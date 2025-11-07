import { useEffect } from 'react';
import { Moon, Sun, ShieldCheck } from 'lucide-react';

function Navbar({ dark, toggleDark, feedActive }) {
  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [dark]);

  return (
    <nav className="w-full border-b border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-black/40 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
          </div>
          <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
            Security Control Center
          </h1>
          <div className="ml-4 flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">Real-Time Feed</span>
            <span
              className={`relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 ${
                feedActive ? 'animate-pulse shadow-[0_0_0_3px] shadow-emerald-500/30' : 'opacity-50'
              }`}
              aria-label={feedActive ? 'Feed active' : 'Feed paused'}
            />
          </div>
        </div>
        <button
          onClick={toggleDark}
          className="inline-flex items-center gap-2 rounded-md border border-gray-200 dark:border-gray-800 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
          aria-label="Toggle theme"
        >
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          <span className="hidden sm:inline">{dark ? 'Light' : 'Dark'}</span>
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
