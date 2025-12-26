'use client';

import { cn } from '@/lib/utils';
import { getEffectByName } from '@/lib/mixEngine';
import { Sparkles, Zap, Star, AlertTriangle } from 'lucide-react';

interface EffectBadgeProps {
    effect: string;
    showMultiplier?: boolean;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const tierConfig = {
    legendary: {
        bg: 'bg-gradient-to-r from-purple-500/20 to-pink-500/20',
        border: 'border-purple-500/50',
        text: 'text-purple-300',
        glow: 'shadow-purple-500/20',
        icon: Sparkles,
    },
    rare: {
        bg: 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20',
        border: 'border-blue-500/50',
        text: 'text-blue-300',
        glow: 'shadow-blue-500/20',
        icon: Zap,
    },
    common: {
        bg: 'bg-zinc-800/50',
        border: 'border-zinc-700',
        text: 'text-zinc-300',
        glow: '',
        icon: Star,
    },
    negative: {
        bg: 'bg-red-900/30',
        border: 'border-red-500/50',
        text: 'text-red-300',
        glow: 'shadow-red-500/20',
        icon: AlertTriangle,
    },
};

const sizeConfig = {
    sm: {
        padding: 'px-2 py-0.5',
        text: 'text-xs',
        icon: 'h-3 w-3',
        gap: 'gap-1',
    },
    md: {
        padding: 'px-3 py-1',
        text: 'text-sm',
        icon: 'h-4 w-4',
        gap: 'gap-1.5',
    },
    lg: {
        padding: 'px-4 py-1.5',
        text: 'text-base',
        icon: 'h-5 w-5',
        gap: 'gap-2',
    },
};

export default function EffectBadge({
    effect,
    showMultiplier = false,
    size = 'md',
    className,
}: EffectBadgeProps) {
    const effectData = getEffectByName(effect);
    const tier = effectData?.tier || 1;
    const multiplier = effectData?.multiplier || 1;

    const config = tierConfig.common; // Default fallback
    const sizeStyles = sizeConfig[size];
    const Icon = tier === 1 ? Star : (tier === 2 ? Star : (tier >= 3 ? Sparkles : Star));

    // Dynamic styles based on effect color
    const dynamicStyle = effectData?.color ? {
        borderColor: effectData.color + '80', // 50% opacity
        color: effectData.color,
        backgroundColor: effectData.color + '1A', // 10% opacity
        boxShadow: `0 0 10px ${effectData.color}1A`
    } : {};

    return (
        <div
            className={cn(
                'inline-flex items-center rounded-full border font-medium transition-all',
                !effectData?.color && config.bg,
                !effectData?.color && config.border,
                !effectData?.color && config.text,
                sizeStyles.padding,
                sizeStyles.text,
                sizeStyles.gap,
                className
            )}
            style={dynamicStyle}
            title={effectData?.description || effect}
        >
            <Icon className={sizeStyles.icon} />
            <span>{effect}</span>
            {showMultiplier && multiplier !== 1 && (
                <span className="opacity-70">×{multiplier}</span>
            )}
        </div>
    );
}
