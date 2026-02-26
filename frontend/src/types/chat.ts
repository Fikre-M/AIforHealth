export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  type?: 'text' | 'image' | 'file';
  metadata?: {
    confidence?: number;
    sources?: string[];
    suggestions?: string[];
  };
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface ChatResponse {
  message: ChatMessage;
  suggestions?: string[];
  confidence?: number;
}