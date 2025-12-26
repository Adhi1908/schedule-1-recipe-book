'use client';

import { cn } from '@/lib/utils';
import { Check, AlertCircle, HelpCircle } from 'lucide-react';

interface ConfidenceIndicatorProps {
    level: 'confirmed' | 'unconfirmed';
    source?: string;
    lastUpdated?: string;
    size?: 'sm' | 'md';
    className?: string;
}

export default function ConfidenceIndicator({
    level,
    source,
    lastUpdated,
    size = 'md',
    className,
}: ConfidenceIndicatorProps) {
    const isConfirmed = level === 'confirmed';

    const sizeClasses = size === 'sm'
        ? 'px-2 py-1 text-xs gap-1'
        : 'px-3 py-1.5 text-sm gap-2';

    return (
        <div
            className={cn(
                'inline-flex items-center rounded-lg border',
                isConfirmed
                    ? 'bg-green-500/10 border-green-500/30 text-green-400'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-400',
                sizeClasses,
                className
            )}
        >
            {isConfirmed ? (
                <Check className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />
            ) : (
                <HelpCircle className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />
            )}
            <span className="font-medium">
                {isConfirmed ? 'Confirmed' : 'Unconfirmed'}
            </span>
            {source && (
                <>
                    <span className="opacity-50">•</span>
                    <span className="opacity-70">{source}</span>
                </>
            )}
            {lastUpdated && (
                <>
                    <span className="opacity-50">•</span>
                    <span className="opacity-70">{lastUpdated}</span>
                </>
            )}
        </div>
    );
}
