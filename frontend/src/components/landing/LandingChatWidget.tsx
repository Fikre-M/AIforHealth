import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, LogIn, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  type?: 'text' | 'auth-prompt';
}

// Hardcoded FAQ responses — no API calls for unauthenticated users
const FAQ_RESPONSES: Array<{ patterns: string[]; response: string }> = [
  {
    patterns: ['appointment', 'book', 'schedule', 'visit'],
    response:
      'You can book appointments with doctors directly through AIforHealth. We support in-person and virtual visits, with real-time availability and instant confirmation. Want to see how it works?',
  },
  {
    patterns: ['symptom', 'sick', 'pain', 'feel', 'hurt', 'headache', 'fever', 'cough'],
    response:
      "Our AI Symptom Checker can help you understand your symptoms and suggest whether you should see a doctor. It asks a few questions and gives you guidance — though it's not a substitute for professional medical advice.",
  },
  {
    patterns: ['reminder', 'notification', 'alert', 'forget', 'miss'],
    response:
      'AIforHealth sends smart reminders via email and SMS so you never miss an appointment. You can customize how far in advance you get notified.',
  },
  {
    patterns: ['doctor', 'specialist', 'physician', 'find', 'search'],
    response:
      'You can search for doctors by specialty, location, and availability. Each profile includes their qualifications, clinic details, and patient reviews.',
  },
  {
    patterns: ['price', 'cost', 'free', 'plan', 'subscription', 'pay'],
    response:
      'AIforHealth offers a free trial with no credit card required. Premium plans unlock unlimited AI consultations, advanced reminders, and priority booking.',
  },
  {
    patterns: ['privacy', 'data', 'secure', 'safe', 'hipaa'],
    response:
      'Your health data is encrypted and stored securely. We follow strict privacy standards and never share your information with third parties without your consent.',
  },
  {
    patterns: ['ai', 'artificial intelligence', 'how does', 'work'],
    response:
      'Our AI assistant is powered by advanced language models trained on medical knowledge. It can answer health questions, help you understand symptoms, and guide you to the right care — all in plain language.',
  },
];

const FREE_EXCHANGE_LIMIT = 3;

const AUTH_PROMPT_MESSAGE: Message = {
  id: 'auth-prompt',
  content: '',
  sender: 'ai',
  type: 'auth-prompt',
};

function getFaqResponse(input: string): string {
  const lower = input.toLowerCase();
  for (const faq of FAQ_RESPONSES) {
    if (faq.patterns.some((p) => lower.includes(p))) {
      return faq.response;
    }
  }
  return "That's a great question. Our full AI health assistant can give you a detailed answer — it's available once you create a free account. It only takes a minute to get started.";
}

export function LandingChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      content:
        "Hi! I'm the AIforHealth assistant. Ask me anything about our platform — appointments, symptoms, reminders, or how the AI works.",
      sender: 'ai',
    },
  ]);
  const [input, setInput] = useState('');
  const [exchangeCount, setExchangeCount] = useState(0);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, messages]);

  const handleSend = () => {
    if (!input.trim() || showAuthPrompt) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      sender: 'user',
    };

    const newCount = exchangeCount + 1;
    setInput('');
    setExchangeCount(newCount);

    if (newCount >= FREE_EXCHANGE_LIMIT) {
      setMessages((prev) => [...prev, userMsg, AUTH_PROMPT_MESSAGE]);
      setShowAuthPrompt(true);
    } else {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: getFaqResponse(input.trim()),
        sender: 'ai',
      };
      setMessages((prev) => [...prev, userMsg, aiResponse]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Chat window */}
      {isOpen && (
        <div
          className="w-[340px] sm:w-[380px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
          style={{ height: '480px' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-medical-600 text-white flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-white/20 rounded-full">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold leading-none">AIforHealth Assistant</p>
                <p className="text-xs text-white/70 mt-0.5">Ask me anything</p>
              </div>
            </div>
            <button
              onClick={() => {
                setIsOpen(false);
              }}
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Close chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50">
            {messages.map((msg) => {
              if (msg.type === 'auth-prompt') {
                return (
                  <div key={msg.id} className="flex justify-start">
                    <div className="flex items-start gap-2 max-w-[90%]">
                      <div className="p-1.5 rounded-full bg-medical-100 flex-shrink-0 mt-0.5">
                        <Bot className="h-3.5 w-3.5 text-medical-600" />
                      </div>
                      <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                        <p className="text-sm text-gray-800 mb-3">
                          You've reached the limit for guest questions. Create a free account to
                          unlock the full AI health assistant — unlimited questions, symptom
                          checking, and appointment booking.
                        </p>
                        <div className="flex flex-col gap-2">
                          <Link
                            to="/register"
                            className="flex items-center justify-center gap-2 bg-medical-600 hover:bg-medical-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                          >
                            <UserPlus className="h-4 w-4" />
                            Create Free Account
                          </Link>
                          <Link
                            to="/login"
                            className="flex items-center justify-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                          >
                            <LogIn className="h-4 w-4" />
                            Sign In
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              const isUser = msg.sender === 'user';
              return (
                <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`flex items-start gap-2 max-w-[85%] ${isUser ? 'flex-row-reverse' : ''}`}
                  >
                    <div
                      className={`p-1.5 rounded-full flex-shrink-0 mt-0.5 ${isUser ? 'bg-blue-100' : 'bg-medical-100'}`}
                    >
                      {isUser ? (
                        <User className="h-3.5 w-3.5 text-blue-600" />
                      ) : (
                        <Bot className="h-3.5 w-3.5 text-medical-600" />
                      )}
                    </div>
                    <div
                      className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                        isUser
                          ? 'bg-blue-600 text-white rounded-tr-sm'
                          : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 px-3 py-3 bg-white flex-shrink-0">
            {showAuthPrompt ? (
              <p className="text-xs text-center text-gray-500 py-1">
                Sign in or create an account to continue chatting
              </p>
            ) : (
              <>
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value);
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about appointments, symptoms..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-medical-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="p-2 bg-medical-600 text-white rounded-full hover:bg-medical-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                    aria-label="Send"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-400 text-center mt-1.5">
                  {FREE_EXCHANGE_LIMIT - exchangeCount} free question
                  {FREE_EXCHANGE_LIMIT - exchangeCount !== 1 ? 's' : ''} remaining
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => {
          setIsOpen((prev) => !prev);
        }}
        className="w-14 h-14 bg-medical-600 hover:bg-medical-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </div>
  );
}
