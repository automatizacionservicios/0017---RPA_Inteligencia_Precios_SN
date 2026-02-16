import React from 'react';
import { formatPrice } from '@/core/utils';

interface PriceTagProps {
  price: number;
  regularPrice?: number;
  discountPercentage?: number;
  variant?: 'large' | 'small' | 'table';
  className?: string;
}

/**
 * Premium PriceTag component for standardized price display.
 * Supports discounts, different variants, and es-CO formatting.
 */
export const PriceTag = ({
  price,
  regularPrice,
  discountPercentage,
  variant = 'large',
  className = '',
}: PriceTagProps) => {
  const hasDiscount = regularPrice && regularPrice > price;

  if (variant === 'table') {
    return (
      <div
        className={`flex flex-col items-center justify-center text-center ${className}`}
        data-testid="price-tag-table"
      >
        {hasDiscount && (
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold text-stone-300 line-through">
              {formatPrice(regularPrice)}
            </span>
            {discountPercentage && (
              <span className="text-[9px] font-black bg-rose-500 text-white px-1.5 py-0.5 rounded-md shadow-sm">
                -{discountPercentage}%
              </span>
            )}
          </div>
        )}
        <span className="text-[15px] font-mono font-black text-stone-700">
          {formatPrice(price)}
        </span>
      </div>
    );
  }

  const isSmall = variant === 'small';

  return (
    <div
      className={`flex flex-col ${isSmall ? 'gap-0' : 'gap-1'} ${className}`}
      data-testid="price-tag-standard"
    >
      {hasDiscount && (
        <div className="flex items-center gap-2">
          <span
            className={`${isSmall ? 'text-[9px]' : 'text-[10px]'} font-bold text-stone-400 line-through`}
          >
            {formatPrice(regularPrice)}
          </span>
          {discountPercentage && (
            <span
              className={`${isSmall ? 'text-[8px] px-1' : 'text-[9px] px-1.5'} font-black bg-rose-500 text-white py-0.5 rounded-md shadow-sm`}
            >
              -{discountPercentage}%
            </span>
          )}
        </div>
      )}
      <span
        className={`${isSmall ? 'text-lg' : 'text-2xl'} font-black text-stone-800 tracking-tight`}
      >
        {formatPrice(price)}
      </span>
    </div>
  );
};
