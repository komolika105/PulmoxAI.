import React, { useState, useEffect } from 'react';
import { Sparkles, Activity, AlertCircle, HelpCircle, ArrowRight, MessageSquare, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { fetchGeminiExplanation, sendGeminiChat } from '../services/api';

export default function GeminiExplanation({ prediction, confidence, probabilities }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  // Interactive Q&A chat state
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);

  useEffect(() => {
    if (!prediction) return;
    
    setLoading(true);
    setError('');

    fetchGeminiExplanation({
      prediction,
      confidence,
      probabilities
    })
      .then((explanationData) => {
        setData(explanationData);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load Gemini explanation:', err);
        setError('Could not load AI explanation.');
        setLoading(false);
      });
  }, [prediction, confidence, probabilities]);

  const handleSendQuestion = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userMsg = chatInput.trim();
    setChatInput('');
    setChatMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setChatLoading(true);

    try {
      const chatRes = await sendGeminiChat({
        message: userMsg,
        prediction,
        confidence,
        probabilities
      });
      
      setChatMessages((prev) => [...prev, { sender: 'ai', text: chatRes.reply }]);
    } catch (err) {
      setChatMessages((prev) => [...prev, { sender: 'ai', text: "Sorry, I couldn't process your question right now. Please discuss with your clinician." }]);
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 mt-8 text-center backdrop-blur-xl">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-3" />
        <h3 className="text-lg font-medium text-slate-200">Consulting Gemini AI Engine...</h3>
        <p className="text-slate-400 text-sm mt-1">Generating personalized clinical lung tissue explanation...</p>
      </div>
    );
  }

  if (error || !data) {
    return null;
  }

  return (
    <div className="bg-slate-900/90 border border-cyan-500/20 rounded-2xl p-6 md:p-8 mt-8 shadow-2xl backdrop-blur-xl transition-all duration-300">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 rounded-xl text-cyan-400">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                Powered by Gemini AI
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">{data.title}</h2>
          </div>
        </div>
      </div>

      {/* Summary Box */}
      <div className="mt-6 p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-300 text-sm leading-relaxed">
        <p className="font-medium text-slate-100">{data.summary}</p>
      </div>

      {/* Lung Anatomy Breakdown Section */}
      <div className="mt-6">
        <h3 className="text-md font-semibold text-cyan-300 flex items-center gap-2 mb-2">
          <Activity className="w-5 h-5 text-cyan-400" />
          What Has Happened to Your Lungs?
        </h3>
        <p className="text-slate-300 text-sm leading-relaxed bg-slate-950/40 p-4 rounded-xl border border-slate-800">
          {data.lung_anatomy_explanation}
        </p>
      </div>

      {/* 3 Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {/* Key Radiological Findings */}
        <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition">
          <h4 className="text-sm font-semibold text-blue-400 flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-4 h-4" />
            Key X-Ray Findings
          </h4>
          <ul className="space-y-2 text-xs text-slate-300">
            {(data?.key_findings || []).map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-blue-400 font-bold">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Symptoms to Monitor */}
        <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition">
          <h4 className="text-sm font-semibold text-amber-400 flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4" />
            Symptoms to Watch
          </h4>
          <ul className="space-y-2 text-xs text-slate-300">
            {(data?.symptoms_to_monitor || []).map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Doctor Questions */}
        <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition">
          <h4 className="text-sm font-semibold text-purple-400 flex items-center gap-2 mb-3">
            <HelpCircle className="w-4 h-4" />
            Ask Your Doctor
          </h4>
          <ul className="space-y-2 text-xs text-slate-300">
            {(data?.doctor_questions || []).map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-purple-400 font-bold">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Next Steps */}
      <div className="mt-6 p-4 rounded-xl bg-cyan-950/30 border border-cyan-800/40 flex items-start gap-3">
        <ArrowRight className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-cyan-400">Recommended Next Steps</h4>
          <p className="text-sm text-slate-200 mt-1">{data.next_steps}</p>
        </div>
      </div>

      {/* Interactive Gemini Chat */}
      <div className="mt-8 pt-6 border-t border-slate-800">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2 mb-3">
          <MessageSquare className="w-4 h-4 text-cyan-400" />
          Ask Gemini AI Follow-Up Questions About Your Scan
        </h3>

        {/* Chat Message History */}
        {chatMessages.length > 0 && (
          <div className="space-y-3 mb-4 max-h-60 overflow-y-auto pr-2">
            {chatMessages.map((msg, index) => (
              <div
                key={index}
                className={`p-3.5 rounded-xl text-xs leading-relaxed max-w-[85%] ${
                  msg.sender === 'user'
                    ? 'ml-auto bg-cyan-600 text-white font-medium'
                    : 'bg-slate-800 text-slate-200 border border-slate-700'
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>
        )}

        {/* Chat Input Form */}
        <form onSubmit={handleSendQuestion} className="flex gap-2">
          <input
            type="text"
            placeholder="e.g. Is this condition curable? What tests will the doctor perform?"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
          />
          <button
            type="submit"
            disabled={chatLoading || !chatInput.trim()}
            className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-semibold px-4 py-2.5 rounded-xl transition flex items-center gap-2 text-sm shrink-0"
          >
            {chatLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Ask
          </button>
        </form>
      </div>
    </div>
  );
}
