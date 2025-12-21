import type { ChatMessage } from '@/types';

// Enhanced AI conversation types
export interface AIConversation {
  id: string;
  userId: string;
  title: string;
  messages: AIMessage[];
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'archived';
}

export interface AIMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: string;
  suggestions?: string[];
  metadata?: {
    confidence?: number;
    category?: string;
    requiresFollowUp?: boolean;
  };
}

export interface AIResponse {
  message: string;
  suggestions?: string[];
  confidence: number;
  category: 'general' | 'symptoms' | 'medication' | 'appointment' | 'emergency';
  requiresFollowUp: boolean;
  recommendedActions?: Array<{
    type: 'book_appointment' | 'call_doctor' | 'emergency' | 'learn_more';
    label: string;
    priority: 'low' | 'medium' | 'high';
  }>;
}

// Mock conversation storage
const mockConversations = new Map<string, AIConversation>();

// Medical knowledge base for more accurate responses
const medicalKeywords = {
  emergency: [
    'chest pain', 'heart attack', 'stroke', 'difficulty breathing', 'severe bleeding',
    'unconscious', 'seizure', 'severe allergic reaction', 'poisoning', 'overdose'
  ],
  symptoms: [
    'headache', 'fever', 'cough', 'nausea', 'dizziness', 'fatigue', 'pain',
    'rash', 'swelling', 'shortness of breath', 'vomiting', 'diarrhea'
  ],
  medication: [
    'prescription', 'medication', 'pills', 'dosage', 'side effects', 'drug interaction',
    'pharmacy', 'refill', 'allergic reaction to medication'
  ],
  appointment: [
    'appointment', 'schedule', 'book', 'doctor visit', 'consultation', 'checkup',
    'specialist', 'follow-up'
  ]
};

// Simulate realistic AI processing delay
const getAIDelay = (): number => {
  return Math.floor(Math.random() * 2000) + 1000; // 1-3 seconds
};

// Simulate network errors
const simulateNetworkError = (errorRate: number = 0.03): void => {
  if (Math.random() < errorRate) {
    throw new Error('AI service temporarily unavailable. Please try again.');
  }
};

// Analyze message content and determine category
function analyzeMessage(message: string): {
  category: AIResponse['category'];
  confidence: number;
  isEmergency: boolean;
} {
  const lowerMessage = message.toLowerCase();
  
  // Check for emergency keywords
  const emergencyMatch = medicalKeywords.emergency.some(keyword => 
    lowerMessage.includes(keyword)
  );
  
  if (emergencyMatch) {
    return { category: 'emergency', confidence: 0.95, isEmergency: true };
  }
  
  // Check other categories
  const symptomMatch = medicalKeywords.symptoms.some(keyword => 
    lowerMessage.includes(keyword)
  );
  
  const medicationMatch = medicalKeywords.medication.some(keyword => 
    lowerMessage.includes(keyword)
  );
  
  const appointmentMatch = medicalKeywords.appointment.some(keyword => 
    lowerMessage.includes(keyword)
  );
  
  if (symptomMatch) {
    return { category: 'symptoms', confidence: 0.8, isEmergency: false };
  }
  
  if (medicationMatch) {
    return { category: 'medication', confidence: 0.85, isEmergency: false };
  }
  
  if (appointmentMatch) {
    return { category: 'appointment', confidence: 0.9, isEmergency: false };
  }
  
  return { category: 'general', confidence: 0.6, isEmergency: false };
}

