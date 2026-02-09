import { Search, DollarSign, GitCompare, Clock, Shield, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: Search,
    title: "Búsqueda Avanzada",
    description: "Encuentra rápidamente cualquier producto de café colombiano con filtros inteligentes.",
  },
  {
    icon: DollarSign,
    title: "Precios Actualizados",
    description: "Consulta precios en tiempo real de diferentes marcas y presentaciones.",
  },
  {
    icon: GitCompare,
    title: "Comparación de Productos",
    description: "Compara características, precios y especificaciones lado a lado.",
  },
  {
    icon: Clock,
    title: "Historial de Precios",
    description: "Visualiza tendencias y cambios históricos en los precios del café.",
  },
  {
    icon: Shield,
    title: "Información Verificada",
    description: "Todos los datos son verificados y actualizados constantemente.",
  },
  {
    icon: TrendingUp,
    title: "Análisis de Mercado",
    description: "Accede a estadísticas y análisis del mercado cafetero colombiano.",
  },
];

const Features = () => {
  return (
    <section id="productos" className="py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 space-y-4 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold">
            Funcionalidades{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Próximamente
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Estamos construyendo la plataforma más completa para consultar información sobre café colombiano
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="shadow-soft hover:shadow-medium transition-smooth border-border/50 bg-card animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader>
                <div className="flex items-center justify-center w-12 h-12 rounded-lg gradient-corporate mb-4">
                  <feature.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
