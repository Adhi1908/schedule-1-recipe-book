'use client';

import { cn } from '@/lib/utils';
import EffectBadge from './EffectBadge';
import ConfidenceIndicator from './ConfidenceIndicator';
import { Leaf, FlaskConical, Sparkles } from 'lucide-react';
import type { Product, Ingredient } from '@/lib/types';

interface ProductCardProps {
    product?: Product;
    ingredient?: Ingredient;
    onClick?: () => void;
    selected?: boolean;
    className?: string;
}

export default function ProductCard({
    product,
    ingredient,
    onClick,
    selected = false,
    className,
}: ProductCardProps) {
    const item = product || ingredient;
    if (!item) return null;

    const isProduct = !!product;
    const Icon = isProduct ? Leaf : FlaskConical;

    const categoryColors: Record<string, string> = {
        weed: 'from-green-500/20 to-emerald-500/20 border-green-500/30',
        meth: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
        cocaine: 'from-yellow-500/20 to-amber-500/20 border-amber-500/30',
    };

    return (
        <div
            onClick={onClick}
            className={cn(
                'relative p-4 rounded-xl border transition-all cursor-pointer group',
                'bg-gradient-to-br',
                isProduct && product
                    ? categoryColors[product.category] || 'from-zinc-800/50 to-zinc-900/50 border-zinc-700'
                    : 'from-zinc-800/50 to-zinc-900/50 border-zinc-700',
                selected && 'ring-2 ring-green-500 border-green-500/50',
                !selected && 'hover:border-zinc-600 hover:shadow-lg hover:shadow-black/20',
                onClick && 'cursor-pointer',
                className
            )}
        >
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className={cn(
                        'flex h-12 w-12 items-center justify-center rounded-lg overflow-hidden',
                        'bg-zinc-900/50 border border-zinc-700',
                        selected && 'border-green-500/50 bg-green-500/10'
                    )}>
                        {isProduct && product ? (
                            <img
                                src={`/images/products/${product.id}.webp`}
                                alt={product.name}
                                className="h-10 w-10 object-contain"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.parentElement!.innerHTML = '<span class="text-zinc-400">🌿</span>';
                                }}
                            />
                        ) : ingredient ? (
                            <img
                                src={`/images/ingredients/${ingredient.id}.webp`}
                                alt={ingredient.name}
                                className="h-10 w-10 object-contain"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.parentElement!.innerHTML = '<span class="text-zinc-400">🧪</span>';
                                }}
                            />
                        ) : (
                            <Icon className={cn(
                                'h-5 w-5',
                                selected ? 'text-green-400' : 'text-zinc-400'
                            )} />
                        )}
                    </div>
                    <div>
                        <h3 className="font-semibold text-white group-hover:text-green-400 transition-colors">
                            {item.name}
                        </h3>
                        {isProduct && product && (
                            <p className="text-xs text-zinc-500 capitalize">{product.category}</p>
                        )}
                        {!isProduct && ingredient && (
                            <p className="text-xs text-zinc-500">{ingredient.source}</p>
                        )}
                    </div>
                </div>

                {/* Price/Cost */}
                <div className="text-right">
                    <p className="text-lg font-bold text-green-400">
                        ${isProduct && product ? product.basePrice : (ingredient as any)?.price}
                    </p>
                    <p className="text-xs text-zinc-500">
                        {isProduct ? 'base price' : 'cost'}
                    </p>
                </div>
            </div>

            {/* Effects */}
            <div className="mt-4 flex flex-wrap gap-2">
                {isProduct && product?.defaultEffect && (
                    <EffectBadge effect={product.defaultEffect} size="sm" />
                )}
                {!isProduct && ingredient && (
                    <EffectBadge effect={ingredient.defaultEffect} size="sm" />
                )}
            </div>

            {/* Footer */}
            <div className="mt-4 pt-3 border-t border-zinc-800/50 flex items-center justify-between">
                <ConfidenceIndicator
                    level={item.confidence || 'unconfirmed'}
                    size="sm"
                />
                {isProduct && product && (
                    <span className="text-xs text-zinc-500">
                        {product.unlockRequirement}
                    </span>
                )}
            </div>

            {/* Selection indicator */}
            {selected && (
                <div className="absolute top-2 right-2">
                    <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center">
                        <Sparkles className="h-3 w-3 text-white" />
                    </div>
                </div>
            )}
        </div>
    );
}
