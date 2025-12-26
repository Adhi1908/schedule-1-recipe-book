// Mix Engine - Deterministic mixing calculation for Schedule 1

import productsData from '@/data/products.json';
import ingredientsData from '@/data/ingredients.json';
import effectsData from '@/data/effects.json';
import transformationsData from '@/data/transformations.json';
import productNamesData from '@/data/productNames.json';
import type { Product, Ingredient, Effect, MixResult, MixStep } from './types';

// JSON files are plain arrays, not wrapped objects
const products = productsData as unknown as Product[];
const ingredients = ingredientsData as unknown as Ingredient[];
const effects = effectsData as unknown as Effect[];
// transformations.json is a plain object mapping ingredient names to transformation rules
const transformations = transformationsData as unknown as Record<string, Array<{ ifPresent: string[], ifNotPresent: string[], replace: Record<string, string> }>>;
const MAX_EFFECTS = 8;  // Max effects in Schedule 1
const productNames = productNamesData.productNames;

// Helper functions
export function getProductById(id: string): Product | undefined {
    return products.find(p => p.id === id);
}

export function getIngredientById(id: string): Ingredient | undefined {
    return ingredients.find(i => i.id === id);
}

export function getEffectByName(name: string): Effect | undefined {
    return effects.find(e => e.name.toLowerCase() === name.toLowerCase());
}

export function getEffectById(id: string): Effect | undefined {
    return effects.find(e => e.id === id);
}

export function getAllProducts(): Product[] {
    return products;
}

export function getAllIngredients(): Ingredient[] {
    return ingredients;
}

export function getAllEffects(): Effect[] {
    return effects;
}

// Normalize effect name for consistent comparison
function normalizeEffectName(name: string): string {
    return name.toLowerCase().replace(/[^a-z]/g, '');
}

// Check if an effect exists in the current effects list
function hasEffect(currentEffects: string[], effectName: string): boolean {
    const normalized = normalizeEffectName(effectName);
    return currentEffects.some(e => normalizeEffectName(e) === normalized);
}

// Remove an effect from the list
function removeEffect(currentEffects: string[], effectName: string): string[] {
    const normalized = normalizeEffectName(effectName);
    return currentEffects.filter(e => normalizeEffectName(e) !== normalized);
}

/**
 * Generate a product name based on effects and base product category
 * This mimics the in-game naming system
 */
export function generateProductName(effectsList: string[], category: 'weed' | 'meth' | 'cocaine'): string {
    // First, check for known exact effect combinations
    const knownNames = productNames.knownProductNames?.names || [];
    for (const known of knownNames) {
        const knownEffects = known.effects.map((e: string) => normalizeEffectName(e)).sort();
        const currentEffects = effectsList.map(e => normalizeEffectName(e)).sort();

        // Check if effects match (order doesn't matter)
        if (knownEffects.length === currentEffects.length &&
            knownEffects.every((e: string, i: number) => e === currentEffects[i])) {
            return known.name;
        }
    }

    // If no exact match, generate a name based on the most prominent effects
    const namingRules = productNames.namingRules || [];
    const suffixes = productNames.nameSuffixes?.[category] || ['Mix'];

    let prefix = '';

    // Find the first matching effect prefix (prioritize rare/legendary effects)
    const priorityEffects = ['Anti-Gravity', 'Zombifying', 'Glowing', 'Electrifying', 'Cyclopean', 'Shrinking'];

    // First try priority effects
    for (const priorityEffect of priorityEffects) {
        if (effectsList.some(e => normalizeEffectName(e) === normalizeEffectName(priorityEffect))) {
            const rule = namingRules.find((r: { effects: string[] }) =>
                r.effects.some((re: string) => normalizeEffectName(re) === normalizeEffectName(priorityEffect))
            );
            if (rule && rule.namePrefix && rule.namePrefix.length > 0) {
                prefix = rule.namePrefix[0];
                break;
            }
        }
    }

    // If no priority effect found, use the first effect
    if (!prefix && effectsList.length > 0) {
        for (const effect of effectsList) {
            const rule = namingRules.find((r: { effects: string[] }) =>
                r.effects.some((re: string) => normalizeEffectName(re) === normalizeEffectName(effect))
            );
            if (rule && rule.namePrefix && rule.namePrefix.length > 0) {
                prefix = rule.namePrefix[0];
                break;
            }
        }
    }

    // Default prefix if nothing found
    if (!prefix) {
        prefix = 'Custom';
    }

    // Pick a suffix based on category
    const suffix = suffixes[Math.floor(effectsList.length % suffixes.length)];

    return `${prefix} ${suffix}`;
}

