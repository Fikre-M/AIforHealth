import type { ChatMessage, SymptomInput, AIResponse, SymptomAnalysis } from '@/types/symptomChecker';

// Mock symptom database for realistic responses
const symptomDatabase = {
  'headache': {
    commonCauses: ['tension', 'dehydration', 'stress', 'eye strain', 'sinus congestion'],
    urgentCauses: ['migraine', 'high blood pressure', 'medication side effects'],
    emergencyCauses: ['severe head trauma', 'sudden severe headache', 'headache with fever and stiff neck'],
    specialty: 'Neurology'
  },
  'chest pain': {
    commonCauses: ['muscle strain', 'acid reflux', 'anxiety', 'costochondritis'],
    urgentCauses: ['heart palpitations', 'respiratory infection'],
    emergencyCauses: ['heart attack', 'pulmonary embolism', 'aortic dissection'],
    specialty: 'Cardiology'
  },
  'fever': {
    commonCauses: ['viral infection', 'bacterial infection', 'common cold', 'flu'],
    urgentCauses: ['high fever over 103°F', 'persistent fever', 'fever with severe symptoms'],
    emergencyCauses: ['fever with difficulty breathing', 'fever with severe headache and stiff neck'],
    specialty: 'Internal Medicine'
  },
  'cough': {
    commonCauses: ['common cold', 'allergies', 'dry air', 'throat irritation'],
    urgentCauses: ['persistent cough over 3 weeks', 'cough with blood', 'severe cough'],
    emergencyCauses: ['cough with severe breathing difficulty', 'cough with chest pain'],
    specialty: 'Pulmonology'
  },
  'stomach pain': {
    commonCauses: ['indigestion', 'gas', 'food poisoning', 'stress'],
    urgentCauses: ['severe abdominal pain', 'persistent pain', 'pain with vomiting'],
    emergencyCauses: ['severe pain with fever', 'appendicitis symptoms', 'severe cramping'],
    specialty: 'Gastroenterology'
  }
};

