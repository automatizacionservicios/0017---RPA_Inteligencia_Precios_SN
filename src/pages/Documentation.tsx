import { motion } from 'framer-motion';
import {
  Book,
  Search,
  Zap,
  BarChart3,
  Bot,
  ArrowRight,
  ShieldCheck,
  Database,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Documentation = () => {
  const sections = [
    {
      title: 'Buscador de EANs',
      icon: Search,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      content:
        'El módulo principal para consultar precios específicos. Ingresa un código EAN o el nombre del producto para obtener una comparativa en tiempo real entre todas las tiendas del ecosistema Nutresa.',
    },
    {
      title: 'Módulo Pareto (Masivos)',
      icon: Zap,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      content:
        'Diseñado para auditorías a gran escala. Puedes cargar listas desde Excel o pegar datos directamente. El sistema procesará cada ítem y generará una tabla consolidada con el mejor precio del mercado.',
    },
    {
      title: 'Radar Referencial',
      icon: BarChart3,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      content:
        'Herramienta de búsqueda amplia para benchmarking. Permite ver múltiples resultados por tienda para una misma categoría, ideal para detectar nuevas tendencias o cambios de empaque.',
    },
    {
      title: 'Oportunidades de Mercado',
      icon: Sparkles,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      content:
        'Detección automática de brechas de precios y promociones agresivas. El sistema analiza el mercado 24/7 para alertar sobre oportunidades de posicionamiento para Nutresa.',
    },
  ];

  return (
    <div className="min-h-screen bg-stone-50">
      <Header />

      <main className="max-w-[1440px] mx-auto px-6 xl:px-12 py-24">
        <div className="w-full">
          {/* Hero Header */}
          <div className="flex flex-col lg:flex-row items-center gap-16 mb-32">
            <div className="flex-1 space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-stone-200 shadow-sm">
                <Book className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-600">
                  Documentación Técnica v2.5
                </span>
              </div>
              <h1 className="text-6xl md:text-7xl font-black text-stone-900 tracking-tighter uppercase leading-[0.85]">
                Guía de{' '}
                <span className="text-emerald-600 italic text-shadow-glow">Inteligencia</span>
              </h1>
              <p className="text-stone-500 text-xl font-medium leading-relaxed max-w-2xl">
                Domina el ecosistema de Market Radar. Desde auditorías masivas de Pareto hasta el
                monitoreo en tiempo real de brechas de mercado.
              </p>
            </div>
            <div className="w-full lg:w-[400px] bg-white rounded-[3rem] p-12 border border-stone-100 shadow-2xl shadow-stone-200/50 relative overflow-hidden group">
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-50 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
              <Bot className="w-16 h-16 text-emerald-500 mb-8 animate-float" />
              <h4 className="text-stone-900 font-black uppercase text-sm mb-4 flex items-center gap-2 tracking-widest">
                ¿Necesitas Ayuda?
              </h4>
              <p className="text-stone-500 text-sm font-bold leading-loose relative z-10 uppercase tracking-tight">
                Nuestro equipo de soporte técnico está disponible en el módulo de contacto para
                resolver dudas sobre el motor de scraping.
              </p>
            </div>
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-40">
            {sections.map((section, idx) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group p-10 rounded-[2.5rem] border border-stone-100 bg-white hover:shadow-2xl hover:border-emerald-500/20 transition-all duration-700 hover:-translate-y-2"
              >
                <div
                  className={`w-16 h-16 rounded-2xl ${section.bg} flex items-center justify-center mb-10 group-hover:scale-110 transition-transform shadow-sm`}
                >
                  <section.icon className={`w-8 h-8 ${section.color}`} />
                </div>
                <h3 className="text-lg font-black text-stone-900 uppercase tracking-tight mb-4">
                  {section.title}
                </h3>
                <p className="text-stone-400 text-[13px] font-bold leading-relaxed uppercase tracking-tight">
                  {section.content}
                </p>
              </motion.div>
            ))}
          </div>

          {/* New Technical Section: Infrastructure */}
          <div className="grid lg:grid-cols-3 gap-12 mb-40">
            <div className="lg:col-span-1 space-y-6">
              <h2 className="text-4xl font-black uppercase tracking-tighter leading-none text-stone-900">
                Infraestructura & <span className="text-emerald-600">Lógica</span>
              </h2>
              <p className="text-stone-500 font-bold uppercase text-xs tracking-widest leading-loose">
                Detalles de la arquitectura híbrida que permite procesar miles de SKUs en segundos
                con una precisión del 99.8%.
              </p>
            </div>
            <div className="lg:col-span-2 grid md:grid-cols-2 gap-8">
              <div className="p-10 rounded-[2.5rem] bg-stone-900 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl"></div>
                <Database className="w-10 h-10 text-emerald-500 mb-8" />
                <h4 className="font-black uppercase text-sm tracking-widest mb-4">
                  Lógica Centralizada
                </h4>
                <p className="text-stone-400 text-xs font-bold leading-loose uppercase tracking-tight">
                  Utilizamos un sistema de `StrategyFactory` que unifica la extracción de EANs y
                  Gramajes, permitiendo que todas las tiendas compartan algoritmos de limpieza de
                  datos.
                </p>
              </div>
              <div className="p-10 rounded-[2.5rem] bg-white border border-stone-100 shadow-xl">
                <Search className="w-10 h-10 text-blue-600 mb-8" />
                <h4 className="font-black uppercase text-sm tracking-widest mb-4 text-stone-900">
                  Extracción Inteligente
                </h4>
                <p className="text-stone-500 text-xs font-bold leading-loose uppercase tracking-tight">
                  Motor optimizado para lazy-loading y Shopify Liquid, capaz de detectar imágenes en
                  atributos `data-master`, `data-original` y resoluciones dinámicas.
                </p>
              </div>
            </div>
          </div>

          {/* Best Practices Section */}
          <div className="bg-white rounded-[4rem] p-16 md:p-24 border border-stone-100 shadow-2xl relative overflow-hidden mb-40">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-50 rounded-full blur-[120px] -mr-64 -mt-64 opacity-60"></div>

            <div className="relative z-10 grid lg:grid-cols-2 gap-24">
              <div>
                <h2 className="text-5xl font-black uppercase tracking-tighter mb-12 italic text-stone-900 leading-none">
                  Mejores <span className="text-emerald-500">Prácticas</span>
                </h2>
                <div className="space-y-12">
                  <div className="flex gap-8">
                    <div className="w-12 h-12 rounded-2xl bg-stone-900 flex items-center justify-center shrink-0 font-black text-emerald-500 text-lg shadow-xl">
                      1
                    </div>
                    <div>
                      <h5 className="font-black uppercase text-sm tracking-widest mb-3 text-stone-900">
                        Prioridad EAN/GTIN
                      </h5>
                      <p className="text-stone-500 text-sm font-bold uppercase tracking-tight leading-loose">
                        El código de barras de 13 dígitos es la llave maestra para comparativas 100%
                        exactas sin ruido de búsqueda.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-8">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center shrink-0 font-black text-stone-900 text-lg shadow-lg">
                      2
                    </div>
                    <div>
                      <h5 className="font-black uppercase text-sm tracking-widest mb-3 text-stone-900">
                        Uso de Keywords
                      </h5>
                      <p className="text-stone-500 text-sm font-bold uppercase tracking-tight leading-loose">
                        En auditorías masivas, agrega marcas como "Bimbo" o "Sello Rojo" como filtro
                        preventivo para ignorar productos similares.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-8">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0 font-black text-emerald-600 text-lg border border-emerald-100 shadow-sm">
                      3
                    </div>
                    <div>
                      <h5 className="font-black uppercase text-sm tracking-widest mb-3 text-stone-900">
                        Profundidad Semanal
                      </h5>
                      <p className="text-stone-500 text-sm font-bold uppercase tracking-tight leading-loose">
                        Configura la recencia en "Semanal" para un equilibrio perfecto entre
                        velocidad y precisión histórica de precios.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-center gap-8">
                <div className="p-10 rounded-[3rem] bg-stone-50 border border-stone-100 transition-all hover:bg-white hover:shadow-xl group">
                  <ShieldCheck className="w-12 h-12 text-emerald-500 mb-8 group-hover:scale-110 transition-transform" />
                  <h4 className="font-black uppercase text-[10px] tracking-[0.3em] mb-4 text-stone-400">
                    Seguridad & Ética
                  </h4>
                  <p className="text-stone-800 text-sm font-bold leading-loose uppercase tracking-tight">
                    Market Radar cumple con los protocolos robots.txt y no almacena credenciales de
                    usuario ni datos privados de la competencia.
                  </p>
                </div>
                <div className="p-10 rounded-[3rem] bg-stone-50 border border-stone-100 transition-all hover:bg-white hover:shadow-xl group">
                  <ArrowRight className="w-12 h-12 text-blue-500 mb-8 group-hover:translate-x-2 transition-transform" />
                  <h4 className="font-black uppercase text-[10px] tracking-[0.3em] mb-4 text-stone-400">
                    Consumo de APIs
                  </h4>
                  <p className="text-stone-800 text-sm font-bold leading-loose uppercase tracking-tight">
                    Consultamos directamente los backends oficiales (VTEX, Algolia, Shopify) para
                    garantizar datos en tiempo real.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center py-32 border-t border-stone-100 bg-white/50 rounded-[4rem] backdrop-blur-sm">
            <h3 className="text-3xl font-black text-stone-900 uppercase tracking-tighter mb-10 leading-none">
              ¿Listo para empezar tu <span className="text-emerald-600 italic">análisis</span>?
            </h3>
            <div className="flex justify-center gap-6">
              <Button
                onClick={() => (window.location.href = '/')}
                className="bg-stone-900 hover:bg-emerald-600 text-white px-14 py-8 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all shadow-2xl hover:scale-105 active:scale-95"
              >
                Ir al Radar Intelligence
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Documentation;
