# Selectores CSS y Métodos por Tienda - Price Scraper

Documentación técnica de los métodos de recolección y selectores utilizados por el orquestador de precios.

> [!NOTE]
> **Última actualización sincronizada**: 2026-02-12

---

## 🏗️ Resumen de Métodos

| Método | Motor | Descripción |
|--------|-------|-------------|
| **VTEX** | Fetch API (JSON) | Consulta directa a la API de búsqueda de VTEX. |
| **VTEX-IO** | Fetch API (GraphQL) | Consulta a la nueva infraestructura de VTEX IO. |
| **Cheerio** | Cheerio (HTML) | Scraping de HTML estático. |
| **Instaleap** | Fetch API (JSON) | Integración con la API de Moira/Instaleap (D1, Makro). |
| **Algolia** | Fetch API (JSON) | Consulta a índices de Algolia (Farmatodo). |
| **Rappi** | Fetch API (JSON) | Extracción de datos de la plataforma Rappi. |

---

## 📦 Tiendas Cheerio (HTML Scraping)

### Zapatoca
- **URL**: `https://www.mercadozapatoca.com/search/?k={query}`
- **Selectores**:
  - **Tarjeta**: `#categorias .dpr_container`
  - **Nombre**: `.dpr_product-name`
  - **Precio**: `.dpr_listprice`
  - **Precio Regular**: `.dpr_oldprice`
  - **URL**: `a.dpr_listname`
  - **Imagen**: `.dpr_imagen_thumb img`

### Carulla
- **URL**: `https://www.carulla.com/s?q={query}`
- **Nota**: Se utiliza Cheerio para evadir bloqueos en la API de VTEX IO.
- **Selectores**:
  - **Tarjeta**: `[data-fs-product-card="true"]`
  - **Nombre**: `h3`
  - **Precio**: `.product-price_productSellingPrice__text__I1_vF`
  - **Precio Regular**: `.product-price_productListPrice__text__I1_vF`
  - **URL**: `a[data-testid="product-link"]`
  - **Imagen**: `img`

### La Vaquita
- **URL**: `https://vaquitaexpress.com.co/catalogsearch/result/?q={query}`
- **Selectores**:
  - **Tarjeta**: `.product-item`
  - **Nombre**: `.product-item-link`
  - **Precio**: `.price`
  - **URL**: `.product-item-link`
  - **Imagen**: `.product-image-photo`

### Mundo Huevo
- **URL**: `https://mundohuevo.com/search?q={query}`
- **Selectores**:
  - **Tarjeta**: `.col-12.nt_pr__`
  - **Nombre**: `.product-title a`
  - **Precio**: `.price`
  - **URL**: `.product-title a`
  - **Imagen**: `.product-image img`

### Super Mu
- **URL**: `https://supermu.com/search?q={query}`
- **Selectores**:
  - **Tarjeta**: `.product-collection`
  - **Nombre**: `.product-collection__title a`
  - **Precio**: `[data-js-product-price] span`
  - **URL**: `.product-collection__title a`
  - **Imagen**: `[data-master]`

---

## ⚡ Tiendas de API Directa

### VTEX (Legacy & IO)
- **Tiendas**: Éxito, Jumbo, Olímpica, Euro, Megatiendas, Mercacentro, Mercaldas, Nutresa.
- **Endpoint**: `https://{domain}/api/catalog_system/pub/products/search/?ft={query}`
- **Campos Clave**:
  - `productName`
  - `items[0].sellers[0].commertialOffer.Price`
  - `items[0].images[0].imageUrl`

### Instaleap (Moira Engine)
- **Tiendas**: Tiendas D1, Makro.
- **Dominios**: `domicilios.tiendasd1.com`, `tienda.makro.com.co`
- **Método**: Consumo de API REST interna de Instaleap.

### Algolia
- **Tiendas**: Farmatodo.
- **Método**: Búsqueda indexada vía Algolia API.

### Rappi
- **Tiendas**: Rappi.
- **Método**: Extracción de datos vía `__NEXT_DATA__` y API de productos.

---

## 🛠️ Mantenimiento

### Detección de Cambios
Si una tienda Cheerio falla (0 resultados):
1. Verificar si el selector de **Tarjeta** (`productCard`) sigue existiendo en el HTML.
2. Comprobar si los selectores de **Precio** han cambiado sus clases dinámicas (común en Carulla).
3. Asegurar que los headers en `utils.ts` estén enviando un User-Agent actualizado.

### Agregar Nueva Tienda
1. Definir el `scrapeMethod` en `StrategyFactory.ts`.
2. Si es Cheerio, añadir los selectores CSS correspondientes.
3. Actualizar este documento con la nueva configuración.
