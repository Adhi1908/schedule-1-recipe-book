'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { getAllIngredients } from '@/lib/mixEngine';
import { Search, Plus, X, ChevronDown } from 'lucide-react';
import type { Ingredient } from '@/lib/types';
import transformationsData from '@/data/transformations.json';

interface IngredientSelectorProps {
    selectedIngredients: string[];
    onAdd: (ingredientId: string) => void;
    onRemove: (index: number) => void;
    onClear: () => void;
    currentEffects?: string[];
    className?: string;
}

type TransformationRule = {
    ifPresent: string[];
    ifNotPresent: string[];
    replace: Record<string, string>;
};

type Transformations = Record<string, TransformationRule[]>;

export default function IngredientSelector({
    selectedIngredients,
    onAdd,
    onRemove,
    onClear,
    currentEffects = [],
    className,
}: IngredientSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');

    const allIngredients = getAllIngredients();
    const transformations = transformationsData as unknown as Transformations;

    const filteredIngredients = useMemo(() => {
        return allIngredients.filter(ing =>
            ing.name.toLowerCase().includes(search.toLowerCase())
        );
    }, [allIngredients, search]);

    const selectedIngredientObjects = useMemo(() => {
        return selectedIngredients.map(id =>
            allIngredients.find(ing => ing.id === id)
        ).filter(Boolean) as Ingredient[];
    }, [selectedIngredients, allIngredients]);

    // Get what effect an ingredient will produce given current effects
    const getPredictedEffect = (ingredient: Ingredient): { effect: string; type: 'add' | 'transform' } => {
        // Look up by ingredient NAME
        const transformationRules = transformations[ingredient.name];
        const defaultEffect = (ingredient as any).effect || '';

        if (transformationRules && Array.isArray(transformationRules)) {
            // Check for transformations based on current effects
            for (const rule of transformationRules) {
                const ifPresent = rule.ifPresent || [];
                const ifNotPresent = rule.ifNotPresent || [];
                const replace = rule.replace || {};

                // Check if conditions are met
                const hasRequired = ifPresent.every(effect =>
                    currentEffects.some(e => e.toLowerCase() === effect.toLowerCase())
                );
                const notHasBlocked = ifNotPresent.every(effect =>
                    !currentEffects.some(e => e.toLowerCase() === effect.toLowerCase())
                );

                if (hasRequired && notHasBlocked && Object.keys(replace).length > 0) {
                    const [oldEffect, newEffect] = Object.entries(replace)[0];
                    return { effect: `${oldEffect} → ${newEffect}`, type: 'transform' };
                }
            }
        }

        return { effect: defaultEffect || 'Unknown', type: 'add' };
    };

    return (
        <div className={cn('space-y-4', className)}>
            {/* Selected Ingredients */}
            {selectedIngredientObjects.length > 0 && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-zinc-400">
                            Added Ingredients ({selectedIngredientObjects.length})
                        </h4>
                        <button
                            onClick={onClear}
                            className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
                        >
                            <X className="h-3 w-3" />
                            Clear All
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {selectedIngredientObjects.map((ingredient, index) => (
                            <div
                                key={`${ingredient.id}-${index}`}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 group"
                            >
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-700 text-xs font-medium text-zinc-400">
                                    {index + 1}
                                </span>
                                <img
                                    src={`/images/ingredients/${ingredient.id}.webp`}
                                    alt={ingredient.name}
                                    className="h-5 w-5 object-contain"
                                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                />
                                <span className="text-sm text-white">{ingredient.name}</span>
                                <button
                                    onClick={() => onRemove(index)}
                                    className="text-zinc-500 hover:text-red-400 transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Add Ingredient Dropdown */}
            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={cn(
                        'w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl',
                        'bg-zinc-800/50 border-2 border-dashed border-zinc-700',
                        'text-zinc-400 hover:text-white hover:border-zinc-600 transition-all',
                        isOpen && 'border-green-500/50 bg-zinc-800'
                    )}
                >
                    <span className="flex items-center gap-2">
                        <Plus className="h-5 w-5" />
                        Add Ingredient
                    </span>
                    <ChevronDown className={cn(
                        'h-5 w-5 transition-transform',
                        isOpen && 'rotate-180'
                    )} />
                </button>

                {isOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 z-50">
                        <div className="bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl shadow-black/50 overflow-hidden">
                            {/* Search */}
                            <div className="p-3 border-b border-zinc-800">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                                    <input
                                        type="text"
                                        placeholder="Search ingredients..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-green-500"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            {/* Ingredient List */}
                            <div className="max-h-64 overflow-y-auto">
                                {filteredIngredients.map((ingredient) => {
                                    const prediction = getPredictedEffect(ingredient);
                                    return (
                                        <button
                                            key={ingredient.id}
                                            onClick={() => {
                                                onAdd(ingredient.id);
                                                setSearch('');
                                                setIsOpen(false);
                                            }}
                                            className="w-full flex items-center justify-between px-4 py-3 hover:bg-zinc-800/50 transition-colors text-left"
                                        >
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={`/images/ingredients/${ingredient.id}.webp`}
                                                    alt={ingredient.name}
                                                    className="h-8 w-8 object-contain"
                                                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                                />
                                                <div>
                                                    <span className="text-white font-medium">{ingredient.name}</span>
                                                    <span className="ml-2 text-xs text-zinc-500">${(ingredient as any).price}</span>
                                                </div>
                                            </div>
                                            <span className={cn(
                                                'text-xs px-2 py-1 rounded-full',
                                                prediction.type === 'transform'
                                                    ? 'bg-purple-500/20 text-purple-300'
                                                    : 'bg-green-500/20 text-green-300'
                                            )}>
                                                {prediction.effect}
                                            </span>
                                        </button>
                                    );
                                })}
                                {filteredIngredients.length === 0 && (
                                    <div className="px-4 py-8 text-center text-zinc-500">
                                        No ingredients found
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Click outside to close */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
}
