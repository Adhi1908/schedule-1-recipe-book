'use client';

import { getAllProducts, getAllIngredients, calculateMix } from './mixEngine';
import type { Product, Ingredient, MixResult } from './types';

// Inventory types
export interface InventoryItem {
    id: string;
    quantity: number;
}

export interface Inventory {
    products: InventoryItem[];
    ingredients: InventoryItem[];
}

// Recommendation result
export interface Recommendation {
    baseProduct: Product;
    ingredients: Ingredient[];
    result: MixResult;
    ingredientsUsed: { ingredient: Ingredient; count: number }[];
    score: number;
    reason: string;
}

// Goal categories with descriptions
export const GOAL_CATEGORIES = {
    // === PROFIT & VALUE ===
    'best-profit': {
        name: 'Best Profit',
        description: 'Highest profit margin (selling price - ingredient cost)',
        icon: '💰',
        category: 'Money'
    },
    'highest-value': {
        name: 'Highest Sell Price',
        description: 'Maximum final selling price (best for maximizing income)',
        icon: '💎',
        category: 'Money'
    },
    'max-multiplier-profit': {
        name: 'Max Multiplier + Profit',
        description: 'Highest price multiplier combined with profit',
        icon: '📈',
        category: 'Money'
    },
    'best-roi': {
        name: 'Best ROI',
        description: 'Best return on investment (profit / cost ratio)',
        icon: '📈',
        category: 'Money'
    },
    'cheapest-to-make': {
        name: 'Cheapest to Make',
        description: 'Lowest ingredient cost while still profitable',
        icon: '🏷️',
        category: 'Money'
    },

    // === EFFECTS ===
    'most-effects': {
        name: 'Most Effects',
        description: 'Maximum number of effects on final product',
        icon: '✨',
        category: 'Effects'
    },
    'legendary-hunter': {
        name: 'Legendary Hunter',
        description: 'Prioritizes mixes with legendary-tier effects',
        icon: '👑',
        category: 'Effects'
    },
    'rare-collector': {
        name: 'Rare Collector',
        description: 'Prioritizes mixes with rare-tier effects',
        icon: '💫',
        category: 'Effects'
    },
    'highest-multiplier': {
        name: 'Highest Multiplier',
        description: 'Maximum price multiplier from effects',
        icon: '⚡',
        category: 'Effects'
    },

    // === GAMEPLAY ===
    'highest-addiction': {
        name: 'Highest Addiction',
        description: 'Maximum addiction rating for repeat customers',
        icon: '🔥',
        category: 'Gameplay'
    },
    'balanced': {
        name: 'Balanced Build',
        description: 'Good profit with multiple effects and decent addiction',
        icon: '⚖️',
        category: 'Gameplay'
    },
    'beginner-friendly': {
        name: 'Beginner Friendly',
        description: 'Simple mixes with 1-2 ingredients, good profit',
        icon: '🌱',
        category: 'Gameplay'
    },
    'min-ingredients': {
        name: 'Minimum Ingredients',
        description: 'Best result with fewest ingredients',
        icon: '🎯',
        category: 'Gameplay'
    },

    // === SPECIAL BUILDS ===
    'speed-build': {
        name: 'Speed Build',
        description: 'Prioritizes Athletic and movement-related effects',
        icon: '🏃',
        category: 'Special'
    },
    'transformation-master': {
        name: 'Transformation Master',
        description: 'Maximizes effect transformations for complex mixes',
        icon: '🔄',
        category: 'Special'
    },
} as const;

export type GoalType = keyof typeof GOAL_CATEGORIES;

// Get effect tier from effects data
function getEffectTier(effectName: string): string {
    const effectsData = require('@/data/effects.json');
    const effect = effectsData.effects.find((e: { name: string }) =>
        e.name.toLowerCase() === effectName.toLowerCase()
    );
    return effect?.tier || 'common';
}

