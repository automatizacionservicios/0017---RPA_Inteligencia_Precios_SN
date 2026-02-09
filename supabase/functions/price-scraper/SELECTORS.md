# Selectores CSS por Tienda - Coffee Benchmark

Documentación de selectores CSS utilizados para scraping de productos de café en supermercados colombianos.

---

## Mercado Zapatoca

- **Última verificación**: 2025-11-15
- **Método**: Cheerio (HTML estático)
- **URL de búsqueda**: `https://www.mercadozapatoca.com/search/?k={query}`

### Selectores

| Campo | Selector CSS | Notas |
|-------|-------------|-------|
| Tarjeta producto | `#categorias .dpr_container` | Contenedor principal de cada producto |
| Nombre | `.dpr_product-name` | Incluye presentación en formato "X000g" |
| Precio | `.dpr_listprice` | Formato "$##,###" |
| URL | `a.dpr_listname` | Href completo |
| Imagen | `.dpr_imagen_thumb img` | |
| Disponibilidad | `.dpr_in_stock` | Texto "Disponible" o "Agotado" |
| Precio por unidad | `.price_per_unit` | Ya calculado (ej: "$54.80 / GR") |

### Notas especiales
- Presentación incluida en el nombre del producto (ej: "CAFÉ AGUILA ROJA X250g")
- Extraer gramos con regex `/[xX](\d+)\s*(g|gr|kg)/i`
- URLs absolutas ya proporcionadas
- Precio ya formateado con separadores de miles

---

## Supertiendas Cañaveral

- **Última verificación**: 2025-11-15
- **Método**: VTEX API
- **Dominio VTEX**: `domicilioscanaveral.com`
- **URL de búsqueda**: `https://domicilioscanaveral.com/api/catalog_system/pub/products/search/?ft={query}`

### Notas especiales
- Usa plataforma VTEX
- Estructura igual a otras tiendas VTEX (Éxito, Jumbo, Carulla, etc.)
- Respuesta JSON directa de API

---

## Megatiendas

- **Última verificación**: 2025-11-15
- **Método**: VTEX API
- **Dominio VTEX**: `www.megatiendas.co`
- **URL de búsqueda**: `https://www.megatiendas.co/caf%C3%A9?_q=caf%C3%A9&map=ft`

### Notas especiales
- Plataforma VTEX
- Estructura estándar VTEX API

---

## Mercacentro

- **Última verificación**: 2025-11-15
- **Método**: VTEX API
- **Dominio VTEX**: `www.mercacentro.com`
- **URL de búsqueda**: `https://www.mercacentro.com/caf%C3%A9?_q=caf%C3%A9&map=ft`

### Notas especiales
- Plataforma VTEX
- Estructura estándar VTEX API

---

## D1 (Tiendas D1)

- **Última verificación**: 2025-11-15
- **Método**: Cheerio (HTML estático + VTEX posible)
- **URL de búsqueda**: `https://domicilios.tiendasd1.com/search?name={query}`

### Selectores

| Campo | Selector CSS | Notas |
|-------|-------------|-------|
| Tarjeta producto | `div[data-testid="product-card"]`, `.product-item`, `article.product`, `div.vtex-search-result-3-x-galleryItem` | Múltiples selectores para compatibilidad |
| Nombre | `h3`, `.product-name`, `[data-testid="product-name"]`, `span.vtex-product-summary-2-x-productBrand` | Priorizar data-testid |
| Precio | `.price`, `[data-testid="product-price"]`, `span.price-value`, `span.vtex-product-price-1-x-sellingPrice` | Limpiar con regex `/[^\d]/g` |
| Presentación | `.presentation`, `.weight`, `.unit`, `.vtex-product-summary-2-x-productReference` | Extraer gramos con regex |
| URL | `a[href*="/product/"]`, `a.vtex-product-summary-2-x-clearLink` | Construir URL absoluta si es relativa |
| Disponibilidad | `.stock`, `.availability`, `.vtex-product-summary-2-x-availability` | Buscar texto "agotado" |

### Notas especiales
- `__NEXT_DATA__` no siempre está disponible, usar HTML directo
- Pueden usar VTEX en backend, verificar elementos con prefijo `vtex-`
- Transformar precio: `parseFloat(text.replace(/[^\d]/g, ''))`
- Transformar gramos: extraer con `/(\d+)\s*(g|gr|kg)/i`, convertir kg→g

