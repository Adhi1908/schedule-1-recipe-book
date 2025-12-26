'use client';

import { cn } from '@/lib/utils';
import EffectBadge from './EffectBadge';
import { Check, X, AlertTriangle, TrendingUp, Percent, DollarSign, Beaker } from 'lucide-react';
import type { MixResult } from '@/lib/types';

interface MixResultPanelProps {
    result: MixResult | null;
    className?: string;
}

export default function MixResultPanel({ result, className }: MixResultPanelProps) {
    if (!result) {
        return (
            <div className={cn(
                'p-6 rounded-xl border border-dashed border-zinc-700 bg-zinc-900/30',
                'flex flex-col items-center justify-center text-center min-h-[300px]',
                className
            )}>
                <Beaker className="h-12 w-12 text-zinc-600 mb-4" />
                <h3 className="text-lg font-medium text-zinc-400">No Mix Selected</h3>
                <p className="text-sm text-zinc-600 mt-1 max-w-xs">
                    Select a base product and add ingredients to see the mix result
                </p>
            </div>
        );
    }

    return (
        <div className={cn(
            'rounded-xl border overflow-hidden',
            result.isValid
                ? 'border-green-500/30 bg-gradient-to-br from-green-950/30 to-zinc-900'
                : 'border-red-500/30 bg-gradient-to-br from-red-950/30 to-zinc-900',
            className
        )}>
            {/* Header */}
            <div className={cn(
                'px-6 py-4 border-b',
                result.isValid ? 'border-green-500/20 bg-green-500/5' : 'border-red-500/20 bg-red-500/5'
            )}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {result.isValid ? (
                            <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
                                <Check className="h-5 w-5 text-green-400" />
                            </div>
                        ) : (
                            <div className="h-10 w-10 rounded-full bg-red-500/20 flex items-center justify-center">
                                <X className="h-5 w-5 text-red-400" />
                            </div>
                        )}
                        <div>
                            <h3 className="font-bold text-lg text-white">
                                {result.productName}
                            </h3>
                            <p className="text-sm text-zinc-400">
                                {result.steps.length > 0
                                    ? `${result.steps.length} ingredient${result.steps.length > 1 ? 's' : ''} mixed`
                                    : 'Base product only'}
                            </p>
                        </div>
                    </div>

                    {/* Final Price */}
                    <div className="text-right">
                        <p className="text-2xl font-bold text-green-400">${result.finalPrice}</p>
                        <p className="text-xs text-zinc-500">estimated sell price</p>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 border-b border-zinc-800/50">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                        <DollarSign className="h-5 w-5 text-zinc-400" />
                    </div>
                    <div>
                        <p className="text-lg font-semibold text-white">${result.totalCost}</p>
                        <p className="text-xs text-zinc-500">total cost</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-green-400" />
                    </div>
                    <div>
                        <p className={cn(
                            'text-lg font-semibold',
                            result.profit >= 0 ? 'text-green-400' : 'text-red-400'
                        )}>
                            {result.profit >= 0 ? '+' : ''}${result.profit}
                        </p>
                        <p className="text-xs text-zinc-500">profit</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                        <Percent className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                        <p className="text-lg font-semibold text-white">×{result.priceMultiplier}</p>
                        <p className="text-xs text-zinc-500">multiplier</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                        <Beaker className="h-5 w-5 text-purple-400" />
                    </div>
                    <div>
                        <p className="text-lg font-semibold text-white flex items-center gap-1">
                            {result.addictionRating}%
                            <span className="text-amber-400 text-xs" title="Addiction values are estimates and may not reflect actual in-game values">⚠️</span>
                        </p>
                        <p className="text-xs text-zinc-500">addiction*</p>
                    </div>
                </div>
            </div>

            {/* Effects */}
            <div className="p-6 border-b border-zinc-800/50">
                <h4 className="text-sm font-medium text-zinc-400 mb-3">
                    Final Effects ({result.effects.length}/8)
                </h4>
                <div className="flex flex-wrap gap-2">
                    {result.effects.length > 0 ? (
                        result.effects.map((effect, index) => (
                            <EffectBadge key={`${effect}-${index}`} effect={effect} showMultiplier />
                        ))
                    ) : (
                        <span className="text-sm text-zinc-500">No effects</span>
                    )}
                </div>
            </div>

            {/* Mix Steps */}
            {result.steps.length > 0 && (
                <div className="p-6 border-b border-zinc-800/50">
                    <h4 className="text-sm font-medium text-zinc-400 mb-3">Mix Steps</h4>
                    <div className="space-y-2">
                        {result.steps.map((step, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/30 border border-zinc-800"
                            >
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-700 text-xs font-medium text-zinc-300">
                                    {index + 1}
                                </span>
                                <span className="font-medium text-white">{step.ingredientName}</span>
                                <span className="text-zinc-500">→</span>
                                <span className={cn(
                                    'text-sm',
                                    step.action === 'transformed' ? 'text-purple-400' : 'text-green-400'
                                )}>
                                    {step.explanation}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Warnings */}
            {result.warnings.length > 0 && (
                <div className="p-6">
                    <h4 className="text-sm font-medium text-amber-400 mb-3 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Warnings
                    </h4>
                    <ul className="space-y-1">
                        {result.warnings.map((warning, index) => (
                            <li key={index} className="text-sm text-amber-300/80">
                                • {warning}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Disclaimer */}
            <div className="px-6 py-3 border-t border-zinc-800/50 bg-zinc-950/50">
                <p className="text-xs text-zinc-600">
                    *Addiction values are estimates and may not reflect actual in-game values.
                </p>
            </div>
        </div>
    );
}
