import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Bot, AlertTriangle, Calendar, RefreshCw, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { ChatMessage } from '@/components/symptomChecker/ChatMessage';
import { SymptomInput } from '@/components/symptomChecker/SymptomInput';
import { MedicalDisclaimer } from '@/components/symptomChecker/MedicalDisclaimer';
import { symptomCheckerService } from '@/services/symptomCheckerService';
import type {
  ChatMessage as ChatMessageType,
  SymptomInput as SymptomInputType,
} from '@/types/symptomChecker';

export function AISymptomChecker() {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [showSymptomInput, setShowSymptomInput] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const initializeChat = () => {
    const initialMessage = symptomCheckerService.getInitialMessage();
    const disclaimerMessage = symptomCheckerService.getDisclaimerMessage();
    setMessages([initialMessage, disclaimerMessage]);
    setTimeout(() => inputRef.current?.focus(), 100);
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
      type: 'text',
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setTimeout(() => inputRef.current?.focus(), 100);

    try {
      const response = await symptomCheckerService.sendMessage(input, messages);

      const aiMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        content: response.message,
        sender: 'ai',
        timestamp: new Date().toISOString(),
        type: response.type === 'emergency-warning' ? 'appointment-prompt' : 'text',
        metadata: {
          severity:
            response.urgencyLevel === 'emergency'
              ? 'severe'
              : response.urgencyLevel === 'urgent'
                ? 'moderate'
                : 'mild',
          urgency: response.urgencyLevel,
          suggestedSpecialty: response.recommendedSpecialty,
          confidence: response.confidence,
        },
      };
      setMessages((prev) => [...prev, aiMessage]);

      if (response.type === 'appointment-suggestion' || response.urgencyLevel !== 'routine') {
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              id: (Date.now() + 2).toString(),
              content: `Based on your symptoms, I recommend scheduling an appointment with a healthcare professional${response.recommendedSpecialty ? ` in ${response.recommendedSpecialty}` : ''}. Would you like me to help you book an appointment?`,
              sender: 'ai',
              timestamp: new Date().toISOString(),
              type: 'appointment-prompt',
              metadata: {
                suggestedSpecialty: response.recommendedSpecialty,
                urgency: response.urgencyLevel,
              },
            },
          ]);
        }, 1000);
      }

      if (response.followUpQuestions && response.followUpQuestions.length > 0) {
        const followUps = response.followUpQuestions;
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              id: (Date.now() + 3).toString(),
              content: `To better understand your situation, could you tell me:\n\n${followUps.map((q, i) => `${String(i + 1)}. ${q}`).join('\n')}`,
              sender: 'ai',
              timestamp: new Date().toISOString(),
              type: 'suggestion',
            },
          ]);
        }, 2000);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          content:
            'I apologize, but I encountered an error processing your message. Please try again or contact a healthcare professional directly.',
          sender: 'ai',
          timestamp: new Date().toISOString(),
          type: 'text',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSymptomAnalysis = async (symptoms: SymptomInputType[]) => {
    setShowSymptomInput(false);
    setIsLoading(true);

    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      content: `I'd like to analyze these symptoms:\n${symptoms
        .map(
          (s, i) =>
            `${String(i + 1)}. ${s.symptom} (${s.severity}${s.duration ? `, ${s.duration}` : ''})`
        )
        .join('\n')}`,
      sender: 'user',
      timestamp: new Date().toISOString(),
      type: 'symptom-input',
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const analysis = await symptomCheckerService.analyzeSymptoms(symptoms);

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          content: `Based on the symptoms you've described, here's what I can tell you:\n\n**Possible causes may include:** ${analysis.possibleCauses.join(', ')}\n\n**Recommended actions:**\n${analysis.recommendedActions.map((action: string) => `• ${action}`).join('\n')}\n\n**Important:** ${analysis.disclaimer}`,
          sender: 'ai',
          timestamp: new Date().toISOString(),
          type: 'text',
          metadata: {
            symptoms: analysis.symptoms,
            severity: analysis.severity,
            urgency: analysis.urgency,
            suggestedSpecialty: analysis.suggestedSpecialty,
          },
        },
      ]);

      if (analysis.urgency !== 'routine') {
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              id: (Date.now() + 2).toString(),
              content: `Given the nature of your symptoms, I ${analysis.urgency === 'emergency' ? 'strongly recommend seeking immediate medical attention' : 'recommend scheduling an appointment soon'}. Would you like help booking an appointment?`,
              sender: 'ai',
              timestamp: new Date().toISOString(),
              type: 'appointment-prompt',
              metadata: {
                urgency: analysis.urgency,
                suggestedSpecialty: analysis.suggestedSpecialty,
              },
            },
          ]);
        }, 1500);
      }
    } catch (error) {
      console.error('Error analyzing symptoms:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookAppointment = (specialty?: string) => {
    const path = specialty
      ? `/app/appointments/book?specialty=${encodeURIComponent(specialty)}`
      : '/app/appointments/book';
    navigate(path);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    initializeChat();
  };

  if (showDisclaimer) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
        <MedicalDisclaimer onAccept={handleAcceptDisclaimer} onDecline={handleDeclineDisclaimer} />
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm h-[calc(100vh-160px)] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Bot className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                AI Symptom Checker
              </h2>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Get health guidance and symptom information
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                setShowSymptomInput(true);
              }}
              className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 px-3 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Detailed Analysis
            </button>
            <button
              onClick={clearChat}
              className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Clear chat"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Emergency Disclaimer */}
        <div className="mx-4 mt-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex-shrink-0">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-red-800 dark:text-red-200">
              <strong>Emergency:</strong> If you're experiencing severe symptoms or a medical
              emergency, call emergency services immediately. Do not rely on this tool for
              emergencies.
            </p>
          </div>
        </div>

        {/* Messages */}
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              onBookAppointment={
                message.type === 'appointment-prompt'
                  ? () => handleBookAppointment(message.metadata?.suggestedSpecialty)
                  : undefined
              }
            />
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-start gap-2">
                <div className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-700">
                  <Bot className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 px-4 py-3 rounded-2xl rounded-tl-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.15s' }}
                    />
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.3s' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 flex-shrink-0">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
              }}
              onKeyDown={handleKeyPress}
              placeholder="Describe your symptoms or ask a health question..."
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
              disabled={isLoading}
            />
            <button
              onClick={() => {
                void handleSendMessage();
              }}
              disabled={isLoading || !input.trim()}
              className="p-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Press Enter to send · General information only
            </p>
            <button
              onClick={() => handleBookAppointment()}
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            >
              <Calendar className="h-3 w-3" />
              Book Appointment
            </button>
          </div>
        </div>
      </div>

      {/* Symptom Input Modal */}
      {showSymptomInput && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader border>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Detailed Symptom Analysis
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowSymptomInput(false);
                  }}
                  aria-label="Close modal"
                >
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <SymptomInput
                onSubmitSymptoms={(symptoms) => {
                  void handleSymptomAnalysis(symptoms);
                }}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
