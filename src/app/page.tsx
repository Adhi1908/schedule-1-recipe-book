import Link from 'next/link';
import { Beaker, BookOpen, FlaskConical, Leaf, ArrowRight, Sparkles, Zap, Database } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="relative">
      {/* Background effects */}
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-green-500/10 via-emerald-500/5 to-transparent rounded-full blur-3xl" />

      <div className="relative">
        {/* Hero Section */}
        <section className="mx-auto max-w-7xl px-4 py-20 lg:px-8 lg:py-32">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 mb-8">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">Game-Accurate Data • Patch 0.3</span>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              <span className="text-white">Schedule 1</span>
              <br />
              <span className="gradient-text">Mixer</span>
            </h1>

            {/* Description */}
            <p className="mt-6 text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto">
              A fast, accurate lookup & simulation tool for Schedule 1 mixing mechanics.
              Build mixes, reverse-lookup recipes, and explore all ingredients.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/mix-builder"
                className="group flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all hover:scale-105"
              >
                <Beaker className="h-5 w-5" />
                Start Mixing
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/recipes"
                className="flex items-center gap-2 px-8 py-4 rounded-xl bg-zinc-800 border border-zinc-700 text-white font-semibold hover:bg-zinc-700 transition-all"
              >
                <BookOpen className="h-5 w-5" />
                Browse Recipes
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Mix Builder */}
            <Link
              href="/mix-builder"
              className="group p-6 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 hover:border-green-500/30 transition-all hover:shadow-xl hover:shadow-green-500/5"
            >
              <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-4 group-hover:bg-green-500/20 transition-colors">
                <Beaker className="h-6 w-6 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-green-400 transition-colors">
                Mix Builder
              </h3>
              <p className="text-sm text-zinc-500">
                Select base → add ingredients → see exact results. Real-time calculation with step-by-step breakdown.
              </p>
            </Link>

            {/* Recipe Lookup */}
            <Link
              href="/recipes"
              className="group p-6 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 hover:border-blue-500/30 transition-all hover:shadow-xl hover:shadow-blue-500/5"
            >
              <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
                <BookOpen className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
                Recipe Lookup
              </h3>
              <p className="text-sm text-zinc-500">
                Find popular recipes and high-value mixes. One-click copy to share or save.
              </p>
            </Link>

            {/* Ingredients */}
            <Link
              href="/ingredients"
              className="group p-6 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 hover:border-purple-500/30 transition-all hover:shadow-xl hover:shadow-purple-500/5"
            >
              <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4 group-hover:bg-purple-500/20 transition-colors">
                <FlaskConical className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-400 transition-colors">
                Ingredients
              </h3>
              <p className="text-sm text-zinc-500">
                Full catalog of all mixable ingredients, their effects, and transformation rules.
              </p>
            </Link>

            {/* Base Products */}
            <Link
              href="/bases"
              className="group p-6 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 hover:border-amber-500/30 transition-all hover:shadow-xl hover:shadow-amber-500/5"
            >
              <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-4 group-hover:bg-amber-500/20 transition-colors">
                <Leaf className="h-6 w-6 text-amber-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-amber-400 transition-colors">
                Base Products
              </h3>
              <p className="text-sm text-zinc-500">
                All strains and base products with their natural effects and unlock requirements.
              </p>
            </Link>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white">How It Works</h2>
            <p className="mt-2 text-zinc-500">Deterministic mixing with game-accurate data</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-800 border border-zinc-700 mb-4">
                <span className="text-2xl font-bold gradient-text">1</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Select Base</h3>
              <p className="text-sm text-zinc-500">
                Choose your starting product: OG Kush, Sour Diesel, Meth, or Cocaine
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-800 border border-zinc-700 mb-4">
                <span className="text-2xl font-bold gradient-text">2</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Add Ingredients</h3>
              <p className="text-sm text-zinc-500">
                Add ingredients in order. Watch effects transform or stack in real-time
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-800 border border-zinc-700 mb-4">
                <span className="text-2xl font-bold gradient-text">3</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Get Results</h3>
              <p className="text-sm text-zinc-500">
                See final effects, price, profit, and addiction rating instantly
              </p>
            </div>
          </div>
        </section>

        {/* Data Transparency */}
        <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
          <div className="rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 p-8">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                <Database className="h-6 w-6 text-amber-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Data Transparency</h3>
                <p className="text-sm text-zinc-400 mb-4">
                  All data is sourced from verified community resources. Each recipe and transformation
                  is tagged with its confidence level and source.
                </p>
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span className="text-xs text-green-400">Confirmed = Verified by multiple sources</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <div className="h-2 w-2 rounded-full bg-amber-500" />
                    <span className="text-xs text-amber-400">Unconfirmed = Needs verification</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
