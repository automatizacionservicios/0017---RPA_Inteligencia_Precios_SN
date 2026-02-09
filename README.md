# Radar SN - Inteligencia de Precios v2.0

Plataforma avanzada de monitoreo de precios, scraping en tiempo real y análisis competitivo para el **Grupo Nutresa**.

## 🚀 Características Principales

- **Multi-Store Scraping**: Integración con Éxito, Carulla, Nutresa (IO), Farmatodo, y más.
- **Análisis de Pareto**: Carga masiva de productos para auditorías de precios a gran escala.
- **Asistente Gemini AI**: Chat inteligente integrado con Google Gemini 1.5 Flash para análisis semántico de datos.
- **Visualización Pro**: Gráficas comparativas y tablas interactivas con cálculo de precio por gramo/unidad.
- **PWA Ready**: Aplicación web progresiva optimizada para dispositivos móviles.

## 🛠️ Stack Tecnológico

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Framer Motion.
- **UI Components**: shadcn/ui.
- **Backend**: Supabase Edge Functions (Deno).
- **IA**: Google Gemini API.

## 📦 Instalación y Desarrollo

1. **Clonar el repositorio**
   ```bash
   git clone <repo-url>
   cd 0017---RPA_Inteligencia_Precios_SN-master
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Variables de Entorno**
   Configurar las siguientes variables en Supabase:
   - `GEMINI_API_KEY`: Tu clave de Google AI Studio.

4. **Ejecutar en desarrollo**
   ```bash
   npm run dev
   ```

5. **Desplegar nube**
   ```bash
   npx supabase functions deploy price-scraper --no-verify-jwt
   ```

## 🏗️ Estructura del Proyecto

- `/src/components/gemini`: Componentes del asistente de IA.
- `/src/components/radar`: Componentes específicos de visualización de radar.
- `/supabase/functions/price-scraper`: Lógica central de scraping y estrategias.
- `/supabase/functions/gemini-chat`: Backend del asistente inteligente.

---
© 2026 - Inteligencia de Datos - Grupo Nutresa
