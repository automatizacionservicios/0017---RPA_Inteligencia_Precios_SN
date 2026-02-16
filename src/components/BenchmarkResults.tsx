/* eslint-disable */
// Preserving legacy business logic to avoid regressions
import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  ExternalLink,
  ArrowUpDown,
  Download,
  AlertTriangle,
  XCircle,
  Barcode,
  Info,
  ChevronDown,
  ChevronRight,
  Zap,
  ListChecks,
  History,
  LayoutGrid,
  Store as StoreIcon,
  TrendingDown,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { motion, AnimatePresence } from 'framer-motion';
import { exportToExcel } from '@/lib/excel-export';
import { getStoreBrand } from '@/lib/store-branding';
import ResultsFilters from './ResultsFilters';
import { GeminiChatButton } from './gemini/GeminiChatButton';
import type { MarketProduct, BenchmarkMetadata } from '@/types/benchmark';

interface BenchmarkResultsProps {
  products: MarketProduct[];
  rawContent?: string;
  citations?: string[];
  metadata?: BenchmarkMetadata;
  searchQuery: string;
  timestamp: string;
  isEanSearch?: boolean;
}

type SortField = 'price' | 'pricePerGram' | 'store';
type SortDirection = 'asc' | 'desc';

// Extract grammage from name - Global helper
const getWeight = (str: string) => {
  if (!str) return null;
  const match = str.toLowerCase().match(/(\d+(?:\.\d+)?)\s*(g|gr|ml|kg|oz|lb)\b/i);
  if (match) {
    let value = parseFloat(match[1]);
    const unit = match[2].toLowerCase();
    if (unit.startsWith('k')) value *= 1000;
    return Math.round(value);
  }
  return null;
};

