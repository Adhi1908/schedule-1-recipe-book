'use client';

import { useState } from 'react';
import { X, Mail, Lock, User, Chrome } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [loading, setLoading] = useState(false);
    const [verificationSent, setVerificationSent] = useState(false);
    const { signIn, signUp, signInWithGoogle, error, clearError } = useAuth();

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isLogin) {
                await signIn(email, password);
                onClose();
            } else {
                await signUp(email, password, displayName);
                setVerificationSent(true);
            }
        } catch (err) {
            // Error is handled by AuthContext
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setLoading(true);
        try {
            await signInWithGoogle();
            onClose();
        } catch (err) {
            // Error is handled by AuthContext
        } finally {
            setLoading(false);
        }
    };

    const switchMode = () => {
        setIsLogin(!isLogin);
        clearError();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md p-6 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 shadow-2xl">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>

                {/* Header */}
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-white">
                        {verificationSent ? 'Check Your Email' : isLogin ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <p className="text-zinc-500 mt-1">
                        {verificationSent
                            ? `We sent a verification link to ${email}`
                            : isLogin ? 'Sign in to submit recipes' : 'Join the community'}
                    </p>
                </div>

                {verificationSent ? (
                    <div className="text-center">
                        <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-6">
                            <Mail className="h-8 w-8 text-green-400" />
                        </div>
                        <p className="text-zinc-400 text-sm mb-6">
                            Please click the link in the email to verify your account. Once verified, you can sign in.
                        </p>
                        <button
                            onClick={() => {
                                setVerificationSent(false);
                                setIsLogin(true);
                            }}
                            className="w-full py-3 rounded-xl bg-zinc-800 text-white font-medium hover:bg-zinc-700 transition-all"
                        >
                            Back to Sign In
                        </button>
                    </div>
                ) : (
                    <>

                        {/* Error display */}
                        {error && (
                            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {!isLogin && (
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                                    <input
                                        type="text"
                                        placeholder="Display Name"
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        required={!isLogin}
                                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-green-500 transition-colors"
                                    />
                                </div>
                            )}

                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-green-500 transition-colors"
                                />
                            </div>

                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-green-500 transition-colors"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold hover:from-green-600 hover:to-emerald-600 transition-all disabled:opacity-50"
                            >
                                {loading ? 'Loading...' : isLogin ? 'Sign In' : 'Create Account'}
                            </button>
                        </form>

                        {/* Switch mode */}
                        <p className="text-center text-zinc-500 mt-6">
                            {isLogin ? "Don't have an account?" : 'Already have an account?'}
                            <button
                                onClick={switchMode}
                                className="ml-2 text-green-400 hover:text-green-300 font-medium"
                            >
                                {isLogin ? 'Sign Up' : 'Sign In'}
                            </button>
                        </p>

                    </>
                )}
            </div>
        </div>
    );
}
