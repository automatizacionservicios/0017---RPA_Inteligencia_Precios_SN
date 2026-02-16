import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Search,
  Zap,
  Command,
  LayoutDashboard,
  Store as StoreIcon,
  FileText,
  Settings,
  Sparkles,
  MessageSquare,
  PackageCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isBenchmarkPage = location.pathname === '/benchmark';
  const isHomePage = location.pathname === '/';
  const [open, setOpen] = useState(false);

  // Spotlight search listener
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const navItems = [
    { title: 'Radar Principal', href: '/', icon: LayoutDashboard, category: 'Navegación' },
    {
      title: 'Radar Intelligence',
      href: '/benchmark',
      state: { mode: 'single' },
      icon: Search,
      category: 'Herramientas',
    },
    { title: 'Oportunidades', href: '/oportunidades', icon: Sparkles, category: 'Herramientas' },
    {
      title: 'Módulo Pareto',
      href: '/benchmark',
      state: { mode: 'pareto' },
      icon: Zap,
      category: 'Herramientas',
    },
    {
      title: 'Radar Referencial',
      href: '/radar-referencial',
      icon: StoreIcon,
      category: 'Herramientas',
    },
    {
      title: 'Auditoría Stock',
      href: '/auditoria-stock',
      icon: PackageCheck,
      category: 'Herramientas',
    },
    { title: 'Documentación', href: '/documentacion', icon: FileText, category: 'Soporte' },
    { title: 'Soporte / PQR', href: '/contacto', icon: MessageSquare, category: 'Soporte' },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-700 ${
          isHomePage
            ? 'bg-stone-900/60 border-b border-white/5 backdrop-blur-2xl'
            : 'bg-white/90 border-b border-stone-200 backdrop-blur-xl'
        }`}
      >
        {/* Subtle top glow line */}
        <div
          className={`absolute top-0 left-0 right-0 h-[1px] ${isHomePage ? 'bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent' : 'bg-transparent'}`}
        />

        <div className="max-w-[1440px] mx-auto px-6 xl:px-12">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center gap-5 group">
              <div className="relative">
                <div
                  className={`absolute -inset-2 bg-emerald-500/20 rounded-full blur-xl transition-opacity duration-700 opacity-0 group-hover:opacity-100`}
                />
                <img
                  src="/nutresa-radar-logo-oficial.png"
                  alt="Nutresa Radar"
                  className={`h-9 w-auto relative transition-all duration-700 group-hover:scale-105 ${isHomePage ? 'brightness-0 invert' : ''}`}
                />
                {isHomePage && (
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-stone-900 animate-pulse"></div>
                )}
              </div>
              <div className="flex flex-col">
                <span
                  className={`text-[13px] font-black uppercase tracking-[0.3em] leading-none ${isHomePage ? 'text-white' : 'text-stone-900'}`}
                >
                  Radar
                </span>
                <span
                  className={`text-[9px] font-black uppercase tracking-widest leading-none mt-1.5 opacity-60 ${isHomePage ? 'text-stone-400' : 'text-stone-500'}`}
                >
                  Market Intel
                </span>
              </div>
            </Link>

            <div className="flex items-center gap-8">
              {/* Premium Search Trigger (Spotlight Style) */}
              <button
                onClick={() => setOpen(true)}
                className={`hidden lg:flex items-center gap-3 px-5 py-2.5 rounded-2xl border transition-all duration-300 group ${
                  isHomePage
                    ? 'bg-white/5 border-white/10 text-stone-400 hover:bg-white/10 hover:border-white/20'
                    : 'bg-stone-50 border-stone-100 text-stone-500 hover:bg-white hover:shadow-md'
                }`}
              >
                <Search className="w-4 h-4 transition-transform group-hover:scale-110" />
                <span className="text-[10px] font-black uppercase tracking-widest pr-4">
                  Buscar módulo...
                </span>
                <kbd
                  className={`pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 ${isHomePage ? 'bg-white/10 border-white/10 text-white/50' : 'bg-white border-stone-200 text-stone-400'}`}
                >
                  <span className="text-[12px] opacity-70">⌘</span>K
                </kbd>
              </button>

              <div className="flex items-center gap-6">
                {/* Live Status - Premium Redesign */}
                <div
                  className={`hidden md:flex items-center gap-3 px-4 py-2.5 rounded-full border backdrop-blur-sm transition-all duration-700 ${
                    isHomePage
                      ? 'bg-emerald-500/5 border-emerald-500/20 shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)]'
                      : 'bg-white border-stone-100 shadow-sm'
                  }`}
                >
                  <div className="relative">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse"></div>
                    <div className="absolute top-0 left-0 w-3 h-3 rounded-full bg-emerald-500 animate-ping opacity-70"></div>
                  </div>
                  <span
                    className={`text-[10px] font-black uppercase tracking-[0.2em] ${isHomePage ? 'text-emerald-400' : 'text-stone-600'}`}
                  >
                    Monitor <span className="italic">Live</span>
                  </span>
                </div>

                <nav className="flex items-center gap-4">
                  <div className="flex items-center gap-2 border-r border-stone-200/20 pr-4 mr-1">
                    <Button
                      variant="ghost"
                      className={`px-2 py-1.5 rounded-xl font-bold text-[9px] uppercase tracking-widest transition-all duration-300 ${isHomePage ? 'text-white/60 hover:text-white hover:bg-white/5' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-50'}`}
                      onClick={() => navigate('/documentacion')}
                    >
                      Guía
                    </Button>
                    <Button
                      variant="ghost"
                      className={`px-2 py-1.5 rounded-xl font-bold text-[9px] uppercase tracking-widest transition-all duration-300 ${isHomePage ? 'text-white/60 hover:text-white hover:bg-white/5' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-50'}`}
                      onClick={() => navigate('/contacto')}
                    >
                      Soporte
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      className={`px-3 py-1.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all duration-500 gap-2 border border-transparent hover:scale-105 ${
                        isHomePage
                          ? 'text-white hover:bg-white/10 hover:border-white/10'
                          : 'text-stone-600 hover:bg-stone-50 hover:border-stone-100'
                      }`}
                      onClick={() => navigate('/radar-referencial')}
                    >
                      <Search className="w-3 h-3" />
                      Radar
                    </Button>
                    <Button
                      className="bg-stone-900 hover:bg-emerald-600 text-white px-4 py-1.5 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-xl shadow-stone-900/10 transition-all duration-500 gap-2 hover:scale-105 hover:-translate-y-0.5 active:scale-95"
                      onClick={() => navigate('/oportunidades')}
                    >
                      <Sparkles className="w-3 h-3 text-emerald-400" />
                      Ofertas
                    </Button>
                    <Button
                      className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-xl shadow-emerald-500/20 transition-all duration-500 gap-2 hover:scale-105 hover:-translate-y-0.5 active:scale-95"
                      onClick={() => navigate('/benchmark', { state: { mode: 'pareto' } })}
                    >
                      <Zap className="w-3 h-3" />
                      Pareto
                    </Button>
                    <Button
                      className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-1.5 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-xl shadow-amber-500/20 transition-all duration-500 gap-2 hover:scale-105 hover:-translate-y-0.5 active:scale-95"
                      onClick={() => navigate('/auditoria-stock')}
                    >
                      <PackageCheck className="w-3 h-3" />
                      Stock
                    </Button>
                  </div>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Global Command Center (Spotlight Search) */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <div className="bg-white rounded-3xl overflow-hidden shadow-2xl border-none">
          <CommandInput
            placeholder="¿Qué necesitas buscar?"
            className="h-16 text-lg font-bold border-none"
          />
          <CommandList className="max-h-[450px] p-2 custom-scrollbar">
            <CommandEmpty className="py-10 text-center">
              <div className="flex flex-col items-center gap-3">
                <Search className="w-8 h-8 text-stone-200" />
                <p className="text-sm font-bold text-stone-400 uppercase tracking-widest">
                  No se encontraron resultados
                </p>
              </div>
            </CommandEmpty>

            {['Herramientas', 'Navegación', 'Soporte'].map((cat) => (
              <CommandGroup
                key={cat}
                heading={
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-2">
                    {cat}
                  </span>
                }
              >
                {navItems
                  .filter((item) => item.category === cat)
                  .map((item) => (
                    <CommandItem
                      key={item.title}
                      onSelect={() => {
                        navigate(item.href, { state: item.state });
                        setOpen(false);
                      }}
                      className="flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all hover:bg-emerald-50 group mb-1"
                    >
                      <div className="p-2.5 rounded-xl bg-stone-50 group-hover:bg-white text-stone-400 group-hover:text-emerald-600 transition-colors shadow-sm">
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-stone-800 uppercase tracking-tight group-hover:text-emerald-700">
                          {item.title}
                        </span>
                        <span className="text-[10px] font-medium text-stone-400 group-hover:text-emerald-500/70">
                          Navegar al módulo de {item.title.toLowerCase()}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
              </CommandGroup>
            ))}
          </CommandList>
        </div>
      </CommandDialog>
    </>
  );
};

export default Header;
