'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { calculateMix, getAllProducts, getProductById } from '@/lib/mixEngine';
import { generateMixUrl, copyToClipboard } from '@/lib/utils';
import IngredientSelector from '@/components/IngredientSelector';
import MixResultPanel from '@/components/MixResultPanel';
import EffectBadge from '@/components/EffectBadge';
import { Beaker, RotateCcw, Share2, Copy, Check, ChevronDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Product, MixResult } from '@/lib/types';

function MixBuilderContent() {
    const searchParams = useSearchParams();
    const products = getAllProducts();

    // Initialize from URL params if present
    const [selectedProductId, setSelectedProductId] = useState<string | null>(() => {
        return searchParams.get('base') || null;
    });
    const [ingredientIds, setIngredientIds] = useState<string[]>(() => {
        const ingredients = searchParams.get('ingredients');
        return ingredients ? ingredients.split(',') : [];
    });
    const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    // Calculate mix result
    const mixResult: MixResult | null = useMemo(() => {
        if (!selectedProductId) return null;
        return calculateMix(selectedProductId, ingredientIds);
    }, [selectedProductId, ingredientIds]);

    // Get current effects for the ingredient selector
    const currentEffects = useMemo(() => {
        if (!mixResult) return [];
        return mixResult.effects;
    }, [mixResult]);

    const selectedProduct = selectedProductId ? getProductById(selectedProductId) : null;

    // Handle product selection
    const handleSelectProduct = (productId: string) => {
        setSelectedProductId(productId);
        setIsProductDropdownOpen(false);
    };

    // Handle adding ingredient
    const handleAddIngredient = (ingredientId: string) => {
        setIngredientIds(prev => [...prev, ingredientId]);
    };

    // Handle removing ingredient
    const handleRemoveIngredient = (index: number) => {
        setIngredientIds(prev => prev.filter((_, i) => i !== index));
    };

    // Handle clearing all ingredients
    const handleClearIngredients = () => {
        setIngredientIds([]);
    };

    // Handle reset
    const handleReset = () => {
        setSelectedProductId(null);
        setIngredientIds([]);
    };

    // Handle share
    const handleShare = async () => {
        if (!selectedProductId) return;
        const url = window.location.origin + generateMixUrl(selectedProductId, ingredientIds);
        await copyToClipboard(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Update URL when mix changes
    useEffect(() => {
        if (selectedProductId) {
            const url = generateMixUrl(selectedProductId, ingredientIds);
            window.history.replaceState({}, '', url);
        }
    }, [selectedProductId, ingredientIds]);

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                            <Beaker className="h-5 w-5 text-green-400" />
                        </div>
                        Mix Builder
                    </h1>
                    <p className="mt-1 text-zinc-500">
                        Select a base product and add ingredients to see the exact result
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleShare}
                        disabled={!selectedProductId}
                        className={cn(
                            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                            selectedProductId
                                ? 'bg-zinc-800 text-white hover:bg-zinc-700'
                                : 'bg-zinc-900 text-zinc-600 cursor-not-allowed'
                        )}
                    >
                        {copied ? (
                            <>
                                <Check className="h-4 w-4 text-green-400" />
                                Copied!
                            </>
                        ) : (
                            <>
                                <Share2 className="h-4 w-4" />
                                Share
                            </>
                        )}
                    </button>
                    <button
                        onClick={handleReset}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 text-white hover:bg-zinc-700 text-sm font-medium transition-all"
                    >
                        <RotateCcw className="h-4 w-4" />
                        Reset
                    </button>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Left Column - Builder */}
                <div className="space-y-6">
                    {/* Product Selector */}
                    <div className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800">
                        <h2 className="text-lg font-semibold text-white mb-4">Base Product</h2>

                        <div className="relative">
                            <button
                                onClick={() => setIsProductDropdownOpen(!isProductDropdownOpen)}
                                className={cn(
                                    'w-full flex items-center justify-between gap-4 p-4 rounded-xl border-2 transition-all',
                                    selectedProduct
                                        ? 'bg-zinc-800 border-green-500/30'
                                        : 'bg-zinc-800/50 border-dashed border-zinc-700 hover:border-zinc-600'
                                )}
                            >
                                {selectedProduct ? (
                                    <div className="flex items-center gap-3">
                                        <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center overflow-hidden">
                                            <img
                                                src={`/images/products/${selectedProduct.id}.webp`}
                                                alt={selectedProduct.name}
                                                className="h-10 w-10 object-contain"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                }}
                                            />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-medium text-white">{selectedProduct.name}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                {selectedProduct.baseEffects.map(effect => (
                                                    <EffectBadge key={effect} effect={effect} size="sm" />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <span className="text-zinc-500">Select a base product...</span>
                                )}
                                <ChevronDown className={cn(
                                    'h-5 w-5 text-zinc-400 transition-transform',
                                    isProductDropdownOpen && 'rotate-180'
                                )} />
                            </button>

                            {isProductDropdownOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setIsProductDropdownOpen(false)}
                                    />
                                    <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl shadow-black/50 overflow-hidden">
                                        {products.map((product) => (
                                            <button
                                                key={product.id}
                                                onClick={() => handleSelectProduct(product.id)}
                                                className={cn(
                                                    'w-full flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors text-left',
                                                    selectedProductId === product.id && 'bg-green-500/10'
                                                )}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={`/images/products/${product.id}.webp`}
                                                        alt={product.name}
                                                        className="h-8 w-8 object-contain"
                                                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                                    />
                                                    <div>
                                                        <p className="font-medium text-white">{product.name}</p>
                                                        <p className="text-xs text-zinc-500 capitalize">{product.category}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {product.baseEffects.map(effect => (
                                                        <EffectBadge key={effect} effect={effect} size="sm" />
                                                    ))}
                                                    <span className="text-green-400 font-medium">${product.basePrice}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Ingredient Selector */}
                    <div className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800">
                        <h2 className="text-lg font-semibold text-white mb-4">Ingredients</h2>
                        <IngredientSelector
                            selectedIngredients={ingredientIds}
                            onAdd={handleAddIngredient}
                            onRemove={handleRemoveIngredient}
                            onClear={handleClearIngredients}
                            currentEffects={currentEffects}
                        />
                    </div>
                </div>

                {/* Right Column - Result */}
                <div>
                    <div className="sticky top-24">
                        <h2 className="text-lg font-semibold text-white mb-4">Result</h2>
                        <MixResultPanel result={mixResult} />
                    </div>
                </div>
            </div>
        </div>
    );
}

function MixBuilderLoading() {
    return (
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 text-green-400 animate-spin" />
                    <p className="text-zinc-500">Loading Mix Builder...</p>
                </div>
            </div>
        </div>
    );
}

export default function MixBuilderPage() {
    return (
        <Suspense fallback={<MixBuilderLoading />}>
            <MixBuilderContent />
        </Suspense>
    );
}
