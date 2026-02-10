import { useState, useRef, useLayoutEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from "recharts";
import { ChevronDown, ChevronUp, BarChart3, TrendingDown, Store, PieChart as PieChartIcon, Info, Target, Award, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { MarketProduct } from "@/types/benchmark";
import { getStoreBrand } from "@/lib/store-branding";

interface BenchmarkChartProps {
  products: MarketProduct[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white/95 backdrop-blur-md border border-stone-100 p-5 shadow-2xl rounded-3xl animate-in fade-in zoom-in duration-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full border border-stone-100 flex items-center justify-center bg-white p-1.5 shadow-sm">
            {getStoreBrand(data.store).icon ? (
              <img src={getStoreBrand(data.store).icon!} alt={data.store} className="w-full h-full object-contain" />
            ) : (
              <Store className="w-5 h-5 text-stone-300" />
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest leading-none mb-1">
              Punto de Venta
            </span>
            <span className="text-sm font-black text-stone-800 uppercase tracking-tight leading-none">
              {data.store}
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-sm font-black text-stone-800 line-clamp-2 max-w-[200px]">
            {data.fullName}
          </p>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-xl font-black text-emerald-600">
              ${data.precio.toLocaleString('es-CO')}
            </span>
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-tighter">
              {data.presentation}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const BenchmarkChart = ({ products }: BenchmarkChartProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'details'>('overview');
  const chartRef = useRef<HTMLDivElement>(null);

  const activeProducts = products.filter(p => p.price > 0);
  if (activeProducts.length === 0) return null;

  // --- PROCESAMIENTO ESTRATÉGICO DE DATOS ---

  // 1. Agrupar por producto (EAN o Nombre) para determinar ganadores
  const productGroups: Record<string, MarketProduct[]> = {};
  activeProducts.forEach(p => {
    const key = p.ean || p.productName;
    if (!productGroups[key]) productGroups[key] = [];
    productGroups[key].push(p);
  });

  // 2. Calcular victorias por tienda y Oportunidad de Ahorro
  const storeWins: Record<string, number> = {};
  let totalMarketOpportunity = 0;

  Object.values(productGroups).forEach(group => {
    const prices = group.map(p => p.price);
    const minPriceGroup = Math.min(...prices);
    const maxPriceGroup = Math.max(...prices);

    // Oportunidad = Brecha entre el más caro y el más barato hallado
    totalMarketOpportunity += (maxPriceGroup - minPriceGroup);

    group.forEach(p => {
      if (p.price === minPriceGroup) {
        storeWins[p.store] = (storeWins[p.store] || 0) + 1;
      }
    });
  });

  // 3. Preparar datos para Gráfica de Liderazgo (Pie Chart)
  const pieData = Object.entries(storeWins)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

  // 4. Preparar datos para Gráfica Detallada (Bar Chart)
  const minPrice = Math.min(...activeProducts.map(p => p.price));
  const chartData = activeProducts.map((product, index) => ({
    id: `${product.store}-${index}`,
    store: product.store,
    fullName: product.productName,
    name: `${product.store} • ${product.productName.substring(0, 20)}${product.productName.length > 20 ? '...' : ''}`,
    precio: product.price,
    presentation: product.presentation
  })).sort((a, b) => a.precio - b.precio);

  // 5. Determinar Líder de Mercado
  const marketLeader = pieData.length > 0 ? pieData[0].name : 'N/A';
  const totalProducts = Object.keys(productGroups).length;

  useLayoutEffect(() => {
    if (chartRef.current && activeTab === 'details' && isExpanded) {
      const height = Math.max(400, activeProducts.length * 35);
      chartRef.current.style.height = `${height}px`;
    }
  }, [activeProducts.length, activeTab, isExpanded]);

  return (
    <Card className="border-none bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden group">
      <CardHeader className="p-8 pb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100 shadow-sm group-hover:scale-110 transition-transform duration-500">
              <BarChart3 className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <CardTitle className="text-xl font-black text-stone-800 uppercase tracking-tight leading-none mb-1">
                Visual Market Analytics
              </CardTitle>
              <CardDescription className="text-stone-400 font-bold text-[11px] uppercase tracking-widest leading-none">
                {products.length} Hallazgos • {totalProducts} Referencias únicas
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-stone-100 p-1 rounded-2xl">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setActiveTab('overview');
                setIsExpanded(true);
              }}
              className={`h-9 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest gap-2 transition-all ${activeTab === 'overview' && isExpanded ? 'bg-white text-emerald-600 shadow-sm' : 'text-stone-400 opacity-60'
                }`}
            >
              <PieChartIcon className="w-3.5 h-3.5" />
              Liderazgo
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setActiveTab('details');
                setIsExpanded(true);
              }}
              className={`h-9 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest gap-2 transition-all ${activeTab === 'details' && isExpanded ? 'bg-white text-emerald-600 shadow-sm' : 'text-stone-400 opacity-60'
                }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Productos
            </Button>
            <div className="w-px h-6 bg-stone-200 mx-1" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-10 w-10 p-0 rounded-xl hover:bg-white text-stone-400 transition-all"
            >
              {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          >
            <CardContent className="p-8 pt-4">
              {activeTab === 'overview' ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-4 items-center">
                  {/* Market Share of Wins (Donut Chart) */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                      <Award className="w-5 h-5 text-amber-500" />
                      <h4 className="text-sm font-black text-stone-800 uppercase tracking-tighter">
                        Dominancia de Precios Óptimos
                      </h4>
                    </div>
                    <div className="h-[280px] w-full relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div className="bg-white p-3 rounded-2xl shadow-xl border border-stone-100 font-black uppercase text-[10px]">
                                    <p className="text-stone-800 mb-1">{payload[0].name}</p>
                                    <p className="text-emerald-600">{payload[0].value} Premios Optimal</p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      {/* Center Label */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-2xl font-black text-stone-800">{pieData[0]?.value || 0}</span>
                        <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest italic">Victorias</span>
                      </div>
                    </div>
                  </div>

                  {/* Leaderboard Summary Cards */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                      <Target className="w-5 h-5 text-emerald-500" />
                      <h4 className="text-sm font-black text-stone-800 uppercase tracking-tighter">
                        Resumen de Desempeño
                      </h4>
                    </div>
                    {pieData.slice(0, 4).map((item, idx) => (
                      <div key={item.name} className="flex items-center justify-between p-4 rounded-2xl bg-stone-50 border border-stone-100 group/item hover:bg-white hover:border-emerald-500/20 hover:shadow-md transition-all">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full border border-stone-200 flex items-center justify-center p-1.5 bg-white`}>
                            {getStoreBrand(item.name).icon ? (
                              <img src={getStoreBrand(item.name).icon!} alt="" className="w-full h-full object-contain" />
                            ) : (
                              <Store className="w-4 h-4 text-stone-300" />
                            )}
                          </div>
                          <span className="text-xs font-black text-stone-700 uppercase tracking-tight">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg ${idx === 0 ? 'bg-emerald-500 text-white' : 'bg-stone-200 text-stone-500'}`}>
                            {item.value} WINS
                          </span>
                          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest w-10 text-right">
                            {Math.round((item.value / totalProducts) * 100)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-[400px] w-full mt-4 overflow-y-auto custom-scrollbar pr-4">
                  <div className="min-h-[400px]" ref={chartRef}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData}
                        layout="vertical"
                        margin={{ left: 40, right: 40 }}
                      >
                        <CartesianGrid horizontal={false} strokeDasharray="4 4" stroke="#f1f1f1" />
                        <XAxis type="number" hide />
                        <YAxis
                          type="category"
                          dataKey="name"
                          tick={{ fill: '#78716c', fontSize: 10, fontWeight: 800 }}
                          width={160}
                          axisLine={false}
                          tickLine={false}
                          style={{ pointerEvents: 'none' }}
                        />
                        <Tooltip
                          content={<CustomTooltip />}
                          cursor={{ fill: 'rgba(16, 185, 129, 0.05)', radius: 12 }}
                        />
                        <Bar
                          dataKey="precio"
                          radius={[0, 12, 12, 0]}
                          barSize={20}
                          animationDuration={1500}
                        >
                          {chartData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={entry.precio === minPrice ? '#10b981' : '#e7e5e4'}
                              className="hover:opacity-80 transition-opacity cursor-pointer shadow-sm"
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Insights Summary */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-stone-50 pt-8">
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-100 shadow-sm transition-all hover:scale-105">
                  <div className="p-2 rounded-xl bg-white shadow-sm shrink-0">
                    <Award className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-emerald-800/60 uppercase tracking-widest leading-none mb-1.5">Líder de Valor</p>
                    <p className="font-black text-stone-800 uppercase tracking-tight text-sm">
                      {marketLeader}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-100 shadow-sm transition-all hover:scale-105">
                  <div className="p-2 rounded-xl bg-white shadow-sm shrink-0">
                    <TrendingDown className="w-6 h-6 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-amber-800/60 uppercase tracking-widest leading-none mb-1.5">Mejor Precio Hallado</p>
                    <p className="font-black text-stone-800 uppercase tracking-tight text-sm">
                      ${minPrice.toLocaleString('es-CO')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-2xl bg-stone-50 border border-stone-100 shadow-sm transition-all hover:scale-105">
                  <div className="p-2 rounded-xl bg-white shadow-sm shrink-0">
                    <Zap className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest leading-none mb-1.5">Oportunidad de Ahorro</p>
                    <p className="font-black text-stone-800 uppercase tracking-tight text-sm">
                      ${totalMarketOpportunity.toLocaleString('es-CO')}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

export default BenchmarkChart;
