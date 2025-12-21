export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: string;
  type?: 'text' | 'symptom-input' | 'suggestion' | 'disclaimer' | 'appointment-prompt';
  metadata?: {
    symptoms?: string[];
    severity?: 'mild' | 'moderate' | 'severe';
    urgency?: 'routine' | 'urgent' | 'emergency';
    suggestedSpecialty?: string;
    confidence?: number;
  };
}

export interface SymptomInput {
  symptom: string;
  severity: 'mild' | 'moderate' | 'severe';
  duration: string;
  location?: string;
  triggers?: string[];
  additionalInfo?: string;
}

export interface AIResponse {
  message: string;
  type: 'information' | 'guidance' | 'appointment-suggestion' | 'emergency-warning';
  confidence: number;
  suggestedActions: string[];
  recommendedSpecialty?: string;
  urgencyLevel: 'routine' | 'urgent' | 'emergency';
  followUpQuestions?: string[];
}

export interface SymptomAnalysis {
  symptoms: string[];
  possibleCauses: string[];
  severity: 'mild' | 'moderate' | 'severe';
  urgency: 'routine' | 'urgent' | 'emergency';
  recommendedActions: string[];
  suggestedSpecialty?: string;
  disclaimer: string;
}