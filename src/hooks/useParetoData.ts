import { useState } from 'react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

/**
 * Interfaz que representa un producto en la lista de Pareto/Auditoría.
 */
export interface ParetoItem {
  id: string;
  /** Nombre legible del producto */
  productName: string;
  /** Palabras clave específicas para el refinamiento de la búsqueda difusa */
  keywords: string[];
  /** Identificador único del producto (EAN-13) */
  ean?: string;
  /** Precio objetivo definido por el usuario para el análisis de competitividad */
  targetPrice?: number;
  /** Estado actual de la auditoría para este elemento */
  status: 'pending' | 'searching' | 'completed' | 'error';
  /** Indica si el usuario ha seleccionado este elemento para la próxima ejecución de auditoría */
  selected: boolean;
  /** Resultados recopilados de todos los minoristas para este elemento */
  foundProducts?: import('@/types/benchmark').MarketProduct[];
}

// Función auxiliar para formatear datos de Excel en ParetoItem[]
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
 * Hook para gestionar la ingesta de datos y el estado de la lista de auditoría de Pareto.
 * Soporta pegado manual, carga de archivos Excel e integración con Google Sheets.
 */
export const useParetoData = () => {
  const [items, setItems] = useState<ParetoItem[]>([]);
  const [gsheetUrl, setGsheetUrl] = useState('');
  const [isFetchingSheet, setIsFetchingSheet] = useState(false);
  const [availableSheets, setAvailableSheets] = useState<string[]>([]);
  const [currentWorkbook, setCurrentWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [isSheetDialogOpen, setIsSheetDialogOpen] = useState(false);

  /**
   * Procesa texto sin formato pegado desde Excel o Google Sheets (separado por tabulaciones).
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
   * Lógica general de procesamiento de hojas XLSX.
   * Gestiona el mapeo de columnas para nombre de producto, EAN, palabras clave y precios.
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
   * Importa datos desde una URL pública de Google Sheets utilizando su endpoint de exportación.
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
