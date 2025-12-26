'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { getAllProducts, getAllIngredients } from '@/lib/mixEngine';
import { findOptimalMixes, GOAL_CATEGORIES, getGroupedGoals, type GoalType, type Inventory, type Recommendation } from '@/lib/optimizer';
import EffectBadge from '@/components/EffectBadge';
import { Target, Plus, Minus, ArrowRight, Sparkles, RefreshCw, Package, FlaskConical, ChevronDown } from 'lucide-react';
import { cn, generateMixUrl } from '@/lib/utils';

export default function OptimizerPage() {
    const products = getAllProducts();
    const ingredients = getAllIngredients();

    // Inventory state with quantities
    const [inventory, setInventory] = useState<Inventory>({
        products: products.map(p => ({ id: p.id, quantity: 0 })),
        ingredients: ingredients.map(i => ({ id: i.id, quantity: 0 }))
    });

    const [selectedGoal, setSelectedGoal] = useState<GoalType>('best-profit');
    const [isGoalDropdownOpen, setIsGoalDropdownOpen] = useState(false);

    // Calculate recommendations
    const recommendations = useMemo(() => {
        return findOptimalMixes(inventory, selectedGoal, 5);
    }, [inventory, selectedGoal]);

    // Helper functions
    const updateProductQuantity = (productId: string, delta: number) => {
        setInventory(prev => ({
            ...prev,
            products: prev.products.map(p =>
                p.id === productId
                    ? { ...p, quantity: Math.max(0, p.quantity + delta) }
                    : p
            )
        }));
    };

    const setProductQuantity = (productId: string, value: number) => {
        setInventory(prev => ({
            ...prev,
            products: prev.products.map(p =>
                p.id === productId
                    ? { ...p, quantity: Math.max(0, value) }
                    : p
            )
        }));
    };

    const updateIngredientQuantity = (ingredientId: string, delta: number) => {
        setInventory(prev => ({
            ...prev,
            ingredients: prev.ingredients.map(i =>
                i.id === ingredientId
                    ? { ...i, quantity: Math.max(0, i.quantity + delta) }
                    : i
            )
        }));
    };

    const setIngredientQuantity = (ingredientId: string, value: number) => {
        setInventory(prev => ({
            ...prev,
            ingredients: prev.ingredients.map(i =>
                i.id === ingredientId
                    ? { ...i, quantity: Math.max(0, value) }
                    : i
            )
        }));
    };

    const clearInventory = () => {
        setInventory({
            products: products.map(p => ({ id: p.id, quantity: 0 })),
            ingredients: ingredients.map(i => ({ id: i.id, quantity: 0 }))
        });
    };

    const selectAll = (type: 'products' | 'ingredients') => {
        setInventory(prev => ({
            ...prev,
            [type]: prev[type].map(item => ({ ...item, quantity: item.quantity > 0 ? item.quantity : 1 }))
        }));
    };

    const hasAnyInventory = inventory.products.some(p => p.quantity > 0);
    const groupedGoals = getGroupedGoals();
    const currentGoal = GOAL_CATEGORIES[selectedGoal];

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                            <Target className="h-5 w-5 text-amber-400" />
                        </div>
                        Inventory Optimizer
                    </h1>
                    <p className="mt-1 text-zinc-500">
                        Tell us what you have, we'll tell you what to make
                    </p>
                </div>
                <button
                    onClick={clearInventory}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 text-white hover:bg-zinc-700 text-sm font-medium transition-all"
                >
                    <RefreshCw className="h-4 w-4" />
                    Clear All
                </button>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Left Column - Inventory Input */}
                <div className="space-y-6">
                    {/* Products Section */}
                    <div className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                <Package className="h-5 w-5 text-green-400" />
                                Products You Have
                            </h2>
                            <button
                                onClick={() => selectAll('products')}
                                className="text-xs text-green-400 hover:text-green-300"
                            >
                                Select All
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {products.map(product => {
                                const item = inventory.products.find(p => p.id === product.id);
                                const quantity = item?.quantity || 0;

                                return (
                                    <div
                                        key={product.id}
                                        className={cn(
                                            'flex items-center justify-between p-3 rounded-lg border transition-all',
                                            quantity > 0
                                                ? 'bg-green-500/10 border-green-500/30'
                                                : 'bg-zinc-800/50 border-zinc-700 hover:border-zinc-600'
                                        )}
                                    >
                                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                            <img
                                                src={`/images/products/${product.id}.webp`}
                                                alt={product.name}
                                                className="h-8 w-8 object-contain flex-shrink-0"
                                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                            />
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-white truncate">{product.name}</p>
                                                <p className="text-xs text-zinc-500 capitalize">{product.category}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1 flex-shrink-0">
                                            <button
                                                onClick={() => updateProductQuantity(product.id, -1)}
                                                className="h-7 w-7 rounded flex items-center justify-center bg-zinc-700 text-zinc-300 hover:bg-zinc-600 transition-colors"
                                            >
                                                <Minus className="h-3 w-3" />
                                            </button>
                                            <input
                                                type="number"
                                                min="0"
                                                value={quantity}
                                                onChange={(e) => setProductQuantity(product.id, parseInt(e.target.value) || 0)}
                                                className={cn(
                                                    'w-12 h-7 text-center text-sm font-medium bg-zinc-800 rounded border border-zinc-600 focus:outline-none focus:border-green-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
                                                    quantity > 0 ? 'text-green-400' : 'text-zinc-500'
                                                )}
                                            />
                                            <button
                                                onClick={() => updateProductQuantity(product.id, 1)}
                                                className="h-7 w-7 rounded flex items-center justify-center bg-zinc-700 text-zinc-300 hover:bg-zinc-600 transition-colors"
                                            >
                                                <Plus className="h-3 w-3" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Ingredients Section */}
                    <div className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                <FlaskConical className="h-5 w-5 text-purple-400" />
                                Ingredients You Have
                            </h2>
                            <button
                                onClick={() => selectAll('ingredients')}
                                className="text-xs text-purple-400 hover:text-purple-300"
                            >
                                Select All
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
                            {ingredients.map(ingredient => {
                                const item = inventory.ingredients.find(i => i.id === ingredient.id);
                                const quantity = item?.quantity || 0;

                                return (
                                    <div
                                        key={ingredient.id}
                                        className={cn(
                                            'flex items-center justify-between p-3 rounded-lg border transition-all',
                                            quantity > 0
                                                ? 'bg-purple-500/10 border-purple-500/30'
                                                : 'bg-zinc-800/50 border-zinc-700 hover:border-zinc-600'
                                        )}
                                    >
                                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                            <img
                                                src={`/images/ingredients/${ingredient.id}.webp`}
                                                alt={ingredient.name}
                                                className="h-8 w-8 object-contain flex-shrink-0"
                                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                            />
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-white truncate">{ingredient.name}</p>
                                                <p className="text-xs text-zinc-500">${(ingredient as any).price}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1 flex-shrink-0">
                                            <button
                                                onClick={() => updateIngredientQuantity(ingredient.id, -1)}
                                                className="h-7 w-7 rounded flex items-center justify-center bg-zinc-700 text-zinc-300 hover:bg-zinc-600 transition-colors"
                                            >
                                                <Minus className="h-3 w-3" />
                                            </button>
                                            <input
                                                type="number"
                                                min="0"
                                                value={quantity}
                                                onChange={(e) => setIngredientQuantity(ingredient.id, parseInt(e.target.value) || 0)}
                                                className={cn(
                                                    'w-12 h-7 text-center text-sm font-medium bg-zinc-800 rounded border border-zinc-600 focus:outline-none focus:border-purple-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
                                                    quantity > 0 ? 'text-purple-400' : 'text-zinc-500'
                                                )}
                                            />
                                            <button
                                                onClick={() => updateIngredientQuantity(ingredient.id, 1)}
                                                className="h-7 w-7 rounded flex items-center justify-center bg-zinc-700 text-zinc-300 hover:bg-zinc-600 transition-colors"
                                            >
                                                <Plus className="h-3 w-3" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Right Column - Goal & Recommendations */}
                <div className="space-y-6">
                    {/* Goal Selector */}
                    <div className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800">
                        <h2 className="text-lg font-semibold text-white mb-4">Optimization Goal</h2>

                        <div className="relative">
                            <button
                                onClick={() => setIsGoalDropdownOpen(!isGoalDropdownOpen)}
                                className="w-full flex items-center justify-between p-4 rounded-xl bg-zinc-800 border border-zinc-700 hover:border-amber-500/50 transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{currentGoal.icon}</span>
                                    <div className="text-left">
                                        <p className="font-medium text-white">{currentGoal.name}</p>
                                        <p className="text-xs text-zinc-500">{currentGoal.description}</p>
                                    </div>
                                </div>
                                <ChevronDown className={cn(
                                    'h-5 w-5 text-zinc-400 transition-transform',
                                    isGoalDropdownOpen && 'rotate-180'
                                )} />
                            </button>

                            {isGoalDropdownOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setIsGoalDropdownOpen(false)}
                                    />
                                    <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl shadow-black/50 overflow-hidden max-h-[400px] overflow-y-auto">
                                        {Object.entries(groupedGoals).map(([category, goals]) => (
                                            <div key={category}>
                                                <p className="px-4 py-2 text-xs font-semibold text-zinc-500 bg-zinc-800/50 uppercase tracking-wider">
                                                    {category}
                                                </p>
                                                {goals.map(({ key, data }) => (
                                                    <button
                                                        key={key}
                                                        onClick={() => {
                                                            setSelectedGoal(key);
                                                            setIsGoalDropdownOpen(false);
                                                        }}
                                                        className={cn(
                                                            'w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-800/50 transition-colors text-left',
                                                            selectedGoal === key && 'bg-amber-500/10'
                                                        )}
                                                    >
                                                        <span className="text-xl">{data.icon}</span>
                                                        <div>
                                                            <p className="font-medium text-white">{data.name}</p>
                                                            <p className="text-xs text-zinc-500">{data.description}</p>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Recommendations */}
                    <div className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800">
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-amber-400" />
                            Recommendations
                        </h2>

                        {!hasAnyInventory ? (
                            <div className="text-center py-12">
                                <Package className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-zinc-400">No inventory selected</h3>
                                <p className="text-sm text-zinc-600 mt-1">
                                    Add products to your inventory to get recommendations
                                </p>
                            </div>
                        ) : recommendations.length === 0 ? (
                            <div className="text-center py-12">
                                <Target className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-zinc-400">No valid mixes found</h3>
                                <p className="text-sm text-zinc-600 mt-1">
                                    Try adding more ingredients to your inventory
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {recommendations.map((rec, index) => (
                                    <div
                                        key={`${rec.baseProduct.id}-${index}`}
                                        className={cn(
                                            'p-4 rounded-xl border transition-all',
                                            index === 0
                                                ? 'bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30'
                                                : 'bg-zinc-800/50 border-zinc-700'
                                        )}
                                    >
                                        {/* Rank & Title */}
                                        <div className="flex items-start justify-between gap-4 mb-3">
                                            <div className="flex items-center gap-3">
                                                <span className={cn(
                                                    'flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold',
                                                    index === 0 ? 'bg-amber-500 text-black' : 'bg-zinc-700 text-zinc-300'
                                                )}>
                                                    #{index + 1}
                                                </span>
                                                <div>
                                                    <p className="font-semibold text-white">
                                                        {rec.result.productName || rec.baseProduct.name}
                                                    </p>
                                                    <p className="text-xs text-zinc-500">
                                                        {rec.baseProduct.name}
                                                        {rec.ingredientsUsed.length > 0 && (
                                                            <> + {rec.ingredientsUsed.map(u =>
                                                                u.count > 1 ? `${u.ingredient.name} ×${u.count}` : u.ingredient.name
                                                            ).join(' + ')}</>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-bold text-green-400">
                                                    ${rec.result.finalPrice}
                                                </p>
                                                <p className="text-xs text-zinc-500">
                                                    ${rec.result.profit} profit
                                                </p>
                                            </div>
                                        </div>

                                        {/* Why this recommendation */}
                                        <div className="mb-3 px-3 py-2 rounded-lg bg-zinc-900/50 border border-zinc-700">
                                            <p className="text-xs text-amber-400">
                                                <span className="font-medium">Why:</span> {rec.reason}
                                            </p>
                                        </div>

                                        {/* Effects */}
                                        <div className="flex flex-wrap gap-1.5 mb-3">
                                            {rec.result.effects.slice(0, 5).map((effect, effectIdx) => (
                                                <EffectBadge key={`${effect}-${effectIdx}`} effect={effect} size="sm" />
                                            ))}
                                            {rec.result.effects.length > 5 && (
                                                <span className="text-xs text-zinc-500 self-center">
                                                    +{rec.result.effects.length - 5} more
                                                </span>
                                            )}
                                        </div>

                                        {/* Action */}
                                        <Link
                                            href={generateMixUrl(rec.baseProduct.id, rec.ingredients.map(i => i.id))}
                                            className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 text-sm font-medium transition-all"
                                        >
                                            Open in Mixer
                                            <ArrowRight className="h-4 w-4" />
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Quick Tips */}
                    {hasAnyInventory && recommendations.length > 0 && (
                        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                            <h3 className="text-sm font-medium text-amber-400 mb-2">💡 Quick Tips</h3>
                            <ul className="text-xs text-zinc-400 space-y-1">
                                <li>• Try different goal categories to find what works best for your playstyle</li>
                                <li>• Higher ingredient quantities allow more duplicate uses in a single mix</li>
                                <li>• The "Beginner Friendly" goal is great for simple, profitable mixes</li>
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
