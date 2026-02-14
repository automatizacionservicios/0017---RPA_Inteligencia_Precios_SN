import { useState } from "react";
import { ChevronDown, Store as StoreIcon, Trash2, Play, Zap, Info, Target, List, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { MarketProduct } from "@/types/benchmark";

// Custom Hooks
import { useParetoData, ParetoItem } from "@/hooks/useParetoData";
import { useParetoAudit } from "@/hooks/useParetoAudit";
import { useParetoStores } from "@/hooks/useParetoStores";

// Sub-components
import { StoreSelector } from "./pareto/StoreSelector";
import { DataIngestionCards } from "./pareto/DataIngestionCards";
import { AuditStatusCard } from "./pareto/AuditStatusCard";
import { ParetoResultsTable } from "./pareto/ParetoResultsTable";
import { SheetSelectorDialog } from "./pareto/SheetSelectorDialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
interface ParetoInputProps {
    onResultsFound: (results: MarketProduct[]) => void;
}

export const ParetoInput = ({ onResultsFound }: ParetoInputProps) => {
    // Hooks initialization
    const {
        items, setItems,
        gsheetUrl, setGsheetUrl,
        isFetchingSheet,
        availableSheets,
        currentWorkbook,
        isSheetDialogOpen, setIsSheetDialogOpen,
        handlePaste,
        loadFromGSheet,
        processSheet,
        removeItem,
        toggleItemSelection,
        toggleAllItems
    } = useParetoData();

    const { stores, handleStoreToggle, enabledStoresCount } = useParetoStores('national');

    const [searchMode, setSearchMode] = useState<'best-price' | 'full-list'>('full-list');
    const [showStoreConfig, setShowStoreConfig] = useState(false);

    const {
        isAuditing,
        isPaused,
        progress,
        isFinished,
        setIsFinished,
        runAudit,
        resetAudit,
        togglePause
    } = useParetoAudit({
        items,
        setItems,
        stores,
        onResultsFound,
        searchMode,
        locationId: 'national'
    });

    return (
        <div className="p-4 md:p-6 lg:p-10 animate-fade-in">
            {/* Header & Description */}
            <div className="max-w-4xl mx-auto mb-10">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-4 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 shadow-sm">
                        <Zap className="w-8 h-8 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <h3 className="text-3xl font-black text-foreground tracking-tight">Carga Masiva (Pareto)</h3>
                                <div className="p-1 px-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                    <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Enterprise</span>
                                </div>
                            </div>
                        </div>
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
                                    value="full-list"
                                    className="relative z-10 h-full rounded-xl font-black text-xs uppercase tracking-wide data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm transition-all duration-300"
                                >
                                    <List className="w-4 h-4 mr-2" /> Lista Cruzada
                                </TabsTrigger>
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
                                    Tiendas ({enabledStoresCount})
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

                <StoreSelector
                    open={showStoreConfig}
                    onOpenChange={setShowStoreConfig}
                    stores={stores}
                    onToggle={handleStoreToggle}
                />
            </div>

            {/* Main Action Area */}
            <div className="max-w-6xl mx-auto space-y-8">
                {items.length === 0 && !isAuditing ? (
                    <DataIngestionCards
                        gsheetUrl={gsheetUrl}
                        setGsheetUrl={setGsheetUrl}
                        isFetchingSheet={isFetchingSheet}
                        onLoadFromGSheet={() => loadFromGSheet(gsheetUrl)}
                        onPaste={(e) => handlePaste(e.clipboardData.getData("text"))}
                    />
                ) : (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                        <AuditStatusCard
                            isAuditing={isAuditing}
                            isPaused={isPaused}
                            progress={progress}
                            isFinished={isFinished}
                            onTogglePause={togglePause}
                            onReset={resetAudit}
                            onHideFinished={() => setIsFinished(false)}
                            selectedCount={items.filter(i => i.selected).length}
                        />

                        <ParetoResultsTable
                            items={items}
                            isAuditing={isAuditing}
                            onToggleSelection={toggleItemSelection}
                            onToggleAll={toggleAllItems}
                        />
                    </div>
                )}
            </div>

            <SheetSelectorDialog
                open={isSheetDialogOpen}
                onOpenChange={setIsSheetDialogOpen}
                availableSheets={availableSheets}
                onSelectSheet={(name) => currentWorkbook && processSheet(currentWorkbook, name)}
            />
        </div>
    );
};
