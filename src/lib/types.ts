// Type definitions for Schedule 1 Mixer

export interface Product {
  id: string;
  name: string;
  category: 'weed' | 'meth' | 'cocaine';
  defaultEffect?: string; // Some products like Meth/Cocaine have no default effect
  basePrice: number;
  addictionModifier: number;  // Base addiction for product (e.g., Meth: 0.6, Cocaine: 0.4, Weed: 0)
  description?: string;
  unlockRequirement?: string;
  patchVersion?: string;
  confidence?: 'confirmed' | 'unconfirmed';
  source?: string;
}

export interface Ingredient {
  id: string;
  name: string;
  defaultEffect: string;
  cost: number;
  source: string;
  patchVersion: string;
  confidence: 'confirmed' | 'unconfirmed';
}

export interface Effect {
  id: string;
  name: string;
  multiplier: number;
  addictionModifier: number;
  description: string;
  tier: number;
  color?: string;
  confidence?: 'confirmed' | 'unconfirmed';
}

export interface TransformationRule {
  if: string;
  becomes: string;
}

export interface IngredientTransformation {
  default: string;
  rules: TransformationRule[];
  confidence: 'confirmed' | 'unconfirmed';
  source: string;
}

export interface Transformations {
  [ingredientId: string]: IngredientTransformation;
}

export interface TransformationsData {
  transformations: Transformations;
  meta: {
    maxEffects: number;
    patchVersion: string;
    lastUpdated: string;
  };
}

export interface MixStep {
  ingredientName: string;
  ingredientId: string;
  action: 'added' | 'transformed';
  effectBefore?: string;
  effectAfter: string;
  explanation: string;
}

export interface MixResult {
  isValid: boolean;
  effects: string[];
  basePrice: number;
  finalPrice: number;
  priceMultiplier: number;
  totalCost: number;
  profit: number;
  addictionRating: number;
  steps: MixStep[];
  warnings: string[];
  productName: string;
}

export interface Recipe {
  id: string;
  name: string;
  baseProduct: string;
  ingredients: string[];
  finalEffects: string[];
  estimatedPrice: number;
  confidence: 'confirmed' | 'unconfirmed';
  source: string;
  patchVersion: string;
}
