import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import {
  Sparkles,
  BookOpen,
  HelpCircle,
  FileText,
  Lightbulb,
  CheckCircle,
  Clock,
  Bookmark,
  BookmarkCheck,
  Save,
  Copy,
  PlusCircle,
  X,
  ExternalLink,
  ChevronRight,
  Layers,
  ArrowLeft,
  Compass,
  Check
} from 'lucide-react';
import QuizModal from './QuizModal';

export default function StudyDashboard({ materialData, onBackToUpload }) {
  const material = materialData?.material || materialData;
  const initialSummary = materialData?.summary || material?.ai_summary;
  const initialNote = materialData?.note || material?.latest_note;

  const [activeTab, setActiveTab] = useState('summary');

  const [noteContent, setNoteContent] = useState(initialNote?.content || '');
  const [saveStatus, setSaveStatus] = useState('saved');
  const [isBookmarked, setIsBookmarked] = useState(initialNote?.is_bookmarked || false);
  const debounceTimerRef = useRef(null);

  const [selectionRange, setSelectionRange] = useState(null);
  const [selectedText, setSelectedText] = useState('');
  const [floatingBtnPos, setFloatingBtnPos] = useState(null);

  const [explanationData, setExplanationData] = useState(null);
  const [explaining, setExplaining] = useState(false);
  const [explainError, setExplainError] = useState(null);
  const [copied, setCopied] = useState(false);

  const [quizOpen, setQuizOpen] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizData, setQuizData] = useState(null);

  const leftPanelRef = useRef(null);

  const saveNoteToBackend = useCallback(
    async (contentToSave, bookmarkedFlag) => {
      if (!material?.id) return;
      setSaveStatus('saving');
      try {
        await axios.put(`/api/notes/${material.id}/`, {
          content: contentToSave,
          is_bookmarked: bookmarkedFlag !== undefined ? bookmarkedFlag : isBookmarked,
        });
        setSaveStatus('saved');
      } catch (err) {
        console.error('Auto-save error:', err);
        setSaveStatus('unsaved');
      }
    },
    [material?.id, isBookmarked]
  );

  const handleNotesChange = (newContent) => {
    setNoteContent(newContent);
    setSaveStatus('unsaved');

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      saveNoteToBackend(newContent, isBookmarked);
    }, 2000);
  };

  const toggleBookmark = () => {
    const nextState = !isBookmarked;
    setIsBookmarked(nextState);
    saveNoteToBackend(noteContent, nextState);
  };

  const handleLeftPanelMouseUp = (e) => {
    if (e.target.closest('#floating-explain-btn') || e.target.closest('#explanation-drawer')) {
      return;
    }

    const selection = window.getSelection();
    const text = selection ? selection.toString().trim() : '';

    if (text && text.length > 10) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      setSelectedText(text);
      setSelectionRange(range);

      setFloatingBtnPos({
        top: Math.max(10, rect.top + window.scrollY - 46),
        left: Math.max(10, rect.left + window.scrollX + rect.width / 2 - 60),
      });
    } else {
      setFloatingBtnPos(null);
    }
  };

  useEffect(() => {
    const handleDocumentClick = (e) => {
      if (!e.target.closest('#floating-explain-btn') && !e.target.closest('#explanation-drawer')) {
        const selection = window.getSelection();
        if (!selection || !selection.toString().trim()) {
          setFloatingBtnPos(null);
        }
      }
    };
    document.addEventListener('mousedown', handleDocumentClick);
    return () => document.removeEventListener('mousedown', handleDocumentClick);
  }, []);

  const handleExplainSelection = async () => {
    if (!selectedText) return;

    setFloatingBtnPos(null);
    setExplaining(true);
    setExplainError(null);
    setExplanationData({
      text: selectedText,
      explanation: '',
    });

    try {
      const res = await axios.post('/api/explain/', {
        text: selectedText,
        material_id: material.id,
      });

      setExplanationData({
        text: selectedText,
        explanation: res.data.explanation,
      });
    } catch (err) {
      console.error('Synthesis error:', err);
      setExplainError(
        err.response?.data?.error || err.message || 'Unable to synthesize contextual explanation for this passage.'
      );
    } finally {
      setExplaining(false);
    }
  };

  const handleAppendExplanationToNotes = () => {
    if (!explanationData?.explanation) return;

    const formattedBlock = `<p><br></p><blockquote><strong>Deep Dive: ${explanationData.text}</strong><br>${explanationData.explanation}</blockquote><p><br></p>`;
    const updated = noteContent + formattedBlock;
    setNoteContent(updated);
    saveNoteToBackend(updated, isBookmarked);
    setExplanationData(null);
  };

  const handleCopyExplanation = () => {
    if (explanationData?.explanation) {
      navigator.clipboard.writeText(explanationData.explanation);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleTriggerQuiz = async () => {
    setQuizOpen(true);
    setQuizLoading(true);
    try {
      const res = await axios.post(`/api/quiz/${material.id}/`);
      setQuizData(res.data);
    } catch (err) {
      console.error('Assessment generation error:', err);
      alert(
        'Unable to launch assessment: ' +
          (err.response?.data?.error || err.message || 'Please check manuscript structure.')
      );
    } finally {
      setQuizLoading(false);
    }
  };

  const keyPoints = initialSummary?.key_points || [];
  const realWorldExamples = initialSummary?.real_world_examples || [];

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0c11] text-[#e8e6e1]">
      {/* Studio Header Bar */}
      <header className="h-16 border-b border-[#20212e] bg-[#101119]/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between shrink-0 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToUpload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#181923] hover:bg-[#202130] text-[#a5a29a] hover:text-[#f5f2ea] text-xs font-medium transition cursor-pointer border border-[#2b2c3d]"
            title="Ingest new manuscript"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#e5a93c]" />
            <span className="hidden sm:inline">New Session</span>
          </button>

          <div className="h-5 w-px bg-[#262738]" />

          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-[#221c13] border border-[#e5a93c]/30 text-[#e5a93c]">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#f5f2ea] leading-tight truncate max-w-xs sm:max-w-md font-heading">
                {material?.title || 'Study Session'}
              </h2>
              <span className="text-[10px] text-[#8f8c83] uppercase font-mono tracking-wider">
                {material?.file_type || 'DOC'} Manuscript
              </span>
            </div>
          </div>
        </div>

        {/* Right Header Status Controls */}
        <div className="flex items-center gap-3">
          {/* Auto-save Status */}
          <div className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-[#161722] border border-[#27283a]">
            {saveStatus === 'saving' ? (
              <>
                <div className="w-2 h-2 rounded-full bg-[#f59e0b] animate-ping" />
                <span className="text-[#c7c4bb]">Saving...</span>
              </>
            ) : saveStatus === 'unsaved' ? (
              <>
                <div className="w-2 h-2 rounded-full bg-[#e5a93c]" />
                <span className="text-[#fcd34d]">Unsaved changes</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-3.5 h-3.5 text-[#34d399]" />
                <span className="text-[#8c8981]">Saved</span>
              </>
            )}
          </div>

          {/* Bookmark Toggle */}
          <button
            onClick={toggleBookmark}
            className={`p-2 rounded-xl border transition cursor-pointer ${
              isBookmarked
                ? 'bg-[#2a2215] border-[#e5a93c]/50 text-[#f59e0b]'
                : 'bg-[#181924] border-[#292a3c] text-[#8a877e] hover:text-[#f0ede6]'
            }`}
            title={isBookmarked ? 'Bookmarked session' : 'Bookmark this session'}
          >
            {isBookmarked ? (
              <BookmarkCheck className="w-4 h-4" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
          </button>
        </div>
      </header>

      {/* Main Split Screen */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-hidden h-[calc(100vh-4rem)]">
        {/* LEFT PANEL: Executive Briefing & Context Source */}
        <section
          ref={leftPanelRef}
          onMouseUp={handleLeftPanelMouseUp}
          className="flex flex-col border-r border-[#20212e] bg-[#0e0f16]/60 overflow-hidden relative"
        >
          {/* Tabs Header */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-[#20212e] bg-[#12131c]/70 shrink-0">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('summary')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  activeTab === 'summary'
                    ? 'bg-[#e5a93c] text-[#141008] shadow-sm'
                    : 'text-[#96938a] hover:text-[#ede9e1] hover:bg-[#1a1b28]'
                }`}
              >
                Executive Briefing & Cases
              </button>
              <button
                onClick={() => setActiveTab('raw_text')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                  activeTab === 'raw_text'
                    ? 'bg-[#e5a93c] text-[#141008] shadow-sm'
                    : 'text-[#96938a] hover:text-[#ede9e1] hover:bg-[#1a1b28]'
                }`}
              >
                Source Manuscript
              </button>
            </div>

            <div className="hidden sm:inline-flex items-center gap-1.5 text-[11px] text-[#e5a93c] bg-[#221c13] px-2.5 py-1 rounded-full border border-[#e5a93c]/30">
              <Sparkles className="w-3 h-3 text-[#f59e0b]" />
              Highlight text to clarify concepts
            </div>
          </div>

          {/* Left Scroll Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {activeTab === 'summary' ? (
              <div className="space-y-6">
                {/* Core Principles Card */}
                <div className="bg-[#12131d]/90 border border-[#232435] rounded-2xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 text-[#e5a93c] font-semibold text-sm font-heading">
                    <FileText className="w-4 h-4 text-[#f59e0b]" />
                    <span>Core Strategic Principles</span>
                  </div>
                  {keyPoints.length === 0 ? (
                    <p className="text-xs text-[#8c8981] italic">Briefing not yet populated.</p>
                  ) : (
                    <ul className="space-y-3.5">
                      {keyPoints.map((point, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-3.5 text-sm text-[#dedad2] leading-relaxed selection:bg-[#e5a93c]/30 selection:text-[#fef3c7]"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-[#e5a93c] shrink-0 mt-2" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Practical Case Implementations Card */}
                <div className="bg-[#12131d]/90 border border-[#232435] rounded-2xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 text-[#fcd34d] font-semibold text-sm font-heading">
                    <Lightbulb className="w-4 h-4 text-[#fbbf24]" />
                    <span>Empirical Applications & Case Studies</span>
                  </div>
                  {realWorldExamples.length === 0 ? (
                    <p className="text-xs text-[#8c8981] italic">No case studies cataloged.</p>
                  ) : (
                    <div className="grid grid-cols-1 gap-3">
                      {realWorldExamples.map((ex, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-xl bg-[#181926]/80 border border-[#2a2b3d] text-xs sm:text-sm text-[#cdc8be] leading-relaxed selection:bg-[#e5a93c]/30 selection:text-[#fef3c7]"
                        >
                          {ex}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Raw Document Text */
              <div className="bg-[#12131d]/90 border border-[#232435] rounded-2xl p-6">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#232435]">
                  <span className="text-xs font-semibold text-[#8c8981] uppercase tracking-wider font-mono">
                    Manuscript Source ({material?.extracted_text?.length || 0} characters)
                  </span>
                </div>
                <div className="text-sm text-[#dedad2] whitespace-pre-wrap leading-relaxed selection:bg-[#e5a93c]/30 selection:text-[#fef3c7]">
                  {material?.extracted_text || 'No text content available.'}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* RIGHT PANEL: Precision Workspace & Debounced Notes */}
        <section className="flex flex-col bg-[#0b0c11] overflow-hidden">
          {/* Right Header */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-[#20212e] bg-[#12131c]/70 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#f0ede6] uppercase tracking-wider font-heading">
                Precision Study Notes
              </span>
              <span className="text-[11px] text-[#78756d] font-mono">Auto-saves 2s</span>
            </div>
            <button
              onClick={() => saveNoteToBackend(noteContent, isBookmarked)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium text-[#aba79e] hover:text-[#f5f2ea] bg-[#181925] hover:bg-[#202132] transition cursor-pointer border border-[#2b2c3d]"
            >
              <Save className="w-3.5 h-3.5 text-[#e5a93c]" />
              Save Now
            </button>
          </div>

          {/* Quill Notes Editor */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col">
            <div className="flex-1 flex flex-col">
              <ReactQuill
                theme="snow"
                value={noteContent}
                onChange={handleNotesChange}
                placeholder="Formulate strategic notes, structural arguments, or embed concept deep-dives..."
                modules={{
                  toolbar: [
                    [{ header: [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ list: 'ordered' }, { list: 'bullet' }],
                    ['blockquote', 'code-block'],
                    ['clean'],
                  ],
                }}
              />
            </div>
          </div>

          {/* Bottom Action Footer with Mastery Exam Button */}
          <div className="px-6 py-4 border-t border-[#20212e] bg-[#11121a]/90 backdrop-blur-md flex items-center justify-between shrink-0">
            <div className="text-xs text-[#8c8981]">
              Ready to test conceptual comprehension & active recall?
            </div>
            <button
              onClick={handleTriggerQuiz}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#d97706] via-[#f59e0b] to-[#e5a93c] hover:from-[#b45309] hover:to-[#d97706] text-[#120e06] font-bold text-sm shadow-xl shadow-[#d97706]/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#120e06]" />
              Launch Mastery Examination
            </button>
          </div>
        </section>
      </div>

      {/* Floating "✦ Clarify Concept" Button */}
      {floatingBtnPos && (
        <button
          id="floating-explain-btn"
          onClick={handleExplainSelection}
          style={{
            position: 'absolute',
            top: `${floatingBtnPos.top}px`,
            left: `${floatingBtnPos.left}px`,
          }}
          className="z-50 flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#d97706] to-[#f59e0b] hover:from-[#b45309] hover:to-[#d97706] text-[#140f06] text-xs font-bold shadow-2xl border border-[#fef3c7] animate-in fade-in zoom-in-90 duration-150 cursor-pointer hover:scale-105"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#140f06]" />
          ✦ Clarify Concept
        </button>
      )}

      {/* Contextual Concept Deep-Dive Drawer */}
      {(explaining || explanationData) && (
        <div
          id="explanation-drawer"
          className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] bg-[#12131d] border border-[#e5a93c]/40 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 duration-200"
        >
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#221c13] to-[#161722] border-b border-[#2d2e40]">
            <div className="flex items-center gap-2 text-[#e5a93c] text-xs font-semibold font-heading">
              <Sparkles className="w-4 h-4 text-[#f59e0b]" />
              Contextual Concept Deep-Dive
            </div>
            <button
              onClick={() => {
                setExplanationData(null);
                setExplaining(false);
              }}
              className="text-[#8c8981] hover:text-white p-1 rounded-lg hover:bg-[#1f202e] transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
            <div className="p-3 rounded-xl bg-[#191a27] border border-[#2b2c3e] text-xs text-[#cdc8be] font-serif-quote italic">
              "{explanationData?.text}"
            </div>

            {explaining ? (
              <div className="flex flex-col items-center justify-center py-6 space-y-3">
                <div className="w-8 h-8 rounded-full border-2 border-[#2c271b] border-t-[#e5a93c] animate-spin" />
                <p className="text-xs text-[#8c8981]">Synthesizing context and extracting intuitive analogies...</p>
              </div>
            ) : explainError ? (
              <p className="text-xs text-[#f87171]">{explainError}</p>
            ) : (
              <div className="text-xs sm:text-sm text-[#ede9e1] leading-relaxed whitespace-pre-wrap font-sans">
                {explanationData?.explanation}
              </div>
            )}
          </div>

          {!explaining && explanationData?.explanation && (
            <div className="flex items-center justify-between px-4 py-2.5 bg-[#10111a] border-t border-[#20212e]">
              <button
                onClick={handleCopyExplanation}
                className="flex items-center gap-1 text-[11px] text-[#8c8981] hover:text-[#f5f2ea] transition cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-[#34d399]" /> : <Copy className="w-3 h-3 text-[#e5a93c]" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
              <button
                onClick={handleAppendExplanationToNotes}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#e5a93c] hover:bg-[#d97706] text-[#120e06] text-xs font-semibold transition cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Embed in Notes
              </button>
            </div>
          )}
        </div>
      )}

      {/* Quiz Modal */}
      <QuizModal
        isOpen={quizOpen}
        onClose={() => setQuizOpen(false)}
        quizData={quizData}
        loading={quizLoading}
        onRetry={handleTriggerQuiz}
      />
    </div>
  );
}
