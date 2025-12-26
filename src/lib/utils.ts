import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function copyToClipboard(text: string): Promise<void> {
    return navigator.clipboard.writeText(text);
}

export function formatPrice(price: number): string {
    return `$${price.toLocaleString()}`;
}

export function formatPercentage(value: number): string {
    return `${value}%`;
}

export function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

export function generateMixUrl(baseProductId: string, ingredientIds: string[]): string {
    const params = new URLSearchParams();
    params.set('base', baseProductId);
    if (ingredientIds.length > 0) {
        params.set('ingredients', ingredientIds.join(','));
    }
    return `/mix-builder?${params.toString()}`;
}

export function parseMixUrl(searchParams: URLSearchParams): {
    baseProductId: string | null;
    ingredientIds: string[];
} {
    const baseProductId = searchParams.get('base');
    const ingredientsParam = searchParams.get('ingredients');
    const ingredientIds = ingredientsParam ? ingredientsParam.split(',') : [];

    return { baseProductId, ingredientIds };
}
