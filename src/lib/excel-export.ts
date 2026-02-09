import * as XLSX from 'xlsx';
import type { MarketProduct, BenchmarkMetadata } from '@/types/benchmark';

interface ExportData {
  products: MarketProduct[];
  metadata?: BenchmarkMetadata;
  searchQuery: string;
  timestamp: string;
}

export function exportToExcel(data: ExportData) {
  // Crear workbook
  const workbook = XLSX.utils.book_new();

  // HOJA 1: Resumen de Búsqueda
  const summaryData = [
    ['RESUMEN DE BÚSQUEDA'],
    [''],
    ['Búsqueda:', data.searchQuery],
    ['Fecha:', new Date(data.timestamp).toLocaleString('es-CO')],
    ['Productos encontrados:', data.products.length],
    [''],
    ['ESTADÍSTICAS'],
    [''],
    ['Precio mínimo:', `$${Math.min(...data.products.map(p => p.price)).toLocaleString('es-CO')}`],
    ['Precio máximo:', `$${Math.max(...data.products.map(p => p.price)).toLocaleString('es-CO')}`],
    ['Precio promedio:', `$${(data.products.reduce((sum, p) => sum + p.price, 0) / data.products.length).toFixed(0)}`],
    [''],
    ['Precio/gramo mínimo:', `$${Math.min(...data.products.map(p => p.pricePerGram)).toFixed(2)}`],
    ['Precio/gramo máximo:', `$${Math.max(...data.products.map(p => p.pricePerGram)).toFixed(2)}`],
    ['Precio/gramo promedio:', `$${(data.products.reduce((sum, p) => sum + p.pricePerGram, 0) / data.products.length).toFixed(2)}`],
  ];

  if (data.metadata) {
    summaryData.push(['']);
    summaryData.push(['METADATOS']);
    summaryData.push(['']);
    if (data.metadata.searchesPerformed) {
      summaryData.push(['Búsquedas realizadas:', data.metadata.searchesPerformed]);
    }
    if (data.metadata.sourcesEvaluated) {
      summaryData.push(['Fuentes evaluadas:', data.metadata.sourcesEvaluated]);
    }
    if (data.metadata.confidenceLevel) {
      summaryData.push(['Nivel de confianza:', data.metadata.confidenceLevel]);
    }
    summaryData.push(['Modelo:', data.metadata.model]);
  }

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);

  // Estilos para la hoja de resumen (anchos de columna)
  summarySheet['!cols'] = [
    { wch: 25 }, // Columna A
    { wch: 30 }  // Columna B
  ];

  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumen');

  // HOJA 2: Productos Detallados (ordenados por precio/gramo)
  const sortedProducts = [...data.products].sort((a, b) => a.pricePerGram - b.pricePerGram);

  const productsData = sortedProducts.map(product => ({
    'Tienda': product.store,
    'Producto': product.productName,
    'EAN': product.ean || '-',
    'Marca': product.brand || 'N/A',
    'Presentación': product.presentation,
    'Gramos': product.gramsAmount || 'N/A',
    'Precio': product.price,
    'Precio/Gramo': parseFloat(product.pricePerGram.toFixed(2)),
    'Disponibilidad': product.availability,
    'Tipo': product.productType || 'N/A',
    'URL': product.url,
    'Fecha Verificación': product.verifiedDate || new Date(data.timestamp).toLocaleDateString('es-CO')
  }));

  const productsSheet = XLSX.utils.json_to_sheet(productsData);

  // Anchos de columna para productos
  productsSheet['!cols'] = [
    { wch: 15 }, // Tienda
    { wch: 35 }, // Producto
    { wch: 15 }, // EAN
    { wch: 15 }, // Marca
    { wch: 20 }, // Presentación
    { wch: 10 }, // Gramos
    { wch: 12 }, // Precio
    { wch: 12 }, // Precio/Gramo
    { wch: 15 }, // Disponibilidad
    { wch: 15 }, // Tipo
    { wch: 60 }, // URL
    { wch: 18 }  // Fecha
  ];

  XLSX.utils.book_append_sheet(workbook, productsSheet, 'Productos');

  // HOJA 3: Comparación por Tienda
  const storeStats = data.products.reduce((acc, product) => {
    if (!acc[product.store]) {
      acc[product.store] = {
        count: 0,
        totalPrice: 0,
        minPrice: Infinity,
        maxPrice: 0,
        avgPricePerGram: 0,
        totalPricePerGram: 0
      };
    }
    acc[product.store].count++;
    acc[product.store].totalPrice += product.price;
    acc[product.store].minPrice = Math.min(acc[product.store].minPrice, product.price);
    acc[product.store].maxPrice = Math.max(acc[product.store].maxPrice, product.price);
    acc[product.store].totalPricePerGram += product.pricePerGram;
    return acc;
  }, {} as Record<string, any>);

  const comparisonData = Object.entries(storeStats).map(([store, stats]) => ({
    'Tienda': store,
    'Productos': stats.count,
    'Precio Mínimo': stats.minPrice,
    'Precio Máximo': stats.maxPrice,
    'Precio Promedio': parseFloat((stats.totalPrice / stats.count).toFixed(2)),
    'Precio/Gramo Promedio': parseFloat((stats.totalPricePerGram / stats.count).toFixed(2))
  })).sort((a, b) => a['Precio/Gramo Promedio'] - b['Precio/Gramo Promedio']);

  const comparisonSheet = XLSX.utils.json_to_sheet(comparisonData);

  comparisonSheet['!cols'] = [
    { wch: 15 }, // Tienda
    { wch: 12 }, // Productos
    { wch: 15 }, // Precio Mínimo
    { wch: 15 }, // Precio Máximo
    { wch: 18 }, // Precio Promedio
    { wch: 22 }  // Precio/Gramo Promedio
  ];

  XLSX.utils.book_append_sheet(workbook, comparisonSheet, 'Comparación por Tienda');

  // Generar nombre de archivo
  const searchQueryClean = (data.searchQuery || 'Busqueda').replace(/\s+/g, '_');
  const fileName = `Comparador_Cafe_${searchQueryClean}_${new Date().toISOString().split('T')[0]}.xlsx`;

  // Descargar archivo
  XLSX.writeFile(workbook, fileName);
}
