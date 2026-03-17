import api from './api';

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
}

export interface AIResponse {
  message: string;
  conversationId: string;
}

// Map backend message format to frontend format
const mapMessage = (m: any): AIMessage => ({
  id: m._id || m.id || String(Date.now()),
  content: m.content,
  sender: m.role === 'assistant' ? 'ai' : 'user',
  timestamp: m.timestamp,
});

const mapConversation = (c: any): AIConversation => ({
  id: c._id || c.id,
  userId: c.user,
  title: c.title,
  messages: (c.messages || []).map(mapMessage),
  createdAt: c.createdAt,
  updatedAt: c.updatedAt,
  status: c.status === 'active' ? 'active' : 'archived',
});

export const aiAssistantService = {
  async sendMessage(
    message: string,
    conversationId?: string | null,
    _userId?: string
  ): Promise<{ response: AIResponse; conversation: AIConversation }> {
    if (conversationId) {
      // Continue existing conversation
      const res = await api.post(
        `/ai-assistant/conversations/${conversationId}/messages`,
        { message }
      );
      const data = res.data.data;
      const aiMessage = data.conversation?.messages?.slice(-1)[0];
      return {
        response: {
          message: data.response || aiMessage?.content || '',
          conversationId,
        },
        conversation: mapConversation(data.conversation),
      };
    } else {
      // Start new conversation
      const res = await api.post('/ai-assistant/conversations', { message });
      const conv = res.data.data;
      const aiMessage = conv.messages?.find((m: any) => m.role === 'assistant');
      return {
        response: {
          message: aiMessage?.content || '',
          conversationId: conv._id || conv.id,
        },
        conversation: mapConversation(conv),
      };
    }
  },

  async getConversation(conversationId: string): Promise<AIConversation | null> {
    try {
      const res = await api.get(`/ai-assistant/conversations/${conversationId}`);
      return mapConversation(res.data.data);
    } catch {
      return null;
    }
  },

  async getUserConversations(_userId: string): Promise<AIConversation[]> {
    try {
      const res = await api.get('/ai-assistant/conversations');
      return (res.data.data || []).map(mapConversation);
    } catch {
      return [];
    }
  },

  async archiveConversation(conversationId: string): Promise<void> {
    await api.patch(`/ai-assistant/conversations/${conversationId}/status`, {
      status: 'archived',
    });
  },

  async deleteConversation(conversationId: string): Promise<void> {
    await api.delete(`/ai-assistant/conversations/${conversationId}`);
  },
};

export default aiAssistantService;
