import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { GeminiChatInterface } from './GeminiChatInterface';
import type { MarketProduct, BenchmarkMetadata } from '@/types/benchmark';

interface GeminiChatButtonProps {
  products: MarketProduct[];
  metadata?: BenchmarkMetadata;
  searchQuery: string;
}

export const GeminiChatButton = ({ products, metadata, searchQuery }: GeminiChatButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-6 right-6 z-40 group flex flex-col items-end">
        <div className="mb-3 px-4 py-2 bg-stone-900/90 backdrop-blur-sm text-white text-[11px] font-black rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 cursor-default whitespace-nowrap relative border border-white/10 uppercase tracking-widest">
          ¿Te ayudo con Gemini?
          <div className="absolute -bottom-1 right-6 w-2 h-2 bg-stone-900 rotate-45" />
        </div>

        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.15)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.2)] hover:scale-110 active:scale-95 transition-all duration-300 bg-white border border-stone-100 p-0 overflow-hidden ring-4 ring-emerald-500/5 group/btn relative"
          size="icon"
          aria-label="Abrir asistente Gemini"
        >
          <div className="absolute inset-0 bg-emerald-500/5 animate-pulse rounded-full" />
          <div className="flex items-center justify-center h-full w-full relative z-10 transition-transform group-hover/btn:rotate-12">
            <img src="/gemini-icon.png" alt="Gemini" className="h-8 w-8 object-contain" />
          </div>
        </Button>
      </div>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md p-0 flex flex-col border-l-stone-100 bg-white shadow-2xl"
        >
          <SheetHeader className="p-8 pb-6 bg-white/80 backdrop-blur-md border-b border-stone-100">
            <SheetTitle className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white border border-stone-100 shadow-sm flex items-center justify-center overflow-hidden p-2 transition-transform hover:scale-105">
                <img src="/gemini-icon.png" alt="Gemini" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black text-stone-800 uppercase tracking-tighter leading-none">
                  Asistente Gemini
                </span>
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-1.5 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Official Google Gemini Intelligence
                </span>
              </div>
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-hidden">
            <GeminiChatInterface
              products={products}
              metadata={metadata}
              searchQuery={searchQuery}
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
