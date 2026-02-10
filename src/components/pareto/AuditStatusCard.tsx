import { motion, AnimatePresence } from "framer-motion";
import { Zap, FileCheck, Play, Pause, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface AuditStatusCardProps {
    isAuditing: boolean;
    isPaused: boolean;
    progress: number;
    isFinished: boolean;
    onTogglePause: () => void;
    onReset: () => void;
    onHideFinished: () => void;
    selectedCount: number;
}

export const AuditStatusCard = ({
    isAuditing,
    isPaused,
    progress,
    isFinished,
    onTogglePause,
    onReset,
    onHideFinished,
    selectedCount
}: AuditStatusCardProps) => {
    return (
        <AnimatePresence mode="wait">
            {isAuditing && (
                <motion.div
                    key="progress-card"
                    initial={{ opacity: 0, height: 0, scale: 0.95 }}
                    animate={{ opacity: 1, height: 'auto', scale: 1 }}
                    exit={{ opacity: 0, height: 0, scale: 0.9, transition: { duration: 0.4, ease: "circIn" } }}
                    className="bg-emerald-600 p-8 rounded-3xl shadow-[0_20px_40px_rgba(16,185,129,0.15)] relative overflow-hidden group mb-8"
                >
                    <div className="absolute -right-10 -bottom-10 opacity-10 group-hover:scale-110 transition-transform duration-1000">
                        <Zap className="w-64 h-64 text-white" />
                    </div>
                    <div className="absolute -left-10 -top-10 opacity-5">
                        <FileCheck className="w-48 h-48 text-white" />
                    </div>

                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                        <div className="relative h-24 w-24 flex-shrink-0">
                            <div className="absolute inset-0 bg-white/20 rounded-full animate-ping" />
                            <div className="relative h-24 w-24 bg-white rounded-3xl shadow-2xl flex items-center justify-center p-4 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                                <img src="/nutresa-tree.png" alt="Nutresa" className="w-full h-full object-contain" />
                            </div>
                        </div>

                        <div className="flex-1 w-full space-y-4">
                            <div className="flex justify-between items-end">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h4 className="text-2xl font-black text-white tracking-tight uppercase">Auditoría Masiva</h4>
                                        <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 font-black text-[10px]">
                                            {isPaused ? "EN PAUSA" : "EN VIVO"}
                                        </Badge>
                                    </div>
                                    <p className="text-emerald-100/80 font-bold text-sm">Procesando {selectedCount} productos para Nutresa</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-6xl font-black text-white/40 tabular-nums leading-none">
                                        {Math.round(progress)}<span className="text-2xl">%</span>
                                    </span>
                                </div>
                            </div>

                            <Progress
                                value={progress}
                                className="h-4 bg-emerald-800 shadow-inner rounded-full overflow-hidden [&>div]:bg-white [&>div]:shadow-[0_0_15px_rgba(255,255,255,0.5)] [&>div]:transition-all [&>div]:duration-500"
                            />

                            <div className="flex flex-wrap gap-4 pt-2">
                                <Button
                                    onClick={onTogglePause}
                                    variant="ghost"
                                    className="text-white hover:bg-white/10 font-black text-xs uppercase tracking-widest px-6 h-10 rounded-xl"
                                >
                                    {isPaused ? <><Play className="w-4 h-4 mr-2" /> Reanudar</> : <><Pause className="w-4 h-4 mr-2" /> Pausar</>}
                                </Button>
                                <Button
                                    onClick={onReset}
                                    variant="ghost"
                                    className="text-emerald-100 hover:text-white hover:bg-white/10 font-black text-xs uppercase tracking-widest px-6 h-10 rounded-xl"
                                >
                                    Reiniciar Proceso
                                </Button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {isFinished && !isAuditing && (
                <motion.div
                    key="finish-card"
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="bg-white p-8 rounded-3xl border-2 border-emerald-500/20 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 mb-8"
                >
                    <div className="flex items-center gap-6">
                        <div className="h-16 w-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 shadow-inner">
                            <CheckCircle className="w-10 h-10" />
                        </div>
                        <div>
                            <h4 className="text-2xl font-black text-stone-800 tracking-tight flex items-center gap-2">
                                ANÁLISIS COMPLETADO
                                <Badge className="bg-emerald-500 text-white font-black animate-pulse">EXITOSO</Badge>
                            </h4>
                            <p className="text-stone-500 font-bold">Hemos procesado todos los productos seleccionados satisfactoriamente.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button
                            onClick={onHideFinished}
                            variant="outline"
                            className="h-14 px-8 rounded-2xl border-stone-200 font-black text-stone-600 hover:bg-stone-50"
                        >
                            OCULTAR AVISO
                        </Button>
                        <Button
                            onClick={onReset}
                            className="h-14 px-8 rounded-2xl bg-stone-900 text-white font-black shadow-[0_10px_20px_rgba(0,0,0,0.1)] hover:scale-105 transition-all"
                        >
                            AUDITAR NUEVAMENTE
                        </Button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
