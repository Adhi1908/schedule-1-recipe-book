'use client';

import { useState, useMemo } from 'react';
import { getAllIngredients } from '@/lib/mixEngine';
import EffectBadge from '@/components/EffectBadge';
import ConfidenceIndicator from '@/components/ConfidenceIndicator';
import { FlaskConical, Search, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import transformationsData from '@/data/transformations.json';

type TransformationRule = {
    ifPresent: string[];
    ifNotPresent: string[];
    replace: Record<string, string>;
};

type Transformations = Record<string, TransformationRule[]>;

export default function IngredientsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const ingredients = getAllIngredients();
    const transformations = transformationsData as unknown as Transformations;

    // Filter ingredients
    const filteredIngredients = useMemo(() => {
        const query = searchQuery.toLowerCase();
        return ingredients.filter(ing =>
            ing.name.toLowerCase().includes(query) ||
            ((ing as any).effect || '').toLowerCase().includes(query)
        );
    }, [ingredients, searchQuery]);

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                            <FlaskConical className="h-5 w-5 text-purple-400" />
                        </div>
                        Ingredients
                    </h1>
                    <p className="mt-1 text-zinc-500">
                        All mixable ingredients with their effects and transformation rules
                    </p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800 text-sm text-zinc-400">
                    <span>{ingredients.length}</span>
                    <span>ingredients</span>
                </div>
            </div>

            {/* Search */}
            <div className="relative mb-8">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                <input
                    type="text"
                    placeholder="Search by ingredient name or effect..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-colors"
                />
            </div>

            {/* Ingredients List */}
            <div className="space-y-4">
                {filteredIngredients.map((ingredient) => {
                    // Look up transformations by ingredient NAME
                    const transformationRules = transformations[ingredient.name] || [];
                    const defaultEffect = (ingredient as any).effect || '';
                    const isExpanded = expandedId === ingredient.id;

                    return (
                        <div
                            key={ingredient.id}
                            className="rounded-xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 overflow-hidden"
                        >
                            {/* Main Row */}
                            <button
                                onClick={() => setExpandedId(isExpanded ? null : ingredient.id)}
                                className="w-full flex items-center justify-between p-5 text-left hover:bg-zinc-800/30 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="h-14 w-14 rounded-xl bg-purple-500/10 flex items-center justify-center overflow-hidden">
                                        <img
                                            src={`/images/ingredients/${ingredient.id}.webp`}
                                            alt={ingredient.name}
                                            className="h-12 w-12 object-contain"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                                const fallback = document.createElement('span');
                                                fallback.innerHTML = '🧪';
                                                fallback.className = 'text-2xl';
                                                e.currentTarget.parentElement?.appendChild(fallback);
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-white">{ingredient.name}</h3>
                                        <p className="text-sm text-zinc-500">Rank {(ingredient as any).rank || 'N/A'}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-lg font-bold text-purple-400">${(ingredient as any).price || 0}</p>
                                        <p className="text-xs text-zinc-500">cost</p>
                                    </div>
                                    {defaultEffect && <EffectBadge effect={defaultEffect} />}
                                    {isExpanded ? (
                                        <ChevronUp className="h-5 w-5 text-zinc-500" />
                                    ) : (
                                        <ChevronDown className="h-5 w-5 text-zinc-500" />
                                    )}
                                </div>
                            </button>

                            {/* Expanded Content */}
                            {isExpanded && (
                                <div className="px-5 pb-5 border-t border-zinc-800">
                                    <div className="pt-5 space-y-4">
                                        {/* Default Effect */}
                                        <div>
                                            <h4 className="text-sm font-medium text-zinc-400 mb-2">Default Effect</h4>
                                            <p className="text-sm text-zinc-300">
                                                When added to a mix without matching transformation rules, this ingredient adds:
                                            </p>
                                            <div className="mt-2">
                                                <EffectBadge effect={defaultEffect || 'None'} size="lg" />
                                            </div>
                                        </div>

                                        {/* Transformation Rules */}
                                        {transformationRules.length > 0 && (
                                            <div>
                                                <h4 className="text-sm font-medium text-zinc-400 mb-3">Transformation Rules</h4>
                                                <p className="text-sm text-zinc-500 mb-3">
                                                    If the mix already has one of these effects, it will transform:
                                                </p>
                                                <div className="grid gap-2">
                                                    {transformationRules.map((rule, idx) => {
                                                        // Get the replacement entry
                                                        const entries = Object.entries(rule.replace || {});
                                                        if (entries.length === 0) return null;
                                                        const [oldEffect, newEffect] = entries[0];

                                                        return (
                                                            <div
                                                                key={idx}
                                                                className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/50 border border-zinc-700"
                                                            >
                                                                <EffectBadge effect={oldEffect} size="sm" />
                                                                <ArrowRight className="h-4 w-4 text-purple-400" />
                                                                <EffectBadge effect={newEffect} size="sm" />
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {/* Confidence - hardcoded since data doesn't have this */}
                                        <div className="pt-3 border-t border-zinc-800/50">
                                            <ConfidenceIndicator
                                                level="confirmed"
                                                source="Game Data"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {filteredIngredients.length === 0 && (
                <div className="text-center py-16">
                    <FlaskConical className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-zinc-400">No ingredients found</h3>
                    <p className="text-sm text-zinc-600 mt-1">Try a different search term</p>
                </div>
            )}

            {/* Legend */}
            <div className="mt-12 p-6 rounded-xl bg-zinc-900/50 border border-zinc-800">
                <h3 className="text-lg font-semibold text-white mb-4">How Transformations Work</h3>
                <div className="grid md:grid-cols-2 gap-6 text-sm text-zinc-400">
                    <div>
                        <h4 className="font-medium text-zinc-300 mb-2">Default Effect</h4>
                        <p>
                            When you add an ingredient to a mix, it will add its default effect unless
                            a transformation rule matches.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-medium text-zinc-300 mb-2">Transformation Rules</h4>
                        <p>
                            If your mix already has a specific effect, adding an ingredient may
                            transform that effect into something else instead of adding the default.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
