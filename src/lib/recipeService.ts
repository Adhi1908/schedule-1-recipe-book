'use client';

import {
    collection,
    addDoc,
    getDocs,
    query,
    orderBy,
    updateDoc,
    doc,
    increment,
    where,
    Timestamp,
    deleteDoc,
    getDoc
} from 'firebase/firestore';
import { db } from './firebase';

export interface UserRecipe {
    id?: string;
    userId: string;
    userName: string;
    name: string;
    description: string;
    baseProduct: string;
    ingredients: string[];
    createdAt: Date;
    upvotes: number;
    verified: boolean;
}

const RECIPES_COLLECTION = 'user_recipes';

// Submit a new recipe
export async function submitRecipe(recipe: Omit<UserRecipe, 'id' | 'createdAt' | 'upvotes' | 'verified'>): Promise<string> {
    try {
        const docRef = await addDoc(collection(db, RECIPES_COLLECTION), {
            ...recipe,
            createdAt: Timestamp.now(),
            upvotes: 0,
            verified: false
        });
        return docRef.id;
    } catch (error) {
        console.error('Error submitting recipe:', error);
        throw new Error('Failed to submit recipe');
    }
}

// Get all user recipes
export async function getUserRecipes(): Promise<UserRecipe[]> {
    try {
        const q = query(
            collection(db, RECIPES_COLLECTION),
            orderBy('upvotes', 'desc')
        );
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date()
        })) as UserRecipe[];
    } catch (error) {
        console.error('Error fetching recipes:', error);
        return [];
    }
}

// Get recipes by user ID
export async function getRecipesByUser(userId: string): Promise<UserRecipe[]> {
    try {
        const q = query(
            collection(db, RECIPES_COLLECTION),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date()
        })) as UserRecipe[];
    } catch (error) {
        console.error('Error fetching user recipes:', error);
        return [];
    }
}

// Upvote a recipe
export async function upvoteRecipe(recipeId: string): Promise<void> {
    try {
        const recipeRef = doc(db, RECIPES_COLLECTION, recipeId);
        await updateDoc(recipeRef, {
            upvotes: increment(1)
        });
    } catch (error) {
        console.error('Error upvoting recipe:', error);
        throw new Error('Failed to upvote recipe');
    }
}

// Delete a recipe (Admin)
export async function deleteUserRecipe(recipeId: string): Promise<void> {
    try {
        await deleteDoc(doc(db, RECIPES_COLLECTION, recipeId));
    } catch (error) {
        console.error('Error deleting recipe:', error);
        throw new Error('Failed to delete recipe');
    }
}

// Update a recipe (Admin)
export async function updateUserRecipe(recipeId: string, updates: Partial<UserRecipe>): Promise<void> {
    try {
        const recipeRef = doc(db, RECIPES_COLLECTION, recipeId);
        await updateDoc(recipeRef, updates);
    } catch (error) {
        console.error('Error updating recipe:', error);
        throw new Error('Failed to update recipe');
    }
}

// Toggle verification status (Admin)
export async function toggleRecipeVerification(recipeId: string, currentStatus: boolean): Promise<void> {
    try {
        const recipeRef = doc(db, RECIPES_COLLECTION, recipeId);
        await updateDoc(recipeRef, {
            verified: !currentStatus
        });
    } catch (error) {
        console.error('Error toggling verification:', error);
        throw new Error('Failed to toggle verification');
    }
}
