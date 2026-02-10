import { FileSpreadsheet, Link as LinkIcon, Target, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface DataIngestionCardsProps {
    gsheetUrl: string;
    setGsheetUrl: (val: string) => void;
    isFetchingSheet: boolean;
    onLoadFromGSheet: () => void;
    onPaste: (e: React.ClipboardEvent<HTMLTextAreaElement>) => void;
}

export const DataIngestionCards = ({
    gsheetUrl,
    setGsheetUrl,
    isFetchingSheet,
    onLoadFromGSheet,
    onPaste
}: DataIngestionCardsProps) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4">
            {/* Option A: Google Sheets */}
            <div className="group relative p-8 rounded-[32px] bg-white border border-stone-100 shadow-2xl shadow-stone-200/50 hover:border-emerald-500/20 transition-all duration-500">
                <div className="absolute -top-3 left-8 px-4 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-emerald-500/20">
                    Recomendado
                </div>

                <div className="flex flex-col h-full">
                    <div className="p-4 rounded-2xl bg-emerald-50 w-fit mb-6 group-hover:scale-110 transition-transform duration-500">
                        <FileSpreadsheet className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h4 className="text-2xl font-black text-stone-800 mb-2 tracking-tight">Google Sheets</h4>
                    <p className="text-sm font-medium text-stone-500 mb-8 leading-relaxed">
                        Sincroniza tus productos directamente desde una hoja pública de Google.
                        Ideal para listados largos y control de FK/EAN.
                    </p>

                    <div className="mt-auto space-y-4">
                        <div className="flex gap-3">
                            <div className="relative flex-1">
                                <LinkIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                                <Input
                                    placeholder="Pega el link del Google Sheet..."
                                    className="h-14 pl-12 rounded-2xl border-stone-200 bg-stone-50/50 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm font-bold shadow-inner"
                                    value={gsheetUrl}
                                    onChange={(e) => setGsheetUrl(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && onLoadFromGSheet()}
                                />
                            </div>
                            <Button
                                onClick={onLoadFromGSheet}
                                disabled={isFetchingSheet}
                                className="h-14 px-8 rounded-2xl bg-stone-900 text-white font-black hover:bg-black shadow-lg shadow-stone-900/20 transition-all hover:scale-105"
                            >
                                {isFetchingSheet ? <Loader2 className="w-5 h-5 animate-spin" /> : "ANALIZAR"}
                            </Button>
                        </div>
                        <p className="text-[9px] text-stone-400 font-bold uppercase tracking-widest text-center border-t border-stone-100 pt-4">
                            Requiere columnas: Producto | Keywords | EAN | Precio
                        </p>
                    </div>
                </div>
            </div>

            {/* Option B: Manual Paste */}
            <div className="group p-8 rounded-[32px] bg-white border border-stone-100 shadow-2xl shadow-stone-200/50 hover:border-emerald-500/20 transition-all duration-500">
                <div className="flex flex-col h-full">
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-4 rounded-2xl bg-stone-50 group-hover:bg-stone-100 group-hover:scale-110 transition-all duration-500">
                            <Target className="w-8 h-8 text-stone-400 group-hover:text-stone-600" />
                        </div>
                        <div className="text-right">
                            <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest border border-emerald-100 px-3 py-1.5 rounded-lg bg-emerald-50">Antibobos Active</p>
                        </div>
                    </div>
                    <h4 className="text-2xl font-black text-stone-800 mb-2 tracking-tight">Pegado Manual</h4>
                    <p className="text-sm font-medium text-stone-500 mb-6 leading-relaxed">
                        Copia de Excel y pega aquí. El sistema detectará las columnas por ti automáticamente.
                    </p>

                    <div className="relative flex-1">
                        <Textarea
                            placeholder="Copia aquí tus datos de Excel..."
                            className="min-h-[160px] rounded-[24px] border-2 border-dashed border-stone-200 bg-stone-50/50 hover:bg-white focus:bg-white focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 text-center flex flex-col items-center justify-center pt-12 transition-all text-sm font-medium shadow-inner resize-none"
                            onPaste={onPaste}
                        />
                        <div className="absolute inset-x-0 top-12 flex justify-center pointer-events-none opacity-40">
                            <Target className="w-8 h-8 text-stone-300 animate-pulse" />
                        </div>
                        <div className="mt-4 flex flex-col gap-2 px-2">
                            <div className="flex justify-between">
                                <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest">Soporta Tabulaciones y CSV</span>
                                <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Detección Automática</span>
                            </div>
                            <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                                <p className="text-[10px] font-bold text-stone-500 leading-normal italic">
                                    💡 Tip: Si pegas desde Excel, asegúrate que el orden sea: <span className="text-stone-800">Nombre | Marcas | EAN | Precio</span>.
                                    Si solo tienes EAN, pégalo en la tercera columna.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
