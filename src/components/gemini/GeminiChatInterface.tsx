import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, User } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import type { MarketProduct, BenchmarkMetadata } from '@/types/benchmark';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface GeminiChatInterfaceProps {
  products: MarketProduct[];
  metadata?: BenchmarkMetadata;
  searchQuery: string;
}

// Helper para obtener la clave de almacenamiento
const getStorageKey = (): string | null => {
  const sessionId = sessionStorage.getItem('geminiSearchSessionId');
  return sessionId ? `geminiChat_${sessionId}` : null;
};

export const GeminiChatInterface = ({
  products,
  metadata,
  searchQuery,
}: GeminiChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>(() => {
    // Intentar cargar del sessionStorage
    const storageKey = getStorageKey();
    if (storageKey) {
      const stored = sessionStorage.getItem(storageKey);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          // Convertir timestamps de string a Date
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return parsed.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          }));
        } catch (error) {
          console.error('Error al cargar historial de chat:', error);
        }
      }
    }

    // Si no hay historial guardado, usar mensaje de bienvenida
    return [
      {
        role: 'assistant',
        content:
          '¡Hola! Soy Gemini 👋\n\nEstoy aquí para ayudarte a analizar los resultados del scraping. Puedes preguntarme sobre:\n\n• Comparaciones de precios entre tiendas\n• Mejor relación precio/calidad\n• Tendencias y patrones\n• Insights específicos de los datos\n\n¿Qué te gustaría saber?',
        timestamp: new Date(),
      },
    ];
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Persistir mensajes en sessionStorage
  useEffect(() => {
    const storageKey = getStorageKey();
    if (storageKey && messages.length > 0) {
      sessionStorage.setItem(storageKey, JSON.stringify(messages));
    }
  }, [messages]);

  // Auto-scroll al nuevo mensaje
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gemini-chat`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: input,
            products,
            metadata,
            searchQuery,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al obtener respuesta de Gemini');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      toast.error(error instanceof Error ? error.message : 'Error al comunicarse con Gemini');
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-stone-50/50">
      <ScrollArea className="flex-1 px-6 pt-6" ref={scrollRef}>
        <div className="space-y-8 pb-6">
          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm border transition-transform hover:scale-105 ${
                    msg.role === 'user'
                      ? 'bg-stone-900 border-stone-800 text-white'
                      : 'bg-white border-stone-100'
                  }`}
                >
                  {msg.role === 'user' ? (
                    <User className="w-5 h-5" />
                  ) : (
                    <img src="/gemini-icon.png" alt="Gemini" className="w-5 h-5 object-contain" />
                  )}
                </div>

                <div
                  className={`flex flex-col max-w-[80%] ${
                    msg.role === 'user' ? 'items-end text-right' : 'items-start'
                  }`}
                >
                  <div
                    className={`p-4 rounded-3xl text-[13px] font-medium leading-relaxed shadow-sm transition-all ${
                      msg.role === 'user'
                        ? 'bg-emerald-600 text-white rounded-tr-none shadow-emerald-200/20'
                        : 'bg-white border border-stone-100 text-stone-700 rounded-tl-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-2 px-1 opacity-60">
                    {msg.timestamp.toLocaleTimeString('es-CO', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-4"
            >
              <div className="w-9 h-9 rounded-2xl bg-white border border-stone-100 shadow-sm flex items-center justify-center p-2">
                <img
                  src="/gemini-icon.png"
                  alt="Gemini"
                  className="w-full h-full object-contain animate-pulse"
                />
              </div>
              <div className="bg-white/50 backdrop-blur-sm border border-stone-100 px-5 py-4 rounded-3xl rounded-tl-none shadow-sm">
                <div className="flex gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/40 animate-bounce [animation-delay:0ms]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/40 animate-bounce [animation-delay:150ms]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/40 animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      <div className="p-6 border-t border-stone-100 bg-white/50 backdrop-blur-md">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-3 relative group"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pregunta sobre los resultados..."
            disabled={isLoading}
            className="h-14 rounded-2xl border-stone-100 bg-white/80 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-all text-sm font-bold text-stone-800 pl-5 pr-14 shadow-sm group-hover:border-stone-200"
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            size="icon"
            className="absolute right-1.5 top-1.5 h-11 w-11 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition-all shadow-md active:scale-90"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
        <div className="flex items-center justify-center gap-2 mt-4 opacity-40 hover:opacity-100 transition-opacity">
          <span className="text-[9px] font-black text-stone-400 uppercase tracking-[0.2em]">
            Official Gemini Intelligence
          </span>
          <span className="w-1 h-1 rounded-full bg-emerald-500" />
          <span className="text-[9px] font-black text-stone-400 uppercase tracking-[0.2em]">
            Assistant AI
          </span>
        </div>
      </div>
    </div>
  );
};
