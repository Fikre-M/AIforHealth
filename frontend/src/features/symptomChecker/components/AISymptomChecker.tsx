import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Bot, AlertTriangle, Calendar, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
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
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    // Scroll only the chat container, not the entire page
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  const initializeChat = () => {
    const initialMessage = symptomCheckerService.getInitialMessage();
    const disclaimerMessage = symptomCheckerService.getDisclaimerMessage();
    setMessages([initialMessage, disclaimerMessage]);
    
    // Focus on input after chat is initialized
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
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

    // Keep focus on input after sending message
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);

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

  // Prevent page scroll when input is focused
  useEffect(() => {
    const handleFocus = (e: FocusEvent) => {
      if (e.target === inputRef.current) {
        // Prevent default scroll behavior
        e.preventDefault();
        // Ensure chat container stays in view
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
      }
    };

    const inputElement = inputRef.current;
    if (inputElement) {
      inputElement.addEventListener('focus', handleFocus);
      return () => {
        inputElement.removeEventListener('focus', handleFocus);
      };
    }
    // Return undefined for the else case
    return undefined;
  }, []);

  if (showDisclaimer) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center p-4">
        <MedicalDisclaimer
          onAccept={handleAcceptDisclaimer}
          onDecline={handleDeclineDisclaimer}
        />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col space-y-4 p-4 max-w-4xl mx-auto">
      {/* Header */}
      <Card className="flex-shrink-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Bot className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">AI Symptom Checker</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Get health guidance and symptom information</p>
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
                aria-label="Clear chat"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Emergency Warning */}
      <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-400 p-4 rounded-r-lg flex-shrink-0">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mr-2 flex-shrink-0" />
          <p className="text-sm text-red-800 dark:text-red-200">
            <strong>Emergency:</strong> If you're experiencing severe symptoms or a medical emergency, 
            call emergency services immediately. Do not rely on this tool for emergency situations.
          </p>
        </div>
      </div>

      {/* Chat Container */}
      <Card className="flex-1 flex flex-col min-h-0">
        {/* Messages */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto scroll-smooth"
        >
          <CardContent className="p-4 space-y-4 bg-gray-50 dark:bg-gray-800/50">
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
                  <div className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                    <Bot className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </CardContent>
        </div>

        {/* Input */}
        <CardContent className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0">
          <div className="flex space-x-3">
            <div className="flex-1">
              <Input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Describe your symptoms or ask a health question..."
                disabled={isLoading}
                fullWidth
              />
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !input.trim()}
              variant="primary"
              size="md"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center justify-between mt-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Press Enter to send • This tool provides general information only
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBookAppointment}
              leftIcon={<Calendar className="h-4 w-4" />}
            >
              Book Appointment
            </Button>
          </div>
        </CardContent>
      </Card>

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
                  onClick={() => setShowSymptomInput(false)}
                  aria-label="Close modal"
                >
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <SymptomInput
                onSubmitSymptoms={handleSymptomAnalysis}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}