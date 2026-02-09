import { useState, ClipboardEvent, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trash2, Play, Pause, AlertCircle, CheckCircle, Loader2, List, Target, ChevronDown, Store as StoreIcon, FileSpreadsheet, Link as LinkIcon, FileCheck, Zap, Info } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from 'xlsx';
import type { MarketProduct } from "@/types/benchmark";
import { getStoreBrand } from "@/lib/store-branding";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { isEanOnly } from "@/lib/store-capabilities";

interface ParetoItem {
    id: string;
    productName: string;
    keywords: string[];
    ean?: string;
    targetPrice?: number;
    status: 'pending' | 'searching' | 'completed' | 'error';
    selected: boolean;
    foundProducts?: MarketProduct[];
}

interface Store {
    id: string;
    name: string;
    enabled: boolean;
}

interface ParetoInputProps {
    onResultsFound: (results: MarketProduct[]) => void;
}

export const ParetoInput = ({ onResultsFound }: ParetoInputProps) => {
    const [items, setItems] = useState<ParetoItem[]>([]);
    const [isAuditing, setIsAuditing] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [progress, setProgress] = useState(0);
    const [searchMode, setSearchMode] = useState<'best-price' | 'full-list'>('best-price');
    const [showStoreConfig, setShowStoreConfig] = useState(false);
    const [isFinished, setIsFinished] = useState(false);

    // Refs for safe async control
    const pauseRef = useRef(false);
    const stopRef = useRef(false);

    // Ref for searchMode to avoid stale closures in the async loop
    const searchModeRef = useRef(searchMode);

    useEffect(() => {
        searchModeRef.current = searchMode;
    }, [searchMode]);

    // Google Sheets States
    const [gsheetUrl, setGsheetUrl] = useState("");
    const [isFetchingSheet, setIsFetchingSheet] = useState(false);
    const [availableSheets, setAvailableSheets] = useState<string[]>([]);
    const [currentWorkbook, setCurrentWorkbook] = useState<XLSX.WorkBook | null>(null);
    const [isSheetDialogOpen, setIsSheetDialogOpen] = useState(false);

    const [stores, setStores] = useState<Store[]>([
        { id: 'jumbo', name: 'Jumbo', enabled: true },
        { id: 'olimpica', name: 'Olímpica', enabled: true },
        { id: 'exito', name: 'Éxito', enabled: true },
        { id: 'euro', name: 'Euro Supermercados', enabled: true },
        { id: 'vaquita', name: 'Vaquita Express', enabled: true },
        { id: 'megatiendas', name: 'Megatiendas', enabled: true },
        { id: 'mercacentro', name: 'Mercacentro', enabled: true },
        { id: 'zapatoca', name: 'Mercados Zapatoca', enabled: true },
        { id: 'nutresa', name: 'Nutresa en casa', enabled: true },
        { id: 'mundohuevo', name: 'Mundo Huevo', enabled: true },
        { id: 'farmatodo', name: 'Farmatodo', enabled: true },
        { id: 'mercaldas', name: 'Mercaldas', enabled: true },
        { id: 'supermu', name: 'Super Mu', enabled: true }
        // EAN-only stores excluded: Carulla, D1, Makro, Berpa, MercadoLibre
    ]);

    const handlePaste = (e: ClipboardEvent<HTMLTextAreaElement>) => {
        e.preventDefault();
        const text = e.clipboardData.getData("text");

        if (!text) return;

        const rows = text.split(/\r?\n/).filter(line => line.trim() !== "");
        const newItems: ParetoItem[] = rows.map((row) => {
            const cols = row.split("\t");
            const name = cols[0]?.trim();
            const ean = cols[2]?.trim();

            return {
                id: crypto.randomUUID(),
                productName: name || (ean ? `Producto ${ean}` : "Sin nombre"),
                keywords: cols[1] ? cols[1].split(",").map(k => k.trim()) : [],
                ean: ean,
                targetPrice: cols[3] ? parseFloat(cols[3].replace(/[$,]/g, "")) : undefined,
                status: 'pending' as const,
                selected: true
            };
        }).filter(item => item.productName !== "Sin nombre" || item.ean);

        setItems(prev => [...prev, ...newItems]);
        toast.success(`${newItems.length} registros cargados correctamente.`);
    };

    const loadFromGSheet = async () => {
        if (!gsheetUrl) {
            toast.error("Por favor ingresa un link de Google Sheets");
            return;
        }

        let sheetId = "";
        const match = gsheetUrl.match(/[-\w]{25,}/);
        if (match) {
            sheetId = match[0];
        } else {
            toast.error("Link de Google Sheets no válido");
            return;
        }

        setIsFetchingSheet(true);
        try {
            // Fetch as XLSX to get all sheets
            const exportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=xlsx`;
            const response = await fetch(exportUrl);

            if (!response.ok) {
                throw new Error("No se pudo acceder al archivo. Asegúrate de que sea público.");
            }

            const arrayBuffer = await response.arrayBuffer();
            const workbook = XLSX.read(arrayBuffer, { type: 'array' });

            if (workbook.SheetNames.length === 0) {
                toast.error("El archivo no contiene hojas");
                return;
            }

            setCurrentWorkbook(workbook);
            setAvailableSheets(workbook.SheetNames);

            if (workbook.SheetNames.length > 1) {
                setIsSheetDialogOpen(true);
            } else {
                processSheet(workbook, workbook.SheetNames[0]);
            }
        } catch (error) {
            console.error("GSheet Error:", error);
            toast.error("Error al cargar Google Sheets. Verifica que el acceso sea público.");
        } finally {
            setIsFetchingSheet(false);
        }
    };

    const processSheet = (workbook: XLSX.WorkBook, sheetName: string) => {
        const worksheet = workbook.Sheets[sheetName];
        const data: any[] = XLSX.utils.sheet_to_json(worksheet);

        if (data.length === 0) {
            toast.error(`La hoja "${sheetName}" está vacía`);
            return;
        }

        const newItems: ParetoItem[] = data.map((row: any) => {
            const keys = Object.keys(row);
            const findKey = (candidates: string[]) =>
                keys.find(k => candidates.some(c => k.toLowerCase().includes(c.toLowerCase())));

            const nameKey = findKey(['producto', 'nombre', 'product', 'name']) || keys[0];
            const keywordsKey = findKey(['keywords', 'palabras', 'claves', 'fk']) || keys[1];
            const eanKey = findKey(['ean', 'codigo', 'code', 'barras']) || keys[2];
            const priceKey = findKey(['precio', 'target', 'objetivo', 'price']) || keys[3];

            // Extraer nombre
            const name = String(row[nameKey] || "").trim();

            // Extraer EAN con cuidado especial para preservar todos los dígitos
            let ean = "";
            if (row[eanKey]) {
                // Si es número, convertir a string sin notación científica
                if (typeof row[eanKey] === 'number') {
                    ean = row[eanKey].toFixed(0); // Evita notación científica
                } else {
                    ean = String(row[eanKey]).trim();
                }
                // Limpiar cualquier carácter no numérico excepto el EAN mismo
                ean = ean.replace(/[^\d]/g, '');
            }

            // Extraer keywords, ignorando códigos internos largos
            let keywords: string[] = [];
            if (row[keywordsKey]) {
                const rawKeywords = String(row[keywordsKey]).split(",").map((k: string) => k.trim());
                // Filtrar keywords que parecen códigos internos (solo números largos)
                keywords = rawKeywords.filter(k => {
                    // Si es puramente numérico y largo, probablemente es un código FK, lo ignoramos
                    if (/^\d{5,}$/.test(k)) return false;
                    return k.length > 0;
                });
            }

            return {
                id: crypto.randomUUID(),
                productName: name || (ean ? `Producto ${ean}` : "Sin nombre"),
                keywords: keywords,
                ean: ean || undefined,
                targetPrice: row[priceKey] ? parseFloat(String(row[priceKey]).replace(/[$,]/g, "")) : undefined,
                status: 'pending' as const,
                selected: true
            };
        }).filter(item => item.productName !== "Sin nombre" || item.ean);

        setItems(prev => [...prev, ...newItems]);
        setGsheetUrl("");
        setIsSheetDialogOpen(false);
        toast.success(`${newItems.length} productos cargados desde la hoja "${sheetName}"`);
    };

    const removeItem = (id: string) => {
        setItems(prev => prev.filter(i => i.id !== id));
    };

    const toggleItemSelection = (id: string) => {
        setItems(prev => prev.map(item =>
            item.id === id ? { ...item, selected: !item.selected } : item
        ));
    };

    const toggleAllItems = (selected: boolean) => {
        setItems(prev => prev.map(item => ({ ...item, selected })));
    };

    const handleStoreToggle = (storeId: string) => {
        setStores(prev => prev.map(s =>
            s.id === storeId ? { ...s, enabled: !s.enabled } : s
        ));
    };

    const runAudit = async () => {
        const selectedItems = items.filter(i => i.selected);
        if (selectedItems.length === 0) {
            toast.error("Por favor selecciona al menos un producto");
            return;
        }

        const selectedStores = stores.filter(s => s.enabled).map(s => ({ id: s.id, name: s.name }));
        if (selectedStores.length === 0) {
            toast.error("Por favor selecciona al menos una tienda");
            return;
        }

        setIsAuditing(true);
        setIsPaused(false);
        setIsFinished(false);
        pauseRef.current = false;
        stopRef.current = false;

        setProgress(0);
        const total = selectedItems.length;
        let completed = 0;

        const updatedItems = [...items];
        let totalAccumulatedResults: MarketProduct[] = [];

        for (let i = 0; i < updatedItems.length; i++) {
            if (!updatedItems[i].selected) continue;

            // Wait if paused or stop if requested
            while (pauseRef.current && !stopRef.current) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            if (stopRef.current) {
                break;
            }

            updatedItems[i].status = 'searching';
            setItems([...updatedItems]);

            try {
                const payload = {
                    searchMode: 'product',
                    productName: updatedItems[i].productName.startsWith('Producto ') ? '' : updatedItems[i].productName,
                    keywords: updatedItems[i].keywords,
                    ean: updatedItems[i].ean,
                    selectedStores: selectedStores,
                    categoryFilter: 'all',
                    advancedOptions: {
                        searchRecency: 'month',
                        deepResearch: false
                    }
                };

                const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/price-scraper`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`
                    },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) throw new Error("API Error");

                const data = await response.json();
                const allResults = data.products || [];

                updatedItems[i].status = 'completed';

                if (searchModeRef.current === 'best-price') {
                    // In best-price mode, we still store ALL results in the item for specific logic,
                    // BUT we might want to only show one.
                    // Actually, per plan, we ALWAYS store all results now.
                    // So we just assign allResults to foundProducts.
                    updatedItems[i].foundProducts = allResults;

                    // For the callback accumulation, we'll handle it at the end or accumulation logic needs to check mode
                    // But wait, the plan said: "At the end of runAudit... construct the totalAccumulatedResults"
                } else {
                    updatedItems[i].foundProducts = allResults;
                }

                // Unified storage: Always store everything
                updatedItems[i].foundProducts = allResults;

            } catch (error) {
                console.error(`Error auditing ${updatedItems[i].productName}:`, error);
                updatedItems[i].status = 'error';
            }

            completed++;
            setProgress((completed / total) * 100);
            setItems([...updatedItems]);
        }

        setIsAuditing(false);
        setIsPaused(false);
        setIsFinished(true); // Mark as finished for animation
        pauseRef.current = false;

        if (stopRef.current) {
            toast.info("Proceso detenido y reiniciado");
            stopRef.current = false;
            return;
        }

        toast.success("Carga masiva completada");

        // Calculate final accumulated results based on the FINAL mode selected by user
        // This ensures if they switched to "Cross List" at the last second, they get everything.
        const finalRequiredResults: MarketProduct[] = [];

        updatedItems.forEach(item => {
            if (item.selected && item.foundProducts && item.foundProducts.length > 0) {
                if (searchModeRef.current === 'best-price') {
                    // Add only the first one (best price)
                    finalRequiredResults.push(item.foundProducts[0]);
                } else {
                    // Add all
                    finalRequiredResults.push(...item.foundProducts);
                }
            }
        });

        if (finalRequiredResults.length > 0) {
            onResultsFound(finalRequiredResults);
        }
    };

    const resetAudit = () => {
        if (isAuditing) {
            stopRef.current = true;
            pauseRef.current = false;
            setIsPaused(false);
        }

        setItems(prev => prev.map(item => ({
            ...item,
            status: 'pending',
            foundProducts: undefined
        })));
        setProgress(0);
        setIsAuditing(false);
    };

    const togglePause = () => {
        const nextPause = !isPaused;
        setIsPaused(nextPause);
        pauseRef.current = nextPause;
    };

    return (
        <div className="p-4 md:p-6 lg:p-10 animate-fade-in">
            {/* Header & Description */}
            <div className="max-w-4xl mx-auto mb-10">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-4 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 shadow-sm">
                        <Zap className="w-8 h-8 text-emerald-600" />
                    </div>
                    <div>
                        <h3 className="text-3xl font-black text-foreground tracking-tight">Carga Masiva (Pareto)</h3>
                        <p className="text-muted-foreground font-medium">
                            Auditoría de precios a gran escala mediante Google Sheets o pegado manual
                        </p>
                    </div>
                </div>

                {/* Audit Configuration & Control Bar */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                    <div className="space-y-4">
                        <Label className="text-[11px] font-black text-stone-400 ml-1 uppercase tracking-widest">
                            Configuración de Auditoría
                        </Label>
                        <Tabs value={searchMode} onValueChange={(v: any) => setSearchMode(v)} className="w-full">
                            <TabsList className="grid w-full grid-cols-2 h-14 p-1.5 bg-stone-100/80 rounded-2xl relative">
                                <TabsTrigger
                                    value="best-price"
                                    className="relative z-10 h-full rounded-xl font-black text-xs uppercase tracking-wide data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm transition-all duration-300"
                                >
                                    <Target className="w-4 h-4 mr-2" /> Mejor Precio
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Info className="w-3.5 h-3.5 ml-2 text-stone-300 hover:text-emerald-500 transition-colors" />
                                            </TooltipTrigger>
                                            <TooltipContent className="bg-stone-900 text-white rounded-xl p-3 border-none shadow-xl">
                                                <p className="text-[10px] font-bold">Extrae solo el precio más bajo entre todas las tiendas.</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="full-list"
                                    className="relative z-10 h-full rounded-xl font-black text-xs uppercase tracking-wide data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm transition-all duration-300"
                                >
                                    <List className="w-4 h-4 mr-2" /> Lista Cruzada
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>

                    <div className="flex items-center gap-3">
                        <Collapsible open={showStoreConfig} onOpenChange={setShowStoreConfig} className="flex-1">
                            <CollapsibleTrigger asChild>
                                <Button variant="outline" className="w-full h-14 rounded-2xl border-stone-200 bg-white font-bold text-stone-600 shadow-sm hover:bg-stone-50 hover:border-emerald-200 hover:text-emerald-700 transition-all text-xs uppercase tracking-wide">
                                    <div className={`p-1.5 rounded-lg mr-3 transition-colors ${showStoreConfig ? 'bg-emerald-100 text-emerald-600' : 'bg-stone-100 text-stone-400'}`}>
                                        <StoreIcon className="w-4 h-4" />
                                    </div>
                                    Tiendas ({stores.filter(s => s.enabled).length})
                                    <ChevronDown className={`ml-auto w-4 h-4 transition-transform duration-300 text-stone-400 ${showStoreConfig ? 'rotate-180 text-emerald-500' : ''}`} />
                                </Button>
                            </CollapsibleTrigger>
                        </Collapsible>

                        {items.length > 0 && !isAuditing && (
                            <Button
                                variant="outline"
                                onClick={() => setItems([])}
                                className="h-14 w-14 rounded-2xl border-rose-100 text-rose-400 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 shadow-sm transition-all"
                            >
                                <Trash2 className="w-5 h-5" />
                            </Button>
                        )}

                        <Button
                            onClick={runAudit}
                            disabled={items.length === 0 || isAuditing}
                            className="h-14 px-8 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-95 flex-1 md:flex-none uppercase tracking-widest text-xs"
                        >
                            {isAuditing ? <Loader2 className="w-5 h-5 mr-3 animate-spin" /> : <Play className="w-5 h-5 mr-3 fill-current" />}
                            {isAuditing ? "PROCESANDO..." : "AUDITAR"}
                        </Button>
                    </div>
                </div>

                {/* Collapsible Store Selector */}
                <Collapsible open={showStoreConfig} onOpenChange={setShowStoreConfig}>
                    <CollapsibleContent className="pt-4 animate-in slide-in-from-top-2">
                        <div className="p-6 rounded-[24px] bg-white border border-stone-100 shadow-xl shadow-stone-200/50 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                            {stores.map(store => (
                                <div
                                    key={store.id}
                                    className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer group hover:scale-[1.02] active:scale-95 ${store.enabled
                                        ? 'bg-emerald-50/50 border-emerald-500/20 shadow-sm'
                                        : 'bg-stone-50 border-stone-100 opacity-60 grayscale hover:grayscale-0'
                                        }`}
                                    onClick={() => handleStoreToggle(store.id)}
                                >
                                    <Checkbox
                                        id={`store-${store.id}`}
                                        checked={store.enabled}
                                        onCheckedChange={() => handleStoreToggle(store.id)}
                                        className={`transition-all ${store.enabled ? 'data-[state=checked]:bg-emerald-500 data-[state=checked]:border-none' : 'border-stone-300'}`}
                                    />
                                    <label htmlFor={`store-${store.id}`} className={`text-[10px] font-black cursor-pointer uppercase tracking-tight truncate ${store.enabled ? 'text-emerald-800' : 'text-stone-500'}`}>
                                        {store.name}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </CollapsibleContent>
                </Collapsible>
            </div>

            {/* Main Action Area (Loading Data or Running Audit) */}
            <div className="max-w-6xl mx-auto space-y-8">
                {items.length === 0 && !isAuditing ? (
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
                                                onKeyDown={(e) => e.key === 'Enter' && loadFromGSheet()}
                                            />
                                        </div>
                                        <Button
                                            onClick={loadFromGSheet}
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
                                        onPaste={handlePaste}
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

                ) : (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                        <AnimatePresence mode="wait">
                            {isAuditing && (
                                <motion.div
                                    key="progress-card"
                                    initial={{ opacity: 0, height: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, height: 'auto', scale: 1 }}
                                    exit={{ opacity: 0, height: 0, scale: 0.9, transition: { duration: 0.4, ease: "circIn" } }}
                                    className="bg-emerald-600 p-8 rounded-3xl shadow-[0_20px_40px_rgba(16,185,129,0.15)] relative overflow-hidden group"
                                >
                                    {/* Decorative elements */}
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
                                                    <p className="text-emerald-100/80 font-bold text-sm">Procesando {items.filter(i => i.selected).length} productos para Nutresa</p>
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
                                                    onClick={togglePause}
                                                    variant="ghost"
                                                    className="text-white hover:bg-white/10 font-black text-xs uppercase tracking-widest px-6 h-10 rounded-xl"
                                                >
                                                    {isPaused ? <><Play className="w-4 h-4 mr-2" /> Reanudar</> : <><Pause className="w-4 h-4 mr-2" /> Pausar</>}
                                                </Button>
                                                <Button
                                                    onClick={resetAudit}
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
                                    className="bg-white p-8 rounded-3xl border-2 border-emerald-500/20 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6"
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
                                            onClick={() => setIsFinished(false)}
                                            variant="outline"
                                            className="h-14 px-8 rounded-2xl border-stone-200 font-black text-stone-600 hover:bg-stone-50"
                                        >
                                            OCULTAR AVISO
                                        </Button>
                                        <Button
                                            onClick={resetAudit}
                                            className="h-14 px-8 rounded-2xl bg-stone-900 text-white font-black shadow-[0_10px_20px_rgba(0,0,0,0.1)] hover:scale-105 transition-all"
                                        >
                                            AUDITAR NUEVAMENTE
                                        </Button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Results / Preview Table */}
                        <div className="bg-white rounded-[32px] border border-stone-200 shadow-2xl shadow-stone-200/50 overflow-hidden animate-slide-up">
                            <div className="p-8 bg-white border-b border-stone-100 flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <div className="w-2 h-10 bg-gradient-to-b from-emerald-500 to-teal-600 rounded-full" />
                                    <div>
                                        <h5 className="font-black text-stone-800 uppercase tracking-tight text-xl leading-none">Listado de Auditoría</h5>
                                        <p className="text-[10px] font-bold text-stone-400 mt-1 uppercase tracking-widest">Vista Previa de Productos</p>
                                    </div>
                                    <Badge variant="outline" className="ml-2 font-black text-emerald-600 bg-emerald-50 border-emerald-100 px-3 py-1 text-xs">
                                        {items.length} REGISTROS
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-3 bg-stone-50 px-4 py-2 rounded-xl border border-stone-100">
                                    <Checkbox
                                        id="selectAll"
                                        checked={items.every(i => i.selected)}
                                        onCheckedChange={(v) => toggleAllItems(!!v)}
                                        className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600 border-stone-300"
                                    />
                                    <Label htmlFor="selectAll" className="text-[10px] font-black text-stone-500 uppercase cursor-pointer tracking-widest">Marcar Todos</Label>
                                </div>
                            </div>

                            <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                                <Table>
                                    <TableHeader className="bg-stone-50/90 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
                                        <TableRow className="hover:bg-transparent border-stone-100">
                                            <TableHead className="w-[60px]"></TableHead>
                                            <TableHead className="text-[10px] font-black text-stone-500 uppercase tracking-widest px-6 py-4">Identificación</TableHead>
                                            <TableHead className="text-[10px] font-black text-stone-500 uppercase tracking-widest py-4">Producto / FK</TableHead>
                                            <TableHead className="text-[10px] font-black text-stone-500 uppercase tracking-widest py-4">Estado</TableHead>
                                            <TableHead className="text-[10px] font-black text-stone-500 uppercase tracking-widest text-right px-8 py-4 w-[200px]">Resultados</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        <AnimatePresence>
                                            {items.map((item, idx) => (
                                                <motion.tr
                                                    key={item.id}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: 10 }}
                                                    transition={{ delay: idx * 0.05 }}
                                                    className={`border-b border-stone-100 transition-colors ${!item.selected ? 'opacity-40 grayscale bg-stone-50/10' : 'hover:bg-stone-50/50'} group`}
                                                >
                                                    <TableCell className="px-6">
                                                        <Checkbox
                                                            checked={item.selected}
                                                            onCheckedChange={() => toggleItemSelection(item.id)}
                                                            disabled={isAuditing}
                                                            className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] font-black text-stone-400 uppercase tracking-tighter">EAN / CODE</span>
                                                            <span className="font-mono text-xs font-bold text-stone-600">{item.ean || "---"}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col gap-0.5">
                                                            <span className="font-black text-stone-800 text-sm line-clamp-1">{item.productName}</span>
                                                            {item.keywords.length > 0 && (
                                                                <div className="flex flex-wrap gap-1">
                                                                    {item.keywords.map((k, i) => (
                                                                        <span key={i} className="text-[9px] font-bold text-emerald-600/70 bg-emerald-50 px-1.5 rounded uppercase">{k}</span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            {item.status === 'pending' && (
                                                                <div className="flex items-center gap-1.5 px-3 py-1 bg-stone-100 rounded-full text-[10px] font-black text-stone-500 uppercase tracking-wider">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-stone-300" /> Cola
                                                                </div>
                                                            )}
                                                            {item.status === 'searching' && (
                                                                <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500 rounded-full text-[10px] font-black text-white uppercase tracking-wider animate-pulse">
                                                                    <Loader2 className="w-3 h-3 animate-spin" /> Buscando
                                                                </div>
                                                            )}
                                                            {item.status === 'completed' && (
                                                                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${item.foundProducts?.length ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-100 text-stone-400'}`}>
                                                                    {item.foundProducts?.length ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                                                                    {item.foundProducts?.length ? 'Verificado' : 'No Encontrado'}
                                                                </div>
                                                            )}
                                                            {item.status === 'error' && (
                                                                <div className="flex items-center gap-1.5 px-3 py-1 bg-destructive/10 rounded-full text-[10px] font-black text-destructive uppercase tracking-wider">
                                                                    <AlertCircle className="w-3 h-3" /> Error
                                                                </div>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right px-6">
                                                        {item.foundProducts && item.foundProducts.length > 0 ? (
                                                            <div className="flex flex-row items-center justify-end gap-2 py-1">
                                                                <div className="flex flex-row items-center justify-end -space-x-2">
                                                                    {(() => {
                                                                        // Filter products based on display mode
                                                                        const productsToDisplay = searchMode === 'best-price' && item.foundProducts?.length
                                                                            ? [item.foundProducts[0]]
                                                                            : (item.foundProducts || []);

                                                                        const zIndices = ['z-[10]', 'z-[9]', 'z-[8]', 'z-[7]'];

                                                                        return productsToDisplay.slice(0, 4).map((p, i) => {
                                                                            const brand = getStoreBrand(p.store);
                                                                            return (
                                                                                <div
                                                                                    key={i}
                                                                                    className={`w-8 h-8 rounded-full overflow-hidden border-2 border-white flex items-center justify-center bg-white shadow-md ring-1 ring-stone-100 hover:scale-110 hover:z-20 transition-all cursor-help relative ${zIndices[i] || 'z-0'}`}
                                                                                    title={`${p.store}: ${p.price.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })}`}
                                                                                >
                                                                                    {brand.icon ? (
                                                                                        <img src={brand.icon} alt={p.store} className="w-full h-full object-contain" />
                                                                                    ) : (
                                                                                        <StoreIcon className="w-4 h-4 text-stone-300" />
                                                                                    )}
                                                                                </div>
                                                                            );
                                                                        });
                                                                    })()}
                                                                </div>
                                                                {item.foundProducts.length > 4 && (
                                                                    <div className="flex items-center h-8 px-1">
                                                                        <span className="text-[10px] font-black text-stone-400 tracking-tight italic whitespace-nowrap">
                                                                            + {item.foundProducts.length - 4}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            !isAuditing && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => removeItem(item.id)}
                                                                    className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 text-stone-300 hover:text-destructive hover:bg-destructive/5 transition-all"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </Button>
                                                            )
                                                        )}
                                                    </TableCell>
                                                </motion.tr>
                                            ))}
                                        </AnimatePresence>
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Sheet Selection Dialog */}
            {/* Sheet Selection Dialog */}
            <Dialog open={isSheetDialogOpen} onOpenChange={setIsSheetDialogOpen}>
                <DialogContent className="sm:max-w-[425px] rounded-3xl p-8 border-none shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black text-stone-800 flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-xl bg-emerald-50">
                                <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
                            </div>
                            Seleccionar Hoja
                        </DialogTitle>
                        <DialogDescription className="font-medium text-stone-500">
                            Detectamos varias hojas en el archivo. Favor elige la correcta para iniciar la carga.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-3 py-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {availableSheets.map((sheet) => (
                            <Button
                                key={sheet}
                                variant="outline"
                                className="group relative justify-start h-16 px-6 rounded-2xl border-stone-100 hover:border-emerald-500/50 hover:bg-emerald-50 transition-all overflow-hidden"
                                onClick={() => currentWorkbook && processSheet(currentWorkbook, sheet)}
                            >
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <FileCheck className="w-5 h-5 mr-4 text-stone-300 group-hover:text-emerald-600 transition-colors" />
                                <span className="font-black text-stone-600 group-hover:text-stone-800 uppercase tracking-tight text-sm">{sheet}</span>
                            </Button>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};