// Calculate score based on goal
function calculateScore(result: MixResult, goal: GoalType, ingredientCount: number): { score: number; reason: string } {
    if (!result.isValid) return { score: -Infinity, reason: 'Invalid mix' };

    switch (goal) {
        case 'best-profit':
            return {
                score: result.profit,
                reason: `$${result.profit} profit`
            };

        case 'highest-value':
            return {
                score: result.finalPrice * 10 + result.profit,
                reason: `$${result.finalPrice} sell price, $${result.profit} profit`
            };

        case 'max-multiplier-profit':
            return {
                score: (result.priceMultiplier * 100) + result.profit,
                reason: `×${result.priceMultiplier.toFixed(2)} multiplier, $${result.profit} profit`
            };

        case 'best-roi':
            const roi = result.totalCost > 0 ? (result.profit / result.totalCost) * 100 : 0;
            return {
                score: roi,
                reason: `${roi.toFixed(0)}% return on investment`
            };

        case 'cheapest-to-make':
            // Invert cost but only if profitable
            const costScore = result.profit > 0 ? 1000 - result.totalCost : -Infinity;
            return {
                score: costScore,
                reason: `$${result.totalCost} cost, $${result.profit} profit`
            };

        case 'most-effects':
            return {
                score: result.effects.length,
                reason: `${result.effects.length} effects`
            };

        case 'legendary-hunter': {
            const legendaryCount = result.effects.filter(e => getEffectTier(e) === 'legendary').length;
            return {
                score: legendaryCount * 100 + result.profit,
                reason: `${legendaryCount} legendary effect(s)`
            };
        }

        case 'rare-collector': {
            const rareCount = result.effects.filter(e => getEffectTier(e) === 'rare').length;
            return {
                score: rareCount * 100 + result.profit,
                reason: `${rareCount} rare effect(s)`
            };
        }

        case 'highest-multiplier':
            return {
                score: result.priceMultiplier,
                reason: `${result.priceMultiplier}x price multiplier`
            };

        case 'highest-addiction':
            return {
                score: result.addictionRating,
                reason: `${result.addictionRating}% addiction`
            };

        case 'balanced': {
            // Weighted score of profit, effects, and addiction
            const balancedScore = (result.profit * 0.4) + (result.effects.length * 20) + (result.addictionRating * 0.3);
            return {
                score: balancedScore,
                reason: `$${result.profit} profit, ${result.effects.length} effects, ${result.addictionRating}% addiction`
            };
        }

        case 'beginner-friendly':
            // Prefer 1-2 ingredients with good profit
            const beginnerScore = ingredientCount <= 2 ? result.profit + 100 : result.profit - (ingredientCount * 20);
            return {
                score: beginnerScore,
                reason: `${ingredientCount} ingredient(s), $${result.profit} profit`
            };

        case 'min-ingredients':
            // Maximize profit while minimizing ingredients
            const minIngScore = result.profit - (ingredientCount * 50);
            return {
                score: minIngScore,
                reason: `${ingredientCount} ingredient(s) for $${result.profit} profit`
            };

        case 'speed-build': {
            const speedEffects = ['Athletic', 'Energizing', 'Electrifying'];
            const speedCount = result.effects.filter(e =>
                speedEffects.some(se => e.toLowerCase().includes(se.toLowerCase()))
            ).length;
            return {
                score: speedCount * 100 + result.profit,
                reason: `${speedCount} speed effect(s)`
            };
        }

        case 'transformation-master': {
            // Count transformations in steps
            const transformCount = result.steps.filter(s => s.action === 'transformed').length;
            return {
                score: transformCount * 50 + result.profit,
                reason: `${transformCount} transformation(s)`
            };
        }

        default:
            return { score: result.profit, reason: `$${result.profit} profit` };
    }
}

// Generate combinations of ingredients up to maxLength
function* generateCombinations<T>(array: T[], maxLength: number): Generator<T[]> {
    const n = array.length;

    // Generate all combinations from 1 to maxLength ingredients
    for (let len = 1; len <= Math.min(maxLength, n); len++) {
        const indices = Array.from({ length: len }, (_, i) => i);

        while (true) {
            yield indices.map(i => array[i]);

            // Find rightmost index that can be incremented
            let i = len - 1;
            while (i >= 0 && indices[i] === n - len + i) i--;

            if (i < 0) break;

            indices[i]++;
            for (let j = i + 1; j < len; j++) {
                indices[j] = indices[j - 1] + 1;
            }
        }
    }
}

