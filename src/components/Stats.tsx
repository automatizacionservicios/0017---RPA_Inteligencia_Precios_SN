import { Card, CardContent } from '@/components/ui/card';

const stats = [
  { value: '500+', label: 'Productos de Café' },
  { value: '50+', label: 'Marcas Colombianas' },
  { value: '100%', label: 'Datos Verificados' },
  { value: '24/7', label: 'Actualización' },
];

const Stats = () => {
  return (
    <section className="py-12 md:py-16 bg-card">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card
              key={index}
              className="text-center shadow-soft border-border/50 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="pt-6">
                <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
