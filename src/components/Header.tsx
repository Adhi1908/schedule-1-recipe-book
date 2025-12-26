'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Beaker, BookOpen, FlaskConical, Leaf, Menu, X, Target, User, LogOut } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import LoginModal from '@/components/auth/LoginModal';

const navigation = [
    { name: 'Mix Builder', href: '/mix-builder', icon: Beaker },
    { name: 'Recipes', href: '/recipes', icon: BookOpen },
    { name: 'Optimizer', href: '/optimizer', icon: Target },
    { name: 'Ingredients', href: '/ingredients', icon: FlaskConical },
    { name: 'Base Products', href: '/bases', icon: Leaf },
];

export default function Header() {
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const { user, logout, loading } = useAuth();

    const handleLogout = async () => {
        await logout();
        setShowUserMenu(false);
    };

    return (
        <>
            <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-950/95 backdrop-blur supports-[backdrop-filter]:bg-zinc-950/80">
                <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/20">
                            <Beaker className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-lg font-bold text-white group-hover:text-green-400 transition-colors">
                                Schedule 1
                            </span>
                            <span className="text-[10px] font-medium text-zinc-500 -mt-1">
                                MIXER
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex md:items-center md:gap-1">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                                        isActive
                                            ? 'bg-green-500/10 text-green-400 shadow-inner'
                                            : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                                    )}
                                >
                                    <Icon className="h-4 w-4" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Right side - Auth & Version */}
                    <div className="hidden lg:flex items-center gap-3">
                        {/* Version Badge */}
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-800/50 border border-zinc-700">
                            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-xs font-medium text-zinc-400">
                                Patch 0.3
                            </span>
                        </div>

                        {/* Auth Button */}
                        {!loading && (
                            <>
                                {user ? (
                                    <div className="relative">
                                        <button
                                            onClick={() => setShowUserMenu(!showUserMenu)}
                                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors"
                                        >
                                            <div className="h-6 w-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                                                <span className="text-xs font-bold text-white">
                                                    {user.displayName?.[0] || user.email?.[0] || 'U'}
                                                </span>
                                            </div>
                                            <span className="text-sm font-medium text-white max-w-[100px] truncate">
                                                {user.displayName || 'User'}
                                            </span>
                                        </button>

                                        {showUserMenu && (
                                            <div className="absolute right-0 top-full mt-2 w-48 py-2 rounded-lg bg-zinc-800 border border-zinc-700 shadow-xl">
                                                <div className="px-4 py-2 border-b border-zinc-700">
                                                    <p className="text-sm font-medium text-white truncate">
                                                        {user.displayName || 'User'}
                                                    </p>
                                                    <p className="text-xs text-zinc-500 truncate">
                                                        {user.email}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full flex items-center gap-2 px-4 py-2 text-left text-sm text-red-400 hover:bg-zinc-700 transition-colors"
                                                >
                                                    <LogOut className="h-4 w-4" />
                                                    Sign Out
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setShowLoginModal(true)}
                                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium hover:from-green-600 hover:to-emerald-600 transition-all"
                                    >
                                        <User className="h-4 w-4" />
                                        Login
                                    </button>
                                )}
                            </>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <button
                        type="button"
                        className="md:hidden p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? (
                            <X className="h-6 w-6" />
                        ) : (
                            <Menu className="h-6 w-6" />
                        )}
                    </button>
                </nav>

                {/* Mobile menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden border-t border-zinc-800 bg-zinc-950">
                        <div className="space-y-1 px-4 py-3">
                            {navigation.map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={cn(
                                            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                                            isActive
                                                ? 'bg-green-500/10 text-green-400'
                                                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                                        )}
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <Icon className="h-5 w-5" />
                                        {item.name}
                                    </Link>
                                );
                            })}

                            {/* Mobile Auth */}
                            {!loading && (
                                <div className="pt-3 border-t border-zinc-800">
                                    {user ? (
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-zinc-800/50 w-full"
                                        >
                                            <LogOut className="h-5 w-5" />
                                            Sign Out ({user.displayName || 'User'})
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                setMobileMenuOpen(false);
                                                setShowLoginModal(true);
                                            }}
                                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-green-400 hover:bg-zinc-800/50 w-full"
                                        >
                                            <User className="h-5 w-5" />
                                            Login / Sign Up
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </header>

            {/* Login Modal */}
            <LoginModal
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
            />
        </>
    );
}