// Emergency keywords that should trigger immediate care recommendations
const emergencyKeywords = [
  'severe', 'unbearable', 'worst pain ever', 'can\'t breathe', 'chest pain',
  'difficulty breathing', 'unconscious', 'bleeding heavily', 'severe headache',
  'sudden onset', 'high fever', 'vomiting blood', 'severe allergic reaction'
];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const symptomCheckerService = {
  async sendMessage(message: string, conversationHistory: ChatMessage[]): Promise<AIResponse> {
    await delay(1500); // Simulate AI processing time

    const lowerMessage = message.toLowerCase();
    
    // Check for emergency keywords
    const hasEmergencyKeywords = emergencyKeywords.some(keyword => 
      lowerMessage.includes(keyword.toLowerCase())
    );

    if (hasEmergencyKeywords) {
      return {
        message: "I'm concerned about the symptoms you've described. These could indicate a serious condition that requires immediate medical attention. Please consider visiting an emergency room or calling emergency services right away.",
        type: 'emergency-warning',
        confidence: 0.95,
        suggestedActions: [
          'Seek immediate emergency care',
          'Call emergency services if symptoms are severe',
          'Do not delay medical attention'
        ],
        urgencyLevel: 'emergency',
        followUpQuestions: []
      };
    }

    // Analyze symptoms mentioned in the message
    const mentionedSymptoms = Object.keys(symptomDatabase).filter(symptom =>
      lowerMessage.includes(symptom)
    );

    if (mentionedSymptoms.length > 0) {
      const primarySymptom = mentionedSymptoms[0];
      const symptomInfo = symptomDatabase[primarySymptom as keyof typeof symptomDatabase];

      // Determine urgency based on context
      let urgencyLevel: 'routine' | 'urgent' | 'emergency' = 'routine';
      let responseType: AIResponse['type'] = 'information';

      if (lowerMessage.includes('severe') || lowerMessage.includes('getting worse')) {
        urgencyLevel = 'urgent';
        responseType = 'appointment-suggestion';
      }

      const responses = [
        `I understand you're experiencing ${primarySymptom}. This can be concerning, and I'm here to help provide some general information.`,
        `Based on what you've described about ${primarySymptom}, there are several possible causes to consider.`,
        `Thank you for sharing your symptoms regarding ${primarySymptom}. Let me provide some general guidance.`
      ];

      const selectedResponse = responses[Math.floor(Math.random() * responses.length)];

      return {
        message: `${selectedResponse} Common causes can include ${symptomInfo.commonCauses.slice(0, 3).join(', ')}. However, it's important to note that I cannot provide a medical diagnosis. For a proper evaluation, I'd recommend consulting with a healthcare professional.`,
        type: responseType,
        confidence: 0.75,
        suggestedActions: [
          'Monitor your symptoms',
          'Keep a symptom diary',
          'Consider scheduling an appointment with a doctor',
          'Seek medical attention if symptoms worsen'
        ],
        recommendedSpecialty: symptomInfo.specialty,
        urgencyLevel,
        followUpQuestions: [
          'How long have you been experiencing this?',
          'Have you noticed any triggers?',
          'Are there any other symptoms you\'re experiencing?'
        ]
      };
    }

    // General health questions
    if (lowerMessage.includes('when should i see a doctor') || lowerMessage.includes('should i make an appointment')) {
      return {
        message: "It's always best to consult with a healthcare professional when you have health concerns. I'd recommend scheduling an appointment if your symptoms persist, worsen, or if you're feeling worried about them. A doctor can provide proper evaluation and personalized advice.",
        type: 'appointment-suggestion',
        confidence: 0.85,
        suggestedActions: [
          'Schedule an appointment with your primary care doctor',
          'Consider urgent care for non-emergency concerns',
          'Keep track of your symptoms before the appointment'
        ],
        urgencyLevel: 'routine',
        followUpQuestions: [
          'What specific symptoms are you concerned about?',
          'How long have you been experiencing these symptoms?'
        ]
      };
    }

    // Default response for general queries
    const generalResponses = [
      "I'm here to help provide general health information and guidance. Could you tell me more about what symptoms or health concerns you're experiencing?",
      "Thank you for reaching out. I can help provide general health information, but remember that I cannot replace professional medical advice. What would you like to know about?",
      "I'm designed to provide general health guidance and help you understand when to seek medical care. What specific symptoms or concerns would you like to discuss?"
    ];

    return {
      message: generalResponses[Math.floor(Math.random() * generalResponses.length)],
      type: 'information',
      confidence: 0.8,
      suggestedActions: [
        'Describe your symptoms in detail',
        'Mention how long you\'ve had these symptoms',
        'Include any relevant medical history'
      ],
      urgencyLevel: 'routine',
      followUpQuestions: [
        'What symptoms are you experiencing?',
        'When did these symptoms start?',
        'Have you tried any treatments?'
      ]
    };
  },

  async analyzeSymptoms(symptoms: SymptomInput[]): Promise<SymptomAnalysis> {
    await delay(2000);

    const symptomNames = symptoms.map(s => s.symptom.toLowerCase());
    const maxSeverity = symptoms.reduce((max, s) => 
      s.severity === 'severe' ? 'severe' : 
      s.severity === 'moderate' && max !== 'severe' ? 'moderate' : max, 
      'mild' as 'mild' | 'moderate' | 'severe'
    );

    // Determine urgency based on severity and symptoms
    let urgency: 'routine' | 'urgent' | 'emergency' = 'routine';
    if (maxSeverity === 'severe') urgency = 'urgent';
    if (symptomNames.some(s => emergencyKeywords.some(k => s.includes(k)))) {
      urgency = 'emergency';
    }

    const possibleCauses = symptomNames.flatMap(symptom => {
      const info = symptomDatabase[symptom as keyof typeof symptomDatabase];
      return info ? info.commonCauses.slice(0, 2) : ['various conditions'];
    });

    const recommendedActions = [
      'Monitor your symptoms closely',
      'Keep a detailed symptom diary',
      'Stay hydrated and get adequate rest',
      urgency === 'emergency' ? 'Seek immediate medical attention' : 'Consider scheduling a medical appointment',
      'Avoid self-medication without professional guidance'
    ];

    const suggestedSpecialty = symptomNames.map(symptom => {
      const info = symptomDatabase[symptom as keyof typeof symptomDatabase];
      return info?.specialty;
    }).find(specialty => specialty) || 'General Medicine';

    return {
      symptoms: symptomNames,
      possibleCauses: [...new Set(possibleCauses)],
      severity: maxSeverity,
      urgency,
      recommendedActions,
      suggestedSpecialty,
      disclaimer: 'This analysis is for informational purposes only and should not be considered a medical diagnosis. Always consult with qualified healthcare professionals for proper medical evaluation and treatment.'
    };
  },

  getInitialMessage(): ChatMessage {
    return {
      id: 'initial',
      content: "Hello! I'm your AI Health Assistant. I can help provide general health information and guidance about symptoms. Please remember that I cannot diagnose medical conditions or replace professional medical advice. How can I help you today?",
      sender: 'ai',
      timestamp: new Date().toISOString(),
      type: 'text'
    };
  },

  getDisclaimerMessage(): ChatMessage {
    return {
      id: 'disclaimer',
      content: "⚠️ **Important Medical Disclaimer**: This AI assistant provides general health information only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of qualified healthcare providers with any questions about medical conditions. In case of emergency, call emergency services immediately.",
      sender: 'ai',
      timestamp: new Date().toISOString(),
      type: 'disclaimer'
    };
  }
};