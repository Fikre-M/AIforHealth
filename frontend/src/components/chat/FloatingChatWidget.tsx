import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Plus, Minimize2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { aiAssistantService } from '@/services/aiAssistantService';
import { useAuth } from '@/hooks/useAuth';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
}

// Don't show the widget on the dedicated AI chat page — it's redundant there
const HIDDEN_ROUTES = ['/app/ai-chat'];

/** Returns a context-aware opening line based on the current route. */
function getPageContext(pathname: string, firstName: string): string {
  const name = firstName ? ` ${firstName}` : '';

  if (pathname === '/app/dashboard') {
    return `Hi${name}! I can see your dashboard. Want me to check your upcoming appointments, find a doctor, or answer a health question?`;
  }
  if (pathname.startsWith('/app/appointments/book')) {
    return `Hi${name}! Looks like you're booking an appointment. I can help you find the right specialist or answer questions about the process.`;
  }
  if (pathname.startsWith('/app/appointments')) {
    return `Hi${name}! I can see your appointments page. Need to reschedule, find a new doctor, or have a health question?`;
  }
  if (pathname === '/app/symptom-checker') {
    return `Hi${name}! You're using the symptom checker. Once you get a recommendation, I can book an appointment with the right specialist for you.`;
  }
  if (pathname === '/app/notifications') {
    return `Hi${name}! Checking your notifications? I can help you act on any of them — like rescheduling an appointment or finding a doctor.`;
  }
  if (pathname === '/app/profile' || pathname === '/app/settings') {
    return `Hi${name}! Need help with your profile or settings? I can also answer health questions or book appointments.`;
  }
  if (pathname.startsWith('/app/patients')) {
    return `Hi${name}! I can help you look up patient information or answer clinical questions.`;
  }
  if (pathname === '/app/analytics') {
    return `Hi${name}! Reviewing your analytics? I can help interpret trends or answer questions about your practice.`;
  }

  // Default fallback
  return firstName
    ? `Hi ${firstName}! I'm your AI health assistant. I can search for doctors, book appointments, or answer health questions. How can I help?`
    : "Hi! I'm your AI health assistant. How can I help you today?";
}

export function FloatingChatWidget() {
  const location = useLocation();
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] ?? '';
  const greeting = getPageContext(location.pathname, firstName);

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '0', content: greeting, sender: 'ai' },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // When the user navigates to a new page, update the greeting — but only
  // if no real conversation has started yet (just the initial AI message).
  useEffect(() => {
    if (conversationId === null && messages.length <= 1) {
      const newGreeting = getPageContext(location.pathname, firstName);
      setMessages([{ id: Date.now().toString(), content: newGreeting, sender: 'ai' }]);
    }
  }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, isMinimized]);

  if (HIDDEN_ROUTES.includes(location.pathname)) return null;

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const text = input.trim();
    setInput('');
    setError(null);

    const userMsg: Message = {
      id: Date.now().toString(),
      content: text,
      sender: 'user',
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const { response, conversation } = await aiAssistantService.sendMessage(text, conversationId);
      if (!conversationId) setConversationId(conversation.id);

      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), content: response.message, sender: 'ai' },
      ]);
    } catch {
      setError('Something went wrong. Please try again.');
      setMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
      setInput(text);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const handleNewChat = () => {
    setConversationId(null);
    setError(null);
    const newGreeting = getPageContext(location.pathname, firstName);
    setMessages([{ id: Date.now().toString(), content: newGreeting, sender: 'ai' }]);
  };

  const handleOpen = () => {
    setIsOpen(true);
    setIsMinimized(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Chat window */}
      {isOpen && (
        <div
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden transition-all duration-200"
          style={{ width: '360px', height: isMinimized ? 'auto' : '480px' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-blue-600 text-white flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-white/20 rounded-full">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold leading-none">AI Health Assistant</p>
                <p className="text-xs text-white/70 mt-0.5">Powered by Gemini</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleNewChat}
                className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
                title="New conversation"
                aria-label="New conversation"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => {
                  setIsMinimized((v) => !v);
                }}
                className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
                aria-label={isMinimized ? 'Expand chat' : 'Minimize chat'}
              >
                <Minimize2 className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                }}
                className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
                aria-label="Close chat"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50 dark:bg-gray-900/50">
                {messages.map((msg) => {
                  const isUser = msg.sender === 'user';
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`flex items-start gap-2 max-w-[85%] ${isUser ? 'flex-row-reverse' : ''}`}
                      >
                        <div
                          className={`p-1.5 rounded-full flex-shrink-0 mt-0.5 ${isUser ? 'bg-blue-100 dark:bg-blue-900/40' : 'bg-gray-200 dark:bg-gray-700'}`}
                        >
                          {isUser ? (
                            <User className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                          ) : (
                            <Bot className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400" />
                          )}
                        </div>
                        <div
                          className={`px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                            isUser
                              ? 'bg-blue-600 text-white rounded-tr-sm'
                              : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-sm shadow-sm'
                          }`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex items-start gap-2">
                      <div className="p-1.5 rounded-full bg-gray-200 dark:bg-gray-700 mt-0.5">
                        <Bot className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm">
                        <div className="flex space-x-1">
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                          <div
                            className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: '0.15s' }}
                          />
                          <div
                            className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: '0.3s' }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <p className="text-xs text-red-500 text-center bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-gray-200 dark:border-gray-700 px-3 py-3 bg-white dark:bg-gray-800 flex-shrink-0">
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value);
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask a health question..."
                    disabled={isLoading}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
                  />
                  <button
                    onClick={() => {
                      void handleSend();
                    }}
                    disabled={isLoading || !input.trim()}
                    className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                    aria-label="Send"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={
          isOpen
            ? () => {
                setIsOpen(false);
              }
            : handleOpen
        }
        className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        aria-label={isOpen ? 'Close chat' : 'Open AI assistant'}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </div>
  );
}
