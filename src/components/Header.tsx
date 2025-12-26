'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Beaker, BookOpen, FlaskConical, Leaf, Menu, X, Target } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

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

    return (
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

                {/* Version Badge */}
                <div className="hidden lg:flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-800/50 border border-zinc-700">
                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-xs font-medium text-zinc-400">
                            Patch 0.3
                        </span>
                    </div>
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
                    </div>
                </div>
            )}
        </header>
    );
}
