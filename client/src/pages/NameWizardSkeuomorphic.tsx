import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Loader2, Copy, Check, AlertCircle, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

type Step = 'gender' | 'search' | 'results' | 'reveal';
type Gender = 'male' | 'female';

export default function NameWizardSkeuomorphic() {
  const [step, setStep] = useState<Step>('gender');
  const [gender, setGender] = useState<Gender | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<string[]>([]);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [isFuzzy, setIsFuzzy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  const [allResults, setAllResults] = useState<string[]>([]);

  const searchQuery_trpc = trpc.names.search.useQuery(
    { query: searchQuery, gender: gender || 'male' },
    { enabled: false }
  );

  useEffect(() => {
    setFadeIn(false);
    const timer = setTimeout(() => setFadeIn(true), 50);
    return () => clearTimeout(timer);
  }, [step]);

  const handleGenderSelect = (g: Gender) => {
    setGender(g);
    setStep('search');
  };

  const handleSearch = async () => {
    if (!gender || !searchQuery.trim()) {
      toast.error('Please enter a search term');
      return;
    }
    setIsSearching(true);
    try {
      const data = await searchQuery_trpc.refetch();
      if (data.data) {
        setAllResults(data.data.results);
        setResults(data.data.results);
        setIsFuzzy(data.data.isFuzzy);
        setStep('results');
      }
    } catch (error) {
      toast.error('Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleMoreResults = async () => {
    if (!gender || allResults.length === 0) return;
    setIsSearching(true);
    try {
      if (allResults.length > 30) {
        const shuffled = [...allResults].sort(() => Math.random() - 0.5);
        setResults(shuffled.slice(0, 30));
        toast.success('Showing more options...');
      } else {
        const data = await searchQuery_trpc.refetch();
        if (data.data) {
          setResults(data.data.results);
          setAllResults(data.data.results);
        }
      }
    } catch (error) {
      toast.error('Failed to load more results.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectName = (name: string) => {
    setSelectedName(name);
    setStep('reveal');
  };

  const handleCopyName = async () => {
    if (!selectedName) return;
    
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(selectedName);
        setCopied(true);
        toast.success('Name copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = selectedName;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        setCopied(true);
        toast.success('Name copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (error) {
      console.error('Copy failed:', error);
      toast.error('Failed to copy. Please try again.');
    }
  };

  const handleReset = () => {
    setStep('gender');
    setGender(null);
    setSearchQuery('');
    setResults([]);
    setSelectedName(null);
    setIsFuzzy(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex flex-col items-center justify-center p-4">
      {/* Skeuomorphic Hero Section */}
      {step === 'gender' && (
        <div className={`w-full max-w-2xl text-center mb-8 transition-all duration-500 ${fadeIn ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          <div className="relative inline-block mb-6">
            {/* Wood texture background */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-700 via-amber-600 to-amber-800 rounded-2xl blur-xl opacity-30"></div>
            <div className="relative bg-gradient-to-br from-amber-600 via-amber-700 to-amber-800 px-8 py-6 rounded-2xl shadow-2xl border-4 border-amber-900">
              <h1 className="text-5xl md:text-6xl font-bold text-amber-50 drop-shadow-lg" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
                Fahad
              </h1>
              <p className="text-3xl text-amber-100 font-bold mt-2" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                NAME BOT™
              </p>
            </div>
          </div>
          <p className="text-3xl text-amber-900 mb-4 font-light">
            ☆¤°•∆π♤♡◇●☆
          </p>
          <p className="text-xl text-amber-800 font-serif italic">
            Discover Your Destiny Name
          </p>
        </div>
      )}

      <div className="w-full max-w-2xl">
        {/* Gender Selection - Skeuomorphic Buttons */}
        {step === 'gender' && (
          <div className={`transition-all duration-500 ${fadeIn ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            <div className="bg-gradient-to-b from-amber-100 to-amber-50 rounded-3xl shadow-2xl p-8 md:p-12 border-8 border-amber-200">
              <h2 className="text-3xl font-bold text-amber-900 mb-8 text-center font-serif">
                Choose Your Gender
              </h2>
              <div className="grid grid-cols-2 gap-6">
                {/* Male Button */}
                <button
                  onClick={() => handleGenderSelect('male')}
                  className="group relative h-32 bg-gradient-to-b from-blue-300 via-blue-400 to-blue-600 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-200 border-4 border-blue-700 hover:scale-105 active:scale-95"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent rounded-2xl"></div>
                  <div className="relative h-full flex flex-col items-center justify-center">
                    <span className="text-4xl mb-2">♤</span>
                    <span className="text-xl font-bold text-blue-900">Male</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-transparent via-white/40 to-transparent rounded-b-2xl"></div>
                </button>

                {/* Female Button */}
                <button
                  onClick={() => handleGenderSelect('female')}
                  className="group relative h-32 bg-gradient-to-b from-pink-300 via-pink-400 to-pink-600 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-200 border-4 border-pink-700 hover:scale-105 active:scale-95"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent rounded-2xl"></div>
                  <div className="relative h-full flex flex-col items-center justify-center">
                    <span className="text-4xl mb-2">♡</span>
                    <span className="text-xl font-bold text-pink-900">Female</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-transparent via-white/40 to-transparent rounded-b-2xl"></div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Search Input - Skeuomorphic */}
        {step === 'search' && (
          <div className={`transition-all duration-500 ${fadeIn ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            <div className="bg-gradient-to-b from-amber-100 to-amber-50 rounded-3xl shadow-2xl p-8 md:p-12 border-8 border-amber-200">
              <h2 className="text-3xl font-bold text-amber-900 mb-2 text-center font-serif">
                Find Your Name
              </h2>
              <p className="text-amber-700 text-center mb-8 font-serif italic">
                Enter the first 3 letters or a full name
              </p>
              <div className="space-y-6">
                {/* Skeuomorphic Input */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g., FAH or FAHAD"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full h-14 px-6 text-lg border-4 border-amber-300 rounded-2xl bg-gradient-to-b from-white to-amber-50 shadow-inset focus:outline-none focus:ring-4 focus:ring-amber-400 focus:border-amber-400 font-serif"
                    style={{
                      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1), 0 4px 8px rgba(0,0,0,0.1)'
                    }}
                  />
                </div>

                {/* Skeuomorphic Buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={handleSearch}
                    disabled={isSearching || !searchQuery.trim()}
                    className="flex-1 h-14 bg-gradient-to-b from-purple-400 via-purple-500 to-purple-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-200 border-4 border-purple-800 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSearching ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      'Search'
                    )}
                  </button>
                  <button
                    onClick={handleReset}
                    className="h-14 px-6 bg-gradient-to-b from-gray-300 via-gray-400 to-gray-600 text-gray-900 font-bold rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-200 border-4 border-gray-700 hover:scale-105 active:scale-95"
                  >
                    Back
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results - Skeuomorphic */}
        {step === 'results' && (
          <div className={`transition-all duration-500 ${fadeIn ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            <div className="bg-gradient-to-b from-amber-100 to-amber-50 rounded-3xl shadow-2xl p-8 md:p-12 border-8 border-amber-200">
              <h2 className="text-3xl font-bold text-amber-900 mb-2 text-center font-serif">
                {isFuzzy ? 'Did you mean?' : 'Select Your Name'}
              </h2>
              <p className="text-amber-700 text-center mb-6 font-serif">
                Found {results.length} matching name{results.length !== 1 ? 's' : ''}
              </p>

              {results.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <AlertCircle className="w-12 h-12 text-amber-400 mb-4" />
                  <p className="text-amber-900 font-bold mb-2 font-serif">No names found</p>
                  <p className="text-amber-700 text-sm font-serif">Try a different search term or use the "More" button.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto mb-6 p-4 bg-gradient-to-b from-white/50 to-amber-50/50 rounded-2xl border-4 border-amber-200">
                  {results.map((name, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectName(name)}
                      className="h-14 bg-gradient-to-b from-green-300 via-green-400 to-green-600 text-green-900 font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border-3 border-green-700 hover:scale-105 active:scale-95 text-sm"
                    >
                      {name}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={handleMoreResults}
                  disabled={isSearching || results.length === 0}
                  className="flex-1 h-14 bg-gradient-to-b from-amber-400 via-amber-500 to-amber-700 text-amber-900 font-bold rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-200 border-4 border-amber-800 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'More Options'
                  )}
                </button>
                <button
                  onClick={() => setStep('search')}
                  className="h-14 px-6 bg-gradient-to-b from-gray-300 via-gray-400 to-gray-600 text-gray-900 font-bold rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-200 border-4 border-gray-700 hover:scale-105 active:scale-95"
                >
                  Back
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reveal - Skeuomorphic Leather Card */}
        {step === 'reveal' && selectedName && (
          <div className={`transition-all duration-500 ${fadeIn ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            {/* Leather-textured card */}
            <div className="bg-gradient-to-br from-amber-900 via-amber-800 to-amber-950 rounded-3xl shadow-2xl overflow-hidden border-8 border-amber-950">
              {/* Stitched border effect */}
              <div className="absolute inset-0 pointer-events-none" style={{
                backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 12px)',
                backgroundSize: '100% 2px',
                backgroundPosition: '0 0, 0 calc(100% - 2px)',
                backgroundRepeat: 'repeat-x'
              }}></div>

              <div className="relative p-8 md:p-10 text-amber-50">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8 pb-6 border-b-2 border-amber-700">
                  <div className="w-14 h-14 bg-gradient-to-br from-amber-200 to-amber-400 rounded-full flex items-center justify-center shadow-lg border-4 border-amber-600">
                    <MessageCircle className="w-7 h-7 text-amber-900" />
                  </div>
                  <div>
                    <p className="font-bold text-xl font-serif">Fahad - NAME BOT™</p>
                    <p className="text-sm text-amber-200 font-serif italic">Channel • Destiny Oracle</p>
                  </div>
                </div>

                {/* Message content */}
                <div className="bg-gradient-to-b from-amber-800 to-amber-900 rounded-2xl p-8 mb-8 border-4 border-amber-700 shadow-inner">
                  <p className="text-amber-200 text-sm mb-4 font-serif italic">Your Destiny Name:</p>
                  <p className="text-5xl md:text-6xl font-bold text-amber-100 mb-6 text-center font-serif" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
                    {selectedName}
                  </p>
                  <p className="text-amber-300 text-xs text-right font-serif">✓✓ Revealed</p>
                </div>

                {/* Buttons */}
                <div className="space-y-4">
                  <button
                    onClick={handleCopyName}
                    className="w-full h-14 bg-gradient-to-b from-amber-200 via-amber-300 to-amber-400 text-amber-900 hover:from-amber-100 hover:to-amber-300 font-bold rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl border-4 border-amber-500 hover:scale-105 active:scale-95"
                  >
                    {copied ? (
                      <>
                        <Check className="w-5 h-5" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-5 h-5" />
                        Copy Name
                      </>
                    )}
                  </button>

                  <button
                    onClick={(e) => e.preventDefault()}
                    className="w-full h-14 bg-gradient-to-b from-green-400 via-green-500 to-green-700 hover:from-green-300 hover:to-green-600 text-white font-bold rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl border-4 border-green-800 hover:scale-105 active:scale-95"
                  >
                    Fahad Tech
                  </button>
                </div>
              </div>
            </div>

            {/* Action button */}
            <div className="mt-6">
              <button
                onClick={handleReset}
                className="w-full h-14 bg-gradient-to-b from-purple-400 via-purple-500 to-purple-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-200 border-4 border-purple-800 hover:scale-105 active:scale-95"
              >
                Find Another Name
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
