
import React, { useState, useCallback } from 'react';
import { fetchSlangData } from './services/geminiService.ts';
import { SlangCollection } from './types.ts';
import { SlangCard } from './components/SlangCard.tsx';

const App: React.FC = () => {
  const [query, setQuery] = useState('');
  const [data, setData] = useState<SlangCollection | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>(['London', 'Brooklyn', 'Mumbai', 'Sydney']);

  const handleSearch = useCallback(async (location: string) => {
    if (!location.trim()) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchSlangData(location);
      setData(result);
      if (!history.includes(location) && location !== "My Current Location") {
        setHistory(prev => [location, ...prev.slice(0, 3)]);
      }
    } catch (err: any) {
      const message = err.message || "The streets are quiet right now.";
      if (message.includes("API Key")) {
        setError("API Key Error: Please check your project environment variables.");
      } else {
        setError(`Coach's Error: ${message}`);
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [history]);

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Instead of coordinates, we try to fetch for the current context
        handleSearch("My current region");
      },
      () => {
        setError("Permission denied. Enter your location manually.");
        setIsLoading(false);
      }
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <header className="w-full text-center mt-12 mb-16">
        <div className="inline-flex items-center justify-center space-x-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-2xl flex items-center justify-center rotate-6 shadow-2xl shadow-violet-500/40 animate-float">
            <i className="fa-solid fa-microphone-lines text-3xl text-white"></i>
          </div>
          <div className="text-left">
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter uppercase italic">
              Lingo<span className="text-violet-500">Street</span>
            </h1>
            <div className="h-1 w-full bg-violet-500/30 rounded-full mt-1 overflow-hidden">
              <div className="h-full bg-violet-500 w-1/3 animate-[shimmer_2s_infinite]"></div>
            </div>
          </div>
        </div>
        <p className="text-slate-400 text-lg md:text-xl max-w-xl mx-auto font-medium">
          Master the street vernacular. Your AI coach for local slang, regional heat, and cultural nuances.
        </p>
      </header>

      {/* Search Section */}
      <section className="w-full max-w-3xl mb-16">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative flex flex-col md:flex-row gap-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
              placeholder="Where are we heading? (e.g. London, Bronx, Lagos)..."
              className="flex-grow bg-slate-900 border border-slate-700/50 rounded-xl py-5 px-6 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all text-xl shadow-2xl"
            />
            <button 
              onClick={() => handleSearch(query)}
              disabled={isLoading}
              className="bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white px-8 py-5 rounded-xl font-bold transition-all transform active:scale-95 shadow-lg shadow-violet-900/20 whitespace-nowrap"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <i className="fa-solid fa-spinner animate-spin"></i> Analyzing...
                </span>
              ) : 'GET COACHED'}
            </button>
          </div>
        </div>

        {/* Quick Suggestions */}
        <div className="mt-6 flex flex-wrap gap-3 items-center justify-center">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Recently Spotted:</span>
          {history.map((loc) => (
            <button
              key={loc}
              onClick={() => { setQuery(loc); handleSearch(loc); }}
              className="px-4 py-1.5 bg-slate-800/40 hover:bg-slate-700/60 rounded-full text-xs font-semibold text-slate-400 transition-all border border-slate-700/50 hover:text-violet-400"
            >
              {loc}
            </button>
          ))}
          <button 
            onClick={useCurrentLocation}
            className="px-4 py-1.5 bg-violet-950/20 hover:bg-violet-950/40 text-violet-400 rounded-full text-xs font-bold transition-all border border-violet-500/20 flex items-center gap-2"
          >
            <i className="fa-solid fa-location-dot"></i> LOCAL
          </button>
        </div>
      </section>

      {/* Main Content */}
      <main className="w-full">
        {error && (
          <div className="p-8 rounded-2xl bg-rose-500/5 border border-rose-500/20 text-rose-400 text-center mb-12 flex flex-col items-center">
            <div className="w-12 h-12 bg-rose-500/20 rounded-full flex items-center justify-center mb-4">
              <i className="fa-solid fa-circle-exclamation text-xl"></i>
            </div>
            <p className="font-semibold">{error}</p>
            <p className="text-xs text-rose-500/60 mt-2">Try refreshing or checking your API configuration.</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-8">
            <div className="relative">
              <div className="w-32 h-32 border-4 border-violet-500/10 border-t-violet-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <i className="fa-solid fa-comments text-3xl text-violet-500 animate-pulse"></i>
              </div>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white mb-2">Talking to the locals...</p>
              <p className="text-slate-500">Decrypting the latest street terminology for {query || 'the area'}</p>
            </div>
          </div>
        ) : data ? (
          <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Area */}
            <div className="glass-morphism rounded-[2.5rem] p-10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                <i className="fa-solid fa-earth-americas text-[15rem] rotate-12"></i>
              </div>
              
              <div className="relative z-10 flex flex-col md:flex-row md:items-end gap-6 md:justify-between">
                <div>
                  <div className="inline-block px-4 py-1 bg-violet-500/10 border border-violet-500/20 rounded-full text-violet-400 text-xs font-bold tracking-widest uppercase mb-4">
                    Regional Report
                  </div>
                  <h2 className="text-5xl font-black text-white mb-4 tracking-tight">
                    {data.location}
                  </h2>
                  <p className="text-xl text-slate-300 italic max-w-3xl leading-relaxed font-light">
                    "{data.cultureNote}"
                  </p>
                </div>
                <div className="flex items-center gap-4 text-slate-400">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold text-slate-500 uppercase">Coach Insight</p>
                    <p className="text-sm">Authenticated Dialect</p>
                  </div>
                  <div className="w-12 h-12 rounded-full border border-slate-700 flex items-center justify-center">
                    <i className="fa-solid fa-check-double text-violet-500"></i>
                  </div>
                </div>
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {data.slangs.map((item, idx) => (
                <SlangCard key={idx} item={item} />
              ))}
            </div>

            {/* Warning Box */}
            <div className="max-w-4xl mx-auto p-8 rounded-3xl bg-amber-500/[0.03] border border-amber-500/10 flex gap-6 items-center">
              <div className="text-4xl text-amber-500/40">
                <i className="fa-solid fa-triangle-exclamation"></i>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed italic">
                <strong className="text-slate-400 uppercase text-xs block mb-1">Language Advisory:</strong>
                Street talk can be sharp. Slang marked as Extreme or Spicy should be used with extreme caution. Respect local culture and read the room before using these expressions.
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-32">
            <div className="w-24 h-24 bg-slate-900 rounded-3xl mx-auto flex items-center justify-center mb-8 border border-slate-800 rotate-12">
              <i className="fa-solid fa-map-location-dot text-4xl text-slate-700"></i>
            </div>
            <h3 className="text-2xl font-bold text-slate-600 mb-2">Your journey starts here.</h3>
            <p className="text-slate-700">Type a city name above to get your first slang lesson.</p>
          </div>
        )}
      </main>

      <footer className="mt-24 pb-12 text-center text-slate-700 text-xs font-bold tracking-widest uppercase">
        LingoStreet AI &copy; {new Date().getFullYear()} • Street Dialect Intelligence
      </footer>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
};

export default App;
