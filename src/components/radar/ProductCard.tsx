import { ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getStoreBrand } from '@/lib/store-branding';
import type { MarketProduct } from '@/types/benchmark';

interface ProductCardProps {
  product: MarketProduct;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const brand = getStoreBrand(product.store);
  const isExternal = product.isExternalLink;

  if (isExternal) {
    return (
      <Card className="group relative overflow-hidden border-none shadow-xl hover:shadow-2xl transition-all duration-500 bg-white rounded-3xl">
        <div className="absolute top-0 right-0 p-4">
          <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none px-3 py-1 text-[9px] font-black uppercase tracking-widest">
            Externo
          </Badge>
        </div>
        <CardContent className="p-8 flex flex-col items-center text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-stone-50 border border-stone-100 p-4 transition-transform group-hover:scale-110 duration-500">
            <img
              src={brand.icon || ''}
              alt={product.store}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="space-y-2">
            <h5 className="text-lg font-black text-stone-800 uppercase tracking-tighter leading-none">
              {product.store}
            </h5>
            <p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest leading-relaxed">
              Infraestructura protegida.
              <br />
              Se requiere consulta manual.
            </p>
          </div>
          <Button
            className="w-full bg-stone-900 hover:bg-stone-800 text-white rounded-2xl h-14 font-black uppercase tracking-[0.2em] text-[10px] gap-2 transition-all shadow-lg shadow-stone-200"
            onClick={() => window.open(product.url, '_blank')}
          >
            <ExternalLink className="w-4 h-4" />
            Buscar Producto
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="group relative overflow-hidden border-none shadow-xl hover:shadow-2xl transition-all duration-500 bg-white rounded-3xl">
      <div className="absolute top-0 right-0 p-4 z-10">
        <Badge
          className={`border-none px-3 py-1 text-[9px] font-black uppercase tracking-widest ${product.availability === 'Disponible' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}
        >
          {product.availability}
        </Badge>
      </div>
      <CardContent className="p-0">
        <div className="relative h-48 bg-stone-50 p-6 flex items-center justify-center group-hover:bg-stone-100 transition-colors duration-500">
          <img
            src={brand.icon || ''}
            alt={product.store}
            className="w-24 h-24 object-contain opacity-80 group-hover:scale-110 transition-transform duration-500 mix-blend-multiply"
          />
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-stone-100 p-1.5 shrink-0">
              <img
                src={brand.icon || ''}
                alt={product.store}
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">
              {product.store}
            </span>
          </div>

          <h3
            className="font-bold text-stone-800 leading-tight text-sm line-clamp-2 min-h-[2.5rem]"
            title={product.productName}
          >
            {product.productName}
          </h3>

          <div className="flex items-end justify-between pt-2 border-t border-stone-100">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                Precio
              </p>
              <p className="text-2xl font-black text-stone-800 tracking-tight">
                ${product.price.toLocaleString('es-CO')}
              </p>
            </div>
            <div className="text-right space-y-1">
              {product.gramsAmount && product.gramsAmount > 0 && product.pricePerGram ? (
                <>
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                    x Gramo
                  </p>
                  <p className="text-xs font-bold text-emerald-600">
                    ${product.pricePerGram.toFixed(1)}
                  </p>
                </>
              ) : null}
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full rounded-xl border-stone-200 hover:bg-stone-50 text-xs font-bold uppercase tracking-wider gap-2 h-10"
            onClick={() => window.open(product.url, '_blank')}
          >
            Ver en Tienda <ExternalLink className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
