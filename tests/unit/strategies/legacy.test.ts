import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StrategyFactory } from '../../../supabase/functions/price-scraper/core/StrategyFactory';
import { VtexStrategy } from '../../../supabase/functions/price-scraper/strategies/VtexStrategy';
import { CheerioStrategy } from '../../../supabase/functions/price-scraper/strategies/CheerioStrategy';
import { RappiStrategy } from '../../../supabase/functions/price-scraper/strategies/RappiStrategy';
import { InstaleapStrategy } from '../../../supabase/functions/price-scraper/strategies/InstaleapStrategy';

// Mock global fetch
global.fetch = vi.fn();

describe('Legacy Strategies Smoke Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('StrategyFactory', () => {
        it('should exist', () => {
            expect(StrategyFactory).toBeDefined();
        });

        it('should return VtexStrategy for exito', () => {
            const strategy = StrategyFactory.getStrategy('exito');
            expect(strategy).toBeInstanceOf(VtexStrategy);
        });

        it('should return CheerioStrategy for zapatoca', () => {
            const strategy = StrategyFactory.getStrategy('zapatoca');
            expect(strategy).toBeInstanceOf(CheerioStrategy);
        });

        it('should return RappiStrategy for rappi', () => {
            const strategy = StrategyFactory.getStrategy('rappi');
            expect(strategy).toBeInstanceOf(RappiStrategy);
        });

        it('should return InstaleapStrategy for d1', () => {
            const strategy = StrategyFactory.getStrategy('d1');
            expect(strategy).toBeInstanceOf(InstaleapStrategy);
        });

        it('should return null for unknown store', () => {
            const strategy = StrategyFactory.getStrategy('unknown-store');
            expect(strategy).toBeNull();
        });
    });

    describe('VtexStrategy', () => {
        it('should instantiate correctly', () => {
            const strategy = new VtexStrategy('www.test.com', 'TEST_STORE');
            expect(strategy).toBeDefined();
        });

        it('should run search without crashing (mocked fetch)', async () => {
            (global.fetch as any).mockResolvedValue({
                ok: true,
                json: async () => [],
                headers: new Headers(),
            });

            const strategy = new VtexStrategy('www.test.com', 'TEST_STORE');
            const results = await strategy.search('arroz');
            expect(results).toEqual([]);
            expect(global.fetch).toHaveBeenCalled();
        });
    });

    describe('CheerioStrategy', () => {
        const mockConfig = {
            domains: ['test.com'],
            selectors: {
                productCard: '.card',
                name: '.name',
                price: '.price',
            },
        };

        it('should instantiate correctly', () => {
            const strategy = new CheerioStrategy(mockConfig, 'TEST_STORE');
            expect(strategy).toBeDefined();
        });

        it('should run search without crashing (mocked fetch)', async () => {
            (global.fetch as any).mockResolvedValue({
                ok: true,
                text: async () => '<html><body></body></html>',
                headers: new Headers(),
            });

            const strategy = new CheerioStrategy(mockConfig, 'TEST_STORE');
            const results = await strategy.search('arroz');
            expect(results).toEqual([]);
            expect(global.fetch).toHaveBeenCalled();
        });
    });

    describe('RappiStrategy', () => {
        it('should instantiate correctly', () => {
            const strategy = new RappiStrategy('RAPPI');
            expect(strategy).toBeDefined();
        });

        it('should run search without crashing (mocked fetch)', async () => {
            (global.fetch as any).mockResolvedValue({
                ok: true,
                text: async () => '<html><body></body></html>', // Missing __NEXT_DATA__, should return empty array safely
                headers: new Headers(),
            });

            const strategy = new RappiStrategy('RAPPI');
            const results = await strategy.search('arroz');
            expect(results).toEqual([]);
            expect(global.fetch).toHaveBeenCalled();
        });
    });

    describe('InstaleapStrategy', () => {
        it('should instantiate correctly', () => {
            const strategy = new InstaleapStrategy('test.com', 'TEST_STORE');
            expect(strategy).toBeDefined();
        });

        it('should run search without crashing (mocked fetch)', async () => {
            (global.fetch as any).mockResolvedValue({
                ok: true,
                json: async () => ({ data: { searchProducts: { edges: [] } } }),
                headers: new Headers(),
            });

            const strategy = new InstaleapStrategy('test.com', 'TEST_STORE');
            const results = await strategy.search('arroz');
            expect(results).toEqual([]);
            expect(global.fetch).toHaveBeenCalled();
        });
    });
});
