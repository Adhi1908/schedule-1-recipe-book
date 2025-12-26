import { Github, Heart } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="border-t border-zinc-800 bg-zinc-950">
            <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
                <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
                    {/* Left side */}
                    <div className="flex flex-col items-center gap-2 md:items-start">
                        <p className="text-sm text-zinc-500">
                            Schedule 1 Mixer — Game-Accurate Mixing Calculator
                        </p>
                        <p className="text-xs text-zinc-600">
                            Not affiliated with TVGS. All game content belongs to respective owners.
                        </p>
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-xs text-zinc-500">
                            <span>Last Updated:</span>
                            <span className="text-zinc-400">December 2025</span>
                        </div>
                        <div className="h-4 w-px bg-zinc-700" />
                        <div className="flex items-center gap-2 text-xs text-zinc-500">
                            <span>Data Source:</span>
                            <span className="text-green-400">Community Verified</span>
                        </div>
                    </div>
                </div>

                {/* Disclaimer */}
                <div className="mt-6 pt-6 border-t border-zinc-800/50">
                    <p className="text-center text-xs text-zinc-600 max-w-2xl mx-auto">
                        ⚠️ This is a fan-made tool for the video game &quot;Schedule 1&quot;.
                        All data is sourced from community resources and may not be 100% accurate.
                        If a result shows &quot;Unknown&quot; or &quot;Unconfirmed&quot;, it means the data has not been verified.
                    </p>
                </div>
            </div>
        </footer>
    );
}
