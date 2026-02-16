import { useState } from 'react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

/**
 * Interface representing a product item in the Pareto/Audit list.
 */
export interface ParetoItem {
  id: string;
  /** Human-readable name of the product */
  productName: string;
  /** Specific keywords for fuzzy search refinement */
  keywords: string[];
  /** Unique product identifier (ean-13) */
  ean?: string;
  /** User-defined target price for competitiveness analysis */
  targetPrice?: number;
  /** Current status of the audit for this item */
  status: 'pending' | 'searching' | 'completed' | 'error';
  /** Whether the user has selected this item for the next audit run */
  selected: boolean;
  /** Collected results from all retailers for this item */
  foundProducts?: import('@/types/benchmark').MarketProduct[];
}

// Helper function to format Excel data into ParetoItem[]
export const formatExcelData = (data: Record<string, unknown>[]): ParetoItem[] => {
  return data
    .map((row: Record<string, unknown>) => {
      const keys = Object.keys(row);
      const findKey = (candidates: string[]) =>
        keys.find((k) => candidates.some((c) => k.toLowerCase().includes(c.toLowerCase())));

      const nameKey = findKey(['producto', 'nombre', 'product', 'name']) || keys[0];
      const keywordsKey = findKey(['keywords', 'palabras', 'claves', 'fk']) || keys[1];
      const eanKey = findKey(['ean', 'codigo', 'code', 'barras']) || keys[2];
      const priceKey = findKey(['precio', 'target', 'objetivo', 'price']) || keys[3];

      const name = String(row[nameKey] || '').trim();
      let ean = '';
      if (row[eanKey]) {
        ean = typeof row[eanKey] === 'number' ? row[eanKey].toFixed(0) : String(row[eanKey]).trim();
        ean = ean.replace(/[^\d]/g, '');
      }
      let keywords: string[] = [];
      if (row[keywordsKey]) {
        const rawKeywords = String(row[keywordsKey])
          .split(',')
          .map((k: string) => k.trim());
        keywords = rawKeywords.filter((k) => !/^\d{5,}$/.test(k) && k.length > 0);
      }
      return {
        id: crypto.randomUUID(),
        productName: name || (ean ? `Producto ${ean}` : 'Sin nombre'),
        keywords: keywords,
        ean: ean || undefined,
        targetPrice: row[priceKey]
          ? parseFloat(String(row[priceKey]).replace(/[$,]/g, ''))
          : undefined,
        status: 'pending' as const,
        selected: true,
      };
    })
    .filter((item) => item.productName !== 'Sin nombre' || item.ean);
};

/**
 * Hook to manage data ingestion and state for the Pareto audit list.
 * Supports manual pasting, Excel uploads, and Google Sheets integration.
 */
export const useParetoData = () => {
  const [items, setItems] = useState<ParetoItem[]>([]);
  const [gsheetUrl, setGsheetUrl] = useState('');
  const [isFetchingSheet, setIsFetchingSheet] = useState(false);
  const [availableSheets, setAvailableSheets] = useState<string[]>([]);
  const [currentWorkbook, setCurrentWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [isSheetDialogOpen, setIsSheetDialogOpen] = useState(false);

  /**
   * Processes raw text pasted from Excel or Google Sheets (Tab-separated).
   */
  const handlePaste = (text: string) => {
    if (!text) return;
    const rows = text.split(/\r?\n/).filter((line) => line.trim() !== '');
    const newItems: ParetoItem[] = rows
      .map((row) => {
        const cols = row.split('\t');
        const name = cols[0]?.trim();
        const ean = cols[2]?.trim();
        return {
          id: crypto.randomUUID(),
          productName: name || (ean ? `Producto ${ean}` : 'Sin nombre'),
          keywords: cols[1] ? cols[1].split(',').map((k) => k.trim()) : [],
          ean: ean,
          targetPrice: cols[3] ? parseFloat(cols[3].replace(/[$,]/g, '')) : undefined,
          status: 'pending' as const,
          selected: true,
        };
      })
      .filter((item) => item.productName !== 'Sin nombre' || item.ean);
    setItems((prev) => [...prev, ...newItems]);
    toast.success(`${newItems.length} registros cargados correctamente.`);
  };

  /**
   * General XLSX sheet processing logic.
   * Handles column mapping for product name, EAN, keywords, and prices.
   */
  const processSheet = (workbook: XLSX.WorkBook, sheetName: string) => {
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet) as Record<string, unknown>[];
    if (data.length === 0) {
      toast.error(`La hoja "${sheetName}" está vacía`);
      return;
    }
    const newItems: ParetoItem[] = formatExcelData(data);
    setItems((prev) => [...prev, ...newItems]);
    setGsheetUrl('');
    setIsSheetDialogOpen(false);
    toast.success(`${newItems.length} productos cargados desde la hoja "${sheetName}"`);
  };

  /**
   * Imports data from a public Google Sheets URL using its Export endpoint.
   */
  const loadFromGSheet = async (url: string) => {
    let sheetId = '';
    const match = url.match(/[-\w]{25,}/);
    if (match) sheetId = match[0];
    else {
      toast.error('Link de Google Sheets no válido');
      return;
    }
    setIsFetchingSheet(true);
    try {
      const exportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=xlsx`;
      const response = await fetch(exportUrl);
      if (!response.ok) throw new Error('No se pudo acceder');
      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      setCurrentWorkbook(workbook);
      setAvailableSheets(workbook.SheetNames);
      if (workbook.SheetNames.length > 1) setIsSheetDialogOpen(true);
      else processSheet(workbook, workbook.SheetNames[0]);
    } catch (err) {
      toast.error('Error al procesar el archivo');
      console.error(err);
      setIsFetchingSheet(false);
    }
  };

  return {
    items,
    setItems,
    gsheetUrl,
    setGsheetUrl,
    isFetchingSheet,
    availableSheets,
    currentWorkbook,
    isSheetDialogOpen,
    setIsSheetDialogOpen,
    handlePaste,
    loadFromGSheet,
    processSheet,
    removeItem: (id: string) => setItems((prev) => prev.filter((i) => i.id !== id)),
    toggleItemSelection: (id: string) =>
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, selected: !i.selected } : i))),
    toggleAllItems: (selected: boolean) =>
      setItems((prev) => prev.map((i) => ({ ...i, selected }))),
  };
};
