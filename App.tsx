
import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Presentation, 
  Layout, 
  Download, 
  Sparkles, 
  Loader2, 
  Globe, 
  Settings2,
  ChevronRight,
  Monitor,
  Type as TypeIcon,
  ChevronLeft,
  Columns,
  Maximize2
} from 'lucide-react';
import { OutputType, Tone, Language, GeneratedData, SlideContent, DocumentSection } from './types';
import { generateAILogic } from './geminiService';
import { downloadPPTX, downloadDOCX } from './fileService';

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
      setError("Failed to generate content. Please check your API key and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!generatedData) return;
    if (generatedData.type === OutputType.SLIDES) {
      downloadPPTX(generatedData);
    } else {
      downloadDOCX(generatedData);
    }
  };

  // Helper to get total count for navigation
  const totalItems = generatedData ? generatedData.items.length + (generatedData.type === OutputType.SLIDES ? 1 : 0) : 0;

  const goToNext = () => setActiveSlideIndex(prev => Math.min(prev + 1, totalItems - 1));
  const goToPrev = () => setActiveSlideIndex(prev => Math.max(prev - 1, 0));

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
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
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-500">
            <a href="#" className="hover:text-indigo-600 transition-colors">Workspace</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Library</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Team</a>
            <div className="h-4 w-px bg-slate-200" />
            <button className="px-5 py-2 rounded-full border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all font-medium">
              Sign In
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-[1600px] mx-auto w-full px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Configuration Panel */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-6 lg:sticky lg:top-24">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-800 relative">
              <Settings2 className="w-5 h-5 text-indigo-500" />
              Design Specs
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
                  className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all resize-none text-slate-800 placeholder:text-slate-400 font-medium"
                />
              </div>

              {/* Grid of options */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <TypeIcon className="w-3.5 h-3.5" /> Tone
                  </label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value as Tone)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none cursor-pointer focus:ring-4 focus:ring-indigo-500/10 transition-all text-slate-700 font-medium appearance-none"
                  >
                    {Object.values(Tone).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">
                    {type === OutputType.SLIDES ? 'Length' : 'Pages'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="15"
                    value={count}
                    onChange={(e) => setCount(parseInt(e.target.value))}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all text-slate-700 font-medium"
                  />
                </div>
              </div>

              {/* Language */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" /> Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as Language)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none cursor-pointer focus:ring-4 focus:ring-indigo-500/10 transition-all text-slate-700 font-medium appearance-none"
                >
                  {Object.values(Language).map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-xs font-bold flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  {error}
                </div>
              )}

              <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-xl shadow-slate-200 hover:bg-slate-800 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Drafting AI Content...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Create with DocuGenius
                  </>
                )}
              </button>
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
                <div className="flex items-center gap-2">
                   <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20 active:scale-95 group"
                  >
                    <Download className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                    Export {type === OutputType.SLIDES ? 'PPTX' : 'DOCX'}
                  </button>
                </div>
              )}
            </div>

            {/* Canvas Body */}
            <div className="flex flex-1 overflow-hidden">
              
              {/* Slide Thumbnails (Sidebar) - Only for Slides */}
              {generatedData && type === OutputType.SLIDES && (
                <div className="w-48 bg-slate-950/50 border-r border-slate-800 p-4 overflow-y-auto space-y-4 custom-scrollbar">
                  {/* Title Slide Thumbnail */}
                  <div 
                    onClick={() => setActiveSlideIndex(0)}
                    className={`aspect-video rounded-lg cursor-pointer transition-all border-2 overflow-hidden flex flex-col p-1.5 bg-gradient-to-br from-indigo-900 to-purple-900 ${
                      activeSlideIndex === 0 ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-lg' : 'border-slate-800 hover:border-slate-600 opacity-60'
                    }`}
                  >
                    <div className="w-full h-1 bg-white/20 rounded mb-1" />
                    <div className="text-[6px] text-white/50 leading-tight font-bold line-clamp-2 uppercase">{generatedData.title}</div>
                  </div>
                  
                  {/* Content Slides Thumbnails */}
                  {generatedData.items.map((_, i) => (
                    <div 
                      key={i}
                      onClick={() => setActiveSlideIndex(i + 1)}
                      className={`aspect-video rounded-lg cursor-pointer transition-all border-2 flex flex-col p-2 bg-slate-800 ${
                        activeSlideIndex === i + 1 ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-lg' : 'border-slate-800 hover:border-slate-600 opacity-60'
                      }`}
                    >
                      <div className="w-6 h-0.5 bg-slate-600 rounded mb-1" />
                      <div className="space-y-0.5">
                        <div className="w-full h-0.5 bg-slate-700" />
                        <div className="w-3/4 h-0.5 bg-slate-700" />
                        <div className="w-1/2 h-0.5 bg-slate-700" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Main Preview Area */}
              <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center bg-slate-950/30 custom-scrollbar relative">
                
                {!generatedData && !loading && (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-center space-y-6">
                    <div className="w-32 h-32 bg-slate-900 rounded-[40px] flex items-center justify-center border border-slate-800 shadow-2xl relative group">
                       <div className="absolute inset-0 bg-indigo-500/10 rounded-[40px] blur-2xl group-hover:bg-indigo-500/20 transition-all" />
                      {type === OutputType.SLIDES ? <Presentation className="w-16 h-16 text-indigo-400" /> : <FileText className="w-16 h-16 text-indigo-400" />}
                    </div>
                    <div className="max-w-xs">
                      <h3 className="text-white font-bold text-xl mb-2">Ready to Create</h3>
                      <p className="text-sm text-slate-400 leading-relaxed">Enter your instructions on the left to generate your {type === OutputType.SLIDES ? 'slide deck' : 'document'} with AI precision.</p>
                    </div>
                  </div>
                )}

                {loading && (
                  <div className="flex-1 flex flex-col items-center justify-center gap-8">
                    <div className="relative">
                      <div className="w-24 h-24 border-4 border-slate-800 border-t-indigo-500 rounded-full animate-[spin_1.5s_linear_infinite]"></div>
                      <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-500 w-8 h-8 animate-pulse" />
                    </div>
                    <div className="text-center space-y-2">
                      <p className="font-bold text-white text-2xl tracking-tight">Crafting Masterpiece...</p>
                      <div className="flex gap-1 justify-center">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                      </div>
                    </div>
                  </div>
                )}

                {generatedData && (
                  <div className="w-full max-w-5xl animate-in fade-in duration-700">
                    
                    {/* Navigation Overlays (Floating) */}
                    <div className="fixed bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-slate-900/80 backdrop-blur-xl px-4 py-2 rounded-2xl border border-slate-700/50 shadow-2xl z-20">
                      <button 
                        onClick={goToPrev}
                        disabled={activeSlideIndex === 0}
                        className="p-2 hover:bg-slate-800 rounded-xl transition-all disabled:opacity-30 text-white"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <div className="text-xs font-black text-slate-400 px-4 select-none tracking-widest uppercase">
                        {activeSlideIndex + 1} / {totalItems}
                      </div>
                      <button 
                        onClick={goToNext}
                        disabled={activeSlideIndex === totalItems - 1}
                        className="p-2 hover:bg-slate-800 rounded-xl transition-all disabled:opacity-30 text-white"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Rendering Engine */}
                    <div className="mb-24">
                      {type === OutputType.SLIDES ? (
                        /* Presentation Slide Engine */
                        <div className="slide-canvas">
                          {activeSlideIndex === 0 ? (
                            /* Title Slide */
                            <div className="aspect-video bg-gradient-to-br from-indigo-800 via-indigo-600 to-purple-800 rounded-3xl shadow-2xl flex flex-col items-center justify-center p-16 text-center text-white relative overflow-hidden border border-white/10 ring-1 ring-white/20">
                              <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                                <svg width="100%" height="100%"><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/></pattern><rect width="100%" height="100%" fill="url(#grid)" /></svg>
                              </div>
                              <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/20 rounded-full blur-[120px]" />
                              <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/30 rounded-full blur-[120px]" />
                              
                              <div className="relative z-10 w-full">
                                <div className="inline-block px-4 py-1.5 bg-white/10 border border-white/20 rounded-full text-xs font-bold tracking-[0.2em] uppercase mb-10 backdrop-blur-md">
                                  Global Presentation Deck
                                </div>
                                <h1 className="text-6xl font-black mb-8 leading-[1.05] tracking-tight text-white drop-shadow-2xl">
                                  {generatedData.title}
                                </h1>
                                {generatedData.subtitle && (
                                  <p className="text-2xl text-indigo-100 font-medium opacity-90 max-w-3xl mx-auto italic border-t border-white/10 pt-8">
                                    {generatedData.subtitle}
                                  </p>
                                )}
                              </div>
                            </div>
                          ) : (
                            /* Content Slides */
                            <div className="aspect-video bg-white rounded-3xl shadow-2xl flex flex-col p-12 text-slate-800 relative group overflow-hidden border border-slate-200">
                              <div className="absolute top-0 left-0 w-2 h-full bg-indigo-600" />
                              <div className="absolute top-8 right-12 text-slate-100 font-black text-8xl pointer-events-none select-none">
                                {String(activeSlideIndex + 1).padStart(2, '0')}
                              </div>
                              
                              <div className="relative z-10">
                                <h3 className="text-4xl font-black text-slate-900 mb-12 flex items-center gap-4 border-b border-slate-100 pb-8">
                                  <span className="flex items-center justify-center w-12 h-12 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-600/30 text-lg">
                                    {activeSlideIndex}
                                  </span>
                                  {(generatedData.items[activeSlideIndex - 1] as SlideContent).title}
                                </h3>
                                
                                <div className="flex-1 flex flex-col justify-center">
                                  <ul className="space-y-8">
                                    {(generatedData.items[activeSlideIndex - 1] as SlideContent).points.map((point, pIdx) => (
                                      <li key={pIdx} className="flex gap-6 text-2xl text-slate-600 font-medium leading-relaxed group/item transition-all hover:translate-x-2">
                                        <div className="w-3 h-3 rounded-full bg-indigo-500 mt-3 flex-shrink-0 shadow-sm" />
                                        <span>{point}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                              
                              <div className="mt-auto pt-8 flex justify-between items-center text-[10px] font-black text-slate-300 tracking-widest uppercase border-t border-slate-50">
                                <div className="flex items-center gap-2">
                                  <div className="w-4 h-4 bg-indigo-600 rounded-sm" />
                                  <span>Design System v1.0</span>
                                </div>
                                <span>DocuGenius AI • Strategic Deck</span>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        /* Document Page Engine */
                        <div className="document-canvas">
                           {activeSlideIndex === 0 ? (
                             /* Document Front Page */
                             <div className="bg-white min-h-[900px] shadow-2xl p-24 flex flex-col border border-slate-200 relative overflow-hidden">
                               <div className="absolute top-0 right-0 w-4 h-full bg-slate-900" />
                               <div className="mb-24 flex justify-between items-start">
                                 <div className="text-4xl font-black italic tracking-tighter text-slate-900 border-l-8 border-indigo-600 pl-6">
                                   DG<span className="text-indigo-600">.</span>
                                 </div>
                                 <div className="text-right">
                                   <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Issue Date</div>
                                   <div className="text-sm font-bold text-slate-900">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                                 </div>
                               </div>

                               <div className="flex-1 flex flex-col justify-center">
                                 <div className="w-24 h-1 bg-indigo-600 mb-12" />
                                 <h1 className="text-7xl font-serif font-black text-slate-900 mb-8 leading-[1.1] max-w-3xl">
                                   {generatedData.title}
                                 </h1>
                                 <div className="flex items-center gap-8 mt-12">
                                   <div>
                                     <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">Primary Intent</div>
                                     <div className="text-lg font-bold text-slate-800">{tone} Strategy Report</div>
                                   </div>
                                   <div className="h-10 w-px bg-slate-100" />
                                   <div>
                                     <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">Scope</div>
                                     <div className="text-lg font-bold text-slate-800">Generated Synthesis</div>
                                   </div>
                                 </div>
                               </div>

                               <div className="mt-auto border-t border-slate-100 pt-12 flex justify-between text-[10px] font-black tracking-widest text-slate-300 uppercase">
                                 <span>INTERNAL DOCUMENTATION</span>
                                 <span>SECURE GENESIS v2.4</span>
                               </div>
                             </div>
                           ) : (
                             /* Document Body Section */
                             <div className="bg-white min-h-[900px] shadow-2xl p-20 flex flex-col border border-slate-200">
                                <div className="flex justify-between items-center mb-16 text-[10px] font-black text-slate-300 tracking-widest uppercase border-b border-slate-50 pb-8">
                                  <span>{generatedData.title}</span>
                                  <span>Section {String(activeSlideIndex).padStart(2, '0')}</span>
                                </div>

                                <div className="max-w-3xl mx-auto w-full">
                                  <h3 className="text-4xl font-serif font-bold text-indigo-900 mb-10 leading-tight">
                                    {(generatedData.items[activeSlideIndex - 1] as DocumentSection).heading}
                                  </h3>
                                  <div className="space-y-8">
                                    {(generatedData.items[activeSlideIndex - 1] as DocumentSection).paragraphs.map((p, pIdx) => (
                                      <p key={pIdx} className="text-xl text-slate-700 leading-relaxed text-justify font-serif selection:bg-indigo-100">
                                        {p}
                                      </p>
                                    ))}
                                  </div>
                                </div>

                                <div className="mt-auto pt-12 text-center">
                                   <div className="text-slate-300 font-serif text-sm"> — {activeSlideIndex + 1} — </div>
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

      {/* Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
        
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-in {
          animation: fade-in 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        /* Prevent ugly text selection on UI elements */
        button, select, input { user-select: none; }
      `}</style>
    </div>
  );
};

export default App;