// Main optimization function
export function findOptimalMixes(
    inventory: Inventory,
    goal: GoalType,
    topN: number = 5
): Recommendation[] {
    const allProducts = getAllProducts();
    const allIngredients = getAllIngredients();

    // Get owned products and ingredients
    const ownedProducts = inventory.products
        .filter(p => p.quantity > 0)
        .map(p => allProducts.find(prod => prod.id === p.id))
        .filter(Boolean) as Product[];

    const ownedIngredients = inventory.ingredients
        .filter(i => i.quantity > 0)
        .map(i => ({
            ingredient: allIngredients.find(ing => ing.id === i.id)!,
            quantity: i.quantity
        }))
        .filter(item => item.ingredient);

    if (ownedProducts.length === 0) {
        return [];
    }

    const recommendations: Recommendation[] = [];
    // Max 4 ingredients for performance (more causes exponential slowdown)
    const maxIngredientsPerMix = 4;

    // For each owned product
    for (const product of ownedProducts) {
        // Try base product alone
        const baseResult = calculateMix(product.id, []);
        if (baseResult.isValid) {
            const { score, reason } = calculateScore(baseResult, goal, 0);
            recommendations.push({
                baseProduct: product,
                ingredients: [],
                result: baseResult,
                ingredientsUsed: [],
                score,
                reason
            });
        }

        // If we have ingredients, try combinations
        if (ownedIngredients.length > 0) {
            // Create ingredient pool - limit to 2 of each type maxfor performance
            const ingredientPool: Ingredient[] = [];
            for (const item of ownedIngredients) {
                for (let i = 0; i < Math.min(item.quantity, 2); i++) {
                    ingredientPool.push(item.ingredient);
                }
            }

            // Generate combinations with a hard limit to prevent lag
            let combinationsProcessed = 0;
            const MAX_COMBINATIONS = 500; // Hard limit for performance

            for (const combo of generateCombinations(ingredientPool, maxIngredientsPerMix)) {
                if (combinationsProcessed >= MAX_COMBINATIONS) break;
                combinationsProcessed++;

                const ingredientIds = combo.map(ing => ing.id);
                const result = calculateMix(product.id, ingredientIds);

                if (result.isValid) {
                    const { score, reason } = calculateScore(result, goal, combo.length);

                    // Count ingredients used
                    const usedMap = new Map<string, { ingredient: Ingredient; count: number }>();
                    for (const ing of combo) {
                        if (usedMap.has(ing.id)) {
                            usedMap.get(ing.id)!.count++;
                        } else {
                            usedMap.set(ing.id, { ingredient: ing, count: 1 });
                        }
                    }

                    recommendations.push({
                        baseProduct: product,
                        ingredients: combo,
                        result,
                        ingredientsUsed: Array.from(usedMap.values()),
                        score,
                        reason
                    });
                }
            }
        }
    }

    // Sort by score descending and take top N
    recommendations.sort((a, b) => b.score - a.score);

    // Remove duplicates (same product + same ingredients)
    const seen = new Set<string>();
    const unique: Recommendation[] = [];

    for (const rec of recommendations) {
        const key = `${rec.baseProduct.id}:${rec.ingredients.map(i => i.id).sort().join(',')}`;
        if (!seen.has(key)) {
            seen.add(key);
            unique.push(rec);
        }
        if (unique.length >= topN) break;
    }

    return unique;
}

// Get goal categories grouped by category
export function getGroupedGoals(): Record<string, { key: GoalType; data: typeof GOAL_CATEGORIES[GoalType] }[]> {
    const groups: Record<string, { key: GoalType; data: typeof GOAL_CATEGORIES[GoalType] }[]> = {};

    for (const [key, data] of Object.entries(GOAL_CATEGORIES) as [GoalType, typeof GOAL_CATEGORIES[GoalType]][]) {
        if (!groups[data.category]) {
            groups[data.category] = [];
        }
        groups[data.category].push({ key, data });
    }

    return groups;
}