/**
 * Calculate the result of mixing a base product with ingredients
 * This is the core deterministic engine
 */
export function calculateMix(
    baseProductId: string,
    ingredientIds: string[]
): MixResult {
    const baseProduct = getProductById(baseProductId);

    if (!baseProduct) {
        return {
            isValid: false,
            effects: [],
            basePrice: 0,
            finalPrice: 0,
            priceMultiplier: 1,
            totalCost: 0,
            profit: 0,
            addictionRating: 0,
            steps: [],
            warnings: ['Invalid base product selected'],
            productName: 'Unknown'
        };
    }

    // Start with base effects
    let currentEffects: string[] = [];
    if (baseProduct.defaultEffect) {
        currentEffects.push(baseProduct.defaultEffect);
    }
    const steps: MixStep[] = [];
    const warnings: string[] = [];
    let totalIngredientCost = 0;

    // Process each ingredient in order
    for (const ingredientId of ingredientIds) {
        const ingredient = getIngredientById(ingredientId);

        if (!ingredient) {
            warnings.push(`Unknown ingredient: ${ingredientId}`);
            continue;
        }

        totalIngredientCost += (ingredient as any).price || 0;

        // Look up transformation rules by ingredient NAME (not id)
        const transformationRules = transformations[ingredient.name];

        // Check if any current effect triggers a transformation
        let transformed = false;
        let step: MixStep | null = null;
        let transformedEffects: Array<{ from: string; to: string }> = [];

        // Phase 1: Apply ALL matching transformation rules
        // CRITICAL: Take a snapshot of effects BEFORE transformations to prevent within-step chaining
        // (e.g., Energizing→Paranoia→Balding should not happen in one step)
        if (transformationRules && Array.isArray(transformationRules)) {
            // Snapshot the current effects before ANY transformations for this ingredient
            const effectsSnapshot = [...currentEffects];

            // Collect all transformations that should apply based on the snapshot
            const transformsToApply: Array<{ from: string; to: string }> = [];

            for (const rule of transformationRules) {
                const ifPresent = rule.ifPresent || [];
                const ifNotPresent = rule.ifNotPresent || [];
                const replace = rule.replace || {};

                // Check conditions against the ORIGINAL snapshot
                const hasRequired = ifPresent.every((effect: string) => hasEffect(effectsSnapshot, effect));
                const notHasBlocked = ifNotPresent.every((effect: string) => !hasEffect(effectsSnapshot, effect));

                if (hasRequired && notHasBlocked) {
                    for (const [oldEffect, newEffect] of Object.entries(replace)) {
                        // Only transform effects that were in the snapshot
                        if (hasEffect(effectsSnapshot, oldEffect)) {
                            transformsToApply.push({ from: oldEffect, to: newEffect as string });
                        }
                    }
                }
            }

            // Now apply all collected transformations
            for (const transform of transformsToApply) {
                currentEffects = removeEffect(currentEffects, transform.from);
                if (currentEffects.length < MAX_EFFECTS && !hasEffect(currentEffects, transform.to)) {
                    currentEffects.push(transform.to);
                }
                transformedEffects.push(transform);
            }
        }

        // Phase 2: ALWAYS add default effect after transformations
        // This matches the game's actual behavior - transformation AND default effect
        const defaultEffect = (ingredient as any).effect || '';
        let addedDefault = false;
        if (defaultEffect && currentEffects.length < MAX_EFFECTS && !hasEffect(currentEffects, defaultEffect)) {
            currentEffects.push(defaultEffect);
            addedDefault = true;
        }

        // Create step for logging
        if (transformedEffects.length > 0) {
            const transformExplanation = transformedEffects
                .map(t => `${t.from} → ${t.to}`)
                .join(', ');
            step = {
                ingredientName: ingredient.name,
                ingredientId: ingredient.id,
                action: 'transformed',
                effectBefore: transformedEffects[0].from,
                effectAfter: transformedEffects[0].to,
                explanation: transformExplanation + (addedDefault ? ` + Added ${defaultEffect}` : '')
            };
        } else if (addedDefault) {
            step = {
                ingredientName: ingredient.name,
                ingredientId: ingredient.id,
                action: 'added',
                effectAfter: defaultEffect,
                explanation: `Added ${defaultEffect}`
            };
        } else if (defaultEffect) {
            step = {
                ingredientName: ingredient.name,
                ingredientId: ingredient.id,
                action: 'added',
                effectAfter: defaultEffect,
                explanation: `${defaultEffect} (already present, no change)`
            };
            warnings.push(`${ingredient.name}: ${defaultEffect} already present`);
        } else if (!defaultEffect) {
            warnings.push(`No default effect for: ${ingredient.name}`);
        }

        if (step) {
            steps.push(step);
        }
    }

    // Calculate final price and addiction rating
    // Calculate final price using the game formula:
    // Sell Price = BasePrice * (1 + SumOfEffectMultipliers)
    let effectMultiplierSum = 0;

    // Start with base product addiction (e.g., Meth: 0.6, Cocaine: 0.4, Weed: 0)
    let addictionRating = (baseProduct as any).addictionModifier || 0;

    // Add addiction modifiers from effects and sum multipliers
    for (const effectName of currentEffects) {
        const effect = getEffectByName(effectName);
        if (effect) {
            effectMultiplierSum += effect.multiplier;
            addictionRating += effect.addictionModifier;
        }
    }

    // Convert to percentage and round to 2 decimal places
    // Formula: Total Addiction = Base Product Addiction + Sum(Effect Addiction Modifiers)
    // Cap at 100%
    const addictionPercentage = Math.round(Math.min(addictionRating, 1) * 100 * 100) / 100;

    const priceMultiplier = 1 + effectMultiplierSum;
    const finalPrice = Math.round(baseProduct.basePrice * priceMultiplier);
    const totalCost = totalIngredientCost; // Only ingredient costs, not base product
    const profit = finalPrice - totalCost;

    // Generate product name based on effects
    // If no ingredients added, use base product name
    const generatedName = ingredientIds.length > 0
        ? generateProductName(currentEffects, baseProduct.category as 'weed' | 'meth' | 'cocaine')
        : baseProduct.name;

    return {
        isValid: true,
        effects: currentEffects,
        basePrice: baseProduct.basePrice,
        finalPrice,
        priceMultiplier: Math.round(priceMultiplier * 100) / 100,
        totalCost,
        profit,
        addictionRating: addictionPercentage,
        steps,
        warnings,
        productName: generatedName
    };
}

