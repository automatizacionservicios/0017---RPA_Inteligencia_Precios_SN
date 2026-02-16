import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import BenchmarkSearch from '@/components/BenchmarkSearch';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';

// Simulando ResizeObserver como una clase
global.ResizeObserver = class ResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
};

// Simulando Supabase
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    functions: {
      invoke: vi.fn(() => Promise.resolve({ data: { products: [] }, error: null })),
    },
  })),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // Desactivar reintentos en pruebas
    },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      {children}
    </BrowserRouter>
  </QueryClientProvider>
);

describe('SearchFlow - Feature Test', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should allow user to type "Arroz" and trigger search', async () => {
    const onSearchMock = vi.fn();

    render(<BenchmarkSearch onSearch={onSearchMock} isLoading={false} />, { wrapper });

    // Buscar la pestaña de modo nombre si no está activa
    const nameTab = screen.getByText(/Modo Nombre/i);
    fireEvent.click(nameTab);

    // Buscar el input de búsqueda
    const input = screen.getByPlaceholderText(/Ej: Café Colcafé Granulado/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Arroz' } });
    expect(input.value).toBe('Arroz');

    // Buscar y hacer clic en el botón de búsqueda
    const searchBtn = screen.getByRole('button', { name: /Iniciar Búsqueda/i });
    fireEvent.click(searchBtn);

    // Verificar que el callback onSearch fue llamado con "Arroz"
    await waitFor(
      () => {
        expect(onSearchMock).toHaveBeenCalled();
      },
      { timeout: 3000 }
    );

    const callArgs = onSearchMock.mock.calls[0];
    expect(callArgs[0]).toBe('product');
    expect(callArgs[1]).toBe('Arroz');
    expect(callArgs[3]).toBe('all'); // Presentation
    expect(Array.isArray(callArgs[4])).toBe(true); // Selected stores
    expect(callArgs[5]).toMatchObject({
      deepResearch: true,
      searchRecency: 'week',
    });
  });

  it('shows loading state when search is in progress', () => {
    render(<BenchmarkSearch onSearch={vi.fn()} isLoading={true} />, { wrapper });
    expect(screen.getByText(/PROCESANDO/i)).toBeDefined();
  });
});
