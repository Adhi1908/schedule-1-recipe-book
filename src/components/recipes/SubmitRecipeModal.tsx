'use client';

import { useState } from 'react';
import { X, Plus, Trash2, Beaker, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { submitRecipe } from '@/lib/recipeService';
import { getAllProducts, getAllIngredients, calculateMix } from '@/lib/mixEngine';
import { cn } from '@/lib/utils';

interface SubmitRecipeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmitted: () => void;
}

export default function SubmitRecipeModal({ isOpen, onClose, onSubmitted }: SubmitRecipeModalProps) {
    const { user } = useAuth();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [baseProduct, setBaseProduct] = useState('');
    const [ingredients, setIngredients] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const products = getAllProducts();
    const allIngredients = getAllIngredients();

    if (!isOpen) return null;

    const addIngredient = () => {
        if (ingredients.length < 8) {
            setIngredients([...ingredients, '']);
        }
    };

    const updateIngredient = (index: number, value: string) => {
        const newIngredients = [...ingredients];
        newIngredients[index] = value;
        setIngredients(newIngredients);
    };

    const removeIngredient = (index: number) => {
        setIngredients(ingredients.filter((_, i) => i !== index));
    };

    const getPreview = () => {
        if (!baseProduct || ingredients.length === 0) return null;
        const validIngredients = ingredients.filter(i => i);
        if (validIngredients.length === 0) return null;
        return calculateMix(baseProduct, validIngredients);
    };

    const preview = getPreview();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        const validIngredients = ingredients.filter(i => i);
        if (validIngredients.length === 0) {
            setError('Please add at least one ingredient');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await submitRecipe({
                userId: user.uid,
                userName: user.displayName || 'Anonymous',
                name,
                description,
                baseProduct,
                ingredients: validIngredients
            });
            setSuccess(true);
            setTimeout(() => {
                onSubmitted();
                onClose();
                // Reset form
                setName('');
                setDescription('');
                setBaseProduct('');
                setIngredients([]);
                setSuccess(false);
            }, 1500);
        } catch (err: any) {
            setError(err.message || 'Failed to submit recipe');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto py-8">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-2xl mx-4 p-6 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 shadow-2xl max-h-[90vh] overflow-y-auto">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>

                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                        <Beaker className="h-5 w-5 text-green-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">Submit Recipe</h2>
                        <p className="text-zinc-500">Share your mix with the community</p>
                    </div>
                </div>

                {/* Success state */}
                {success && (
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                            <Check className="h-8 w-8 text-green-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-white">Recipe Submitted!</h3>
                        <p className="text-zinc-500">Thanks for sharing with the community</p>
                    </div>
                )}

                {/* Form */}
                {!success && (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Error display */}
                        {error && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        {/* Recipe Name */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">Recipe Name</label>
                            <input
                                type="text"
                                placeholder="e.g., Ultimate Profit Mix"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-green-500 transition-colors"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">Description</label>
                            <textarea
                                placeholder="What makes this recipe special?"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={2}
                                className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-green-500 transition-colors resize-none"
                            />
                        </div>

                        {/* Base Product */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">Base Product</label>
                            <select
                                value={baseProduct}
                                onChange={(e) => setBaseProduct(e.target.value)}
                                required
                                className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-green-500 transition-colors"
                            >
                                <option value="">Select a product...</option>
                                {products.map(product => (
                                    <option key={product.id} value={product.id}>
                                        {product.name} (${product.basePrice})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Ingredients */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-sm font-medium text-zinc-400">Ingredients ({ingredients.length}/8)</label>
                                {ingredients.length < 8 && (
                                    <button
                                        type="button"
                                        onClick={addIngredient}
                                        className="flex items-center gap-1.5 text-sm text-green-400 hover:text-green-300"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Add Ingredient
                                    </button>
                                )}
                            </div>
                            <div className="space-y-2">
                                {ingredients.map((ing, index) => (
                                    <div key={index} className="flex gap-2">
                                        <select
                                            value={ing}
                                            onChange={(e) => updateIngredient(index, e.target.value)}
                                            className="flex-1 px-4 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-green-500 transition-colors"
                                        >
                                            <option value="">Select ingredient...</option>
                                            {allIngredients.map(ingredient => (
                                                <option key={`${index}-${ingredient.id}`} value={ingredient.id}>
                                                    {ingredient.name} (${ingredient.price})
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            type="button"
                                            onClick={() => removeIngredient(index)}
                                            className="p-2.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                                {ingredients.length === 0 && (
                                    <p className="text-zinc-500 text-sm py-3 text-center border border-dashed border-zinc-700 rounded-lg">
                                        Click "Add Ingredient" to start building your recipe
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Preview */}
                        {preview && preview.isValid && (
                            <div className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-700">
                                <h4 className="text-sm font-medium text-zinc-400 mb-2">Preview</h4>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-lg font-semibold text-white">{preview.productName}</p>
                                        <p className="text-sm text-zinc-500">{preview.effects.length} effects</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-green-400">${preview.finalPrice}</p>
                                        <p className="text-sm text-zinc-500">+${preview.profit} profit</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading || ingredients.length === 0}
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold hover:from-green-600 hover:to-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Submitting...' : 'Submit Recipe'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
