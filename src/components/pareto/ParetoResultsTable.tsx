import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ParetoItem } from '@/hooks/useParetoData';
import { getStoreBrand } from '@/lib/store-branding';

interface ParetoResultsTableProps {
  items: ParetoItem[];
  isAuditing: boolean;
  onToggleSelection: (id: string) => void;
  onToggleAll: (selected: boolean) => void;
}

export const ParetoResultsTable = ({
  items,
  isAuditing,
  onToggleSelection,
  onToggleAll,
}: ParetoResultsTableProps) => {
  return (
    <div className="bg-white rounded-[32px] border border-stone-200 shadow-2xl shadow-stone-200/50 overflow-hidden animate-slide-up">
      <div className="p-8 bg-white border-b border-stone-100 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-2 h-10 bg-gradient-to-b from-emerald-500 to-teal-600 rounded-full" />
          <div>
            <h5 className="font-black text-stone-800 uppercase tracking-tight text-xl leading-none">
              Listado de Auditoría
            </h5>
            <p className="text-[10px] font-bold text-stone-400 mt-1 uppercase tracking-widest">
              Vista Previa de Productos
            </p>
          </div>
          <Badge
            variant="outline"
            className="ml-2 font-black text-emerald-600 bg-emerald-50 border-emerald-100 px-3 py-1 text-xs"
          >
            {items.length} REGISTROS
          </Badge>
        </div>
        <div className="flex items-center gap-3 bg-stone-50 px-4 py-2 rounded-xl border border-stone-100">
          <Checkbox
            id="selectAll"
            checked={items.length > 0 && items.every((i) => i.selected)}
            onCheckedChange={(v) => onToggleAll(!!v)}
            className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600 border-stone-300"
          />
          <Label
            htmlFor="selectAll"
            className="text-[10px] font-black text-stone-500 uppercase cursor-pointer tracking-widest"
          >
            Marcar Todos
          </Label>
        </div>
      </div>

      <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
        <Table>
          <TableHeader className="bg-stone-50/90 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
            <TableRow className="hover:bg-transparent border-stone-100">
              <TableHead className="w-[60px]"></TableHead>
              <TableHead className="text-[10px] font-black text-stone-500 uppercase tracking-widest px-6 py-4">
                Identificación
              </TableHead>
              <TableHead className="text-[10px] font-black text-stone-500 uppercase tracking-widest py-4">
                Producto / FK
              </TableHead>
              <TableHead className="text-[10px] font-black text-stone-500 uppercase tracking-widest py-4">
                Estado
              </TableHead>
              <TableHead className="text-[10px] font-black text-stone-500 uppercase tracking-widest text-right px-8 py-4 w-[200px]">
                Resultados
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence>
              {items.map((item, idx) => (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ delay: idx * 0.005 }}
                  className={`border-b border-stone-100 transition-colors ${
                    !item.selected ? 'opacity-40 grayscale bg-stone-50/10' : 'hover:bg-stone-50/50'
                  } group`}
                >
                  <TableCell className="px-6">
                    <Checkbox
                      checked={item.selected}
                      onCheckedChange={() => onToggleSelection(item.id)}
                      disabled={isAuditing}
                      className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-stone-400 uppercase tracking-tighter">
                        EAN / CODE
                      </span>
                      <span className="font-mono text-xs font-bold text-stone-600">
                        {item.ean || '---'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-black text-stone-800 text-sm line-clamp-1">
                        {item.productName}
                      </span>
                      {item.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {item.keywords.map((k, i) => (
                            <span
                              key={i}
                              className="text-[9px] font-bold text-emerald-600/70 bg-emerald-50 px-1.5 rounded uppercase"
                            >
                              {k}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {item.status === 'pending' && (
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-stone-100 rounded-full text-[10px] font-black text-stone-500 uppercase tracking-wider">
                          <div className="w-1.5 h-1.5 rounded-full bg-stone-300" /> Cola
                        </div>
                      )}
                      {item.status === 'searching' && (
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500 rounded-full text-[10px] font-black text-white uppercase tracking-wider animate-pulse">
                          <Loader2 className="w-3 h-3 animate-spin" /> Buscando
                        </div>
                      )}
                      {item.status === 'completed' && (
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 rounded-full text-[10px] font-black text-emerald-600 uppercase tracking-wider">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Listo
                        </div>
                      )}
                      {item.status === 'error' && (
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-50 rounded-full text-[10px] font-black text-rose-600 uppercase tracking-wider">
                          <div className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Error
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right px-8">
                    {item.foundProducts && item.foundProducts.length > 0 ? (
                      <div className="flex justify-end p-2">
                        <div className="flex -space-x-3 transition-all duration-300">
                          {Array.from(new Set(item.foundProducts.map((p) => p.store)))
                            .slice(0, 5)
                            .map((storeId, sIdx) => {
                              const brand = getStoreBrand(storeId);
                              return (
                                <motion.div
                                  key={storeId}
                                  initial={{ opacity: 0, scale: 0.5, x: 20 }}
                                  animate={{ opacity: 1, scale: 1, x: 0 }}
                                  transition={{
                                    type: 'spring',
                                    stiffness: 260,
                                    damping: 20,
                                    delay: idx * 0.05 + sIdx * 0.1,
                                  }}
                                  className="w-10 h-10 rounded-full bg-white shadow-lg border-2 border-white flex items-center justify-center p-1.5 relative ring-1 ring-stone-100 cursor-pointer"
                                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                  style={{ zIndex: (10 - sIdx) as any }}
                                  title={brand.name}
                                >
                                  {brand.icon ? (
                                    <img
                                      src={brand.icon}
                                      alt={brand.name}
                                      className="w-full h-full object-contain"
                                    />
                                  ) : (
                                    <span className="text-[8px] font-black text-stone-400">
                                      {storeId.substring(0, 2).toUpperCase()}
                                    </span>
                                  )}
                                </motion.div>
                              );
                            })}
                          {new Set(item.foundProducts.map((p) => p.store)).size > 5 && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.5 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: idx * 0.05 + 0.5 }}
                              className="w-10 h-10 rounded-full bg-emerald-50 border-2 border-white shadow-lg flex items-center justify-center ring-1 ring-emerald-100 relative z-0"
                            >
                              <span className="text-[10px] font-black text-emerald-600">
                                +{new Set(item.foundProducts.map((p) => p.store)).size - 5}
                              </span>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    ) : item.status === 'completed' ? (
                      <span className="text-[10px] font-black text-stone-300 uppercase tracking-widest">
                        Sin Hallazgos
                      </span>
                    ) : null}
                  </TableCell>
                </motion.tr>
              ))}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
