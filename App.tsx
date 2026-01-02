
import React, { useState } from 'react';
import { 
  FileText, 
  Presentation, 
  Download, 
  Sparkles, 
  Loader2, 
  Globe, 
  Settings2,
  ChevronRight,
  Monitor,
  Type as TypeIcon,
  ChevronLeft,
  Palette,
  Check
} from 'lucide-react';
import { OutputType, Tone, Language, GeneratedData, SlideContent, DocumentSection, ThemePalette, ThemeFont } from './types';
import { generateAILogic } from './geminiService';
import { downloadPPTX, downloadDOCX } from './fileService';

const THEMES: ThemePalette[] = [
  {
    id: 'indigo',
    name: 'Modern Indigo',
    primary: '4F46E5',
    dark: '1E1B4B',
    light: 'F8FAFC',
    accent: '818CF8',
    bgGradient: 'from-indigo-800 via-indigo-600 to-purple-800'
  },
  {
    id: 'emerald',
    name: 'Professional Emerald',
    primary: '10B981',
    dark: '064E3B',
    light: 'F0FDF4',
    accent: '34D399',
    bgGradient: 'from-emerald-800 via-emerald-600 to-teal-800'
  },
  {
    id: 'ruby',
    name: 'Corporate Ruby',
    primary: 'E11D48',
    dark: '4C0519',
    light: 'FFF1F2',
    accent: 'FB7185',
    bgGradient: 'from-rose-800 via-rose-600 to-pink-800'
  },
  {
    id: 'amber',
    name: 'Sunset Business',
    primary: 'F59E0B',
    dark: '451A03',
    light: 'FFFBEB',
    accent: 'FBBF24',
    bgGradient: 'from-amber-800 via-amber-600 to-orange-800'
  }
];