// Generate contextual AI response
function generateAIResponse(message: string, conversationHistory: AIMessage[] = []): AIResponse {
  const analysis = analyzeMessage(message);
  const lowerMessage = message.toLowerCase();
  
  let response: string;
  let suggestions: string[] = [];
  let recommendedActions: AIResponse['recommendedActions'] = [];
  
  switch (analysis.category) {
    case 'emergency':
      response = "🚨 This sounds like a medical emergency. Please call 911 immediately or go to your nearest emergency room. Do not wait for an appointment or try to treat this yourself.";
      suggestions = [
        "Call 911 now",
        "Go to nearest ER",
        "Call poison control: 1-800-222-1222"
      ];
      recommendedActions = [
        { type: 'emergency', label: 'Call 911', priority: 'high' },
        { type: 'emergency', label: 'Find nearest ER', priority: 'high' }
      ];
      break;
      
    case 'symptoms':
      if (lowerMessage.includes('pain')) {
        response = "I understand you're experiencing pain. Can you describe:\n• Location and type of pain\n• When it started\n• Pain level (1-10)\n• What makes it better or worse\n\nFor severe or persistent pain, please consider scheduling an appointment.";
        suggestions = [
          "The pain is sharp and sudden",
          "It's a dull, constant ache",
          "The pain comes and goes",
          "I need to see a doctor"
        ];
      } else if (lowerMessage.includes('fever')) {
        response = "Fever can indicate infection or illness. Have you:\n• Taken your temperature?\n• Noticed other symptoms?\n• Tried fever reducers?\n\nSeek medical attention if fever is over 101°F (38.3°C) or persists.";
        suggestions = [
          "My temperature is over 101°F",
          "I have chills and body aches",
          "The fever won't go down",
          "I need medical attention"
        ];
      } else {
        response = "I understand you're experiencing symptoms. While I can provide general information, it's important to get a proper medical evaluation for accurate diagnosis and treatment. Would you like help scheduling an appointment?";
        suggestions = [
          "Tell me more about my symptoms",
          "Book an appointment",
          "Find a specialist",
          "Learn about treatment options"
        ];
      }
      
      recommendedActions = [
        { type: 'book_appointment', label: 'Schedule appointment', priority: 'medium' },
        { type: 'call_doctor', label: 'Call your doctor', priority: 'medium' }
      ];
      break;
      
    case 'medication':
      response = "For medication questions, it's crucial to consult with your healthcare provider or pharmacist. They can provide specific guidance about:\n• Proper dosages\n• Drug interactions\n• Side effects\n• Timing and administration\n\nNever stop or change medications without medical supervision.";
      suggestions = [
        "I'm having side effects",
        "Can I take this with other medications?",
        "I missed a dose",
        "Talk to my pharmacist"
      ];
      recommendedActions = [
        { type: 'call_doctor', label: 'Contact your doctor', priority: 'high' },
        { type: 'learn_more', label: 'Medication safety tips', priority: 'low' }
      ];
      break;
      
    case 'appointment':
      response = "I can help you with appointment scheduling! Our system allows you to:\n• View available doctors and specialties\n• Check appointment availability\n• Book appointments online\n• Manage existing appointments\n\nWould you like me to guide you through the booking process?";
      suggestions = [
        "Show me available doctors",
        "I need a specialist",
        "Book a general checkup",
        "Reschedule existing appointment"
      ];
      recommendedActions = [
        { type: 'book_appointment', label: 'Book appointment now', priority: 'high' },
        { type: 'learn_more', label: 'View doctor profiles', priority: 'medium' }
      ];
      break;
      
    default:
      const contextualResponses = [
        "I'm here to help with your health questions and guide you through our services. While I can provide general information, always consult with healthcare professionals for personalized medical advice.",
        "Thank you for reaching out. I can assist with general health information, appointment scheduling, and navigating our healthcare services. What specific area would you like help with?",
        "I understand you have health-related questions. I'm designed to provide general guidance and help you access appropriate care. For specific medical concerns, I recommend consulting with our qualified healthcare providers."
      ];
      
      response = contextualResponses[Math.floor(Math.random() * contextualResponses.length)];
      suggestions = [
        "Help me book an appointment",
        "I have symptoms to discuss",
        "Questions about medications",
        "General health information"
      ];
      recommendedActions = [
        { type: 'book_appointment', label: 'Schedule consultation', priority: 'medium' },
        { type: 'learn_more', label: 'Browse health resources', priority: 'low' }
      ];
  }
  
  return {
    message: response,
    suggestions,
    confidence: analysis.confidence,
    category: analysis.category,
    requiresFollowUp: analysis.category !== 'general',
    recommendedActions
  };
}

