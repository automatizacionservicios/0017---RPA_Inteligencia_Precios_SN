import {
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  ExternalLink,
  ShieldCheck,
  Heart,
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-stone-900 text-stone-400 pt-24 pb-12 overflow-hidden relative">
      {/* Decorative background element */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent"></div>

      <div className="max-w-[1700px] mx-auto px-6 xl:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          {/* Brand Column */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <img
                src="/nutresa-radar-logo-oficial.png"
                alt="Nutresa Radar"
                className="h-14 w-auto brightness-0 invert opacity-90 transition-all hover:opacity-100"
              />
            </div>
            <p className="text-sm leading-relaxed max-w-xs font-medium">
              Plataforma avanzada de inteligencia de mercado y monitoreo de precios en tiempo real
              para el ecosistema de Retail en Colombia.
            </p>
            <div className="flex gap-4 pt-4">
              <a
                href="https://www.instagram.com/gruponutresa/"
                target="_blank"
                rel="noopener noreferrer"
                title="Instagram Nutresa"
                className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all duration-300"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://www.facebook.com/GrupoNutresa/"
                target="_blank"
                rel="noopener noreferrer"
                title="Facebook Nutresa"
                className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all duration-300"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com/GrupoNutresa"
                target="_blank"
                rel="noopener noreferrer"
                title="Twitter Nutresa"
                className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all duration-300"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="https://www.linkedin.com/company/grupo-nutresa/"
                target="_blank"
                rel="noopener noreferrer"
                title="LinkedIn Nutresa"
                className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all duration-300"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-white font-black uppercase text-[10px] tracking-[0.2em] mb-8">
              Navegación
            </h4>
            <ul className="space-y-4">
              {[
                { label: 'Radar Principal', path: '/' },
                { label: 'Buscador de EAN', path: '/benchmark' },
                { label: 'Módulo de Pareto', path: '/benchmark' },
                { label: 'Radar Referencial', path: '/radar-referencial' },
              ].map((item) => (
                <li key={item.label}>
                  <a
                    href={item.path}
                    className="text-sm font-bold hover:text-emerald-500 transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-stone-700 group-hover:bg-emerald-500 transition-all"></span>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-white font-black uppercase text-[10px] tracking-[0.2em] mb-8">
              Soporte y Guía
            </h4>
            <ul className="space-y-4">
              {[
                { label: 'Guía de Usuario', path: '/documentacion' },
                { label: 'Centro de Soporte', path: '/contacto' },
                { label: 'Reportar Fallo', path: '/contacto' },
                { label: 'Web Nutresa', path: 'https://gruponutresa.com' },
              ].map((item) => (
                <li key={item.label}>
                  <a
                    href={item.path}
                    target={item.path.startsWith('http') ? '_blank' : '_self'}
                    className="text-sm font-bold hover:text-emerald-500 transition-colors flex items-center gap-2"
                  >
                    {item.label}
                    {item.path.startsWith('http') && (
                      <ExternalLink className="w-3 h-3 opacity-50" />
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Technical Info */}
          <div className="bg-white/5 p-8 rounded-[30px] border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-all"></div>
            <h4 className="text-white font-black uppercase text-[10px] tracking-[0.2em] mb-6 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Estado del Sistema
            </h4>
            <div className="space-y-4 relative z-10">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold">Scraping Engine</span>
                <span className="text-emerald-500 font-black tracking-widest uppercase text-[9px] bg-emerald-500/10 px-2 py-1 rounded-md">
                  Online
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold">Gemini AI Lab</span>
                <span className="text-emerald-500 font-black tracking-widest uppercase text-[9px] bg-emerald-500/10 px-2 py-1 rounded-md">
                  Active
                </span>
              </div>
              <p className="text-[10px] text-stone-500 leading-tight pt-4 italic">
                Monitoreo automático activo para 16+ tiendas retail en Colombia.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-[11px] font-bold uppercase tracking-widest text-stone-600">
            Market Intelligence Division <span className="mx-2">|</span> Medellín, CO
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span className="font-bold text-stone-300">© {currentYear} Grupo Nutresa S.A.</span>
            <span className="text-stone-700 mx-2">•</span>
            <span className="flex items-center gap-1 text-[11px] font-black uppercase tracking-tighter opacity-70">
              Made with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> by New Tech SN
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
