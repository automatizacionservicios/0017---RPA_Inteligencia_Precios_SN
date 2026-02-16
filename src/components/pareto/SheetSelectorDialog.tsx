import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FileSpreadsheet } from 'lucide-react';

interface SheetSelectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableSheets: string[];
  onSelectSheet: (name: string) => void;
}

export const SheetSelectorDialog = ({
  open,
  onOpenChange,
  availableSheets,
  onSelectSheet,
}: SheetSelectorDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-[32px] border-none shadow-2xl p-8 max-w-md">
        <DialogHeader>
          <div className="mx-auto p-4 rounded-2xl bg-emerald-50 mb-4">
            <FileSpreadsheet className="w-8 h-8 text-emerald-600" />
          </div>
          <DialogTitle className="text-2xl font-black text-center text-stone-800 tracking-tight">
            Seleccionar Hoja
          </DialogTitle>
          <DialogDescription className="text-center font-medium text-stone-500">
            Este archivo tiene múltiples hojas. ¿Cuál debemos analizar?
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 mt-6">
          {availableSheets.map((sheet) => (
            <Button
              key={sheet}
              variant="outline"
              onClick={() => onSelectSheet(sheet)}
              className="h-14 rounded-2xl border-stone-100 font-bold text-stone-700 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition-all justify-start px-6"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500 mr-4" />
              {sheet}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
