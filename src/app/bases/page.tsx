'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getAllProducts } from '@/lib/mixEngine';
import EffectBadge from '@/components/EffectBadge';
import ConfidenceIndicator from '@/components/ConfidenceIndicator';
import { Leaf, Search, Beaker, ArrowRight, Cannabis, FlaskConical, Snowflake } from 'lucide-react';
import { cn, generateMixUrl } from '@/lib/utils';

const categoryIcons: Record<string, React.ElementType> = {
    weed: Cannabis,
    meth: Snowflake,
    cocaine: FlaskConical,
};

const categoryColors: Record<string, { bg: string; border: string; text: string }> = {
    weed: {
        bg: 'bg-green-500/10',
        border: 'border-green-500/30',
        text: 'text-green-400',
    },
    meth: {
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/30',
        text: 'text-blue-400',
    },
    cocaine: {
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
        text: 'text-amber-400',
    },
};

export default function BasesPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const products = getAllProducts();

    // Filter products
    const filteredProducts = products.filter(product => {
        const matchesSearch =
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (product.description || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = !selectedCategory || product.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    // Get unique categories
    const categories = [...new Set(products.map(p => p.category))];

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                            <Leaf className="h-5 w-5 text-amber-400" />
                        </div>
                        Base Products
                    </h1>
                    <p className="mt-1 text-zinc-500">
                        All strains and base products with their natural effects
                    </p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800 text-sm text-zinc-400">
                    <span>{products.length}</span>
                    <span>products</span>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                    <input
                        type="text"
                        placeholder="Search base products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
                    />
                </div>

                {/* Category Filter */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setSelectedCategory(null)}
                        className={cn(
                            'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                            !selectedCategory
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : 'bg-zinc-800 text-zinc-400 hover:text-white'
                        )}
                    >
                        All
                    </button>
                    {categories.map(category => {
                        const Icon = categoryIcons[category] || Leaf;
                        const colors = categoryColors[category] || {
                            bg: 'bg-zinc-500/10',
                            border: 'border-zinc-500/30',
                            text: 'text-zinc-400',
                        };
                        return (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={cn(
                                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all',
                                    selectedCategory === category
                                        ? `${colors.bg} ${colors.text} border ${colors.border}`
                                        : 'bg-zinc-800 text-zinc-400 hover:text-white'
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                {category}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Products Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => {
                    const Icon = categoryIcons[product.category] || Leaf;
                    const colors = categoryColors[product.category] || {
                        bg: 'bg-zinc-500/10',
                        border: 'border-zinc-500/30',
                        text: 'text-zinc-400',
                    };

                    return (
                        <div
                            key={product.id}
                            className={cn(
                                'p-6 rounded-xl bg-gradient-to-br from-zinc-900 to-zinc-950 border transition-all hover:shadow-xl',
                                colors.border
                            )}
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between gap-4 mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={cn('h-14 w-14 rounded-xl flex items-center justify-center overflow-hidden', colors.bg)}>
                                        <img
                                            src={`/images/products/${product.id}.webp`}
                                            alt={product.name}
                                            className="h-12 w-12 object-contain"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                                const icon = document.createElement('span');
                                                icon.className = `text-2xl`;
                                                icon.innerHTML = product.category === 'weed' ? '🌿' : product.category === 'meth' ? '💎' : '🏔️';
                                                e.currentTarget.parentElement?.appendChild(icon);
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-white">{product.name}</h3>
                                        <p className={cn('text-sm capitalize', colors.text)}>{product.category}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xl font-bold text-green-400">${product.basePrice}</p>
                                    <p className="text-xs text-zinc-500">base price</p>
                                </div>
                            </div>

                            {/* Description */}
                            <p className="text-sm text-zinc-500 mb-4">{product.description}</p>

                            {/* Base Effects */}
                            <div className="mb-4">
                                <p className="text-sm text-zinc-400 mb-2">Base Effects:</p>
                                <div className="flex flex-wrap gap-2">
                                    {product.defaultEffect ? (
                                        <EffectBadge effect={product.defaultEffect} />
                                    ) : (
                                        <span className="text-xs text-zinc-600">No natural effects</span>
                                    )}
                                </div>
                            </div>

                            {/* Unlock Requirement */}
                            <div className="mb-4 p-3 rounded-lg bg-zinc-800/50 border border-zinc-700">
                                <p className="text-xs text-zinc-500 mb-1">Unlock Requirement</p>
                                <p className="text-sm text-zinc-300">{product.unlockRequirement}</p>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                                <ConfidenceIndicator level={product.confidence || 'unconfirmed'} size="sm" />
                                <Link
                                    href={generateMixUrl(product.id, [])}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 text-sm transition-all"
                                >
                                    <Beaker className="h-4 w-4" />
                                    Use in Mix
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                    );
                })}
            </div>

            {filteredProducts.length === 0 && (
                <div className="text-center py-16">
                    <Leaf className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-zinc-400">No products found</h3>
                    <p className="text-sm text-zinc-600 mt-1">Try a different search term or category</p>
                </div>
            )}

            {/* Info */}
            <div className="mt-12 p-6 rounded-xl bg-zinc-900/50 border border-zinc-800">
                <h3 className="text-lg font-semibold text-white mb-4">About Base Products</h3>
                <div className="grid md:grid-cols-3 gap-6 text-sm text-zinc-400">
                    <div>
                        <h4 className="font-medium text-green-400 mb-2">🌿 Weed</h4>
                        <p>
                            Four strains available: OG Kush, Sour Diesel, Green Crack, and Granddaddy Purple.
                            Each has unique base effects and can be mixed with ingredients.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-medium text-blue-400 mb-2">💎 Meth</h4>
                        <p>
                            Requires Lab Station and Pseudo to produce. Higher base price with
                            Electrifying effect. Late-game product.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-medium text-amber-400 mb-2">🏔️ Cocaine</h4>
                        <p>
                            Highest value product. Requires unlocking Salvador Moreno and
                            processing coca plants. Best profit potential.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
