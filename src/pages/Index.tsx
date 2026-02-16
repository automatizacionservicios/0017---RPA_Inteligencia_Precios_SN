import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Zap,
  BarChart3,
  ExternalLink,
  ChevronRight,
  Store,
  Coffee,
  Cookie,
  Beef,
  IceCream,
  UtensilsCrossed,
  ShoppingCart,
  LineChart,
  Sparkles,
  Clock,
  Construction,
  PackageCheck,
} from 'lucide-react';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { Badge } from '@/components/ui/badge';
import { STORE_BRANDING, type StoreBrand } from '@/lib/store-branding';
import { storeHealth } from '@/lib/store-health';
import { canSearchByEan } from '@/lib/store-capabilities';

const SectionHeader = ({
  badge,
  title,
  highlight,
  centered = false,
}: {
  badge: string;
  title: string;
  highlight?: string;
  centered?: boolean;
}) => (
  <div
    className={`flex flex-col mb-12 animate-fade-in ${
      centered ? 'text-center' : 'text-center md:text-left'
    }`}
  >
    <motion.div
      initial={{ opacity: 0, x: centered ? 0 : -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className={`flex items-center gap-3 mb-2 ${
        centered ? 'justify-center' : 'justify-center md:justify-start'
      }`}
    >
      <div className="h-0.5 w-12 bg-emerald-500 rounded-full" />
      <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em]">
        {badge}
      </span>
    </motion.div>
    <motion.h2
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.1 }}
      className="text-4xl md:text-5xl font-black text-stone-900 uppercase tracking-tighter leading-none"
    >
      {title} {highlight && <span className="text-emerald-600 italic">{highlight}</span>}
    </motion.h2>
  </div>
);