const FONTS: ThemeFont[] = [
  { id: 'sans', name: 'Modern Sans', family: 'Arial' },
  { id: 'serif', name: 'Classic Serif', family: 'Georgia' },
  { id: 'mono', name: 'Technical Mono', family: 'Courier New' }
];

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedData, setGeneratedData] = useState<GeneratedData | null>(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  // Form states
  const [prompt, setPrompt] = useState('');
  const [type, setType] = useState<OutputType>(OutputType.SLIDES);
  const [tone, setTone] = useState<Tone>(Tone.PROFESSIONAL);
  const [count, setCount] = useState(5);
  const [language, setLanguage] = useState<Language>(Language.ENGLISH);
  
  // Theme states
  const [selectedPalette, setSelectedPalette] = useState<ThemePalette>(THEMES[0]);
  const [selectedFont, setSelectedFont] = useState<ThemeFont>(FONTS[0]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please enter a topic or instructions.");
      return;
    }

    setLoading(true);
    setError(null);
    setGeneratedData(null);
    setActiveSlideIndex(0);
    try {
      const result = await generateAILogic({
        prompt,
        type,
        tone,
        count,
        language
      });
      setGeneratedData(result);
    } catch (err: any) {
      console.error(err);
      setError("Failed to generate content. Please check your API key.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!generatedData) return;
    if (generatedData.type === OutputType.SLIDES) {
      downloadPPTX(generatedData, selectedPalette, selectedFont);
    } else {
      downloadDOCX(generatedData, selectedPalette, selectedFont);
    }
  };

  const totalItems = generatedData ? generatedData.items.length + (generatedData.type === OutputType.SLIDES ? 1 : 0) : 0;
  const goToNext = () => setActiveSlideIndex(prev => Math.min(prev + 1, totalItems - 1));
  const goToPrev = () => setActiveSlideIndex(prev => Math.max(prev - 1, 0));

  return (
    <div className="min-h-screen flex flex-col bg-slate-50" style={{ fontFamily: selectedFont.family }}>
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-indigo-600 to-purple-600 p-2 rounded-xl shadow-lg shadow-indigo-200">
              <Sparkles className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              DocuGenius <span className="text-indigo-600">AI</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <div className="h-4 w-px bg-slate-200" />
            <button className="px-5 py-2 rounded-full border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all font-medium text-sm">
              Upgrade Pro
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-[1600px] mx-auto w-full px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Configuration Panel */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-6 lg:sticky lg:top-24 max-h-[calc(100vh-120px)] overflow-y-auto custom-scrollbar pr-1">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 relative overflow-hidden">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-800 relative">
              <Settings2 className="w-5 h-5 text-indigo-500" />
              Content Config
            </h2>

            <div className="space-y-5 relative">
              {/* Type Toggle */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Target Format</label>
                <div className="bg-slate-50 p-1.5 rounded-2xl flex gap-1 border border-slate-100">
                  <button
                    onClick={() => { setType(OutputType.SLIDES); setGeneratedData(null); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-semibold text-sm ${
                      type === OutputType.SLIDES 
                        ? 'bg-white shadow-md text-indigo-600' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <Presentation className="w-4 h-4" />
                    Slides
                  </button>
                  <button
                    onClick={() => { setType(OutputType.WORD); setGeneratedData(null); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-semibold text-sm ${
                      type === OutputType.WORD 
                        ? 'bg-white shadow-md text-indigo-600' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    Document
                  </button>
                </div>
              </div>

              {/* Topic Field */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Subject Matter</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your vision..."
                  className="w-full h-24 p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all resize-none text-slate-800 placeholder:text-slate-400 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <TypeIcon className="w-3.5 h-3.5" /> Tone
                  </label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value as Tone)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-700 font-medium"
                  >
                    {Object.values(Tone).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">
                    {type === OutputType.SLIDES ? 'Slides' : 'Sections'}
                  </label>
                  <input
                    type="number"
                    min="1" max="15"
                    value={count}
                    onChange={(e) => setCount(parseInt(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-700 font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" /> Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as Language)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-700 font-medium"
                >
                  {Object.values(Language).map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-[10px] font-bold flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-red-500" />
                  {error}
                </div>
              )}

              <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                {loading ? "Generating..." : "Create Content"}
              </button>
            </div>
          </div>

          {/* Theme & Styling Panel */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-800">
              <Palette className="w-5 h-5 text-purple-500" />
              Theme Engine
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Color Palette</label>
                <div className="grid grid-cols-2 gap-3">
                  {THEMES.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => setSelectedPalette(theme)}
                      className={`relative p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                        selectedPalette.id === theme.id ? 'border-indigo-600 bg-indigo-50/50 shadow-sm' : 'border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      <div className={`w-full h-8 rounded-lg bg-gradient-to-r ${theme.bgGradient}`} />
                      <span className="text-[10px] font-bold text-slate-600 truncate w-full text-center">{theme.name}</span>
                      {selectedPalette.id === theme.id && (
                        <div className="absolute top-1 right-1 bg-indigo-600 text-white p-0.5 rounded-full">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Typography</label>
                <div className="flex flex-col gap-2">
                  {FONTS.map((font) => (
                    <button
                      key={font.id}
                      onClick={() => setSelectedFont(font)}
                      className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                        selectedFont.id === font.id ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-100 hover:border-slate-200'
                      }`}
                      style={{ fontFamily: font.family }}
                    >
                      <span className="text-sm font-semibold text-slate-700">{font.name}</span>
                      {selectedFont.id === font.id && <Check className="w-4 h-4 text-indigo-600" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Studio Canvas Panel */}
        <div className="lg:col-span-8 xl:col-span-9 flex flex-col h-full min-h-[850px]">
          <div className="bg-slate-900 rounded-[32px] shadow-2xl flex flex-col overflow-hidden h-full border border-slate-800">
            
            {/* Toolbar */}
            <div className="px-6 py-4 flex items-center justify-between bg-slate-900/50 border-b border-slate-800 backdrop-blur-md">
              <div className="flex items-center gap-4 text-slate-400">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-full text-xs font-bold text-slate-200 border border-slate-700">
                  <Monitor className="w-3.5 h-3.5" />
                  Studio Mode
                </div>
                {generatedData && (
                  <span className="text-sm font-medium opacity-60">
                    {activeSlideIndex + 1} / {totalItems} {type === OutputType.SLIDES ? 'Slides' : 'Sections'}
                  </span>
                )}
              </div>

              {generatedData && (
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-500 transition-all shadow-lg active:scale-95 group"
                >
                  <Download className="w-4 h-4" />
                  Export {type === OutputType.SLIDES ? 'PPTX' : 'DOCX'}
                </button>
              )}
            </div>

            {/* Canvas Body */}
            <div className="flex flex-1 overflow-hidden">
              
              {generatedData && type === OutputType.SLIDES && (
                <div className="w-48 bg-slate-950/50 border-r border-slate-800 p-4 overflow-y-auto space-y-4 custom-scrollbar">
                  <div 
                    onClick={() => setActiveSlideIndex(0)}
                    className={`aspect-video rounded-lg cursor-pointer transition-all border-2 overflow-hidden flex flex-col p-1.5 bg-gradient-to-br ${selectedPalette.bgGradient} ${
                      activeSlideIndex === 0 ? 'border-white ring-2 ring-white/20' : 'border-slate-800 opacity-60'
                    }`}
                  >
                    <div className="text-[5px] text-white/50 leading-tight font-bold line-clamp-2 uppercase">{generatedData.title}</div>
                  </div>
                  
                  {generatedData.items.map((_, i) => (
                    <div 
                      key={i}
                      onClick={() => setActiveSlideIndex(i + 1)}
                      className={`aspect-video rounded-lg cursor-pointer transition-all border-2 flex flex-col p-2 bg-slate-800 ${
                        activeSlideIndex === i + 1 ? `border-[#${selectedPalette.primary}] ring-2 ring-[#${selectedPalette.primary}]/20` : 'border-slate-800 opacity-60'
                      }`}
                    >
                      <div className="w-6 h-0.5 bg-slate-600 rounded mb-1" />
                      <div className="space-y-0.5">
                        <div className="w-full h-0.5 bg-slate-700" />
                        <div className="w-3/4 h-0.5 bg-slate-700" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center bg-slate-950/30 custom-scrollbar relative">
                {!generatedData && !loading && (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-center space-y-6">
                    <div className="w-32 h-32 bg-slate-900 rounded-[40px] flex items-center justify-center border border-slate-800 shadow-2xl">
                      {type === OutputType.SLIDES ? <Presentation className="w-16 h-16 text-indigo-400" /> : <FileText className="w-16 h-16 text-indigo-400" />}
                    </div>
                    <div className="max-w-xs">
                      <h3 className="text-white font-bold text-xl mb-2">Ready to Design</h3>
                      <p className="text-sm text-slate-400">Describe your topic and pick your theme to start.</p>
                    </div>
                  </div>
                )}

                {loading && (
                  <div className="flex-1 flex flex-col items-center justify-center gap-8">
                    <div className="relative">
                      <div className="w-24 h-24 border-4 border-slate-800 border-t-indigo-500 rounded-full animate-spin"></div>
                      <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-500 w-8 h-8 animate-pulse" />
                    </div>
                    <p className="font-bold text-white text-2xl">AI is crafting your deck...</p>
                  </div>
                )}

                {generatedData && (
                  <div className="w-full max-w-5xl animate-in fade-in duration-700">
                    <div className="fixed bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-slate-900/80 backdrop-blur-xl px-4 py-2 rounded-2xl border border-slate-700 shadow-2xl z-20">
                      <button onClick={goToPrev} disabled={activeSlideIndex === 0} className="p-2 hover:bg-slate-800 rounded-xl disabled:opacity-30 text-white"><ChevronLeft className="w-5 h-5" /></button>
                      <div className="text-xs font-black text-slate-400 px-4 select-none tracking-widest uppercase">{activeSlideIndex + 1} / {totalItems}</div>
                      <button onClick={goToNext} disabled={activeSlideIndex === totalItems - 1} className="p-2 hover:bg-slate-800 rounded-xl disabled:opacity-30 text-white"><ChevronRight className="w-5 h-5" /></button>
                    </div>

                    <div className="mb-24">
                      {type === OutputType.SLIDES ? (
                        <div className="slide-canvas transition-all duration-500" style={{ fontFamily: selectedFont.family }}>
                          {activeSlideIndex === 0 ? (
                            <div className={`aspect-video bg-gradient-to-br ${selectedPalette.bgGradient} rounded-3xl shadow-2xl flex flex-col items-center justify-center p-16 text-center text-white relative overflow-hidden border border-white/10`}>
                               <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
                                <svg width="100%" height="100%"><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/></pattern><rect width="100%" height="100%" fill="url(#grid)" /></svg>
                              </div>
                              <div className="relative z-10 w-full">
                                <div className="inline-block px-4 py-1.5 bg-white/10 border border-white/20 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase mb-10 backdrop-blur-md">
                                  {selectedPalette.name} Style
                                </div>
                                <h1 className="text-5xl font-black mb-8 leading-tight drop-shadow-xl">{generatedData.title}</h1>
                                {generatedData.subtitle && <p className="text-xl text-white/90 font-medium italic border-t border-white/10 pt-8 max-w-2xl mx-auto">{generatedData.subtitle}</p>}
                              </div>
                            </div>
                          ) : (
                            <div className="aspect-video bg-white rounded-3xl shadow-2xl flex flex-col p-12 text-slate-800 relative overflow-hidden border border-slate-200">
                              <div className="absolute top-0 left-0 w-2 h-full" style={{ backgroundColor: `#${selectedPalette.primary}` }} />
                              <div className="absolute top-8 right-12 text-slate-100 font-black text-8xl pointer-events-none select-none">{String(activeSlideIndex + 1).padStart(2, '0')}</div>
                              <div className="relative z-10">
                                <h3 className="text-4xl font-black text-slate-900 mb-12 flex items-center gap-4 border-b border-slate-100 pb-8">
                                  <span className="flex items-center justify-center w-12 h-12 text-white rounded-2xl shadow-lg text-lg" style={{ backgroundColor: `#${selectedPalette.primary}` }}>{activeSlideIndex}</span>
                                  {(generatedData.items[activeSlideIndex - 1] as SlideContent).title}
                                </h3>
                                <ul className="space-y-6">
                                  {(generatedData.items[activeSlideIndex - 1] as SlideContent).points.map((point, pIdx) => (
                                    <li key={pIdx} className="flex gap-6 text-xl text-slate-600 font-medium leading-relaxed hover:translate-x-2 transition-transform">
                                      <div className="w-3 h-3 rounded-full mt-3 flex-shrink-0" style={{ backgroundColor: `#${selectedPalette.primary}` }} />
                                      <span>{point}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="document-canvas transition-all duration-500" style={{ fontFamily: selectedFont.family }}>
                           {activeSlideIndex === 0 ? (
                             <div className="bg-white min-h-[900px] shadow-2xl p-24 flex flex-col border border-slate-200 relative overflow-hidden">
                               <div className="absolute top-0 right-0 w-4 h-full" style={{ backgroundColor: `#${selectedPalette.dark}` }} />
                               <div className="mb-24 flex justify-between items-start">
                                 <div className="text-4xl font-black italic tracking-tighter text-slate-900 border-l-8 pl-6" style={{ borderColor: `#${selectedPalette.primary}` }}>
                                   DG<span style={{ color: `#${selectedPalette.primary}` }}>.</span>
                                 </div>
                               </div>
                               <div className="flex-1 flex flex-col justify-center">
                                 <div className="w-24 h-1 mb-12" style={{ backgroundColor: `#${selectedPalette.primary}` }} />
                                 <h1 className="text-6xl font-bold text-slate-900 mb-8 leading-tight max-w-3xl">{generatedData.title}</h1>
                                 <div className="text-lg font-bold text-slate-800">{tone} Strategy Report</div>
                               </div>
                             </div>
                           ) : (
                             <div className="bg-white min-h-[900px] shadow-2xl p-20 flex flex-col border border-slate-200">
                                <div className="flex justify-between items-center mb-16 text-[10px] font-black text-slate-300 tracking-widest uppercase border-b pb-8">
                                  <span>{generatedData.title}</span>
                                  <span>Section {String(activeSlideIndex).padStart(2, '0')}</span>
                                </div>
                                <div className="max-w-3xl mx-auto w-full">
                                  <h3 className="text-3xl font-bold mb-10 leading-tight" style={{ color: `#${selectedPalette.dark}` }}>
                                    {(generatedData.items[activeSlideIndex - 1] as DocumentSection).heading}
                                  </h3>
                                  <div className="space-y-8">
                                    {(generatedData.items[activeSlideIndex - 1] as DocumentSection).paragraphs.map((p, pIdx) => (
                                      <p key={pIdx} className="text-lg text-slate-700 leading-relaxed text-justify">
                                        {p}
                                      </p>
                                    ))}
                                  </div>
                                </div>
                             </div>
                           )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-in { animation: fade-in 0.6s ease-out; }
      `}</style>
    </div>
  );
};

export default App;
