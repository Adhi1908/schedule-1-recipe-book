'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getAllProducts, getAllIngredients, calculateMix } from '@/lib/mixEngine';
import EffectBadge from '@/components/EffectBadge';
import ConfidenceIndicator from '@/components/ConfidenceIndicator';
import { BookOpen, Search, ArrowRight, Copy, Check, TrendingUp, Beaker, ArrowUpDown, ChevronDown } from 'lucide-react';
import { cn, copyToClipboard, generateMixUrl } from '@/lib/utils';

// Pre-defined popular recipes (community verified)
const popularRecipes = [
    // === TOP PROFIT MIXES (Verified Best Sell Prices) ===
    {
        id: 'ultimate-cocaine',
        name: 'Ultimate Cocaine',
        description: '💎 BEST COCAINE - 8 effects, max sell price ~$500+',
        baseProduct: 'cocaine',
        ingredients: ['cuke', 'gasoline', 'paracetamol', 'mega-bean', 'addy', 'battery', 'chili', 'banana'],
        confidence: 'confirmed' as const,
        source: 'Community Verified',
        category: 'Top Profit'
    },
    {
        id: 'max-meth',
        name: 'Maximum Meth',
        description: '💎 BEST METH - 8 effects, sell price ~$250+',
        baseProduct: 'meth',
        ingredients: ['cuke', 'gasoline', 'paracetamol', 'mega-bean', 'addy', 'battery', 'banana', 'chili'],
        confidence: 'confirmed' as const,
        source: 'Community Verified',
        category: 'Top Profit'
    },
    {
        id: 'perfect-og',
        name: 'Perfect OG Kush',
        description: '💎 BEST WEED - Highest profit OG Kush mix',
        baseProduct: 'og-kush',
        ingredients: ['cuke', 'gasoline', 'paracetamol', 'mega-bean', 'addy', 'battery', 'banana', 'chili'],
        confidence: 'confirmed' as const,
        source: 'Community Verified',
        category: 'Top Profit'
    },
    {
        id: 'ultimate-sour',
        name: 'Ultimate Sour Diesel',
        description: '💎 Max value Sour Diesel with 8 effects',
        baseProduct: 'sour-diesel',
        ingredients: ['cuke', 'gasoline', 'paracetamol', 'mega-bean', 'addy', 'battery', 'banana', 'chili'],
        confidence: 'confirmed' as const,
        source: 'Community Verified',
        category: 'Top Profit'
    },
    {
        id: 'money-green-crack',
        name: 'Money Green Crack',
        description: '💎 Green Crack for maximum profit',
        baseProduct: 'green-crack',
        ingredients: ['cuke', 'gasoline', 'paracetamol', 'mega-bean', 'addy', 'battery', 'banana', 'chili'],
        confidence: 'confirmed' as const,
        source: 'Community Verified',
        category: 'Top Profit'
    },
    {
        id: 'cocaine-315',
        name: 'Cocaine $315 Mix',
        description: '💰 Verified $315 sell price, 4 ingredients only',
        baseProduct: 'cocaine',
        ingredients: ['cuke', 'gasoline', 'paracetamol', 'mega-bean'],
        confidence: 'confirmed' as const,
        source: 'Community Verified',
        category: 'Top Profit'
    },
    {
        id: 'quick-profit-meth',
        name: 'Quick Profit Meth',
        description: '💰 High value meth with minimal ingredients',
        baseProduct: 'meth',
        ingredients: ['gasoline', 'mega-bean', 'battery'],
        confidence: 'confirmed' as const,
        source: 'Community Verified',
        category: 'Top Profit'
    },
    {
        id: 'high-roi-weed',
        name: 'High ROI Weed',
        description: '💰 Best profit-to-cost ratio for weed',
        baseProduct: 'og-kush',
        ingredients: ['gasoline', 'mega-bean', 'addy'],
        confidence: 'confirmed' as const,
        source: 'Community Verified',
        category: 'Top Profit'
    },

    // === SPEED & MOBILITY BUILDS ===
    {
        id: 'speed-runner',
        name: 'Speed Runner',
        description: '🏃 Athletic effect for faster movement speed',
        baseProduct: 'og-kush',
        ingredients: ['energy-drink'],
        confidence: 'confirmed' as const,
        source: 'Schedule 1 Wiki',
        category: 'Speed & Mobility'
    },
    {
        id: 'death-fruit',
        name: 'Death Fruit',
        description: '🏃 Athletic + Anti-Gravity for fast escapes (early game)',
        baseProduct: 'og-kush',
        ingredients: ['energy-drink', 'mouthwash', 'mouthwash'],
        confidence: 'confirmed' as const,
        source: 'YouTube Guide',
        category: 'Speed & Mobility'
    },
    {
        id: 'superhero-mix',
        name: 'Superhero Mix',
        description: '🏃 Full mobility build with Athletic + Anti-Gravity + Energizing',
        baseProduct: 'og-kush',
        ingredients: ['cuke', 'energy-drink', 'mouthwash'],
        confidence: 'confirmed' as const,
        source: 'schedule-1-calculator.com',
        category: 'Speed & Mobility'
    },
    {
        id: 'granddaddy-fuel',
        name: 'Granddaddy Fuel',
        description: '🏃 Sneaky + Athletic + Anti-Gravity (late game)',
        baseProduct: 'granddaddy-purple',
        ingredients: ['energy-drink', 'mouthwash'],
        confidence: 'confirmed' as const,
        source: 'YouTube Guide',
        category: 'Speed & Mobility'
    },

    // === JUMP BOOST / ANTI-GRAVITY ===
    {
        id: 'lunar-jump',
        name: 'Lunar Jump',
        description: '🚀 Pure Anti-Gravity for high jumping',
        baseProduct: 'og-kush',
        ingredients: ['mouthwash'],
        confidence: 'confirmed' as const,
        source: 'Steam Community',
        category: 'Jump Boost'
    },
    {
        id: 'zero-gravity',
        name: 'Zero-G Crystal',
        description: '🚀 Anti-Gravity on Meth base for premium price',
        baseProduct: 'meth',
        ingredients: ['mouthwash'],
        confidence: 'confirmed' as const,
        source: 'Community Verified',
        category: 'Jump Boost'
    },
    {
        id: 'afghan-express',
        name: 'Afghan Express',
        description: '🚀 Anti-Gravity + visual effects, cheap to make',
        baseProduct: 'og-kush',
        ingredients: ['mouthwash', 'addy', 'viagra', 'iodine'],
        confidence: 'confirmed' as const,
        source: 'YouTube Guide',
        category: 'Jump Boost'
    },

    // === BEGINNER FRIENDLY ===
    {
        id: 'starter-sneaky',
        name: 'Starter Sneaky',
        description: '🌱 Simple 1-ingredient mix for beginners',
        baseProduct: 'og-kush',
        ingredients: ['paracetamol'],
        confidence: 'confirmed' as const,
        source: 'GameSpot Guide',
        category: 'Beginner'
    },
    {
        id: 'simple-profit',
        name: 'Simple Profit',
        description: '🌱 Easy 2-ingredient profitable mix',
        baseProduct: 'og-kush',
        ingredients: ['banana', 'gasoline'],
        confidence: 'confirmed' as const,
        source: 'PCGamer Guide',
        category: 'Beginner'
    },
    {
        id: 'basic-boost',
        name: 'Basic Boost',
        description: '🌱 Simple energy blend for new players',
        baseProduct: 'og-kush',
        ingredients: ['cuke', 'banana'],
        confidence: 'confirmed' as const,
        source: 'Steam Community',
        category: 'Beginner'
    },
    {
        id: 'basic-profit',
        name: 'Basic Profit',
        description: '🌱 4-ingredient balanced starter build',
        baseProduct: 'og-kush',
        ingredients: ['banana', 'gasoline', 'paracetamol', 'cuke'],
        confidence: 'confirmed' as const,
        source: 'GameSpot Guide',
        category: 'Beginner'
    },

    // === BEST MONEY MAKERS ===
    {
        id: 'alien-profit',
        name: 'Alien Profit',
        description: '💰 High-value mix with Anti-Gravity + alien visuals',
        baseProduct: 'og-kush',
        ingredients: ['paracetamol', 'cuke', 'mega-bean', 'battery'],
        confidence: 'confirmed' as const,
        source: 'YouTube Guide',
        category: 'High Profit'
    },
    {
        id: 'miracle-mix',
        name: 'Miracle Mix',
        description: '💰 High-value Sour Diesel with 8 effects',
        baseProduct: 'sour-diesel',
        ingredients: ['flu-medicine', 'energy-drink', 'chili', 'flu-medicine', 'mouthwash', 'banana', 'iodine', 'horse-semen'],
        confidence: 'confirmed' as const,
        source: 'LagoFast Guide',
        category: 'High Profit'
    },
    {
        id: 'high-value-meth',
        name: 'High Value Crystal',
        description: '💰 Premium meth mix for maximum sell price',
        baseProduct: 'meth',
        ingredients: ['banana', 'cuke', 'paracetamol', 'gasoline', 'battery', 'mega-bean'],
        confidence: 'confirmed' as const,
        source: 'BisectHosting Guide',
        category: 'High Profit'
    },
    {
        id: 'wedding-fruit',
        name: 'Wedding Fruit',
        description: '💰 Green Crack 7-ingredient money maker',
        baseProduct: 'green-crack',
        ingredients: ['banana', 'cuke', 'paracetamol', 'gasoline', 'chili', 'mega-bean', 'battery'],
        confidence: 'confirmed' as const,
        source: 'YouTube Guide',
        category: 'High Profit'
    },
    {
        id: 'premium-snow',
        name: 'Premium Snow',
        description: '💰 Enhanced cocaine with multiple effects',
        baseProduct: 'cocaine',
        ingredients: ['banana', 'gasoline', 'paracetamol', 'cuke', 'mega-bean'],
        confidence: 'confirmed' as const,
        source: 'Community Verified',
        category: 'High Profit'
    },

    // === SPECIAL EFFECTS ===
    {
        id: 'sweet-fruit',
        name: 'Sweet Fruit',
        description: '✨ Anti-gravity and glowing effects',
        baseProduct: 'og-kush',
        ingredients: ['paracetamol', 'cuke', 'gasoline', 'mega-bean', 'battery'],
        confidence: 'confirmed' as const,
        source: 'Steam Community',
        category: 'Special Effects'
    },
    {
        id: 'explosive-crystal',
        name: 'Explosive Crystal',
        description: '💥 Makes consumer EXPLODE (for chaos)',
        baseProduct: 'meth',
        ingredients: ['donut'],
        confidence: 'confirmed' as const,
        source: 'IndiaToday Guide',
        category: 'Special Effects'
    },
    {
        id: 'zombie-mix',
        name: 'Zombie Mix',
        description: '🧟 Zombifying effect turns customer green',
        baseProduct: 'og-kush',
        ingredients: ['flu-medicine', 'chili'],
        confidence: 'confirmed' as const,
        source: 'PCGamer Guide',
        category: 'Special Effects'
    },
    {
        id: 'glow-weed',
        name: 'Glow Weed',
        description: '✨ Radioactive glow effect',
        baseProduct: 'sour-diesel',
        ingredients: ['battery', 'mega-bean'],
        confidence: 'confirmed' as const,
        source: 'Fandom Wiki',
        category: 'Special Effects'
    }
];

