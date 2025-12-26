// Mix Engine - Deterministic mixing calculation for Schedule 1

import productsData from '@/data/products.json';
import ingredientsData from '@/data/ingredients.json';
import effectsData from '@/data/effects.json';
import transformationsData from '@/data/transformations.json';
import productNamesData from '@/data/productNames.json';
import type { Product, Ingredient, Effect, MixResult, MixStep, Transformations } from './types';

const products = productsData.products as Product[];
const ingredients = ingredientsData.ingredients as Ingredient[];
const effects = effectsData.effects as Effect[];
const transformations = transformationsData.transformations as Transformations;
const MAX_EFFECTS = transformationsData.meta.maxEffects;
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
    let currentEffects = [...baseProduct.baseEffects];
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

        totalIngredientCost += ingredient.cost;
        const transformation = transformations[ingredientId];

        if (!transformation) {
            warnings.push(`No transformation data for: ${ingredient.name}`);
            continue;
        }

        // Check if any current effect triggers a transformation
        let transformed = false;
        let step: MixStep | null = null;

        for (const rule of transformation.rules) {
            if (hasEffect(currentEffects, rule.if)) {
                // Transform the matching effect
                currentEffects = removeEffect(currentEffects, rule.if);

                // Only add the new effect if we're under the max
                if (currentEffects.length < MAX_EFFECTS) {
                    currentEffects.push(rule.becomes);
                }

                step = {
                    ingredientName: ingredient.name,
                    ingredientId: ingredient.id,
                    action: 'transformed',
                    effectBefore: rule.if,
                    effectAfter: rule.becomes,
                    explanation: `${rule.if} → ${rule.becomes}`
                };
                transformed = true;
                break; // Only one transformation per ingredient
            }
        }

        // If no transformation occurred, add the default effect
        if (!transformed) {
            if (currentEffects.length < MAX_EFFECTS) {
                // Don't add duplicate effects
                if (!hasEffect(currentEffects, transformation.default)) {
                    currentEffects.push(transformation.default);
                    step = {
                        ingredientName: ingredient.name,
                        ingredientId: ingredient.id,
                        action: 'added',
                        effectAfter: transformation.default,
                        explanation: `Added ${transformation.default}`
                    };
                } else {
                    step = {
                        ingredientName: ingredient.name,
                        ingredientId: ingredient.id,
                        action: 'added',
                        effectAfter: transformation.default,
                        explanation: `${transformation.default} (already present, no change)`
                    };
                    warnings.push(`${ingredient.name}: ${transformation.default} already present`);
                }
            } else {
                warnings.push(`Max effects (${MAX_EFFECTS}) reached, ${ingredient.name} had no effect`);
                step = {
                    ingredientName: ingredient.name,
                    ingredientId: ingredient.id,
                    action: 'added',
                    effectAfter: 'None',
                    explanation: `Max effects reached - no change`
                };
            }
        }

        if (step) {
            steps.push(step);
        }
    }

    // Calculate final price and addiction rating
    let priceMultiplier = 1;
    let addictionRating = 0;

    for (const effectName of currentEffects) {
        const effect = getEffectByName(effectName);
        if (effect) {
            priceMultiplier *= effect.priceMultiplier;
            addictionRating += effect.addictionModifier;
        }
    }

    const finalPrice = Math.round(baseProduct.basePrice * priceMultiplier);
    const totalCost = baseProduct.basePrice + totalIngredientCost;
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
        addictionRating: Math.min(addictionRating, 100),
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
        const transformation = transformations[ingredient.id];
        if (!transformation) continue;

        // Check for transformations
        for (const rule of transformation.rules) {
            if (hasEffect(currentEffects, rule.if)) {
                suggestions.push({
                    ingredient,
                    potentialResult: `${rule.if} → ${rule.becomes}`,
                    type: 'transform'
                });
                break;
            }
        }

        // If no transformation, show default
        if (!suggestions.find(s => s.ingredient.id === ingredient.id)) {
            suggestions.push({
                ingredient,
                potentialResult: `Add ${transformation.default}`,
                type: 'add'
            });
        }
    }

    return suggestions;
}
