
import React, { useState, useEffect, useCallback } from 'react';
import { fetchSlangData } from './services/geminiService';
import { SlangCollection } from './types';
import { SlangCard } from './components/SlangCard';

const App: React.FC = () => {
  const [query, setQuery] = useState('');
  const [data, setData] = useState<SlangCollection | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>(['London', 'New York City', 'Mumbai', 'Sydney']);

  const handleSearch = useCallback(async (location: string) => {
    if (!location.trim()) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchSlangData(location);
      setData(result);
      if (!history.includes(location)) {
        setHistory(prev => [location, ...prev.slice(0, 4)]);
      }
    } catch (err: any) {
      setError("The coach is speechless! Try a different location or check your connection.");
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
      async (position) => {
        // Reverse geocoding would be ideal, but for now we prompt Gemini 
        // with raw coordinates or just ask it to find the city based on coordinates
        try {
          // Since we can't easily reverse geocode without another API,
          // we'll just try to fetch a default nearby or prompt user.
          // For this app's UX, let's keep it simple:
          handleSearch("My Current Location");
        } catch (e) {
          setError("Couldn't detect your city.");
          setIsLoading(false);
        }
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
      <header className="w-full text-center mt-8 mb-12">
        <div className="inline-flex items-center justify-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-violet-600 rounded-xl flex items-center justify-center rotate-12 shadow-lg shadow-violet-500/50">
            <i className="fa-solid fa-bolt text-2xl text-white"></i>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Lingo<span className="text-violet-500">Street</span>
          </h1>
        </div>
        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto">
          The ultimate slang & street-talk coach. Master the local tongue of any city before you land.
        </p>
      </header>

      {/* Search Section */}
      <section className="w-full max-w-2xl mb-12">
        <div className="relative group">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
            placeholder="Enter a city or country (e.g. Glasglow, Tokyo, Brooklyn)..."
            className="w-full bg-slate-800/50 border-2 border-slate-700 rounded-2xl py-5 px-6 pr-32 focus:outline-none focus:border-violet-500 transition-all text-xl shadow-xl glass-morphism"
          />
          <div className="absolute right-3 top-3 flex space-x-2">
            <button 
              onClick={() => handleSearch(query)}
              disabled={isLoading}
              className="bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-bold transition-colors"
            >
              {isLoading ? <i className="fa-solid fa-spinner animate-spin"></i> : 'Coach Me'}
            </button>
          </div>
        </div>

        {/* Quick History */}
        <div className="mt-4 flex flex-wrap gap-2 items-center justify-center">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-widest mr-2">Trending:</span>
          {history.map((loc) => (
            <button
              key={loc}
              onClick={() => { setQuery(loc); handleSearch(loc); }}
              className="px-3 py-1 bg-slate-800/80 hover:bg-slate-700 rounded-lg text-sm text-slate-300 transition-colors border border-slate-700"
            >
              {loc}
            </button>
          ))}
          <button 
            onClick={useCurrentLocation}
            className="px-3 py-1 bg-violet-900/30 hover:bg-violet-900/50 text-violet-400 rounded-lg text-sm transition-colors flex items-center gap-2 border border-violet-500/30"
          >
            <i className="fa-solid fa-location-crosshairs"></i> Near Me
          </button>
        </div>
      </section>

      {/* Main Content */}
      <main className="w-full">
        {error && (
          <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/50 text-rose-400 text-center mb-8 animate-pulse">
            <i className="fa-solid fa-triangle-exclamation text-2xl mb-2 block"></i>
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-6">
            <div className="relative">
              <div className="w-24 h-24 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <i className="fa-solid fa-microphone text-2xl text-violet-500 animate-bounce"></i>
              </div>
            </div>
            <p className="text-xl font-medium text-slate-400">Consulting with the local street experts...</p>
          </div>
        ) : data ? (
          <div className="space-y-12 animate-in fade-in duration-700">
            {/* Context Info */}
            <div className="glass-morphism rounded-3xl p-8 border-l-8 border-l-violet-500">
              <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
                <i className="fa-solid fa-earth-americas text-violet-500"></i>
                {data.location} Dialect
              </h2>
              <p className="text-lg text-slate-300 italic leading-relaxed">
                "{data.cultureNote}"
              </p>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {data.slangs.map((item, idx) => (
                <SlangCard key={idx} item={item} />
              ))}
            </div>

            {/* Footer Disclaimer */}
            <div className="text-center text-slate-500 text-sm max-w-3xl mx-auto py-12">
              <p className="mb-2 uppercase font-bold tracking-widest text-xs text-slate-600">Linguistic Advisory</p>
              Street talk and regional slang can vary by neighborhood. Some terms marked as 'Extreme' or 'Spicy' may be considered offensive and should be used with caution and cultural awareness. LingoStreet is intended for educational and linguistic curiosity.
            </div>
          </div>
        ) : (
          <div className="text-center py-20 opacity-30">
            <i className="fa-solid fa-street-view text-8xl mb-6 block text-slate-700"></i>
            <p className="text-2xl font-light">Pick a spot on the map to start your training</p>
          </div>
        )}
      </main>

      {/* Floating Action Button for feedback or help */}
      <button className="fixed bottom-6 right-6 w-14 h-14 bg-violet-600 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-50">
        <i className="fa-solid fa-headset text-xl text-white"></i>
      </button>
    </div>
  );
};

export default App;