---

## Ara (Tiendas Ara)

- **Última verificación**: 2025-11-15
- **Método**: Cheerio (VTEX)
- **URL de búsqueda**: `https://www.aratiendas.com/search?q={query}`

### Selectores

| Campo | Selector CSS | Notas |
|-------|-------------|-------|
| Tarjeta producto | `.vtex-search-result-3-x-galleryItem`, `.product-card`, `article.product` | Plataforma VTEX |
| Nombre | `.vtex-product-summary-2-x-productBrand`, `.product-title` | Usar productBrand de VTEX |
| Precio | `.vtex-product-price-1-x-sellingPrice`, `.price` | Precio de venta (no lista) |
| Marca | `.vtex-product-summary-2-x-brandName`, `.brand` | Puede no estar presente |
| URL | `a.vtex-product-summary-2-x-clearLink`, `a.product-link` | Verificar href |
| Disponibilidad | `.vtex-product-summary-2-x-availability`, `.availability` | Texto "agotado" |

### Notas especiales
- Plataforma VTEX, estructura similar a otras tiendas VTEX
- Algunos productos pueden no tener marca visible
- Validar URLs con regex `startsWith('http')`

---

---

## Mundo Huevo

- **Última verificación**: 2026-02-03
- **Método**: Cheerio (Shopify)
- **URL de búsqueda**: `https://mundohuevo.com/search?options[prefix]=last&q={query}`

### Selectores

| Campo | Selector CSS | Notas |
|-------|-------------|-------|
| Tarjeta producto | `.nt_pr` | |
| Nombre | `.product-title a` | |
| Precio | `.price` | |
| URL | `.product-title a` | |
| Imagen | `.product-image img` | |

---

## Super Mu

- **Última verificación**: 2026-02-03
- **Método**: Cheerio (Shopify)
- **URL de búsqueda**: `https://supermu.com/search?options[prefix]=last&q={query}`

### Selectores

| Campo | Selector CSS | Notas |
|-------|-------------|-------|
| Tarjeta producto | `.product-collection` | |
| Nombre | `.product-collection__title a` | |
| Precio | `[data-js-product-price] span` | |
| URL | `.product-collection__title a` | |
| Imagen | `.product-collection__image img` | |
| SKU | `[data-js-product-sku]` | Atributo de datos |

---

## VTEX Stores (Carulla, Éxito, Jumbo, Olímpica, Makro)

- **Última verificación**: 2025-11-15
- **Método**: VTEX API directa
- **Endpoint**: `https://{domain}/api/catalog_system/pub/products/search/?ft={query}&_from=0&_to=20`

### Campos de API

| Campo | Path JSON | Transformación |
|-------|-----------|----------------|
| Nombre | `product.productName` o `product.name` | Directo |
| Marca | `product.brand` | Puede estar vacío |
| Precio | `product.items[0].sellers[0].commertialOffer.Price` | Validar > 1000 y < 500000 |
| Gramos | `product.items[0].unitMultiplier` + `measurementUnit` | Convertir kg→g si aplica |
| Disponibilidad | `product.items[0].sellers[0].commertialOffer.AvailableQuantity` | > 0 = Disponible |
| URL | `https://{domain}/{product.linkText}/p` | **CRÍTICO**: Agregar slash antes de linkText |

### Validación de gramos
1. **Prioridad 1**: Usar `unitMultiplier` si `measurementUnit` es 'g' o 'kg'
2. **Prioridad 2**: Extraer del nombre con regex `/(\d+)\s*(g|gr|kg)/i`
3. **Validación**: Si usuario pidió presentación específica, validar ±20% tolerancia
4. **Fallback**: 250g por defecto

### Filtros
- Excluir: cafeteras, accesorios, morrales, bolsos, tazas, vasos
- Precio válido: 1,000 - 500,000 COP
- Precio/kg válido: < 1,000,000 COP

---

## Makro

- **Última verificación**: 2025-11-15
- **Método**: Cheerio (HTML scraping)
- **Dominio**: `tienda.makro.com.co`
- **URL de búsqueda**: `https://tienda.makro.com.co/search?name={query}`

