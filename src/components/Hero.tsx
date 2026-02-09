import { TrendingUp, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden min-h-[80vh] flex items-center justify-center">
      <div className="absolute inset-0 gradient-neutral opacity-50" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 border border-accent/30 mx-auto">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-sm font-medium text-accent-foreground">
              Información estratégica en tiempo real
            </span>
          </div>

          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-foreground">
              Inteligencia de Precios
              <span className="block text-primary mt-2">Nutresa</span>
            </h2>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Monitoreo y comparación de precios en tiempo real para la toma de decisiones estratégicas.
            </p>
          </div>

          <div className="flex justify-center">
            <Button
              size="lg"
              className="h-14 px-12 text-lg font-bold gradient-corporate text-primary-foreground shadow-strong hover:shadow-xl transition-all hover:scale-105 rounded-full"
              onClick={() => navigate('/benchmark')}
            >
              Comenzar
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-8 pt-8 opacity-80">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="text-sm text-muted-foreground">Datos</p>
                <p className="font-semibold">Actualizados</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-secondary/10">
                <BarChart3 className="w-5 h-5 text-secondary" />
              </div>
              <div className="text-left">
                <p className="text-sm text-muted-foreground">Fuentes</p>
                <p className="font-semibold">Verificadas</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
