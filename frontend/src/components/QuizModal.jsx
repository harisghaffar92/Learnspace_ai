import React, { useState } from 'react';
import {
  X,
  HelpCircle,
  CheckCircle2,
  XCircle,
  Award,
  RotateCcw,
  Sparkles,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';

export default function QuizModal({ isOpen, onClose, quizData, loading, onRetry }) {
  const [userAnswers, setUserAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const questions = quizData?.questions || [];

  const handleSelectOption = (questionIndex, option) => {
    if (submitted) return;
    setUserAnswers((prev) => ({
      ...prev,
      [questionIndex]: option,
    }));
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correct_answer) {
        score += 1;
      }
    });
    return score;
  };

  const handleSubmitQuiz = () => {
    setSubmitted(true);
  };

  const handleReset = () => {
    setUserAnswers({});
    setSubmitted(false);
  };

  const score = calculateScore();
  const answeredCount = Object.keys(userAnswers).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#11121b] border border-[#2b2c3e] rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#20212e] bg-[#141522]/90">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#251e13] border border-[#e5a93c]/30 rounded-xl text-[#e5a93c]">
              <Sparkles className="w-5 h-5 text-[#f59e0b]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#f5f2ea] tracking-tight font-heading">
                Active Recall Mastery Examination
              </h3>
              <p className="text-xs text-[#8c8981]">
                Synthesized dynamically from manuscript structure & study notes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#8c8981] hover:text-[#f5f2ea] rounded-xl hover:bg-[#1f202e] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-full border-4 border-[#2c271b] border-t-[#e5a93c] animate-spin" />
                <Sparkles className="w-5 h-5 text-[#f59e0b] absolute inset-0 m-auto animate-pulse" />
              </div>
              <p className="text-sm font-medium text-[#dedad2]">
                Formulating 5 targeted comprehension challenges...
              </p>
              <p className="text-xs text-[#78756d]">High-Precision Active Recall Engine</p>
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <HelpCircle className="w-12 h-12 text-[#5e5c54] mx-auto" />
              <p className="text-[#dedad2] font-medium">No examination formulated yet.</p>
              <button
                onClick={onRetry}
                className="px-5 py-2.5 bg-[#e5a93c] hover:bg-[#d97706] text-[#120e06] font-bold rounded-xl text-sm transition"
              >
                Launch Examination Now
              </button>
            </div>
          ) : (
            <>
              {/* Score Banner */}
              {submitted && (
                <div className="bg-gradient-to-r from-[#221c13] via-[#1a1b26] to-[#12131d] border border-[#e5a93c]/40 rounded-2xl p-6 text-center shadow-lg">
                  <Award className="w-10 h-10 text-[#f59e0b] mx-auto mb-2" />
                  <h4 className="text-xl font-bold text-[#fef3c7] font-heading">
                    Mastery Result: {score} / {questions.length} ({Math.round((score / questions.length) * 100)}%)
                  </h4>
                  <p className="text-xs text-[#cdc8be] mt-1.5 max-w-md mx-auto">
                    {score === questions.length
                      ? "Flawless conceptual retention! You have demonstrated comprehensive command."
                      : score >= 3
                      ? "Solid grasp of foundational mechanics! Review the highlighted choices below."
                      : "Keep training. Review the strategic briefing and retake the assessment."}
                  </p>
                </div>
              )}

              {/* Questions List */}
              <div className="space-y-6">
                {questions.map((q, qIndex) => {
                  const selected = userAnswers[qIndex];
                  const isCorrect = selected === q.correct_answer;

                  return (
                    <div
                      key={q.id || qIndex}
                      className="bg-[#151622]/90 border border-[#262737] rounded-2xl p-5 space-y-3.5 transition"
                    >
                      <div className="flex items-start gap-3">
                        <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-[#222332] text-xs font-semibold text-[#c5c2ba] shrink-0 mt-0.5 font-mono">
                          {qIndex + 1}
                        </span>
                        <h4 className="text-sm font-medium text-[#f0ede6] leading-relaxed">
                          {q.question}
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 gap-2 pt-1 pl-9">
                        {q.options.map((option, optIdx) => {
                          const isOptionSelected = selected === option;
                          const isOptionCorrect = option === q.correct_answer;

                          let optionStyle =
                            "border-[#272839] bg-[#12131c]/80 text-[#cdc8be] hover:border-[#3e4058] hover:bg-[#181924]";

                          if (!submitted) {
                            if (isOptionSelected) {
                              optionStyle =
                                "border-[#e5a93c] bg-[#221c13] text-[#fef3c7] font-medium shadow-sm";
                            }
                          } else {
                            if (isOptionCorrect) {
                              optionStyle =
                                "border-[#059669] bg-[#064e3b]/30 text-[#6ee7b7] font-medium";
                            } else if (isOptionSelected && !isOptionCorrect) {
                              optionStyle =
                                "border-[#dc2626] bg-[#7f1d1d]/30 text-[#fca5a5] line-through";
                            } else {
                              optionStyle = "border-[#1c1d29] bg-[#0e0f17]/50 text-[#6a6861] opacity-50";
                            }
                          }

                          return (
                            <button
                              key={optIdx}
                              disabled={submitted}
                              onClick={() => handleSelectOption(qIndex, option)}
                              className={`flex items-center justify-between text-left px-4 py-3 rounded-xl border text-xs sm:text-sm transition-all duration-150 ${optionStyle}`}
                            >
                              <span>{option}</span>
                              {submitted && isOptionCorrect && (
                                <CheckCircle2 className="w-4 h-4 text-[#34d399] shrink-0 ml-2" />
                              )}
                              {submitted && isOptionSelected && !isOptionCorrect && (
                                <XCircle className="w-4 h-4 text-[#f87171] shrink-0 ml-2" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!loading && questions.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#20212e] bg-[#141522]/90">
            <div className="text-xs text-[#8c8981] font-mono">
              {answeredCount} of {questions.length} answered
            </div>
            <div className="flex items-center gap-3">
              {submitted ? (
                <>
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-1.5 px-4 py-2 border border-[#2b2c3d] hover:bg-[#1e1f2d] text-[#cdc8be] rounded-xl text-xs sm:text-sm font-medium transition cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4 text-[#e5a93c]" />
                    Retake Examination
                  </button>
                  <button
                    onClick={onClose}
                    className="px-5 py-2 bg-[#e5a93c] hover:bg-[#d97706] text-[#120e06] font-bold rounded-xl text-xs sm:text-sm transition shadow-md shadow-[#e5a93c]/20 cursor-pointer"
                  >
                    Complete
                  </button>
                </>
              ) : (
                <button
                  onClick={handleSubmitQuiz}
                  disabled={answeredCount === 0}
                  className="flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-[#d97706] via-[#f59e0b] to-[#e5a93c] hover:from-[#b45309] hover:to-[#d97706] disabled:opacity-40 disabled:cursor-not-allowed text-[#120e06] font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-[#d97706]/20 transition cursor-pointer"
                >
                  Submit for Evaluation
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
