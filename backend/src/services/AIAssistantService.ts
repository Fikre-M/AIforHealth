import { Types } from 'mongoose';
import { GoogleGenerativeAI, Tool, FunctionDeclaration, SchemaType } from '@google/generative-ai';
import AIAssistant, { IAIConversation, AIConversationStatus } from '../models/AIAssistant';
import { env } from '@/config/env';
import { DoctorService } from './DoctorService';
import { AppointmentService } from './AppointmentService';

/* =========================================================
   System Prompt
========================================================= */

const SYSTEM_PROMPT = `You are a helpful AI health assistant for AIforHealth, a medical appointment and health management platform.
You help users with:
- General health information and wellness tips
- Understanding symptoms (always recommend seeing a doctor for diagnosis)
- Navigating the platform (booking appointments, managing medications, health reminders)
- Answering general questions

You have the ability to take real actions on behalf of the user:
- Search for available doctors by specialty
- Book appointments directly
- View the user's upcoming appointments

When a user wants to book an appointment, follow this flow:
1. Search for doctors matching the needed specialty using search_doctors
2. Present the options clearly (name, specialty)
3. Ask the user to confirm which doctor and what date/time they prefer
4. Once confirmed, call book_appointment to complete the booking
5. Confirm the booking with the confirmation number

Important rules:
- Never diagnose medical conditions - always recommend consulting a healthcare professional
- Be empathetic, clear, and concise
- If asked about emergencies, always direct to emergency services (911 or local equivalent)
- Always confirm with the user before booking an appointment
- When showing appointment dates, format them in a human-readable way`;

/* =========================================================
   Tool Definitions
========================================================= */

const TOOL_DECLARATIONS: FunctionDeclaration[] = [
  {
    name: 'search_doctors',
    description:
      'Search for available doctors by specialty or name. Use this when a user wants to find a doctor or book an appointment.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        specialization: {
          type: SchemaType.STRING,
          description:
            'Medical specialty to search for, e.g. "cardiology", "dermatology", "general"',
        },
        search: {
          type: SchemaType.STRING,
          description: 'Search by doctor name or specialty keyword',
        },
      },
      required: [],
    },
  },
  {
    name: 'book_appointment',
    description:
      'Book an appointment for the user with a specific doctor. Only call this after the user has explicitly confirmed they want to book.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        doctorId: {
          type: SchemaType.STRING,
          description: 'The MongoDB ID of the doctor to book with',
        },
        appointmentDate: {
          type: SchemaType.STRING,
          description:
            'ISO 8601 date-time string for the appointment, must be in the future. Example: 2026-03-20T14:00:00.000Z',
        },
        reason: {
          type: SchemaType.STRING,
          description: 'Reason for the appointment (5-500 characters)',
        },
        type: {
          type: SchemaType.STRING,
          description:
            'Appointment type: consultation, follow_up, routine_checkup, specialist, telemedicine',
        },
      },
      required: ['doctorId', 'appointmentDate', 'reason'],
    },
  },
  {
    name: 'get_my_appointments',
    description: "Get the user's upcoming or recent appointments",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        status: {
          type: SchemaType.STRING,
          description:
            'Filter by status: scheduled, confirmed, completed, cancelled. Leave empty for all upcoming.',
        },
      },
      required: [],
    },
  },
];

const GEMINI_TOOLS: Tool[] = [{ functionDeclarations: TOOL_DECLARATIONS }];

/* =========================================================
   Tool Executor
========================================================= */