### Selectores CSS

| Campo | Selector CSS | Notas |
|-------|-------------|-------|
| Tarjeta producto | `.vtex-search-result-3-x-galleryItem`, `article.product` | Plataforma VTEX con HTML |
| Nombre | `.vtex-product-summary-2-x-productBrand`, `h3.product-name` | Usar productBrand de VTEX |
| Marca | `.vtex-product-summary-2-x-brandName` | Puede no estar presente |
| Precio | `.vtex-product-price-1-x-sellingPrice`, `.price-value` | Limpiar con regex `/[^\d]/g` |
| Presentación | `.vtex-product-summary-2-x-productReference` | Extraer gramos con regex |
| URL | `a.vtex-product-summary-2-x-clearLink` | Construir URL absoluta si es relativa |
| Disponibilidad | `.vtex-product-summary-2-x-availability` | Buscar texto "agotado" |

### Notas especiales
- **CRÍTICO**: URL usa parámetro `?name=` en lugar de `?ft=`
- Rate limiting: 10 segundos entre llamadas al dominio
- Transformar precio: `parseFloat(text.replace(/[^\d]/g, ''))`
- Transformar gramos: extraer con `/(\d+)\s*(g|gr|kg)/i`, convertir kg→g

---

## Troubleshooting

### Si una tienda cambia su estructura HTML:

1. **Inspeccionar con DevTools**:
   - Abrir navegador en modo incógnito
   - Buscar un producto de café
   - Inspeccionar elemento de tarjeta de producto
   - Copiar clase CSS o data-testid

2. **Actualizar configuración**:
   ```typescript
   const NUEVA_CONFIG: ScraperConfig = {
     searchUrl: (query) => `https://nueva-tienda.com/search?q=${encodeURIComponent(query)}`,
     selectors: {
       productCard: '.nuevo-selector-tarjeta',
       name: '.nuevo-selector-nombre',
       price: '.nuevo-selector-precio',
       // ... otros selectores
     }
   };
   ```

3. **Probar manualmente con curl + cheerio**:
   ```bash
   curl "https://tienda.com/search?q=cafe" > test.html
   # Luego inspeccionar test.html con cheerio en playground
   ```

4. **Documentar cambio aquí**:
   - Actualizar fecha de verificación
   - Agregar notas sobre cambios detectados
   - Marcar selectores obsoletos

### Si el scraping retorna 0 productos:

- **Verificar selectores**: Los más probables de cambiar son `productCard` y `price`
- **Revisar rate limiting**: Verificar logs `[RATE]` en consola
- **Comprobar HTML**: Verificar si el sitio cambió a SPA (JavaScript-heavy)
- **Fallback LLM**: Si todo falla, el sistema automáticamente usa Perplexity

### Si hay productos duplicados:

- Verificar que la de-duplicación usa `store+url` como clave única
- Revisar que las URLs estén correctamente formadas (absolutas, no relativas)

### Si los precios están mal:

- Verificar transformación de precio en `config.transforms.price`
- Asegurar que se limpia correctamente: `parseFloat(text.replace(/[^\d]/g, ''))`
- Validar que no se incluyen precios con IVA duplicado

---

## Rate Limiting

- **Tiempo entre llamadas**: 10 segundos por dominio
- **Implementado en**: `withRateLimit()` function
- **Logs**: Buscar `[RATE] Waiting {time}ms for {domain}` en consola

---

## Confidence Scoring

El sistema calcula un nivel de confianza basado en:

| Métrica | Peso | Descripción |
|---------|------|-------------|
| URLs válidas | 50% | Productos con URL completa (http/https) |
| Marcas presentes | 30% | Productos con campo `brand` |
| Gramos válidos | 20% | Presentación ≥ 50g |

**Niveles**:
- `high`: score > 0.8 (>80% datos completos)
- `medium`: score > 0.5 (>50% datos completos)
- `low`: score ≤ 0.5
- `none`: 0 productos encontrados

---

## Actualización de este documento

- **Frecuencia recomendada**: Mensual o después de errores recurrentes
- **Responsable**: Equipo de desarrollo o DevOps
- **Versionado**: Agregar fecha de última actualización en cada sección
- **Testing**: Probar cambios en ambiente de staging antes de producción