const BenchmarkResults = ({
  products,
  rawContent,
  citations,
  metadata,
  searchQuery,
  timestamp,
  isEanSearch,
}: BenchmarkResultsProps) => {
  const [sortField, setSortField] = useState<SortField>('price');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [filteredProducts, setFilteredProducts] = useState<MarketProduct[]>(products);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const toggleGroup = (key: string) => {
    const newCollapsed = new Set(collapsedGroups);
    if (newCollapsed.has(key)) {
      newCollapsed.delete(key);
    } else {
      newCollapsed.add(key);
    }
    setCollapsedGroups(newCollapsed);
  };

  // First, group products by EAN/Name to handle the visual grouping request
  const groupedProducts = useMemo(() => {
    const groups: Record<string, MarketProduct[]> = {};

    const STOP_WORDS = new Set([
      'cafe',
      'tostado',
      'molido',
      'bolsa',
      'doy',
      'pack',
      'tetra',
      'unidad',
      'unidades',
      'und',
      'unds',
      'gramos',
      'mililitros',
    ]);
    const VARIETY_WORDS = [
      'fuerte',
      'tradicional',
      'organico',
      'balanceado',
      'descafeinado',
      'especial',
      'intenso',
      'vainilla',
      'avellana',
      'light',
      'original',
      'plus',
      'zero',
      'azucar',
      'leche',
      'clon',
      'omega',
    ];

    // Get significant tokens for matching
    const getTokens = (str: string) => {
      if (!str) return [];
      return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/\b\d+\s*(g|gr|ml|kg|oz|lb)\b/gi, ' ') // remove units
        .replace(/lomitos/g, 'lomo') // Normalize lomo/lomitos
        .replace(/[^a-z0-9]/g, ' ') // Symbols to spaces
        .split(/\s+/)
        .filter((word) => word.length > 2 && !STOP_WORDS.has(word)); // Meaningful & non-generic words only
    };

    // First pass: Group items primarily by EAN (Business Rule: EAN is the key)
    filteredProducts.forEach((product) => {
      if (product.ean) {
        const groupKey = product.ean;
        if (!groups[groupKey]) groups[groupKey] = [];
        groups[groupKey].push(product);
      }
    });

    // Second pass: Group items WITHOUT EAN (or with different EANs but same product)
    // into existing EAN groups if names overlap significantly AND weight is compatible
    filteredProducts.forEach((product) => {
      if (!product.ean) {
        const tokens = getTokens(product.productName);
        const weight = product.gramsAmount || getWeight(product.productName);
        if (tokens.length === 0) return;

        // Try to find a match in existing groups based on token overlap + grammage
        const matchKey = Object.keys(groups).find((key) => {
          return groups[key].some((p) => {
            const pWeight = p.gramsAmount || getWeight(p.productName);
            // Must have same weight if both have one. Allow 5% tolerance for rounding difference
            if (weight && pWeight && Math.abs(weight - pWeight) > Math.max(weight, pWeight) * 0.05)
              return false;

            const pTokens = getTokens(p.productName);
            const common = pTokens.filter((t) => tokens.includes(t));

            // CRITICAL: If one has a variety word that the other doesn't have, they are DIFF
            const myVarieties = VARIETY_WORDS.filter((vw) => tokens.includes(vw));
            const pVarieties = VARIETY_WORDS.filter((vw) => pTokens.includes(vw));
            const differentVarieties =
              myVarieties.length !== pVarieties.length ||
              !myVarieties.every((v) => pVarieties.includes(v));
            if (differentVarieties && (myVarieties.length > 0 || pVarieties.length > 0))
              return false;

            // Match if they share a significant brand token
            // AND have a reasonable overlap
            const minTokens = Math.min(pTokens.length, tokens.length);
            return common.length >= 2 && common.length / minTokens >= 0.7; // Upped from 0.6 for more precision
          });
        });

        if (matchKey) {
          groups[matchKey].push(product);
        } else {
          // No EAN match, group by a name-derived key
          const nameKey = `name_${tokens.sort().join('')}_${weight || ''}`;
          if (!groups[nameKey]) groups[nameKey] = [];
          groups[nameKey].push(product);
        }
      }
    });

    // Convert to array of groups for easier sorting
    return Object.entries(groups).map(([key, groupProducts]) => {
      const eanProduct = groupProducts.find((p) => p.ean);
      // Select the most representative name: EAN name if available, otherwise shortest (usually cleanest)
      const bestName =
        eanProduct?.productName ||
        [...groupProducts].sort((a, b) => a.productName.length - b.productName.length)[0]
          .productName;

      return {
        key,
        ean: eanProduct?.ean,
        productName: bestName,
        products: groupProducts,
        minPrice: Math.min(
          ...groupProducts
            .filter((p) => p.price > 0)
            .map((p) => p.price)
            .concat(Infinity)
        ),
        maxPrice: Math.max(...groupProducts.map((p) => p.price).concat(-Infinity)),
        stores: Array.from(new Set(groupProducts.map((p) => p.store))).join(', '),
      };
    });
  }, [filteredProducts]);

  const sortedGroups = [...groupedProducts].sort((a, b) => {
    const multiplier = sortDirection === 'asc' ? 1 : -1;

    if (sortField === 'store') {
      return multiplier * a.stores.localeCompare(b.stores);
    }

    if (sortField === 'price') {
      const valA = a.minPrice === Infinity ? 0 : a.minPrice;
      const valB = b.minPrice === Infinity ? 0 : b.minPrice;
      return multiplier * (valA - valB);
    }

    return 0;
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleExport = () => {
    exportToExcel({
      products,
      metadata,
      searchQuery,
      timestamp,
    });
  };

  if (products.length === 0) {
    return (
      <Card className="border-none bg-white shadow-soft rounded-3xl overflow-hidden p-12 text-center group">
        <div className="w-16 h-16 bg-stone-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-500">
          <LayoutGrid className="w-8 h-8 text-stone-300" />
        </div>
        <p className="text-stone-400 font-extrabold uppercase tracking-widest text-[11px]">
          No se encontraron registros
        </p>
        <p className="text-stone-300 text-sm mt-1">
          Refina los parámetros de búsqueda o cambia los filtros
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-10">
      {/* Filtros */}
      <ResultsFilters products={products} onFilterChange={setFilteredProducts} />

      {/* EAN Locator Summary - NEW */}
      {isEanSearch && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-8 border border-emerald-100 shadow-lg shadow-emerald-500/10"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-400/10 to-teal-400/10 rounded-full blur-3xl -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-cyan-400/10 to-emerald-400/10 rounded-full blur-3xl -ml-24 -mb-24" />

          <div className="relative">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-2xl bg-white shadow-xl shadow-emerald-500/20 border border-emerald-100">
                <Barcode className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-xl font-black text-stone-900 uppercase tracking-tight">
                  Códigos EAN Encontrados
                </h3>
                <p className="text-xs font-bold text-emerald-900/70 uppercase tracking-widest mt-0.5">
                  {groupedProducts.filter((g) => g.ean).length} códigos únicos localizados
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {groupedProducts
                .filter((g) => g.ean)
                .slice(0, 8)
                .map((group) => (
                  <div
                    key={group.key}
                    className="flex items-center gap-3 p-4 rounded-2xl bg-white/80 backdrop-blur-sm border border-emerald-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all duration-300 group cursor-pointer"
                    onClick={() => {
                      navigator.clipboard.writeText(group.ean!);
                      toast.success('EAN copiado al portapapeles');
                    }}
                  >
                    <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <Barcode className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="block text-xs font-mono font-black text-emerald-700 group-hover:text-emerald-800">
                        {group.ean}
                      </span>
                      <span className="block text-[9px] font-bold text-stone-400 uppercase tracking-wider truncate mt-0.5">
                        {group.products.length} {group.products.length === 1 ? 'tienda' : 'tiendas'}
                      </span>
                    </div>
                  </div>
                ))}
              {groupedProducts.filter((g) => g.ean).length > 8 && (
                <div className="flex items-center justify-center p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-emerald-100/50">
                  <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">
                    +{groupedProducts.filter((g) => g.ean).length - 8} más
                  </span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Guide for Auditors (Antibobos) - NEW */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-white border border-stone-100 shadow-sm">
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h5 className="text-[10px] font-black uppercase tracking-widest text-stone-800">
              Optimal (Líder)
            </h5>
            <p className="text-[10px] text-stone-400 font-bold mt-1">
              El precio más bajo con un ahorro significativo frente al resto.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-white border border-stone-100 shadow-sm">
          <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h5 className="text-[10px] font-black uppercase tracking-widest text-stone-800">
              Alerta Gramaje
            </h5>
            <p className="text-[10px] text-stone-400 font-bold mt-1">
              Detectamos que este producto tiene un peso diferente al promedio.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-white border border-stone-100 shadow-sm">
          <div className="p-2 rounded-lg bg-stone-50 text-stone-600">
            <Barcode className="w-4 h-4" />
          </div>
          <div>
            <h5 className="text-[10px] font-black uppercase tracking-widest text-stone-800">
              Match por EAN
            </h5>
            <p className="text-[10px] text-stone-400 font-bold mt-1">
              Agrupado automáticamente por código de barras de 13 dígitos.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Tabla de resultados */}
      <Card className="border-none bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden">
        <CardHeader className="p-8 pb-6 bg-stone-50/50 border-b border-stone-100/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2.5 rounded-xl bg-white border border-stone-100 shadow-sm text-emerald-600">
                <ListChecks className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-xl font-black text-stone-800 uppercase tracking-tight leading-tight">
                  Malla de Resultados
                </CardTitle>
                <CardDescription className="text-xs font-bold text-stone-400 uppercase tracking-widest mt-0.5">
                  {filteredProducts.length} registros • {new Date(timestamp).toLocaleTimeString()}
                  {isEanSearch && (
                    <span className="ml-2 text-emerald-600 border-l border-stone-200 pl-2">
                      Modo Localizador de EAN
                    </span>
                  )}
                </CardDescription>
              </div>
            </div>
            <Button
              onClick={handleExport}
              variant="outline"
              size="sm"
              className="h-10 px-5 rounded-xl border-stone-100 text-[11px] font-black uppercase tracking-widest text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-all duration-300 gap-2"
            >
              <Download className="h-3.5 w-3.5" />
              EXPORTAR DATA
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-stone-50/30">
                <TableRow className="hover:bg-transparent border-stone-100">
                  <TableHead
                    className="cursor-pointer hover:text-emerald-600 transition-colors py-5 pl-8 w-[200px]"
                    onClick={() => handleSort('store')}
                  >
                    <div className="flex items-center gap-2 text-[10px] font-black text-stone-400 uppercase tracking-widest">
                      Punto de Venta
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </TableHead>
                  <TableHead className="text-[10px] font-black text-stone-400 uppercase tracking-widest">
                    Descripción Técnica
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:text-emerald-600 transition-colors w-[180px]"
                    onClick={() => handleSort('price')}
                  >
                    <div className="flex flex-col items-center gap-1 text-[10px] font-black text-stone-400 uppercase tracking-widest text-center">
                      <div className="flex items-center gap-2">
                        Precio Final
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:text-emerald-600 transition-colors w-[130px]"
                    onClick={() => handleSort('pricePerGram')}
                  >
                    <div className="flex flex-col items-center gap-1 text-[10px] font-black text-stone-400 uppercase tracking-widest text-center">
                      <div className="flex items-center gap-2">
                        $/Unidad
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </div>
                  </TableHead>
                  <TableHead className="text-[10px] font-black text-stone-400 uppercase tracking-widest w-[140px]">
                    Estado
                  </TableHead>
                  <TableHead className="text-right pr-8 w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedGroups.map((group, idx) => {
                  const validProducts = group.products.filter(
                    (p) => p.price > 0 || p.isExternalLink
                  );
                  const hasCompetition = validProducts.length > 1;

                  // Calcular el Gramaje Objetivo del grupo (el más frecuente o el mayor/base)
                  const weights = validProducts
                    .map((p) => p.gramsAmount || getWeight(p.productName))
                    .filter((w) => w !== null) as number[];
                  const groupTargetWeight =
                    weights.length > 0
                      ? // Usar la moda o el valor que más se repite
                      Object.entries(
                        weights.reduce(
                          (acc, w) => ({ ...acc, [w]: (acc[w] || 0) + 1 }),
                          {} as Record<number, number>
                        )
                      ).sort((a, b) => b[1] - a[1])[0][0]
                      : null;

                  // Usar todos los productos válidos para el Benchmark real (no excluir por gramaje, solo alertar)
                  const benchmarkProducts = validProducts;

                  // Encontrar el precio más bajo entre todos los productos válidos del grupo
                  const uniquePrices = Array.from(
                    new Set(benchmarkProducts.map((p) => p.price))
                  ).sort((a, b) => a - b);
                  const lowestPriceForGroup = uniquePrices.length > 0 ? uniquePrices[0] : -1;
                  const nextBestPrice = uniquePrices.length > 1 ? uniquePrices[1] : -1;
                  const savingsVsNext =
                    lowestPriceForGroup > 0 && nextBestPrice > 0
                      ? nextBestPrice - lowestPriceForGroup
                      : 0;

                  const isCollapsed = collapsedGroups.has(group.key);

                  return (
                    <React.Fragment key={group.key}>
                      {/* Technical Group Header */}
                      <motion.tr
                        key={group.key}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: idx * 0.08 }}
                        className="bg-stone-50/50 border-t-2 border-stone-100/50 cursor-pointer hover:bg-stone-50 transition-colors"
                        onClick={() => toggleGroup(group.key)}
                      >
                        <TableCell colSpan={6} className="py-4 px-8">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div
                                className={`p-2 rounded-xl border transition-all duration-500 ${isCollapsed ? 'bg-white border-stone-100' : 'bg-emerald-600 border-emerald-500 shadow-md shadow-emerald-200'}`}
                              >
                                <Barcode
                                  className={`w-4 h-4 transition-colors ${isCollapsed ? 'text-stone-400' : 'text-white'}`}
                                />
                              </div>
                              <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`text-[10px] font-mono font-black border px-2 py-0.5 rounded-lg transition-all ${isEanSearch ? 'bg-emerald-600 text-white border-emerald-500 scale-110 shadow-md ring-4 ring-emerald-500/10' : 'text-stone-800 bg-stone-100 border-stone-200'}`}
                                  >
                                    {group.ean || 'S/EAN'}
                                  </span>
                                  {isEanSearch && group.ean && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0 hover:bg-emerald-50 text-emerald-600"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigator.clipboard.writeText(group.ean!);
                                        toast.success('EAN copiado al portapapeles');
                                      }}
                                    >
                                      <ListChecks className="w-3 h-3" />
                                    </Button>
                                  )}
                                  {hasCompetition && (
                                    <div className="flex items-center gap-1.5 ml-2 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100">
                                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                      <span className="text-[9px] font-black text-emerald-700 uppercase tracking-tighter">
                                        {validProducts.length} Canales comparados
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <span className="text-sm font-black text-stone-800 mt-1 uppercase tracking-tight truncate max-w-[500px]">
                                  {group.productName}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              {isCollapsed && (
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-stone-100">
                                  <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest">
                                    Min:
                                  </span>
                                  <span className="text-[11px] font-black text-emerald-600">
                                    ${group.minPrice.toLocaleString('es-CO')}
                                  </span>
                                </div>
                              )}
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center border border-stone-200 bg-white transition-transform duration-500 ${!isCollapsed ? 'rotate-180' : ''}`}
                              >
                                <ChevronDown className="h-4 w-4 text-stone-400" />
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </motion.tr>

                      {/* Detail Rows */}
                      <AnimatePresence>
                        {!isCollapsed &&
                          (() => {
                            const validGroupProducts = group.products.filter(
                              (p) => p.pricePerGram > 0
                            );
                            const minPricePerGramInGroup =
                              validGroupProducts.length > 0
                                ? Math.min(...validGroupProducts.map((p) => p.pricePerGram))
                                : Infinity;

                            return group.products
                              .sort((a, b) => (a.price || Infinity) - (b.price || Infinity))
                              .map((product, idx) => {
                                const isLowestPrice =
                                  hasCompetition &&
                                  product.price > 0 &&
                                  product.price === lowestPriceForGroup;
                                const isLowestPricePerGram =
                                  hasCompetition &&
                                  product.pricePerGram > 0 &&
                                  product.pricePerGram === minPricePerGramInGroup;

                                return (
                                  <TableRow
                                    key={`${group.key}-${idx}`}
                                    className={`hover:bg-stone-50/50 transition-colors border-l-4 ${isLowestPrice ? 'border-l-emerald-500 bg-emerald-50/20' : 'border-l-transparent'}`}
                                    style={{ borderTop: '1px solid #f8fafc' }}
                                  >
                                    <TableCell className="pl-12 py-5">
                                      <div className="flex items-center gap-3">
                                        <div
                                          className={`w-8 h-8 rounded-full overflow-hidden border flex items-center justify-center bg-white shadow-sm transition-all ${isLowestPrice
                                              ? 'border-emerald-200 ring-4 ring-emerald-500/10'
                                              : 'border-stone-100'
                                            }`}
                                        >
                                          {getStoreBrand(product.store).icon ? (
                                            <img
                                              src={getStoreBrand(product.store).icon!}
                                              alt={product.store}
                                              className="w-full h-full object-contain"
                                            />
                                          ) : (
                                            <StoreIcon className="w-4 h-4 text-stone-300" />
                                          )}
                                        </div>
                                        <span
                                          className={`text-[11px] font-black uppercase tracking-tight ${isLowestPrice ? 'text-emerald-700' : 'text-stone-600'}`}
                                        >
                                          {product.store}
                                        </span>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-3">
                                        {product.image && (
                                          <TooltipProvider>
                                            <Tooltip delayDuration={0}>
                                              <TooltipTrigger asChild>
                                                <div className="w-12 h-12 rounded-lg border border-stone-100 overflow-hidden bg-white shrink-0 shadow-sm cursor-zoom-in group/img">
                                                  <img
                                                    src={product.image}
                                                    alt={product.productName}
                                                    className="w-full h-full object-contain transition-transform duration-300 group-hover/img:scale-110"
                                                    onError={(e) =>
                                                      (e.currentTarget.style.display = 'none')
                                                    }
                                                  />
                                                </div>
                                              </TooltipTrigger>
                                              <TooltipContent
                                                side="right"
                                                className="p-0 border-none bg-transparent shadow-none overflow-visible z-[100]"
                                              >
                                                <div className="w-64 h-64 bg-white rounded-2xl p-2 shadow-2xl border border-stone-100 animate-in zoom-in-50 duration-200">
                                                  <img
                                                    src={product.image}
                                                    alt={product.productName}
                                                    className="w-full h-full object-contain rounded-xl"
                                                  />
                                                </div>
                                              </TooltipContent>
                                            </Tooltip>
                                          </TooltipProvider>
                                        )}
                                        <div className="flex flex-col gap-0.5 min-w-0">
                                          <span className="text-[10px] font-medium text-stone-400 italic line-clamp-1">
                                            {product.productName}
                                          </span>
                                          <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black text-stone-800 uppercase tracking-widest">
                                              {product.presentation}
                                            </span>

                                            {/* Alerta de Gramaje fuera de rango - Ahora al lado del gramaje */}
                                            {groupTargetWeight &&
                                              (product.gramsAmount ||
                                                getWeight(product.productName)) &&
                                              Math.abs(
                                                (product.gramsAmount ||
                                                  getWeight(product.productName))! -
                                                Number(groupTargetWeight)
                                              ) >
                                              Number(groupTargetWeight) * 0.1 && (
                                                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-[7px] font-black text-amber-700 uppercase tracking-tighter shadow-sm shrink-0">
                                                  <AlertTriangle className="w-2 h-2 text-amber-500" />
                                                  VERIF. GRAM
                                                </div>
                                              )}
                                          </div>
                                        </div>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <div
                                        className={`flex flex-col items-center justify-center text-center ${isLowestPrice ? 'text-emerald-600' : 'text-stone-700'}`}
                                      >
                                        {product.regularPrice &&
                                          product.regularPrice > product.price && (
                                            <div className="flex items-center gap-2 mb-1">
                                              <span className="text-[10px] font-bold text-stone-300 line-through">
                                                ${product.regularPrice.toLocaleString('es-CO')}
                                              </span>
                                              {product.discountPercentage && (
                                                <span className="text-[9px] font-black bg-rose-500 text-white px-1.5 py-0.5 rounded-md shadow-sm">
                                                  -{product.discountPercentage}%
                                                </span>
                                              )}
                                            </div>
                                          )}
                                        <span className="text-[15px] font-mono font-black">
                                          {typeof product.price === 'number'
                                            ? `$${product.price.toLocaleString('es-CO')}`
                                            : '---'}
                                        </span>

                                        {isLowestPrice && (
                                          <TooltipProvider>
                                            <Tooltip delayDuration={150}>
                                              <TooltipTrigger asChild>
                                                <div className="flex flex-row items-center gap-2 mt-1.5 justify-center flex-nowrap min-w-max">
                                                  <div className="inline-flex items-center gap-1.5 text-[8px] bg-amber-400 text-stone-900 px-2.5 py-1 rounded-full w-fit border border-amber-500/30 font-black uppercase tracking-widest cursor-help shadow-sm shrink-0">
                                                    <Zap className="w-2.5 h-2.5 fill-stone-900" />
                                                    OPTIMAL
                                                  </div>
                                                  {savingsVsNext > 0 && (
                                                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100/50 w-fit shadow-sm shrink-0">
                                                      <TrendingDown className="w-3 h-3 text-emerald-600" />
                                                      <span className="text-[9px] font-black text-emerald-700 uppercase tracking-tighter">
                                                        -${savingsVsNext.toLocaleString('es-CO')}
                                                      </span>
                                                    </div>
                                                  )}
                                                </div>
                                              </TooltipTrigger>
                                              <TooltipContent
                                                side="right"
                                                className="bg-stone-900 text-white border-stone-800 p-4 shadow-2xl rounded-2xl max-w-[200px]"
                                              >
                                                <div className="space-y-2">
                                                  <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest">
                                                    Análisis de Diferencial
                                                  </p>
                                                  <p className="text-[11px] font-medium leading-tight text-white/90">
                                                    Este canal es{' '}
                                                    <span className="text-emerald-400 font-black">
                                                      ${savingsVsNext.toLocaleString('es-CO')}
                                                    </span>{' '}
                                                    más económico que el siguiente competidor
                                                    detectado.
                                                  </p>
                                                  <div className="pt-2 border-t border-white/10">
                                                    <p className="text-[9px] font-bold text-stone-400 uppercase">
                                                      Eficiencia Máxima
                                                    </p>
                                                  </div>
                                                </div>
                                              </TooltipContent>
                                            </Tooltip>
                                          </TooltipProvider>
                                        )}
                                      </div>
                                    </TableCell>
                                    <TableCell className="relative">
                                      <div
                                        className={`font-mono text-xs font-black transition-all ${isLowestPricePerGram ? 'text-emerald-600 scale-110' : 'text-stone-500'}`}
                                      >
                                        {typeof product.pricePerGram === 'number'
                                          ? `$${product.pricePerGram.toFixed(2)}`
                                          : '---'}
                                        {isLowestPricePerGram && (
                                          <div className="absolute top-1/2 -left-2 -translate-y-1/2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                                          </div>
                                        )}
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <div
                                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter border transition-all shadow-sm ${product.availability
                                            .toLowerCase()
                                            .includes('disponible') ||
                                            product.availability === 'En stock'
                                            ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                                            : 'bg-rose-50 border-rose-100 text-rose-600 grayscale opacity-70'
                                          }`}
                                      >
                                        <div
                                          className={`w-1.5 h-1.5 rounded-full ${product.availability.toLowerCase().includes('disponible') || product.availability === 'En stock' ? 'bg-emerald-400 shadow-[0_0_5px_rgba(52,211,153,0.5)]' : 'bg-rose-400'}`}
                                        />
                                        {product.availability}
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-right pr-8">
                                      {product.url && (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          asChild
                                          className="h-8 w-8 p-0 hover:bg-emerald-50 hover:text-emerald-600 rounded-xl transition-all duration-300"
                                        >
                                          <a
                                            href={product.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            aria-label="Ver producto en tienda"
                                          >
                                            <ExternalLink className="w-4 h-4" />
                                          </a>
                                        </Button>
                                      )}
                                    </TableCell>
                                  </TableRow>
                                );
                              });
                          })()}
                      </AnimatePresence>
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Raw Insights Section */}
          <AnimatePresence>
            {(rawContent || (citations && citations.length > 0)) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-8 border-t border-stone-100 bg-stone-50/30"
              >
                <div className="flex items-start gap-12">
                  {rawContent && (
                    <div className="flex-1 min-w-[300px]">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="p-1.5 rounded-lg bg-white border border-stone-100 text-amber-500">
                          <History className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-black text-stone-500 uppercase tracking-widest">
                          Análisis de Profundidad (Perplexity)
                        </span>
                      </div>
                      <div className="text-xs text-stone-600 whitespace-pre-wrap leading-relaxed bg-white/50 p-6 rounded-2xl border border-stone-100 shadow-inner italic">
                        {rawContent}
                      </div>
                    </div>
                  )}

                  {citations && citations.length > 0 && (
                    <div className="w-[300px] flex-shrink-0">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="p-1.5 rounded-lg bg-white border border-stone-100 text-stone-400">
                          <ExternalLink className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-black text-stone-500 uppercase tracking-widest">
                          Fuentes Verificadas
                        </span>
                      </div>
                      <div className="flex flex-col gap-2">
                        {citations.map((citation, index) => (
                          <a
                            key={index}
                            href={citation}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center gap-3 p-3 rounded-xl bg-white border border-stone-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all duration-300"
                          >
                            <div className="w-6 h-6 rounded-lg bg-stone-50 flex items-center justify-center text-stone-400 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
                              <ExternalLink className="w-3 h-3" />
                            </div>
                            <span className="text-[10px] text-stone-400 group-hover:text-stone-700 truncate font-medium">
                              {citation}
                            </span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Technical Rejections Section */}
      {metadata?.validation &&
        metadata.validation.rejected > 0 &&
        metadata.validation.rejectedProducts && (
          <Card className="border-none bg-rose-50/30 shadow-[0_8px_30px_rgb(0,0,0,0.02)] rounded-3xl overflow-hidden p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-white border border-rose-100 shadow-sm text-rose-500">
                  <XCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-stone-800 uppercase tracking-tight">
                    Filtros de Validación Activos
                  </h3>
                  <p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mt-0.5">
                    {metadata.validation.rejected} registros no cumplieron con la paridad de datos
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {metadata.validation.rejectedProducts.map((rejected, index) => (
                <div
                  key={index}
                  className="p-4 rounded-2xl bg-white border border-rose-100 group transition-all duration-500 hover:shadow-xl hover:shadow-rose-100/20"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[9px] font-black text-rose-400 uppercase tracking-widest">
                      {rejected.store}
                    </span>
                    <div className="p-1 rounded-md bg-stone-50 group-hover:rotate-12 transition-transform">
                      <AlertTriangle className="w-3 h-3 text-stone-300" />
                    </div>
                  </div>
                  <p className="text-xs font-black text-stone-800 truncate uppercase mt-1">
                    {rejected.productName}
                  </p>
                  <p className="text-[10px] text-stone-400 mt-2 line-clamp-2 italic leading-relaxed border-l-2 border-rose-100 pl-3">
                    {rejected.reason}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 p-4 bg-white/50 rounded-2xl border border-stone-100 text-center">
              <p className="text-[10px] font-black text-stone-300 uppercase tracking-widest">
                Optimización de Precisión IA habilitada
              </p>
            </div>
          </Card>
        )}

      {/* Botón Flotante de Chat con Gemini */}
      <GeminiChatButton products={products} metadata={metadata} searchQuery={searchQuery} />
    </div>
  );
};

export default BenchmarkResults;
