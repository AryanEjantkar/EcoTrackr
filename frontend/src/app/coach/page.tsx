"use client";

import { useEffect, useRef, useState } from "react";
import { 
  Bell, 
  Send, 
  Bot, 
  Sparkles, 
  Bike, 
  Zap, 
  Leaf, 
  ShoppingBag, 
  UtensilsCrossed, 
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { api, CoachSuggestionCard } from "@/utils/api";

interface Message {
  id: number;
  sender: "user" | "coach";
  text: string;
  pills?: string[];
  suggestions?: CoachSuggestionCard[];
  timestamp: Date;
}

export default function AICoach() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [selectedCards, setSelectedCards] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with coach intro greeting
  useEffect(() => {
    setMessages([
      {
        id: 1,
        sender: "coach",
        text: "Hello! I am your **EcoTrackr Sustainability Coach**.\n\nI monitor your carbon activities to construct tailored pathways. I noticed **Transportation** is your primary driver this week. Ask me how to optimize your commute, or request a customized weekly plan!",
        pills: ["STRATEGY", "MOBILITY"],
        timestamp: new Date()
      }
    ]);
  }, []);

  // Auto scroll logic
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || sending) return;
    
    const userMsg: Message = {
      id: Date.now(),
      sender: "user",
      text: textToSend,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setSending(true);
    
    try {
      const coachReply = await api.consultCoach(textToSend);
      
      const responseMsg: Message = {
        id: Date.now() + 1,
        sender: "coach",
        text: coachReply.response,
        suggestions: coachReply.suggestions,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, responseMsg]);
    } catch (err) {
      console.error("Coach API failed", err);
      const errMsg: Message = {
        id: Date.now() + 2,
        sender: "coach",
        text: "Apologies, I encountered a connection error. Please verify the backend service is active.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setSending(false);
    }
  };

  const handleCardToggle = (cardTitle: string) => {
    setSelectedCards(prev => ({
      ...prev,
      [cardTitle]: !prev[cardTitle]
    }));
  };

  // Helper icon renderer
  const getCardIcon = (iconName: string) => {
    switch (iconName.toLowerCase()) {
      case "bike": return <Bike size={16} />;
      case "ac": return <Zap size={16} />;
      case "leaf": return <Leaf size={16} />;
      case "shop": return <ShoppingBag size={16} />;
      case "food": return <UtensilsCrossed size={16} />;
      default: return <Sparkles size={16} />;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-zinc-950">
      
      {/* Header */}
      <header className="flex justify-between items-center p-4 sm:p-6 border-b border-white/5 bg-zinc-950/30 backdrop-blur-md">
        <div>
          <h2 className="text-xl font-extrabold text-zinc-100 flex items-center gap-2">
            <Bot size={22} className="text-emerald-400" />
            <span>Al Coach</span>
          </h2>
          <p className="text-[10px] text-emerald-400 font-extrabold tracking-widest uppercase mt-0.5 font-mono">
            LIVE IMPACT MONITORING
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-xl bg-zinc-900/50 border border-white/5 text-zinc-400 hover:text-zinc-100 transition">
            <Bell size={16} />
          </button>
          <div className="w-9 h-9 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
            YU
          </div>
        </div>
      </header>

      {/* Message Chat Window */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.map((msg) => {
          const isCoach = msg.sender === "coach";
          
          return (
            <div 
              key={msg.id} 
              className={`flex items-start gap-3 max-w-[85%] ${
                isCoach ? "mr-auto animate-fade-in" : "ml-auto flex-row-reverse"
              }`}
            >
              {/* Bot Avatar Icon */}
              {isCoach && (
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400 flex-shrink-0">
                  <Bot size={16} />
                </div>
              )}

              {/* Message Bubble container */}
              <div className="space-y-3">
                <div 
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed border ${
                    isCoach 
                      ? "glass-card border-white/5 text-zinc-200" 
                      : "bg-zinc-900 border-zinc-800 text-zinc-100"
                  }`}
                  style={{ whiteSpace: "pre-line" }}
                >
                  {/* Clean text renderer handles basic markdown bold tags */}
                  {msg.text.split("**").map((part, index) => 
                    index % 2 === 1 ? <strong key={index} className="text-emerald-400 font-bold">{part}</strong> : part
                  )}

                  {/* Quick Pill Labels inside AI response */}
                  {msg.pills && (
                    <div className="flex gap-2 mt-4">
                      {msg.pills.map(pill => (
                        <span 
                          key={pill} 
                          className="text-[9px] border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-mono font-extrabold tracking-wider"
                        >
                          {pill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Structured Suggestion Action Cards inside chat bubble */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="space-y-2 w-full max-w-[320px] sm:max-w-[420px] animate-slide-up">
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider pl-1">
                      Focus Areas & Recommendations:
                    </p>
                    
                    <div className="space-y-2">
                      {msg.suggestions.map((card, idx) => {
                        const isChecked = !!selectedCards[card.title];
                        
                        return (
                          <div 
                            key={idx}
                            onClick={() => handleCardToggle(card.title)}
                            className={`glass-card p-3 rounded-xl border flex items-center justify-between cursor-pointer transition select-none ${
                              isChecked 
                                ? "border-emerald-500 bg-emerald-500/[0.03]" 
                                : "hover:border-white/10"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${isChecked ? "bg-emerald-500/20 text-emerald-400 animate-pulse" : "bg-zinc-800 text-zinc-400"}`}>
                                {getCardIcon(card.icon)}
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-zinc-200">{card.title}</h4>
                                <p className="text-[9px] text-zinc-500 font-medium mt-0.5">{card.details}</p>
                              </div>
                            </div>
                            
                            <div className="flex-shrink-0 ml-4 cursor-pointer">
                              {isChecked ? (
                                <CheckCircle2 size={16} className="text-emerald-400 fill-emerald-500/10" />
                              ) : (
                                <div className="w-4 h-4 rounded-full border border-zinc-600 hover:border-zinc-400" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Streaming / Typing loading indicator */}
        {sending && (
          <div className="flex items-center gap-3 mr-auto max-w-[80%] animate-pulse">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
              <Bot size={16} />
            </div>
            <div className="glass-card px-4 py-3.5 rounded-2xl flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Prompt Suggestions Toolbar */}
      <div className="px-4 sm:px-6 py-2 overflow-x-auto flex gap-2 no-scrollbar bg-zinc-950/20">
        <button 
          onClick={() => handleSend("Give me a sustainability plan for this week.")}
          className="text-[10px] sm:text-xs bg-zinc-900 border border-white/5 text-zinc-300 rounded-full px-4 py-1.5 hover:bg-zinc-800 transition cursor-pointer flex-shrink-0 font-medium"
        >
          Weekly plan
        </button>
        <button 
          onClick={() => handleSend("How can I save energy at home?")}
          className="text-[10px] sm:text-xs bg-zinc-900 border border-white/5 text-zinc-300 rounded-full px-4 py-1.5 hover:bg-zinc-800 transition cursor-pointer flex-shrink-0 font-medium"
        >
          Save energy
        </button>
        <button 
          onClick={() => handleSend("Which activities produce the most emissions?")}
          className="text-[10px] sm:text-xs bg-zinc-900 border border-white/5 text-zinc-300 rounded-full px-4 py-1.5 hover:bg-zinc-800 transition cursor-pointer flex-shrink-0 font-medium"
        >
          High emitters
        </button>
      </div>

      {/* Input Message console */}
      <div className="p-4 sm:p-6 border-t border-white/5 bg-zinc-950/40">
        <div className="flex items-center gap-3 w-full max-w-4xl mx-auto relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
            placeholder="Ask about your footprint..."
            className="flex-1 glass-input pl-4 pr-12 py-3.5 text-xs sm:text-sm font-sans"
            disabled={sending}
          />
          
          <button
            onClick={() => handleSend(input)}
            disabled={!input.trim() || sending}
            className="absolute right-2 p-2 bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 disabled:text-zinc-600 rounded-xl text-zinc-950 transition cursor-pointer"
          >
            <Send size={16} />
          </button>
        </div>
      </div>

    </div>
  );
}
