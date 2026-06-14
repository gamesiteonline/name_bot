import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Loader2, Copy, Check, AlertCircle, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

type Step = 'gender' | 'search' | 'results' | 'reveal';
type Gender = 'male' | 'female';

export default function NameWizard() {
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

  // Fade in animation on step change
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
      // If we have enough results, shuffle and show a different set
      if (allResults.length > 30) {
        const shuffled = [...allResults].sort(() => Math.random() - 0.5);
        setResults(shuffled.slice(0, 30));
        toast.success('Showing more options...');
      } else {
        // Try to fetch new results
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
      // Try modern clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(selectedName);
        setCopied(true);
        toast.success('Name copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
      } else {
        // Fallback for older browsers or non-secure contexts
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-4">
      {/* Hero Section */}
      {step === 'gender' && (
        <div className={`w-full max-w-2xl text-center mb-8 transition-all duration-500 ${fadeIn ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
            ©FAHAD TECH ® - NAME BOT™
          </h1>
          <p className="text-xl md:text-2xl text-white/80 mb-6 font-light">
            ☆¤°•∆π♤♡◇●☆
          </p>
          <p className="text-lg text-white/70 font-medium">
            Discover Your Destiny Name
          </p>
        </div>
      )}

      <div className="w-full max-w-2xl">
        {/* Gender Selection */}
        {step === 'gender' && (
          <Card className={`p-8 md:p-12 bg-white/95 backdrop-blur border-0 shadow-2xl transition-all duration-500 ${fadeIn ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">
              Choose Your Gender
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={() => handleGenderSelect('male')}
                className="h-16 text-lg font-semibold bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl transition-all duration-200 hover:shadow-lg hover:scale-105"
              >
                ♤ Male
              </Button>
              <Button
                onClick={() => handleGenderSelect('female')}
                className="h-16 text-lg font-semibold bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white rounded-xl transition-all duration-200 hover:shadow-lg hover:scale-105"
              >
                ♡ Female
              </Button>
            </div>
          </Card>
        )}

        {/* Search Input */}
        {step === 'search' && (
          <Card className={`p-8 md:p-12 bg-white/95 backdrop-blur border-0 shadow-2xl transition-all duration-500 ${fadeIn ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            <h2 className="text-2xl font-bold text-slate-900 mb-2 text-center">
              Find Your Name
            </h2>
            <p className="text-slate-600 text-center mb-6">
              Enter the first 3 letters or a full name
            </p>
            <div className="space-y-4">
              <Input
                type="text"
                placeholder="e.g., FAH or FAHAD"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="h-12 text-lg border-2 border-slate-300 focus:border-purple-500 rounded-lg"
              />
              <div className="flex gap-3">
                <Button
                  onClick={handleSearch}
                  disabled={isSearching || !searchQuery.trim()}
                  className="flex-1 h-12 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50"
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    'Search'
                  )}
                </Button>
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="h-12 border-2 border-slate-300 text-slate-900 font-semibold rounded-lg hover:bg-slate-100"
                >
                  Back
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Results */}
        {step === 'results' && (
          <Card className={`p-8 md:p-12 bg-white/95 backdrop-blur border-0 shadow-2xl transition-all duration-500 ${fadeIn ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            <h2 className="text-2xl font-bold text-slate-900 mb-2 text-center">
              {isFuzzy ? 'Did you mean?' : 'Select Your Name'}
            </h2>
            <p className="text-slate-600 text-center mb-6">
              Found {results.length} matching name{results.length !== 1 ? 's' : ''}
            </p>
            {results.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="w-12 h-12 text-slate-400 mb-4" />
                <p className="text-slate-600 font-medium mb-2">No names found</p>
                <p className="text-slate-500 text-sm">Try a different search term or use the "More" button to see suggestions.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto mb-6">
                {results.map((name, idx) => (
                  <Button
                    key={idx}
                    onClick={() => handleSelectName(name)}
                    variant="outline"
                    className="h-12 border-2 border-slate-200 hover:border-purple-500 hover:bg-purple-50 text-slate-900 font-medium rounded-lg transition-all duration-200 hover:shadow-md animate-in fade-in duration-300"
                  >
                    {name}
                  </Button>
                ))}
              </div>
            )}
            <div className="flex gap-3">
              <Button
                onClick={handleMoreResults}
                disabled={isSearching || results.length === 0}
                className="flex-1 h-12 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'More Options'
                )}
              </Button>
              <Button
                onClick={() => setStep('search')}
                variant="outline"
                className="h-12 border-2 border-slate-300 text-slate-900 font-semibold rounded-lg hover:bg-slate-100"
              >
                Back
              </Button>
            </div>
          </Card>
        )}

        {/* Reveal - WhatsApp Style Card */}
        {step === 'reveal' && selectedName && (
          <div className={`transition-all duration-500 ${fadeIn ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            {/* WhatsApp-style Preview Card */}
            <Card className="bg-gradient-to-br from-green-900 to-green-800 border-0 shadow-2xl overflow-hidden">
              <div className="p-6 md:p-8 text-white">
                {/* Header with icon */}
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/20">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-lg">©FAHAD TECH ® - NAME BOT™</p>
                    <p className="text-sm text-white/70">Channel • Destiny Oracle</p>
                  </div>
                </div>

                {/* Message content */}
                <div className="bg-white/10 backdrop-blur rounded-lg p-6 mb-6">
                  <p className="text-white/70 text-sm mb-3">Your Destiny Name:</p>
                  <p className="text-4xl md:text-5xl font-bold text-white mb-4 text-center">
                    {selectedName}
                  </p>
                  <p className="text-white/60 text-xs text-right">
                    ✓✓ Revealed
                  </p>
                </div>

                {/* Copy button */}
                <Button
                  onClick={handleCopyName}
                  className="w-full h-12 bg-white text-green-900 hover:bg-white/90 font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 mb-4"
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
                </Button>

                {/* Join Channel Button */}
                <Button
                  onClick={() => window.open('https://whatsapp.com/channel/0029Vb7jjtZLo4hnTZRnqW1n', '_blank')}
                  className="w-full h-12 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition-all duration-200"
                >
                  Join Our Channel
                </Button>
              </div>
            </Card>

            {/* Action buttons below */}
            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleReset}
                className="flex-1 h-12 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200"
              >
                Find Another Name
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
