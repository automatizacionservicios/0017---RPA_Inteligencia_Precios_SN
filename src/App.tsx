import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import RadarReferencial from "./pages/RadarReferencial";
import PromoRadar from "./pages/PromoRadar";
import StockAudit from "@/pages/StockAudit";
import Contact from "./pages/Contact";
import Documentation from "./pages/Documentation";
import Benchmark from "./pages/Benchmark";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/radar-referencial" element={<RadarReferencial />} />
          <Route path="/oportunidades" element={<PromoRadar />} />
          <Route path="/auditoria-stock" element={<StockAudit />} />
          <Route path="/contacto" element={<Contact />} />
          <Route path="/benchmark" element={<Benchmark />} />
          <Route path="/pareto" element={<Benchmark />} />
          <Route path="/documentacion" element={<Documentation />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
