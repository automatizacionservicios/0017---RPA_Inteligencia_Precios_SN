import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { ParetoItem } from "./useParetoData";
import { MarketProduct } from "@/types/benchmark";

interface UseParetoAuditProps {
    items: ParetoItem[];
    setItems: (items: ParetoItem[]) => void;
    stores: { id: string, name: string, enabled: boolean }[];
    onResultsFound: (results: MarketProduct[]) => void;
    searchMode: 'best-price' | 'full-list';
}

export const useParetoAudit = ({
    items,
    setItems,
    stores,
    onResultsFound,
    searchMode
}: UseParetoAuditProps) => {
    const [isAuditing, setIsAuditing] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isFinished, setIsFinished] = useState(false);

    const pauseRef = useRef(false);
    const stopRef = useRef(false);
    const searchModeRef = useRef(searchMode);

    useEffect(() => {
        searchModeRef.current = searchMode;
    }, [searchMode]);

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

        for (let i = 0; i < updatedItems.length; i++) {
            if (!updatedItems[i].selected) continue;

            while (pauseRef.current && !stopRef.current) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            if (stopRef.current) break;

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
                updatedItems[i].foundProducts = data.products || [];
                updatedItems[i].status = 'completed';

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
        setIsFinished(true);
        pauseRef.current = false;

        if (stopRef.current) {
            toast.info("Proceso detenido y reiniciado");
            stopRef.current = false;
            return;
        }

        toast.success("Carga masiva completada");

        const finalRequiredResults: MarketProduct[] = [];
        updatedItems.forEach(item => {
            if (item.selected && item.foundProducts && item.foundProducts.length > 0) {
                if (searchModeRef.current === 'best-price') {
                    finalRequiredResults.push(item.foundProducts[0]);
                } else {
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
        setItems(items.map(item => ({
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

    return {
        isAuditing,
        isPaused,
        progress,
        isFinished,
        setIsFinished,
        runAudit,
        resetAudit,
        togglePause
    };
};