const Home = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const handleGlobalSearch = (_e?: React.FormEvent) => {
    _e?.preventDefault();
    if (searchTerm.trim()) {
      // Unify EAN logic with 8-14 digits regex
      const isEan = /^\d{8,14}$/.test(searchTerm.trim());
      navigate('/radar-referencial', {
        state: {
          quickSearch: searchTerm.trim(),
          isEanMode: isEan,
          autoTrigger: true,
        },
      });
    }
  };

  const quickAccessCards = [
    {
      id: 'ean',
      icon: Search,
      title: 'Buscador de EANs',
      description:
        'Optimiza tus códigos mediante búsqueda por nombre, marca o categoría con el motor de matching más avanzado.',
      action: () => navigate('/benchmark', { state: { mode: 'single' } }),
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      id: 'pareto',
      icon: Zap,
      title: 'Carga Masiva (Pareto)',
      description: 'Procesamiento masivo avanzado desde fuentes remotas.',
      action: () => navigate('/benchmark', { state: { mode: 'pareto' } }),
      color: 'text-white',
      bg: 'bg-stone-900',
      isDark: true,
    },
    {
      id: 'radar',
      icon: LineChart,
      title: 'Radar Referencial',
      description:
        'Auditoría técnica de precios cruzados y benchmarking competitivo en tiempo real.',
      action: () => navigate('/radar-referencial'),
      color: 'text-stone-900',
      bg: 'bg-white',
    },
    {
      id: 'analysis',
      icon: BarChart3,
      title: 'Análisis',
      description: 'Reportes dinámicos',
      action: () => navigate('/benchmark'),
      color: 'text-stone-900',
      bg: 'bg-white',
    },
    {
      id: 'oportunidades',
      icon: Sparkles,
      title: 'Oportunidades',
      description: 'Promo Radar Nutresa',
      action: () => navigate('/oportunidades'),
      color: 'text-stone-900',
      bg: 'bg-white',
    },
    {
      id: 'catalog',
      icon: Store,
      title: 'Tiendas',
      description: 'Retail Global',
      action: () => navigate('/benchmark', { state: { mode: 'catalog' } }),
      color: 'text-stone-900',
      bg: 'bg-white',
    },
    {
      id: 'stock',
      icon: PackageCheck,
      title: 'Auditoría de Stock',
      description: 'Control de inventarios',
      action: () => navigate('/auditoria-stock'),
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
  ];

  const interestLinks = [
    {
      name: 'Grupo Nutresa',
      url: 'https://gruponutresa.com/',
      icon: ExternalLink,
      image: '/previews/grupo-nutresa.png',
      desc: 'Portal Corporativo y Estrategia',
    },
    {
      name: 'Servicios Nutresa',
      url: 'https://www.serviciosnutresa.com/',
      icon: ExternalLink,
      image: '/previews/servicios-nutresa.png',
      desc: 'Centro de Servicios Compartidos',
    },
    {
      name: 'Tienda Nutresa en Casa',
      url: 'https://tiendanutresaencasa.com/',
      icon: ExternalLink,
      image: '/previews/tienda-nutresa.png',
      desc: 'E-commerce y Venta Directa',
    },
  ];

  const brands = [
    'Colcafé',
    'Sello Rojo',
    'Noel',
    'Tosh',
    'Pozuelo',
    'Chiky',
    'Bokitas',
    'Tru-Blu',
    'Natu Cereal',
    'Festival',
    'Dux',
    'Jet',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      {/* Header */}
      <Header />

      {/* Hero Section - Technical "Radar" Aesthetic */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-stone-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.1)_0%,transparent_70%)] animate-pulse-slow"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>

        {/* Radar Animation Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
          <div className="w-[800px] h-[800px] rounded-full border border-emerald-500/30 flex items-center justify-center relative animate-spin-slow">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1/2 bg-gradient-to-b from-emerald-500 to-transparent blur-[2px]"></div>
          </div>
        </div>

        <div className="relative max-w-[1440px] mx-auto px-6 xl:px-12 z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-md animate-fade-in">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">
                SISTEMA DE INTELIGENCIA COMERCIAL v2.0
              </span>
            </div>

            <h1 className="text-6xl md:text-8xl font-black text-white uppercase tracking-tighter leading-none animate-slide-up">
              Market <span className="text-emerald-500">Radar</span>
            </h1>

            <p className="text-lg md:text-xl text-stone-400 max-w-2xl mx-auto font-medium leading-relaxed animate-fade-in delay-200">
              Monitoreo estratégico y auditoría de precios en tiempo real para el ecosistema{' '}
              <span className="text-white font-black italic">Nutresa</span>.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-fade-in delay-300">
              <Button
                size="lg"
                onClick={() => navigate('/radar-referencial')}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest px-10 py-7 rounded-2xl shadow-xl shadow-emerald-900/20 group transition-all"
              >
                Radar Referencial
                <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/benchmark', { state: { mode: 'pareto' } })}
                className="bg-white/5 border-stone-700 hover:bg-white/10 text-white font-black uppercase tracking-widest px-10 py-7 rounded-2xl backdrop-blur-sm"
              >
                Carga Pareto
                <Zap className="w-4 h-4 ml-2 text-emerald-400" />
              </Button>
            </div>

            {/* Hero Search Bar - NEW */}
            <div className="max-w-2xl mx-auto pt-8 animate-slide-up delay-300">
              <form onSubmit={handleGlobalSearch} className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl blur opacity-25 group-focus-within:opacity-60 transition duration-1000"></div>
                <div className="relative flex items-center bg-stone-800 border border-stone-700 rounded-2xl overflow-hidden shadow-2xl">
                  <div className="pl-6 text-stone-500 group-focus-within:text-emerald-500 transition-colors">
                    <Search className="w-6 h-6" />
                  </div>
                  <input
                    type="text"
                    placeholder="¿Qué producto deseas auditar hoy? (ej: Café Colcafé)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-transparent border-none focus:ring-0 text-white px-6 py-6 font-bold text-lg placeholder:text-stone-500"
                  />
                  <div className="pr-2">
                    <Button
                      type="submit"
                      className="bg-emerald-500 hover:bg-emerald-400 text-stone-900 font-black uppercase tracking-widest px-8 h-12 rounded-xl transition-all"
                    >
                      Buscar
                    </Button>
                  </div>
                </div>
              </form>
              <p className="mt-4 text-stone-500 text-[10px] font-black uppercase tracking-[0.2em] opacity-60">
                Presiona <span className="text-white">Enter</span> para búsqueda instantánea en 16
                canales
              </p>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent"></div>
      </section>

      {/* NEW: Step-by-Step Guidance (Antibobos) - REDESIGNED */}
      <section className="bg-white border-b border-stone-100 py-16 relative z-20 overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-6 xl:px-12">
          <div className="relative flex flex-col md:flex-row justify-center items-center gap-12 md:gap-32">
            {/* Decorative Connection Line */}
            <div className="absolute top-1/2 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-stone-200 to-transparent hidden md:block -translate-y-8" />

            {[
              {
                num: 1,
                title: 'Busca el EAN',
                desc: 'Identifica el producto con su código de barras.',
                delay: 0,
              },
              {
                num: 2,
                title: 'Lanza el Robot',
                desc: 'Nuestro scraper consulta 16 tiendas en segundos.',
                delay: 0.2,
              },
              {
                num: 3,
                title: 'Analiza y Gana',
                desc: 'Exporta y define el mejor precio para Nutresa.',
                delay: 0.4,
              },
            ].map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: step.delay }}
                className="relative flex flex-col items-center gap-6 group"
              >
                <div className="w-16 h-16 rounded-[22px] bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-xl shadow-inner group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500 cursor-default">
                  {step.num}
                  <div className="absolute inset-0 rounded-[22px] border-2 border-emerald-500 opacity-0 group-hover:opacity-100 group-hover:scale-125 transition-all duration-500" />
                </div>
                <div className="text-center">
                  <h5 className="text-[13px] font-black uppercase tracking-widest text-stone-900 mb-2">
                    {step.title}
                  </h5>
                  <p className="text-[11px] text-stone-400 font-bold max-w-[180px] leading-relaxed italic">
                    {idx === 0 && <span className="text-stone-300 mr-1 opacity-50">#</span>}
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Bento Grid - Premium Redesign (Inspired by Reference Images) */}
      <section className="max-w-[1440px] mx-auto px-6 xl:px-12 py-24 relative z-20 -mt-24">
        <SectionHeader badge="Ecosistema Profesional" title="Módulos de" highlight="Inteligencia" />
        <div className="w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 auto-rows-[240px]">
            {/* 1. BUSCADOR DE EANS (Large/Tall) */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              onClick={quickAccessCards[0].action}
              className="lg:col-span-5 lg:row-span-3 bg-white border border-stone-100 p-12 rounded-[45px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.06)] hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.12)] transition-all duration-700 cursor-pointer group flex flex-col relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full -mr-32 -mt-32 opacity-30 group-hover:scale-110 transition-transform duration-700" />

              <div className="w-20 h-20 rounded-[28px] bg-emerald-500 flex items-center justify-center mb-10 shadow-lg shadow-emerald-200 group-hover:scale-110 transition-transform">
                <Search className="w-10 h-10 text-white" />
              </div>

              <div className="mt-auto space-y-6">
                <div>
                  <h3 className="text-4xl font-black text-stone-900 uppercase tracking-tighter mb-4 leading-none">
                    Buscador de
                    <br />
                    EANS
                  </h3>
                  <p className="text-stone-500 text-lg font-medium leading-relaxed max-w-xs">
                    {quickAccessCards[0].description}
                  </p>
                </div>

                <div className="flex items-center text-[11px] font-black text-emerald-600 uppercase tracking-[0.2em] group-hover:translate-x-2 transition-transform">
                  Ejecutar Módulo <ChevronRight className="w-4 h-4 ml-2" />
                </div>
              </div>
            </motion.div>

            {/* 2. CARGA MASIVA (Wider / Dark Mode) */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              onClick={quickAccessCards[1].action}
              className="lg:col-span-7 lg:row-span-1 bg-stone-900 p-8 rounded-[40px] shadow-2xl hover:shadow-emerald-900/40 transition-all duration-700 cursor-pointer group flex items-center justify-between relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="flex items-center gap-8 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-emerald-500 group-hover:border-emerald-400 transition-all">
                  <Zap className="w-6 h-6 text-emerald-500 group-hover:text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-1">
                    Carga Masiva (Pareto)
                  </h3>
                  <p className="text-stone-400 text-xs font-medium">
                    {quickAccessCards[1].description}
                  </p>
                </div>
              </div>

              <div className="relative z-10 flex flex-col items-end gap-3">
                <div className="px-3 py-1 rounded-lg bg-emerald-500/20 text-[9px] font-black text-emerald-400 uppercase tracking-widest border border-emerald-500/30">
                  Enterprise
                </div>
                <div className="flex items-center text-[9px] font-black text-stone-500 uppercase tracking-[0.3em] group-hover:text-emerald-500 transition-colors">
                  Lanzar Robot <ChevronRight className="w-3 h-3 ml-2" />
                </div>
              </div>
            </motion.div>

            {/* 3. RADAR REFERENCIAL (Middle Width) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              onClick={quickAccessCards[2].action}
              className="lg:col-span-7 lg:row-span-1 bg-white border border-stone-100 p-8 rounded-[40px] shadow-xl hover:shadow-2xl transition-all duration-700 cursor-pointer group flex items-center gap-8 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-110 transition-transform" />

              <div className="w-16 h-16 rounded-3xl bg-indigo-50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <LineChart className="w-8 h-8 text-indigo-600" />
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-xl font-black text-stone-900 uppercase tracking-tight">
                    {quickAccessCards[2].title}
                  </h3>
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                </div>
                <p className="text-stone-500 text-sm font-medium pr-12">
                  {quickAccessCards[2].description}
                </p>
              </div>
            </motion.div>

            {/* 4. OPORTUNIDADES, 5. ANÁLISIS, 6. TIENDAS & 7. STOCK (Four cards at the bottom) */}
            <div className="lg:col-span-7 lg:row-span-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {[
                quickAccessCards[4],
                quickAccessCards[3],
                quickAccessCards[5],
                quickAccessCards[6],
              ].map((card, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * idx }}
                  onClick={card.action}
                  className="bg-white border border-stone-100 p-8 rounded-[40px] shadow-lg hover:shadow-xl transition-all duration-500 cursor-pointer group flex flex-col justify-center items-center text-center relative overflow-hidden"
                >
                  {card.id === 'oportunidades' && (
                    <div className="absolute top-3 right-5">
                      <div className="flex items-center gap-1.5 px-2 py-0.5 bg-rose-50 rounded-full border border-rose-100">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500"></span>
                        </span>
                        <span className="text-[7px] font-black text-rose-500 uppercase tracking-widest">
                          Live
                        </span>
                      </div>
                    </div>
                  )}
                  <div
                    className={`w-12 h-12 rounded-2xl bg-stone-50 flex items-center justify-center mb-4 group-hover:scale-110 ${card.id === 'oportunidades' ? 'group-hover:bg-amber-50' : 'group-hover:bg-emerald-50'} transition-all`}
                  >
                    <card.icon
                      className={`w-6 h-6 ${card.id === 'oportunidades' ? 'text-amber-500' : 'text-stone-800'} group-hover:text-emerald-600`}
                    />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-stone-900 uppercase tracking-tight mb-1">
                      {card.title}
                    </h4>
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                      {card.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Store Showcase Section - Clickable (Image 1) */}
      <section className="max-w-[1700px] mx-auto px-6 xl:px-12 py-24 bg-stone-50/50">
        <div className="w-full">
          <SectionHeader
            badge="Retail Intelligence Network"
            title="Fuentes"
            highlight="Monitorizadas"
            centered
          />

          <div className="space-y-16">
            {/* Category 1: EAN + Name (Technical Identification) */}
            <div className="space-y-8">
              <div className="flex items-center gap-4 px-4">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-stone-200" />
                <Badge
                  variant="outline"
                  className="px-6 py-1.5 rounded-full border-emerald-200 bg-emerald-50/50 text-emerald-700 font-black text-[10px] tracking-[0.2em] uppercase"
                >
                  Búsqueda por EAN + Nombre
                </Badge>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-stone-200" />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 xl:grid-cols-6 gap-6">
                {Object.entries(STORE_BRANDING)
                  .filter(
                    ([id, brand]) => brand.name !== 'Nutresa' && brand.icon && canSearchByEan(id)
                  )
                  .map(([id, brand], idx) => (
                    <StoreShowcaseCard key={id} id={id} brand={brand} idx={idx} />
                  ))}
              </div>
            </div>

            {/* Category 2: Name Only (Catalog Selection) */}
            <div className="space-y-8">
              <div className="flex items-center gap-4 px-4">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-stone-200 opacity-50" />
                <Badge
                  variant="outline"
                  className="px-6 py-1.5 rounded-full border-amber-200 bg-amber-50/50 text-amber-700 font-black text-[10px] tracking-[0.2em] uppercase"
                >
                  Búsqueda por Nombre solamente
                </Badge>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-stone-200 opacity-50" />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 xl:grid-cols-6 gap-6">
                {Object.entries(STORE_BRANDING)
                  .filter(
                    ([id, brand]) => brand.name !== 'Nutresa' && brand.icon && !canSearchByEan(id)
                  )
                  .map(([id, brand], idx) => (
                    <StoreShowcaseCard key={id} id={id} brand={brand} idx={idx} />
                  ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section - Polish */}
      <section className="bg-white border-y border-stone-100">
        <div className="max-w-[1700px] mx-auto px-6 xl:px-12 py-24">
          <SectionHeader
            badge="Verticales de Consumo"
            title="Categorías"
            highlight="Estratégicas"
            centered
          />

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 w-full">
            {[
              { name: 'Cafés', icon: Coffee, desc: 'Molido, Insta, Grano' },
              { name: 'Galletas', icon: Cookie, desc: 'Dulces, Saladas' },
              { name: 'Cárnicos', icon: Beef, desc: 'Madurados, Larga Vida' },
              { name: 'Chocolates', icon: IceCream, desc: 'Mesa, Golosinas' },
              { name: 'Pastas', icon: UtensilsCrossed, desc: 'Largas, Cortas' },
              { name: 'Helados', icon: ShoppingCart, desc: 'Cremas, Paletas' },
            ].map((cat, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -5 }}
                className="bg-stone-50/50 rounded-[30px] p-8 text-center border border-transparent hover:border-emerald-500/10 hover:bg-white hover:shadow-xl transition-all duration-500 group cursor-default"
              >
                <div className="w-14 h-14 mx-auto bg-white rounded-2xl shadow-sm border border-stone-100 flex items-center justify-center mb-5 group-hover:bg-emerald-500 group-hover:border-emerald-400 transition-all duration-300">
                  <cat.icon className="w-6 h-6 text-stone-800 group-hover:text-white group-hover:scale-110 transition-transform" />
                </div>
                <h4 className="font-black text-stone-800 text-sm uppercase tracking-tight mb-2">
                  {cat.name}
                </h4>
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                  {cat.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enlaces de Interés - Visual Cards (Image 2) */}
      <section className="max-w-[1700px] mx-auto px-6 xl:px-12 py-24">
        <SectionHeader
          badge="Conexiones Estratégicas"
          title="Ecosistema"
          highlight="Nutresa"
          centered
        />

        <div className="grid md:grid-cols-3 gap-8 w-full">
          {interestLinks.map((link, index) => (
            <div
              key={index}
              onClick={() => window.open(link.url, '_blank')}
              className="group relative h-[380px] rounded-[40px] overflow-hidden cursor-pointer shadow-xl hover:shadow-2xl transition-all duration-700 hover:-translate-y-2 border border-stone-100"
            >
              {/* Background Preview Image */}
              <div className="absolute inset-0 transition-transform duration-1000 group-hover:scale-110">
                <img
                  src={link.image}
                  alt={link.name}
                  className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-stone-900/40 group-hover:bg-emerald-900/20 transition-colors duration-700"></div>
              </div>

              {/* Content Overlay */}
              <div className="absolute inset-x-0 bottom-0 p-10 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                    <link.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">
                    Recurso Externo
                  </span>
                </div>
                <h4 className="text-2xl font-black text-white uppercase tracking-tight mb-2 leading-none">
                  {link.name}
                </h4>
                <p className="text-stone-300 text-sm font-medium leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                  {link.desc}
                </p>

                <div className="mt-8 flex items-center gap-2 text-[10px] font-black text-white uppercase tracking-widest opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                  Visitar Sitio Oficial <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Brand Cloud - Polish (Image 2) */}
      <section className="max-w-[1700px] mx-auto px-6 xl:px-12 py-20 border-t border-stone-100 overflow-hidden">
        <h3 className="text-[12px] font-black text-stone-400 text-center uppercase tracking-[0.4em] mb-12 opacity-80">
          Marcas del Grupo Nutresa
        </h3>
        <div className="relative">
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8 w-full px-4">
            {brands.map((brand, index) => (
              <div
                key={index}
                className="text-2xl md:text-3xl font-black text-stone-200 hover:text-stone-800 transition-all duration-500 whitespace-nowrap cursor-default hover:scale-105"
              >
                {brand}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 15s linear infinite;
        }
        .animate-pulse-slow {
          animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
        .animate-slide-up {
          animation: slide-up 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
      `}</style>
    </div>
  );
};

const StoreShowcaseCard = ({ id, brand, idx }: { id: string; brand: StoreBrand; idx: number }) => {
  const effectiveStatus = storeHealth.getEffectiveStatus(
    id,
    (brand.status || 'online') as 'online' | 'manual' | 'maintenance' | 'coming_soon'
  );

  return (
    <motion.div
      key={id}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: idx * 0.05, duration: 0.5 }}
      onClick={() => brand.url && window.open(brand.url, '_blank')}
      className={`group relative flex flex-col items-center gap-5 bg-white/60 backdrop-blur-md p-8 rounded-[40px] border border-stone-100 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer overflow-hidden ${
        effectiveStatus === 'maintenance' || effectiveStatus === 'coming_soon' ? 'opacity-80' : ''
      }`}
      style={{ '--brand-color': brand.color } as React.CSSProperties}
    >
      {/* Brand Background Glow */}
      <div className="absolute -inset-2 opacity-0 group-hover:opacity-10 transition-opacity duration-500 blur-2xl bg-[var(--brand-color)]" />

      {/* Status Badge */}
      <div className="absolute top-4 right-4 z-20">
        {effectiveStatus === 'manual' ? (
          <Badge className="bg-amber-500/10 text-amber-600 border-amber-200/50 text-[8px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
            <Clock className="w-2 h-2" /> MANUAL
          </Badge>
        ) : effectiveStatus === 'maintenance' ? (
          <Badge className="bg-rose-500/10 text-rose-600 border-rose-200/50 text-[8px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
            <Construction className="w-2 h-2" /> REPARACIÓN
          </Badge>
        ) : effectiveStatus === 'coming_soon' ? (
          <Badge className="bg-blue-500/10 text-blue-600 border-blue-200/50 text-[8px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
            <Sparkles className="w-2 h-2" /> PRÓXIMAMENTE
          </Badge>
        ) : (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/5 rounded-full border border-emerald-500/10">
            <div className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </div>
            <span className="text-[7px] font-black text-emerald-600 uppercase tracking-widest">
              Activo
            </span>
          </div>
        )}
      </div>

      <div
        className={`w-24 h-24 rounded-full border border-stone-50 flex items-center justify-center bg-white p-4 shadow-xl shadow-stone-200/50 group-hover:scale-110 group-hover:ring-8 group-hover:ring-emerald-500/5 transition-all duration-700 relative z-10 ${
          effectiveStatus === 'maintenance' || effectiveStatus === 'coming_soon'
            ? 'grayscale opacity-60'
            : ''
        }`}
      >
        <img src={brand.icon!} alt={brand.name} className="w-full h-full object-contain" />
      </div>

      <div className="text-center relative z-10 w-full px-2">
        <span className="block text-[12px] font-black text-stone-800 uppercase tracking-tight mb-1 group-hover:text-emerald-700 transition-colors">
          {brand.name}
        </span>
        <div className="flex flex-col gap-1 items-center">
          {effectiveStatus === 'maintenance' ? (
            <span className="text-[9px] font-bold text-rose-500/70 uppercase">Mantenimiento</span>
          ) : effectiveStatus === 'coming_soon' ? (
            <span className="text-[9px] font-bold text-blue-500/70 uppercase">Lanzamiento</span>
          ) : effectiveStatus === 'manual' ? (
            <span className="text-[9px] font-bold text-amber-600/70 uppercase">Carga Directa</span>
          ) : (
            <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
              Ver Catálogo
            </span>
          )}
        </div>
      </div>

      {/* Decorative bottom line */}
      <div className="absolute bottom-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-700 ease-out bg-[var(--brand-color)]" />
    </motion.div>
  );
};

export default Home;
