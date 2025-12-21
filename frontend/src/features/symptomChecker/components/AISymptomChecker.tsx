import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Bot, AlertTriangle, Calendar, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ChatMessage } from '@/components/symptomChecker/ChatMessage';
import { SymptomInput } from '@/components/symptomChecker/SymptomInput';
import { MedicalDisclaimer } from '@/components/symptomChecker/MedicalDisclaimer';
import { symptomCheckerService } from '@/services/symptomCheckerService';
import type { ChatMessage as ChatMessageType, SymptomInput as SymptomInputType } from '@/types/symptomChecker';

export function AISymptomChecker() {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [showSymptomInput, setShowSymptomInput] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeChat = () => {
    const initialMessage = symptomCheckerService.getInitialMessage();
    const disclaimerMessage = symptomCheckerService.getDisclaimerMessage();
    setMessages([initialMessage, disclaimerMessage]);
  };

  const handleAcceptDisclaimer = () => {
    setShowDisclaimer(false);
    initializeChat();
  };

  const handleDeclineDisclaimer = () => {
    navigate('/app/dashboard');
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      timestamp: new Date().toISOString(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await symptomCheckerService.sendMessage(input, messages);
      
      const aiMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        content: response.message,
        sender: 'ai',
        timestamp: new Date().toISOString(),
        type: response.type === 'emergency-warning' ? 'appointment-prompt' : 'text',
        metadata: {
          severity: response.urgencyLevel === 'emergency' ? 'severe' : 
                   response.urgencyLevel === 'urgent' ? 'moderate' : 'mild',
          urgency: response.urgencyLevel,
          suggestedSpecialty: response.recommendedSpecialty,
          confidence: response.confidence
        }
      };

      setMessages(prev => [...prev, aiMessage]);

      // Add appointment suggestion if needed
      if (response.type === 'appointment-suggestion' || response.urgencyLevel !== 'routine') {
        const appointmentMessage: ChatMessageType = {
          id: (Date.now() + 2).toString(),
          content: `Based on your symptoms, I recommend scheduling an appointment with a healthcare professional${
            response.recommendedSpecialty ? ` in ${response.recommendedSpecialty}` : ''
          }. Would you like me to help you book an appointment?`,
          sender: 'ai',
          timestamp: new Date().toISOString(),
          type: 'appointment-prompt',
          metadata: {
            suggestedSpecialty: response.recommendedSpecialty,
            urgency: response.urgencyLevel
          }
        };

        setTimeout(() => {
          setMessages(prev => [...prev, appointmentMessage]);
        }, 1000);
      }

      // Add follow-up questions if available
      if (response.followUpQuestions && response.followUpQuestions.length > 0) {
        const followUpMessage: ChatMessageType = {
          id: (Date.now() + 3).toString(),
          content: `To better understand your situation, could you tell me:\n\n${response.followUpQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}`,
          sender: 'ai',
          timestamp: new Date().toISOString(),
          type: 'suggestion'
        };

        setTimeout(() => {
          setMessages(prev => [...prev, followUpMessage]);
        }, 2000);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        content: 'I apologize, but I encountered an error processing your message. Please try again or consider contacting a healthcare professional directly.',
        sender: 'ai',
        timestamp: new Date().toISOString(),
        type: 'text'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSymptomAnalysis = async (symptoms: SymptomInputType[]) => {
    setShowSymptomInput(false);
    setIsLoading(true);

    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      content: `I'd like to analyze these symptoms:\n${symptoms.map((s, i) => 
        `${i + 1}. ${s.symptom} (${s.severity}${s.duration ? `, ${s.duration}` : ''})`
      ).join('\n')}`,
      sender: 'user',
      timestamp: new Date().toISOString(),
      type: 'symptom-input'
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      const analysis = await symptomCheckerService.analyzeSymptoms(symptoms);
      
      const analysisMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        content: `Based on the symptoms you've described, here's what I can tell you:\n\n**Possible causes may include:** ${analysis.possibleCauses.join(', ')}\n\n**Recommended actions:**\n${analysis.recommendedActions.map(action => `• ${action}`).join('\n')}\n\n**Important:** ${analysis.disclaimer}`,
        sender: 'ai',
        timestamp: new Date().toISOString(),
        type: 'text',
        metadata: {
          symptoms: analysis.symptoms,
          severity: analysis.severity,
          urgency: analysis.urgency,
          suggestedSpecialty: analysis.suggestedSpecialty
        }
      };

      setMessages(prev => [...prev, analysisMessage]);

      // Add appointment suggestion for urgent cases
      if (analysis.urgency !== 'routine') {
        const appointmentMessage: ChatMessageType = {
          id: (Date.now() + 2).toString(),
          content: `Given the nature of your symptoms, I ${analysis.urgency === 'emergency' ? 'strongly recommend seeking immediate medical attention' : 'recommend scheduling an appointment soon'}. Would you like help booking an appointment?`,
          sender: 'ai',
          timestamp: new Date().toISOString(),
          type: 'appointment-prompt',
          metadata: {
            urgency: analysis.urgency,
            suggestedSpecialty: analysis.suggestedSpecialty
          }
        };

        setTimeout(() => {
          setMessages(prev => [...prev, appointmentMessage]);
        }, 1500);
      }

    } catch (error) {
      console.error('Error analyzing symptoms:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookAppointment = () => {
    navigate('/app/appointments/book');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    initializeChat();
  };

  if (showDisclaimer) {
    return (
      <MedicalDisclaimer
        onAccept={handleAcceptDisclaimer}
        onDecline={handleDeclineDisclaimer}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-200px)] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-medical-100 rounded-lg">
              <Bot className="h-6 w-6 text-medical-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">AI Symptom Checker</h2>
              <p className="text-sm text-gray-600">Get health guidance and symptom information</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSymptomInput(true)}
            >
              Detailed Analysis
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearChat}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Emergency Warning */}
      <div className="bg-red-50 border-l-4 border-red-500 p-4">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
          <p className="text-sm text-red-800">
            <strong>Emergency:</strong> If you're experiencing severe symptoms or a medical emergency, 
            call emergency services immediately. Do not rely on this tool for emergency situations.
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            onBookAppointment={message.type === 'appointment-prompt' ? handleBookAppointment : undefined}
          />
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-200 rounded-full">
                <Bot className="h-4 w-4 text-gray-600" />
              </div>
              <div className="bg-gray-100 p-4 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 p-4 rounded-b-lg">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Describe your symptoms or ask a health question..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500 focus:border-transparent"
            disabled={isLoading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={isLoading || !input.trim()}
            variant="primary"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-gray-500">
            Press Enter to send • This tool provides general information only
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBookAppointment}
          >
            <Calendar className="h-4 w-4 mr-1" />
            Book Appointment
          </Button>
        </div>
      </div>

      {/* Symptom Input Modal */}
      {showSymptomInput && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Detailed Symptom Analysis
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSymptomInput(false)}
                >
                  ×
                </Button>
              </div>
            </div>
            <div className="p-4">
              <SymptomInput
                onSubmitSymptoms={handleSymptomAnalysis}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}