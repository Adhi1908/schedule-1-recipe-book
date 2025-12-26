'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Shield, Trash2, CheckCircle, XCircle, Search, Edit2, Save, X } from 'lucide-react';
import { getUserRecipes, deleteUserRecipe, toggleRecipeVerification, updateUserRecipe, UserRecipe } from '@/lib/recipeService';
import { cn } from '@/lib/utils';
import LoginModal from '@/components/auth/LoginModal';

export default function AdminPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [recipes, setRecipes] = useState<UserRecipe[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<{ name: string; description: string }>({ name: '', description: '' });
    const [showLoginModal, setShowLoginModal] = useState(false);

    // Fetch recipes
    const fetchRecipes = async () => {
        setIsLoading(true);
        try {
            const data = await getUserRecipes();
            setRecipes(data);
        } catch (error) {
            console.error('Failed to fetch recipes', error);
        } finally {
            setIsLoading(false);
        }
    };

    const ADMIN_EMAIL = 'aimbotgamers21@gmail.com';

    useEffect(() => {
        if (!loading) {
            if (!user) {
                setShowLoginModal(true);
            } else if (user.email === ADMIN_EMAIL) {
                fetchRecipes();
            }
        }
    }, [user, loading]);

    // Handlers
    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this recipe?')) return;
        try {
            await deleteUserRecipe(id);
            setRecipes(recipes.filter(r => r.id !== id));
        } catch (error) {
            alert('Failed to delete recipe');
        }
    };

    const handleToggleVerify = async (recipe: UserRecipe) => {
        if (!recipe.id) return;
        try {
            await toggleRecipeVerification(recipe.id, recipe.verified);
            setRecipes(recipes.map(r =>
                r.id === recipe.id ? { ...r, verified: !r.verified } : r
            ));
        } catch (error) {
            alert('Failed to update verification status');
        }
    };

    const startEdit = (recipe: UserRecipe) => {
        setEditingId(recipe.id || null);
        setEditForm({ name: recipe.name, description: recipe.description });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditForm({ name: '', description: '' });
    };

    const saveEdit = async (id: string) => {
        try {
            await updateUserRecipe(id, editForm);
            setRecipes(recipes.map(r =>
                r.id === id ? { ...r, ...editForm } : r
            ));
            setEditingId(null);
        } catch (error) {
            alert('Failed to update recipe');
        }
    };

    // Filter recipes
    const filteredRecipes = recipes.filter(r =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.userName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>;

    if (!user || user.email !== ADMIN_EMAIL) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-4">
                <div className="text-center">
                    <Shield className="h-16 w-16 text-zinc-700 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-white mb-2">Admin Access Required</h1>
                    <p className="text-zinc-500 mb-6">
                        {user ? 'Your account is not authorized.' : 'Please access with an admin account.'}
                    </p>
                    <button
                        onClick={() => setShowLoginModal(true)}
                        className="px-6 py-2 bg-green-500 rounded-lg text-white font-medium hover:bg-green-600 transition-colors"
                    >
                        {user ? 'Switch Account' : 'Login'}
                    </button>
                    {user && (
                        <button
                            onClick={() => router.push('/')}
                            className="block w-full mt-4 text-zinc-500 hover:text-white text-sm"
                        >
                            Return to Home
                        </button>
                    )}
                </div>
                <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                            <Shield className="h-6 w-6 text-red-500" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                            <p className="text-zinc-500">Manage community recipes</p>
                        </div>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                        <input
                            type="text"
                            placeholder="Search recipes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-red-500 w-64"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-zinc-900 border-b border-zinc-800 text-zinc-400">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Recipe Name</th>
                                    <th className="px-6 py-4 font-medium">Author</th>
                                    <th className="px-6 py-4 font-medium">Stats</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800">
                                {filteredRecipes.map((recipe) => (
                                    <tr key={recipe.id} className="hover:bg-zinc-900/50 transition-colors">
                                        <td className="px-6 py-4">
                                            {editingId === recipe.id ? (
                                                <div className="space-y-2">
                                                    <input
                                                        type="text"
                                                        value={editForm.name}
                                                        onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                                                        className="w-full px-2 py-1 bg-zinc-800 rounded border border-zinc-700 text-white"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={editForm.description}
                                                        onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                                                        className="w-full px-2 py-1 bg-zinc-800 rounded border border-zinc-700 text-zinc-400 text-xs"
                                                    />
                                                </div>
                                            ) : (
                                                <div>
                                                    <div className="font-medium text-white">{recipe.name}</div>
                                                    <div className="text-zinc-500 text-xs truncate max-w-[200px]">{recipe.description}</div>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-zinc-300">
                                            {recipe.userName}
                                        </td>
                                        <td className="px-6 py-4 text-zinc-400">
                                            {recipe.upvotes} upvotes
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleToggleVerify(recipe)}
                                                className={cn(
                                                    "px-2 py-1 rounded-full text-xs font-medium border transition-colors flex items-center gap-1 w-fit",
                                                    recipe.verified
                                                        ? "bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20"
                                                        : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700 hover:text-zinc-300"
                                                )}
                                            >
                                                {recipe.verified ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                                                {recipe.verified ? 'Verified' : 'Unverified'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {editingId === recipe.id ? (
                                                    <>
                                                        <button
                                                            onClick={() => saveEdit(recipe.id!)}
                                                            className="p-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20"
                                                            title="Save"
                                                        >
                                                            <Save className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={cancelEdit}
                                                            className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                                                            title="Cancel"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button
                                                        onClick={() => startEdit(recipe)}
                                                        className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
                                                        title="Edit"
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(recipe.id!)}
                                                    className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredRecipes.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                                            No recipes found matching your search.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