export default function RecipesPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<string>('default');
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const RECIPES_PER_PAGE = 6;

    const sortOptions = [
        { id: 'default', label: 'Default Order' },
        { id: 'price-low', label: 'Price: Low to High' },
        { id: 'price-high', label: 'Price: High to Low' },
        { id: 'profit-high', label: 'Profit: High to Low' },
        { id: 'profit-low', label: 'Profit: Low to High' },
        { id: 'effects-high', label: 'Most Effects' },
        { id: 'effects-low', label: 'Fewest Effects' },
        { id: 'ingredients-low', label: 'Fewest Ingredients' },
        { id: 'ingredients-high', label: 'Most Ingredients' },
    ];

    const products = getAllProducts();
    const ingredients = getAllIngredients();

    // Get unique categories
    const categories = ['all', ...new Set(popularRecipes.map(r => r.category))];

    // Calculate results for each recipe
    const recipesWithResults = popularRecipes.map(recipe => {
        const result = calculateMix(recipe.baseProduct, recipe.ingredients);
        const baseProductObj = products.find(p => p.id === recipe.baseProduct);
        const ingredientObjects = recipe.ingredients.map(id =>
            ingredients.find(i => i.id === id)
        ).filter(Boolean);

        return {
            ...recipe,
            result,
            baseProductObj,
            ingredientObjects,
        };
    });

    // Filter recipes by category and search
    const filteredRecipes = recipesWithResults.filter(recipe => {
        const query = searchQuery.toLowerCase();
        const matchesSearch = (
            recipe.name.toLowerCase().includes(query) ||
            recipe.description.toLowerCase().includes(query) ||
            recipe.baseProductObj?.name?.toLowerCase().includes(query) ||
            recipe.result.effects.some(e => e.toLowerCase().includes(query)) ||
            recipe.result.productName.toLowerCase().includes(query) ||
            recipe.category.toLowerCase().includes(query)
        );
        const matchesCategory = selectedCategory === 'all' || recipe.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    // Sort recipes
    const sortedRecipes = [...filteredRecipes].sort((a, b) => {
        switch (sortBy) {
            case 'price-low':
                return a.result.finalPrice - b.result.finalPrice;
            case 'price-high':
                return b.result.finalPrice - a.result.finalPrice;
            case 'profit-high':
                return b.result.profit - a.result.profit;
            case 'profit-low':
                return a.result.profit - b.result.profit;
            case 'effects-high':
                return b.result.effects.length - a.result.effects.length;
            case 'effects-low':
                return a.result.effects.length - b.result.effects.length;
            case 'ingredients-low':
                return a.ingredients.length - b.ingredients.length;
            case 'ingredients-high':
                return b.ingredients.length - a.ingredients.length;
            default:
                return 0;
        }
    });

    // Pagination logic
    const totalPages = Math.ceil(sortedRecipes.length / RECIPES_PER_PAGE);
    const startIndex = (currentPage - 1) * RECIPES_PER_PAGE;
    const paginatedRecipes = sortedRecipes.slice(startIndex, startIndex + RECIPES_PER_PAGE);

    // Reset to page 1 when filters change
    const handleCategoryChange = (category: string) => {
        setSelectedCategory(category);
        setCurrentPage(1);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    // Handle copy
    const handleCopy = async (recipeId: string, baseProductId: string, ingredientIds: string[]) => {
        const url = window.location.origin + generateMixUrl(baseProductId, ingredientIds);
        await copyToClipboard(url);
        setCopiedId(recipeId);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                            <BookOpen className="h-5 w-5 text-blue-400" />
                        </div>
                        Recipes
                        <span className="text-lg font-normal text-zinc-500">({filteredRecipes.length})</span>
                    </h1>
                    <p className="mt-1 text-zinc-500">
                        Popular community-verified mixes for every play style
                    </p>
                </div>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 mb-6">
                {categories.map((category) => (
                    <button
                        key={category}
                        onClick={() => handleCategoryChange(category)}
                        className={cn(
                            'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                            selectedCategory === category
                                ? 'bg-blue-500 text-white'
                                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                        )}
                    >
                        {category === 'all' ? '🎯 All Recipes' :
                            category === 'Top Profit' ? '💎 Top Profit' :
                                category === 'Speed & Mobility' ? '🏃 Speed & Mobility' :
                                    category === 'Jump Boost' ? '🚀 Jump Boost' :
                                        category === 'Beginner' ? '🌱 Beginner' :
                                            category === 'High Profit' ? '💰 High Profit' :
                                                category === 'Special Effects' ? '✨ Special Effects' : category}
                    </button>
                ))}
            </div>

            {/* Search */}
            <div className="relative mb-8">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                <input
                    type="text"
                    placeholder="Search recipes by name, effect, product name, or base product..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-zinc-500">
                    Showing {startIndex + 1}-{Math.min(startIndex + RECIPES_PER_PAGE, sortedRecipes.length)} of {sortedRecipes.length} recipes
                </p>
                <div className="relative">
                    <button
                        onClick={() => setShowSortDropdown(!showSortDropdown)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-all text-sm"
                    >
                        <ArrowUpDown className="h-4 w-4" />
                        {sortOptions.find(o => o.id === sortBy)?.label || 'Sort'}
                        <ChevronDown className={cn('h-4 w-4 transition-transform', showSortDropdown && 'rotate-180')} />
                    </button>
                    {showSortDropdown && (
                        <div className="absolute right-0 top-full mt-2 w-48 py-2 rounded-lg bg-zinc-800 border border-zinc-700 shadow-xl z-50">
                            {sortOptions.map(option => (
                                <button
                                    key={option.id}
                                    onClick={() => {
                                        setSortBy(option.id);
                                        setShowSortDropdown(false);
                                    }}
                                    className={cn(
                                        'w-full px-4 py-2 text-left text-sm transition-colors',
                                        sortBy === option.id
                                            ? 'bg-blue-500/20 text-blue-400'
                                            : 'text-zinc-300 hover:bg-zinc-700 hover:text-white'
                                    )}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Recipes Grid */}
            <div className="grid md:grid-cols-2 gap-6">
                {paginatedRecipes.map((recipe) => (
                    <div
                        key={recipe.id}
                        className="p-6 rounded-xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-all"
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between gap-4 mb-3">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-xl font-semibold text-white">{recipe.name}</h3>
                                    <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-xs text-zinc-400">
                                        {recipe.category}
                                    </span>
                                </div>
                                <p className="text-sm text-zinc-500">{recipe.description}</p>
                            </div>
                            <div className="text-right shrink-0">
                                <p className="text-2xl font-bold text-green-400">${recipe.result.finalPrice}</p>
                                <p className="text-xs text-zinc-500">sell price</p>
                            </div>
                        </div>

                        {/* Generated Product Name */}
                        <div className="mb-4 p-3 rounded-lg bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20">
                            <p className="text-xs text-zinc-400 mb-1">Final Product Name</p>
                            <p className="text-lg font-bold text-green-400">{recipe.result.productName}</p>
                        </div>

                        {/* Base Product + Ingredients */}
                        <div className="flex items-center gap-2 mb-4 text-sm">
                            <span className="text-zinc-500">Base:</span>
                            <span className="text-white font-medium">{recipe.baseProductObj?.name}</span>
                            <span className="text-zinc-600">→</span>
                            <span className="text-zinc-400">{recipe.ingredients.length} ingredients</span>
                        </div>

                        {/* Ingredients */}
                        <div className="mb-4">
                            <p className="text-sm text-zinc-500 mb-2">Ingredients:</p>
                            <div className="flex flex-wrap gap-1.5">
                                {recipe.ingredientObjects.map((ing, idx) => (
                                    <span
                                        key={`${ing?.id}-${idx}`}
                                        className="px-2 py-1 rounded-md bg-zinc-800 text-xs text-zinc-300"
                                    >
                                        {ing?.name}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Effects */}
                        <div className="mb-4">
                            <p className="text-sm text-zinc-500 mb-2">Final Effects:</p>
                            <div className="flex flex-wrap gap-2">
                                {recipe.result.effects.map((effect, idx) => (
                                    <EffectBadge key={`${effect}-${idx}`} effect={effect} size="sm" />
                                ))}
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-4 mb-4 py-3 border-y border-zinc-800">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-green-400" />
                                <span className={cn(
                                    'text-sm font-medium',
                                    recipe.result.profit >= 0 ? 'text-green-400' : 'text-red-400'
                                )}>
                                    {recipe.result.profit >= 0 ? '+' : ''}${recipe.result.profit} profit
                                </span>
                            </div>
                            <div className="text-sm text-zinc-500">
                                ×{recipe.result.priceMultiplier} multiplier
                            </div>
                            <div className="text-sm text-zinc-500" title="Addiction values are estimates">
                                {recipe.result.addictionRating}% addiction*
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between">
                            <ConfidenceIndicator level={recipe.confidence} source={recipe.source} size="sm" />

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleCopy(recipe.id, recipe.baseProduct, recipe.ingredients)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 text-sm transition-all"
                                >
                                    {copiedId === recipe.id ? (
                                        <>
                                            <Check className="h-4 w-4 text-green-400" />
                                            Copied
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="h-4 w-4" />
                                            Copy
                                        </>
                                    )}
                                </button>
                                <Link
                                    href={generateMixUrl(recipe.baseProduct, recipe.ingredients)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 text-sm transition-all"
                                >
                                    <Beaker className="h-4 w-4" />
                                    Open
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-8">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className={cn(
                            'px-4 py-2 rounded-lg font-medium transition-all',
                            currentPage === 1
                                ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                                : 'bg-zinc-800 text-white hover:bg-zinc-700'
                        )}
                    >
                        ← Previous
                    </button>

                    <div className="flex items-center gap-2">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={cn(
                                    'w-10 h-10 rounded-lg font-medium transition-all',
                                    currentPage === page
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                                )}
                            >
                                {page}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className={cn(
                            'px-4 py-2 rounded-lg font-medium transition-all',
                            currentPage === totalPages
                                ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                                : 'bg-zinc-800 text-white hover:bg-zinc-700'
                        )}
                    >
                        Next →
                    </button>
                </div>
            )}

            {sortedRecipes.length === 0 && (
                <div className="text-center py-16">
                    <BookOpen className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-zinc-400">No recipes found</h3>
                    <p className="text-sm text-zinc-600 mt-1">Try a different search term</p>
                </div>
            )}

            {/* Info Box */}
            <div className="mt-12 p-6 rounded-xl bg-zinc-900/50 border border-zinc-800">
                <h3 className="text-lg font-semibold text-white mb-2">About Recipes</h3>
                <p className="text-sm text-zinc-400 mb-3">
                    These recipes are sourced from community guides and verified by multiple players.
                    Prices and effects may vary slightly based on game updates. Use the Mix Builder
                    to experiment with your own combinations.
                </p>
                <p className="text-xs text-zinc-500">
                    *Addiction values are estimates and may not reflect actual in-game values.
                    If you have verified addiction data, please contribute to our data sources.
                </p>
            </div>
        </div>
    );
}
