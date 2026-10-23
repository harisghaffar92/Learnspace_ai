import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import {
  UploadCloud,
  FileText,
  FileCheck,
  AlertCircle,
  Sparkles,
  BookOpen,
  Presentation,
  FileCode,
  Clock,
  ArrowRight,
  Compass,
  Zap
} from 'lucide-react';

export default function UploadZone({ onMaterialLoaded }) {
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [error, setError] = useState(null);
  const [recentMaterials, setRecentMaterials] = useState([]);

  useEffect(() => {
    fetchRecentMaterials();
  }, []);

  const fetchRecentMaterials = async () => {
    try {
      const res = await axios.get('/api/materials/');
      setRecentMaterials(res.data || []);
    } catch (err) {
      console.log('No prior sessions found.');
    }
  };

  const handleUpload = async (file) => {
    if (!file) return;

    setError(null);
    setLoading(true);
    setLoadingStatus('Ingesting manuscript...');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', file.name.replace(/\.[^/.]+$/, ''));

    try {
      setLoadingStatus('Formulating executive briefing & structural index...');
      const response = await axios.post('/api/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setLoadingStatus('Workspace Ready!');
      if (onMaterialLoaded) {
        onMaterialLoaded(response.data);
      }
    } catch (err) {
      console.error(err);
      const errMsg =
        err.response?.data?.error ||
        err.message ||
        'Unable to complete manuscript synthesis. Please verify file integrity and server status.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        handleUpload(acceptedFiles[0]);
      }
    },
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
    },
    maxFiles: 1,
    disabled: loading,
  });

  const handleLoadDemoContent = async () => {
    const sampleText = `Quantum Computing and Superposition Principles

Quantum computing leverages quantum mechanical phenomena such as superposition and entanglement to perform calculations exponentially faster than classical computers for specific problem sets.

Core Principles:
1. Superposition: Unlike classical bits that exist in binary states 0 or 1, a qubit exists in a linear combination of states until measured. Mathematically represented as |ψ⟩ = α|0⟩ + β|1⟩, where |α|² + |β|² = 1.
2. Entanglement: Quantum entanglement links pairs or groups of qubits such that the quantum state of each particle cannot be described independently of the others, regardless of distance.
3. Quantum Decoherence: The loss of quantum coherence due to environmental noise and thermal fluctuations is the greatest engineering obstacle in modern quantum systems.

Real-World Applications:
- Cryptography: Shor's algorithm can break RSA public-key encryption in polynomial time, driving post-quantum cryptography standards.
- Drug Discovery: Molecular simulation for pharmaceutical enzymes that are intractable for supercomputers.
- Logistics and Portfolio Optimization: Solving combinatorial optimization problems using quantum annealing and QAOA algorithms.`;

    const blob = new Blob([sampleText], { type: 'text/plain' });
    const sampleFile = new File([blob], 'Quantum_Computing_Primer.txt', { type: 'text/plain' });
    handleUpload(sampleFile);
  };

  const handleSelectRecent = async (materialId) => {
    setLoading(true);
    setLoadingStatus('Restoring study workspace...');
    try {
      const res = await axios.get(`/api/materials/${materialId}/`);
      if (onMaterialLoaded) {
        onMaterialLoaded({
          id: res.data.id,
          material: res.data,
          summary: res.data.ai_summary,
          note: res.data.latest_note,
        });
      }
    } catch (err) {
      setError('Failed to restore selected study session.');
    } finally {
      setLoading(false);
    }
  };

  const getFormatBadge = (ext) => {
    switch (ext.toLowerCase()) {
      case 'pdf':
        return (
          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-[#3d1a24] text-[#fca5a5] border border-[#7f1d1d]/40 font-mono">
            PDF
          </span>
        );
      case 'docx':
      case 'doc':
        return (
          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-[#1a2936] text-[#93c5fd] border border-[#1e3a8a]/40 font-mono">
            DOCX
          </span>
        );
      case 'pptx':
      case 'ppt':
        return (
          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-[#322314] text-[#fcd34d] border border-[#78350f]/40 font-mono">
            PPTX
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-[#162a22] text-[#86efac] border border-[#064e3b]/40 font-mono">
            TXT
          </span>
        );
    }
  };

  return (
    <div className="min-h-[90vh] flex flex-col items-center justify-center px-4 py-12 max-w-4xl mx-auto ambient-glow-amber">
      {/* Brand & Editorial Title */}
      <div className="text-center space-y-3.5 mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1e1c15] border border-[#e5a93c]/30 text-[#e5a93c] text-xs font-medium tracking-wide shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-[#f59e0b]" />
          Cognitive Study Sanctuary • High-Precision Manuscript Engine
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#f7f5f0] font-heading">
          LearnSpace <span className="text-[#e5a93c] italic font-serif-quote font-normal">Studio</span>
        </h1>

        <p className="text-sm sm:text-base text-[#a3a099] max-w-xl mx-auto leading-relaxed">
          Transform research manuscripts, complex lectures, and raw notes into structured mastery briefings, precision notes, and targeted recall assessments.
        </p>
      </div>

      {/* Main Ingestion Dropzone */}
      <div className="w-full">
        <div
          {...getRootProps()}
          className={`relative group border-2 border-dashed rounded-3xl p-10 sm:p-14 text-center cursor-pointer transition-all duration-300 backdrop-blur-xl ${
            isDragActive
              ? 'border-[#e5a93c] bg-[#1a1710]/90 scale-[1.01] shadow-2xl shadow-[#e5a93c]/10'
              : 'border-[#292a3a] hover:border-[#e5a93c]/60 bg-[#12131b]/70 hover:bg-[#161722]/80 shadow-2xl'
          }`}
        >
          <input {...getInputProps()} />

          {loading ? (
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-[#2c271b] border-t-[#e5a93c] animate-spin" />
                <Sparkles className="w-6 h-6 text-[#f59e0b] absolute inset-0 m-auto animate-pulse" />
              </div>
              <div className="space-y-1">
                <p className="text-base font-medium text-[#f5f2ea]">{loadingStatus}</p>
                <p className="text-xs text-[#8a877f]">
                  Synthesizing core takeaways, practical applications, and workspace index...
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-5">
              <div className="w-18 h-18 rounded-2xl bg-gradient-to-br from-[#2a2215] to-[#1c1811] border border-[#e5a93c]/30 flex items-center justify-center text-[#e5a93c] shadow-xl group-hover:scale-105 group-hover:border-[#e5a93c]/60 transition-all duration-200">
                <UploadCloud className="w-8 h-8 text-[#e5a93c]" />
              </div>

              <div className="space-y-1.5">
                <p className="text-base sm:text-lg font-semibold text-[#f0ede6]">
                  {isDragActive ? 'Release document to ingest' : 'Drop study manuscripts here or browse'}
                </p>
                <p className="text-xs sm:text-sm text-[#96938a]">
                  Instant multi-format ingestion for academic publications, presentations, and treatises
                </p>
              </div>

              {/* Supported format badges */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#181923] border border-[#272839] text-xs text-[#c5c2ba]">
                  <FileText className="w-3.5 h-3.5 text-[#f87171]" /> PDF
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#181923] border border-[#272839] text-xs text-[#c5c2ba]">
                  <BookOpen className="w-3.5 h-3.5 text-[#60a5fa]" /> DOCX
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#181923] border border-[#272839] text-xs text-[#c5c2ba]">
                  <Presentation className="w-3.5 h-3.5 text-[#fbbf24]" /> PPTX
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#181923] border border-[#272839] text-xs text-[#c5c2ba]">
                  <FileCode className="w-3.5 h-3.5 text-[#34d399]" /> TXT
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Error notification */}
        {error && (
          <div className="mt-4 p-4 rounded-xl bg-[#2a1418] border border-[#dc2626]/40 text-[#fecaca] flex items-start gap-3 text-xs sm:text-sm">
            <AlertCircle className="w-5 h-5 text-[#f87171] shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-[#fee2e2]">Ingestion Diagnostic</p>
              <p className="mt-0.5 text-[#fca5a5]">{error}</p>
            </div>
          </div>
        )}

        {/* Demo Quick Button */}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#8c8981] px-2">
          <span>Explore demonstration workspace immediately:</span>
          <button
            type="button"
            onClick={handleLoadDemoContent}
            disabled={loading}
            className="inline-flex items-center gap-1.5 text-[#e5a93c] hover:text-[#fbbf24] font-medium transition cursor-pointer hover:underline"
          >
            <Zap className="w-3.5 h-3.5 text-[#f59e0b]" />
            Inspect Sample: Quantum Computing Principles
          </button>
        </div>
      </div>

      {/* Recent Materials History */}
      {recentMaterials.length > 0 && !loading && (
        <div className="w-full mt-12">
          <div className="flex items-center gap-2 mb-3 px-1 text-xs font-semibold text-[#8c8981] uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5 text-[#e5a93c]" />
            Archived Study Sessions
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {recentMaterials.map((mat) => (
              <button
                key={mat.id}
                onClick={() => handleSelectRecent(mat.id)}
                className="flex items-center justify-between p-4 rounded-2xl bg-[#13141c]/80 border border-[#232433] hover:border-[#e5a93c]/50 hover:bg-[#181924] text-left transition group cursor-pointer shadow-md"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="p-2.5 rounded-xl bg-[#1b1c28] text-[#c2bfb6] group-hover:text-[#e5a93c] group-hover:bg-[#252016] transition">
                    <FileCheck className="w-4 h-4" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-medium text-[#ede9e1] truncate group-hover:text-white">
                      {mat.title}
                    </p>
                    <p className="text-[11px] text-[#78756d]">
                      {new Date(mat.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 shrink-0">
                  {getFormatBadge(mat.file_type || 'txt')}
                  <ArrowRight className="w-4 h-4 text-[#5e5c54] group-hover:text-[#e5a93c] group-hover:translate-x-0.5 transition-all" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