export const aiAssistantService = {
  /**
   * Send a message to the AI assistant
   */
  async sendMessage(
    userId: string,
    message: string,
    conversationId?: string
  ): Promise<{
    response: AIResponse;
    conversationId: string;
    messageId: string;
  }> {
    await new Promise(resolve => setTimeout(resolve, getAIDelay()));
    simulateNetworkError();
    
    // Get or create conversation
    let conversation: AIConversation;
    const currentConversationId = conversationId || `conv-${Date.now()}-${userId}`;
    
    if (conversationId && mockConversations.has(conversationId)) {
      conversation = mockConversations.get(conversationId)!;
    } else {
      conversation = {
        id: currentConversationId,
        userId,
        title: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active'
      };
    }
    
    // Add user message
    const userMessage: AIMessage = {
      id: `msg-${Date.now()}-user`,
      content: message,
      sender: 'user',
      timestamp: new Date().toISOString()
    };
    
    conversation.messages.push(userMessage);
    
    // Generate AI response
    const aiResponse = generateAIResponse(message, conversation.messages);
    
    // Add AI message
    const aiMessage: AIMessage = {
      id: `msg-${Date.now()}-ai`,
      content: aiResponse.message,
      sender: 'ai',
      timestamp: new Date().toISOString(),
      suggestions: aiResponse.suggestions,
      metadata: {
        confidence: aiResponse.confidence,
        category: aiResponse.category,
        requiresFollowUp: aiResponse.requiresFollowUp
      }
    };
    
    conversation.messages.push(aiMessage);
    conversation.updatedAt = new Date().toISOString();
    
    // Store conversation
    mockConversations.set(currentConversationId, conversation);
    
    return {
      response: aiResponse,
      conversationId: currentConversationId,
      messageId: aiMessage.id
    };
  },
  
  /**
   * Get conversation history
   */
  async getConversation(conversationId: string): Promise<AIConversation | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    simulateNetworkError();
    
    return mockConversations.get(conversationId) || null;
  },
  
  /**
   * Get all conversations for a user
   */
  async getUserConversations(userId: string): Promise<AIConversation[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    simulateNetworkError();
    
    return Array.from(mockConversations.values())
      .filter(conv => conv.userId === userId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  },
  
  /**
   * Archive a conversation
   */
  async archiveConversation(conversationId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    simulateNetworkError();
    
    const conversation = mockConversations.get(conversationId);
    if (conversation) {
      conversation.status = 'archived';
      conversation.updatedAt = new Date().toISOString();
      mockConversations.set(conversationId, conversation);
    }
  },
  
  /**
   * Delete a conversation
   */
  async deleteConversation(conversationId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    simulateNetworkError();
    
    mockConversations.delete(conversationId);
  },
  
  /**
   * Get health tips and information
   */
  async getHealthTips(category?: string): Promise<Array<{
    id: string;
    title: string;
    content: string;
    category: string;
    readTime: number;
  }>> {
    await new Promise(resolve => setTimeout(resolve, 400));
    simulateNetworkError();
    
    const healthTips = [
      {
        id: 'tip-1',
        title: 'Stay Hydrated',
        content: 'Drinking adequate water helps maintain body temperature, joint lubrication, and nutrient transport. Aim for 8 glasses per day.',
        category: 'wellness',
        readTime: 2
      },
      {
        id: 'tip-2',
        title: 'Regular Exercise Benefits',
        content: 'Regular physical activity strengthens your heart, improves circulation, and boosts mental health. Even 30 minutes daily makes a difference.',
        category: 'fitness',
        readTime: 3
      },
      {
        id: 'tip-3',
        title: 'Importance of Sleep',
        content: 'Quality sleep is essential for immune function, memory consolidation, and overall health. Adults need 7-9 hours per night.',
        category: 'wellness',
        readTime: 2
      },
      {
        id: 'tip-4',
        title: 'Medication Safety',
        content: 'Always take medications as prescribed, store them properly, and never share prescription medications with others.',
        category: 'medication',
        readTime: 3
      }
    ];
    
    if (category) {
      return healthTips.filter(tip => tip.category === category);
    }
    
    return healthTips;
  },
  
  /**
   * Analyze symptoms (basic triage)
   */
  async analyzeSymptoms(symptoms: string[]): Promise<{
    urgency: 'low' | 'medium' | 'high' | 'emergency';
    recommendations: string[];
    suggestedSpecialties: string[];
  }> {
    await new Promise(resolve => setTimeout(resolve, 1500));
    simulateNetworkError();
    
    const symptomText = symptoms.join(' ').toLowerCase();
    
    // Check for emergency symptoms
    const emergencySymptoms = ['chest pain', 'difficulty breathing', 'severe bleeding', 'unconscious'];
    const hasEmergency = emergencySymptoms.some(symptom => symptomText.includes(symptom));
    
    if (hasEmergency) {
      return {
        urgency: 'emergency',
        recommendations: [
          'Seek immediate emergency care',
          'Call 911 or go to nearest ER',
          'Do not drive yourself'
        ],
        suggestedSpecialties: ['Emergency Medicine']
      };
    }
    
    // Analyze other symptoms
    const highUrgencySymptoms = ['severe pain', 'high fever', 'persistent vomiting'];
    const hasHighUrgency = highUrgencySymptoms.some(symptom => symptomText.includes(symptom));
    
    if (hasHighUrgency) {
      return {
        urgency: 'high',
        recommendations: [
          'Schedule appointment within 24 hours',
          'Consider urgent care if primary doctor unavailable',
          'Monitor symptoms closely'
        ],
        suggestedSpecialties: ['Internal Medicine', 'Family Medicine']
      };
    }
    
    return {
      urgency: 'medium',
      recommendations: [
        'Schedule appointment with primary care physician',
        'Monitor symptoms and note any changes',
        'Rest and stay hydrated'
      ],
      suggestedSpecialties: ['Family Medicine', 'Internal Medicine']
    };
  }
};