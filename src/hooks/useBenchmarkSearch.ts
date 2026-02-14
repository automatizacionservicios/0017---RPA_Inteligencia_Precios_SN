import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Store, AdvancedOptions } from "./useStoreManagement";

interface UseBenchmarkSearchProps {
    initialSearch?: string | null;
    isEanMode?: boolean;
    isLoading: boolean;
    stores: Store[];
    advancedOptions: AdvancedOptions;
    onSearch: (
        searchMode: 'product' | 'store-catalog',
        productName: string,
        productType: string,
        presentation: string,
        selectedStores: Store[],
        advancedOptions: AdvancedOptions,
        storeId?: string,
        keywords?: string[],
        ean?: string,
        brand?: string,
        category?: string,
        productLimit?: number
    ) => void;
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

export const useBenchmarkSearch = ({
    initialSearch,
    isEanMode,
    isLoading,
    stores,
    advancedOptions,
    onSearch,
    activeTab,
    setActiveTab
}: UseBenchmarkSearchProps) => {
    const [productName, setProductName] = useState("");
    const [brandName, setBrandName] = useState("");
    const [categoryName, setCategoryName] = useState("");
    const [eanCode, setEanCode] = useState("");
    const [keywords, setKeywords] = useState("");
    const [selectedStoreForCatalog, setSelectedStoreForCatalog] = useState("");
    const [catalogCategory, setCatalogCategory] = useState("");
    const [catalogLimit, setCatalogLimit] = useState(20);


    useEffect(() => {
        if (initialSearch) {
            if (isEanMode) {
                setEanCode(initialSearch);
                setActiveTab("ean");
            } else {
                setProductName(initialSearch);
                setActiveTab("name");
            }

            if (!isLoading) {
                const timer = setTimeout(() => {
                    const enabledStores = stores.filter(s => s.enabled);
                    const allEnabledStores = [...enabledStores];

                    onSearch(
                        'product',
                        isEanMode ? "" : initialSearch,
                        "",
                        "",
                        allEnabledStores,
                        advancedOptions,
                        undefined,
                        [],
                        isEanMode ? initialSearch : undefined,
                        undefined,
                        undefined,
                        undefined
                    );
                }, 300);
                return () => clearTimeout(timer);
            }
        }
    }, [initialSearch, isEanMode]);

    const handleProductSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!productName.trim() && !eanCode.trim()) {
            toast.error("Por favor ingresa el nombre del producto o un EAN");
            return;
        }
        const allStores = [...stores];
        const selectedStores = allStores.filter(store => store.enabled);
        if (selectedStores.length === 0) {
            toast.error("Por favor selecciona al menos una tienda");
            return;
        }
        const keywordsList = keywords.split(',').map(k => k.trim()).filter(k => k.length > 0);
        onSearch(
            'product',
            productName.trim(),
            "",
            "",
            selectedStores,
            advancedOptions,
            undefined,
            keywordsList,
            eanCode.trim() || undefined,
            brandName.trim() || undefined,
            categoryName.trim() || undefined,
            undefined
        );
    };

    const handleCatalogSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStoreForCatalog) {
            toast.error("Por favor selecciona una tienda");
            return;
        }
        onSearch(
            'store-catalog',
            '',
            '',
            '',
            [],
            advancedOptions,
            selectedStoreForCatalog,
            catalogCategory.trim() ? [catalogCategory.trim()] : [],
            eanCode.trim() || undefined,
            brandName.trim() || undefined,
            catalogCategory.trim() || undefined,
            catalogLimit
        );
    };


    return {
        productName, setProductName,
        brandName, setBrandName,
        categoryName, setCategoryName,
        eanCode, setEanCode,
        keywords, setKeywords,
        selectedStoreForCatalog, setSelectedStoreForCatalog,
        catalogCategory, setCatalogCategory,
        catalogLimit, setCatalogLimit,
        activeTab, setActiveTab,
        handleProductSearch,
        handleCatalogSearch
    };
};
