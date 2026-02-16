/* eslint-disable */
// Preserving legacy business logic to avoid regressions
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, products, metadata, searchQuery } = await req.json();

    // Use official Gemini API Key
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      console.error('❌ GEMINI_API_KEY is missing in Edge Function Secrets');
      return new Response(
        JSON.stringify({
          message:
            'Error de configuración: API Key no encontrada. Por favor contacta al administrador.',
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate products
    if (!products || !Array.isArray(products) || products.length === 0) {
      console.warn('⚠️ No products provided in request');
      return new Response(
        JSON.stringify({
          message:
            'No veo productos en tu consulta actual. Por favor realiza una búsqueda primero para que pueda analizar los datos.',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Preparar estadísticas de los productos
    const productsByStore = products.reduce((acc: Record<string, any[]>, p: any) => {
      if (!acc[p.store]) acc[p.store] = [];
      acc[p.store].push(p);
      return acc;
    }, {});

    const prices = products.map((p: any) => p.price);
    const stats = {
      totalProducts: products.length,
      stores: Object.keys(productsByStore),
      priceRange: {
        min: Math.min(...prices),
        max: Math.max(...prices),
        avg: prices.reduce((sum: number, p: number) => sum + p, 0) / prices.length,
      },
    };

    // Formatear productos como tabla markdown legible
    const productsTable = products
      .map(
        (p: any) =>
          `| ${p.store} | ${p.productName} | $${p.price.toLocaleString('es-CO')} | ${p.presentation} | $${(p.pricePerGram || 0).toFixed(2)}/g |`
      )
      .join('\n');

    console.log(`📊 Procesando consulta sobre ${products.length} productos`);

    const systemPrompt = `Eres Gemini, un asistente de análisis de precios especializado en web scraping de café para el Grupo Nutresa.

BÚSQUEDA REALIZADA: "${searchQuery}"

📊 RESUMEN EJECUTIVO:
- Total de productos encontrados: ${stats.totalProducts}
- Tiendas analizadas: ${stats.stores.join(', ')}
- Rango de precios: $${stats.priceRange.min.toLocaleString('es-CO')} - $${stats.priceRange.max.toLocaleString('es-CO')}
- Precio promedio: $${Math.round(stats.priceRange.avg).toLocaleString('es-CO')}

📋 DATOS COMPLETOS (Formato Tabla):
| Tienda | Producto | Precio | Presentación | Precio/Gramo |
|--------|----------|--------|--------------|--------------|
${productsTable}

${
  metadata
    ? `
📈 METADATA DE VALIDACIÓN:
- Productos validados: ${metadata.aiValidation?.validated || 0}
- Productos rechazados: ${metadata.aiValidation?.rejected || 0}
- Modelo usado: ${metadata.model}
`
    : ''
}

🎯 TU MISIÓN:
1. Analiza SOLO los datos de la tabla anterior
2. Responde preguntas sobre precios, comparaciones y tendencias
3. Proporciona insights accionables y concretos
4. Usa números EXACTOS de la tabla (no inventes datos)
5. Si preguntan por "la más cara" o "la más barata", identifica el producto correcto de la tabla
6. Si detectas oportunidades de ahorro, méncionalas
7. Sé conciso (máximo 3-4 párrafos) pero preciso

❌ RESTRICCIONES:
- NO respondas preguntas fuera del contexto del scraping
- NO inventes precios o productos
- Si no encuentras la info en la tabla, di "No tengo esa información en los resultados actuales"

💬 ESTILO:
- Profesional pero amigable
- Usa emojis ocasionalmente
- Muestra diferencias porcentuales cuando compares
- Formato en español colombiano

Responde en base ÚNICAMENTE a los datos de la tabla anterior.`;

    // Try models in order of preference based on available list found in logs
    const models = [
      'gemini-2.0-flash',
      'gemini-flash-latest',
      'gemini-1.5-flash',
      'gemini-pro-latest',
      'gemini-1.5-pro',
      'gemini-pro',
    ];
    let aiMessage = 'Lo siento, no pude generar una respuesta.';
    let success = false;
    let lastError = '';

    for (const model of models) {
      try {
        console.log(`🤖 Intentando con modelo: ${model}`);
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: systemPrompt }],
            },
            contents: [
              {
                role: 'user',
                parts: [{ text: message }],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1000,
            },
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.warn(`⚠️ Error con ${model}:`, errorText);
          lastError = errorText;

          if (response.status === 404) continue;
          continue;
        }

        const data = await response.json();
        aiMessage =
          data.candidates?.[0]?.content?.parts?.[0]?.text || 'No obtuve respuesta del modelo.';
        success = true;
        break; // Exit loop on success
      } catch (err) {
        console.error(`❌ Excepción con ${model}:`, err);
        lastError = err instanceof Error ? err.message : String(err);
      }
    }

    if (!success) {
      // DIAGNOSTIC: List available models to debug the 404 issue
      console.log('🕵️ Diagnose: Listing available models for this API Key...');
      try {
        const listResp = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`
        );
        if (listResp.ok) {
          const listData = await listResp.json();
          const modelNames = listData.models?.map((m: any) => m.name) || [];
          console.log('✅ Modelos Disponibles:', JSON.stringify(modelNames, null, 2));
          lastError += ` | Disponibles: ${modelNames.join(', ')}`;
        } else {
          console.log('❌ No se pudieron listar los modelos:', await listResp.text());
        }
      } catch (diagErr) {
        console.error('Error diagnosticando modelos:', diagErr);
      }

      throw new Error(
        `Fallaron todos los modelos (${models.join(', ')}). Verifica los logs de Supabase para ver cuáles tiene permiso tu Key. Último error: ${lastError}`
      );
    }

    return new Response(JSON.stringify({ message: aiMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('🔥 Critical Error en gemini-chat:', error);
    return new Response(
      JSON.stringify({
        error: 'internal_error',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: 'Check Supabase project logs for more info',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