/**
 * Find recipes that produce a specific effect combination
 * Used for reverse lookup
 */
export function findRecipesByEffects(targetEffects: string[]): {
    baseProduct: Product;
    ingredients: Ingredient[];
    result: MixResult;
}[] {
    const results: {
        baseProduct: Product;
        ingredients: Ingredient[];
        result: MixResult;
    }[] = [];

    // This is a simplified reverse lookup
    // For full reverse lookup, we'd need to brute-force or use a pre-computed index
    // For now, return empty as this requires extensive computation

    return results;
}

/**
 * Validate if an ingredient can be added to the current mix
 */
export function canAddIngredient(
    currentIngredients: string[],
    newIngredientId: string
): { valid: boolean; reason?: string } {
    // Check if ingredient exists
    const ingredient = getIngredientById(newIngredientId);
    if (!ingredient) {
        return { valid: false, reason: 'Ingredient not found' };
    }

    // Currently no restriction on duplicates in the game
    // but we can add validation rules here if needed

    return { valid: true };
}

/**
 * Get suggested ingredients based on current effects
 */
export function getSuggestedIngredients(currentEffects: string[]): {
    ingredient: Ingredient;
    potentialResult: string;
    type: 'transform' | 'add';
}[] {
    const suggestions: {
        ingredient: Ingredient;
        potentialResult: string;
        type: 'transform' | 'add';
    }[] = [];

    for (const ingredient of ingredients) {
        // Look up transformation rules by ingredient NAME
        const transformationRules = transformations[ingredient.name];
        const defaultEffect = (ingredient as any).effect || '';

        let foundTransformation = false;

        if (transformationRules && Array.isArray(transformationRules)) {
            // Check for transformations
            for (const rule of transformationRules) {
                const ifPresent = rule.ifPresent || [];
                const ifNotPresent = rule.ifNotPresent || [];
                const replace = rule.replace || {};

                // Check if conditions would be met
                const hasRequired = ifPresent.every((effect: string) => hasEffect(currentEffects, effect));
                const notHasBlocked = ifNotPresent.every((effect: string) => !hasEffect(currentEffects, effect));

                if (hasRequired && notHasBlocked) {
                    // Get the first replacement
                    const entries = Object.entries(replace);
                    if (entries.length > 0) {
                        const [oldEffect, newEffect] = entries[0];
                        suggestions.push({
                            ingredient,
                            potentialResult: `${oldEffect} → ${newEffect}`,
                            type: 'transform'
                        });
                        foundTransformation = true;
                        break;
                    }
                }
            }
        }

        // If no transformation would apply, show default effect
        if (!foundTransformation && defaultEffect) {
            suggestions.push({
                ingredient,
                potentialResult: `Add ${defaultEffect}`,
                type: 'add'
            });
        }
    }

    return suggestions;
}
