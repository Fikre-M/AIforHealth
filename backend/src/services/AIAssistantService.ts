import { Types } from 'mongoose';
import { GoogleGenerativeAI } from '@google/generative-ai';
import AIAssistant, { IAIConversation, AIConversationStatus } from '../models/AIAssistant';
import { env } from '@/config/env';

const SYSTEM_PROMPT = `You are a helpful AI health assistant for AIforHealth, a medical appointment and health management platform.
You help users with:
- General health information and wellness tips
- Understanding symptoms (always recommend seeing a doctor for diagnosis)
- Navigating the platform (booking appointments, managing medications, health reminders)
- Answering general questions

Important rules:
- Never diagnose medical conditions - always recommend consulting a healthcare professional
- Be empathetic, clear, and concise
- If asked about emergencies, always direct to emergency services (911 or local equivalent)
- You can answer general knowledge questions too, not just health topics`;

// Log key presence at module load time
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

  private async callGemini(messages: { role: string; content: string }[]): Promise<string> {
    const keyPresent = !!env.GEMINI_API_KEY;
    const keyPreview = env.GEMINI_API_KEY ? env.GEMINI_API_KEY.slice(0, 6) + '...' : 'NOT SET';
    console.log(`[Gemini] Calling API. Key present: ${keyPresent}, preview: ${keyPreview}, model: ${env.GEMINI_MODEL || 'gemini-1.5-flash'}`);

    try {
      const client = this.getClient();
      const model = client.getGenerativeModel({
        model: env.GEMINI_MODEL || 'gemini-1.5-flash',
        systemInstruction: SYSTEM_PROMPT,
      });

      // Filter out any empty messages and ensure alternating user/model roles
      const validMessages = messages.filter(m => m.content?.trim());

      const history = validMessages.slice(0, -1).map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

      const chat = model.startChat({ history });
      const lastMessage = validMessages[validMessages.length - 1];
      const result = await chat.sendMessage(lastMessage.content);
      const text = result.response.text();
      console.log(`[Gemini] Success, response length: ${text.length}`);
      return text;
    } catch (err: any) {
      console.error('[Gemini] API call failed:');
      console.error('  message:', err?.message);
      console.error('  status:', err?.status);
      console.error('  errorDetails:', JSON.stringify(err?.errorDetails || err?.response?.data || ''));
      return this.fallbackResponse(messages[messages.length - 1]?.content || '');
    }
  }

  private fallbackResponse(input: string): string {
    const lower = input.toLowerCase();
    if (lower.includes('symptom') || lower.includes('pain') || lower.includes('hurt')) {
      return "I understand you're experiencing some symptoms. Please consult a healthcare professional for an accurate diagnosis. Can you describe your symptoms in more detail?";
    }
    if (lower.includes('appointment') || lower.includes('schedule')) {
      return "I can help you with appointments. You can book one through the Appointments section of the app.";
    }
    return "I'm your AI health assistant. I'm having trouble connecting right now - please try again shortly.";
  }

  async createConversation(userId: Types.ObjectId, initialMessage: string): Promise<IAIConversation> {
    const conversation = new AIAssistant({
      user: userId,
      title: initialMessage.slice(0, 50),
      messages: [{ role: 'user', content: initialMessage, timestamp: new Date() }],
      status: AIConversationStatus.ACTIVE,
    });

    const saved = await conversation.save();

    // Generate AI response
    const aiResponse = await this.callGemini([{ role: 'user', content: initialMessage }]);

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
    // Save user message
    const updated = await AIAssistant.findOneAndUpdate(
      { _id: conversationId, user: userId },
      { $push: { messages: { role: 'user', content: userInput, timestamp: new Date() } } },
      { new: true }
    );

    if (!updated) throw new Error('Conversation not found');

    // Build message history for context
    const history = updated.messages.map((m: any) => ({
      role: m.role,
      content: m.content,
    }));

    const aiResponse = await this.callGemini(history);

    // Save AI response
    await AIAssistant.findOneAndUpdate(
      { _id: conversationId },
      { $push: { messages: { role: 'assistant', content: aiResponse, timestamp: new Date() } } }
    );

    return {
      response: aiResponse,
      conversation: await AIAssistant.findById(conversationId),
    };
  }

  async getConversation(conversationId: string, userId: Types.ObjectId): Promise<IAIConversation | null> {
    return AIAssistant.findOne({ _id: conversationId, user: userId });
  }

  async listConversations(
    userId: Types.ObjectId,
    { limit = 20, page = 1, status }: { limit?: number; page?: number; status?: AIConversationStatus } = {}
  ) {
    const query: any = { user: userId };
    if (status) query.status = status;

    const [data, total] = await Promise.all([
      AIAssistant.find(query).sort({ updatedAt: -1 }).skip((page - 1) * limit).limit(limit).select('-messages').lean(),
      AIAssistant.countDocuments(query),
    ]);

    return { data, pagination: { total, page, totalPages: Math.ceil(total / limit), limit } };
  }

  async updateConversationStatus(conversationId: string, userId: Types.ObjectId, status: AIConversationStatus) {
    return AIAssistant.findOneAndUpdate({ _id: conversationId, user: userId }, { status }, { new: true });
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
      { $project: { _id: 1, title: 1, lastMessage: { $arrayElemAt: ['$messages', -1] }, updatedAt: 1 } },
      { $project: { _id: 1, title: 1, lastMessage: '$lastMessage.content', updatedAt: 1 } },
    ]);
  }
}

export default new AIAssistantService();
