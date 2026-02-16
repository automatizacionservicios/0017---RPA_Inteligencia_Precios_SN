import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PriceTag } from '@/components/ui/PriceTag';
import React from 'react';

describe('PriceTag', () => {
  it('renders normal price correctly', () => {
    render(<PriceTag price={1200} />);
    expect(screen.getByText(/\$1\.200/)).toBeDefined();
    expect(screen.queryByText(/%/)).toBeNull();
  });

  it('renders discount prices and percentage', () => {
    render(<PriceTag price={1000} regularPrice={1200} discountPercentage={16} />);
    expect(screen.getByText(/\$1\.000/)).toBeDefined();
    expect(screen.getByText(/\$1\.200/)).toBeDefined();
    expect(screen.getByText(/-16%/)).toBeDefined();
  });

  it('renders table variant with discount correctly', () => {
    render(<PriceTag price={1000} regularPrice={1200} discountPercentage={16} variant="table" />);
    screen.getByTestId('price-tag-table');
    expect(screen.getByText(/-16%/)).toBeDefined();
    expect(screen.getByText(/\$1\.200/)).toBeDefined();
  });

  it('renders table variant correctly', () => {
    render(<PriceTag price={1000} variant="table" />);
    const container = screen.getByTestId('price-tag-table');
    expect(container).toBeDefined();
    expect(container.className).toContain('text-center');
  });

  it('renders small variant with correct classes', () => {
    render(<PriceTag price={5000} variant="small" />);
    const priceSpan = screen.getByText(/\$5\.000/);
    expect(priceSpan.className).toContain('text-lg');
  });

  it('handles zero or missing prices gracefully', () => {
    render(<PriceTag price={NaN} />);
    expect(screen.getByText(/---/)).toBeDefined();
  });
});