async function executeTool(
  name: string,
  args: Record<string, unknown>,
  userId: Types.ObjectId
): Promise<unknown> {
  // eslint-disable-next-line no-console
  console.log(`[AITools] Executing tool: ${name}`, args);

  switch (name) {
    case 'search_doctors': {
      const result = await DoctorService.searchDoctors({
        specialization: args['specialization'] as string | undefined,
        search: args['search'] as string | undefined,
        limit: 5,
      });
      return {
        doctors: result.doctors.map((d: any) => ({
          id: d._id,
          name: d.name,
          specialty: d.specialization || 'General Medicine',
          email: d.email,
        })),
        total: result.pagination.total,
      };
    }

    case 'book_appointment': {
      const appointment = await AppointmentService.createAppointment({
        patientId: userId.toString(),
        doctorId: args['doctorId'] as string,
        appointmentDate: new Date(args['appointmentDate'] as string),
        duration: 30,
        type: (args['type'] as string) || 'consultation',
        reason: args['reason'] as string,
      });
      return {
        success: true,
        confirmationNumber: (appointment as any).confirmationNumber,
        appointmentDate: (appointment as any).appointmentDate,
        doctorId: args['doctorId'],
      };
    }

    case 'get_my_appointments': {
      const result = await AppointmentService.getAppointments(
        { status: args['status'] as string | undefined, limit: 5 },
        { patient: userId }
      );
      return {
        appointments: result.appointments.map((a: any) => ({
          id: a._id,
          doctor: a.doctor?.name || 'Unknown',
          specialty: a.doctor?.specialization || '',
          date: a.appointmentDate,
          status: a.status,
          reason: a.reason,
          confirmationNumber: a.confirmationNumber,
        })),
      };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

/* =========================================================
   Service
========================================================= */

// eslint-disable-next-line no-console
console.log('[AIAssistantService] GEMINI_API_KEY present at startup:', !!env.GEMINI_API_KEY);

class AIAssistantService {
  private genAI: GoogleGenerativeAI | null = null;

  private getClient(): GoogleGenerativeAI {
    if (!env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }
    if (!this.genAI) {
      this.genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    }
    return this.genAI;
  }

  /**
   * Calls Gemini with function calling support.
   * Handles the tool-use loop: if Gemini calls a tool, we execute it and feed
   * the result back until Gemini returns a final text response.
   */
  private async callGemini(
    messages: { role: string; content: string }[],
    userId: Types.ObjectId
  ): Promise<string> {
    const keyPreview = env.GEMINI_API_KEY ? env.GEMINI_API_KEY.slice(0, 6) + '...' : 'NOT SET';
    // eslint-disable-next-line no-console
    console.log(
      `[Gemini] Calling API. Key preview: ${keyPreview}, model: ${env.GEMINI_MODEL ?? 'gemini-2.5-flash'}`
    );

    try {
      const client = this.getClient();
      const model = client.getGenerativeModel({
        model: env.GEMINI_MODEL || 'gemini-1.5-flash',
        systemInstruction: SYSTEM_PROMPT,
        tools: GEMINI_TOOLS,
      });

      const validMessages = messages.filter((m) => m.content?.trim());

      const history = validMessages.slice(0, -1).map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

      const chat = model.startChat({ history });
      const lastMessage = validMessages[validMessages.length - 1];

      let result = await chat.sendMessage(lastMessage.content);

      // Agentic loop: keep executing tools until Gemini gives a text response
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const candidate = result.response.candidates?.[0];
        const parts = candidate?.content?.parts ?? [];

        const functionCalls = parts.filter((p) => p.functionCall);

        if (functionCalls.length === 0) {
          // No more tool calls — return the text response
          const text = result.response.text();
          // eslint-disable-next-line no-console
          console.log(`[Gemini] Final response length: ${String(text.length)}`);
          return text;
        }

        // Execute all requested tools and collect results
        const toolResults = await Promise.all(
          functionCalls.map(async (part) => {
            const { name, args } = part.functionCall;
            try {
              const output = await executeTool(name, args as Record<string, unknown>, userId);
              return { name, output };
            } catch (err: unknown) {
              const e = err as { message?: string };
              // eslint-disable-next-line no-console
              console.error(`[AITools] Tool ${name} failed:`, e?.message);
              return { name, output: { error: e?.message ?? 'Tool execution failed' } };
            }
          })
        );

        // Feed tool results back to Gemini
        const functionResponseParts = toolResults.map(({ name, output }) => ({
          functionResponse: { name, response: output as object },
        }));

        result = await chat.sendMessage(functionResponseParts);
      }
    } catch (err: unknown) {
      const e = err as { message?: string; status?: number; errorDetails?: unknown };
      // eslint-disable-next-line no-console
      console.error('[Gemini] API call failed:', e?.message, e?.status);
      throw err;
    }
  }

  async createConversation(
    userId: Types.ObjectId,
    initialMessage: string
  ): Promise<IAIConversation> {
    const conversation = new AIAssistant({
      user: userId,
      title: initialMessage.slice(0, 50),
      messages: [{ role: 'user', content: initialMessage, timestamp: new Date() }],
      status: AIConversationStatus.ACTIVE,
    });

    const saved = await conversation.save();

    const aiResponse = await this.callGemini([{ role: 'user', content: initialMessage }], userId);

    return AIAssistant.findOneAndUpdate(
      { _id: saved._id },
      { $push: { messages: { role: 'assistant', content: aiResponse, timestamp: new Date() } } },
      { new: true }
    ) as Promise<IAIConversation>;
  }

  async processUserInput(
    conversationId: string,
    userId: Types.ObjectId,
    userInput: string
  ): Promise<{ response: string; conversation: IAIConversation | null }> {
    const updated = await AIAssistant.findOneAndUpdate(
      { _id: conversationId, user: userId },
      { $push: { messages: { role: 'user', content: userInput, timestamp: new Date() } } },
      { new: true }
    );

    if (!updated) throw new Error('Conversation not found');

    const history = updated.messages.map((m: { role: string; content: string }) => ({
      role: m.role,
      content: m.content,
    }));

    const aiResponse = await this.callGemini(history, userId);

    await AIAssistant.findOneAndUpdate(
      { _id: conversationId },
      { $push: { messages: { role: 'assistant', content: aiResponse, timestamp: new Date() } } }
    );

    return {
      response: aiResponse,
      conversation: await AIAssistant.findById(conversationId),
    };
  }

  async getConversation(
    conversationId: string,
    userId: Types.ObjectId
  ): Promise<IAIConversation | null> {
    return AIAssistant.findOne({ _id: conversationId, user: userId });
  }

  async listConversations(
    userId: Types.ObjectId,
    {
      limit = 20,
      page = 1,
      status,
    }: { limit?: number; page?: number; status?: AIConversationStatus } = {}
  ) {
    const query: Record<string, unknown> = { user: userId };
    if (status) query['status'] = status;

    const [data, total] = await Promise.all([
      AIAssistant.find(query)
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select('-messages')
        .lean(),
      AIAssistant.countDocuments(query),
    ]);

    return { data, pagination: { total, page, totalPages: Math.ceil(total / limit), limit } };
  }

  async updateConversationStatus(
    conversationId: string,
    userId: Types.ObjectId,
    status: AIConversationStatus
  ) {
    return AIAssistant.findOneAndUpdate(
      { _id: conversationId, user: userId },
      { status },
      { new: true }
    );
  }

  async deleteConversation(conversationId: string, userId: Types.ObjectId): Promise<boolean> {
    const result = await AIAssistant.deleteOne({ _id: conversationId, user: userId });
    return result.deletedCount > 0;
  }

  async getConversationHistory(userId: Types.ObjectId, limit = 5) {
    return AIAssistant.aggregate([
      { $match: { user: userId } },
      { $sort: { updatedAt: -1 } },
      { $limit: limit },
      {
        $project: {
          _id: 1,
          title: 1,
          lastMessage: { $arrayElemAt: ['$messages', -1] },
          updatedAt: 1,
        },
      },
      { $project: { _id: 1, title: 1, lastMessage: '$lastMessage.content', updatedAt: 1 } },
    ]);
  }
}

export default new AIAssistantService();
