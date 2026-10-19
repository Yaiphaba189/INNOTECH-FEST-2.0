'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { AIAdvisorResponse, AIStatus } from '@/types';
import {
  Bot,
  Sparkles,
  Send,
  X,
  Zap,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Languages,
  RotateCcw,
} from 'lucide-react';

interface AICopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
  initialQueryType?: 'disease_triage' | 'harvest_decision' | 'market_negotiation' | 'general_copilot';
  initialContext?: Record<string, any>;
  crop?: string;
}

const PRESET_PROMPTS = [
  {
    label: '🍍 Treat Pineapple Heart Rot',
    type: 'disease_triage' as const,
    crop: 'pineapple',
    prompt: 'What immediate biosecurity and drainage protocol should I follow for Phytophthora heart rot in Khousabung?',
    context: { disease_name: 'Heart Rot (Phytophthora)', confidence: 0.94 },
  },
  {
    label: '🌧️ 48h Rain vs 14.8° Brix Risk',
    type: 'harvest_decision' as const,
    crop: 'pineapple',
    prompt: 'Should I harvest my Queen pineapple lot now before the 65mm downpour forecast to avoid rupee loss?',
    context: { rain_mm: 65, brix: 14.8, cost_of_waiting_rupees: 14250, best_buyer: 'Manipur Fruit Co-op', net_rate: 28.5 },
  },
  {
    label: '🚚 Explain Shapley Freight Savings',
    type: 'market_negotiation' as const,
    crop: 'pineapple',
    prompt: 'How does Shapley cooperative freight pooling save 40%+ over solo private pickup along Tiddim road?',
    context: { freight_solo: 4.80, freight_shapley: 2.75 },
  },
  {
    label: '🌾 Chak-hao Leaf Blight Triage',
    type: 'disease_triage' as const,
    crop: 'rice',
    prompt: 'Paddy terrace leaves are turning yellow with water-soaked streaks. What is the CAU Imphal recommendation?',
    context: { disease_name: 'Bacterial Leaf Blight', confidence: 0.91 },
  },
];

export const AICopilotModal: React.FC<AICopilotModalProps> = ({
  isOpen,
  onClose,
  initialPrompt = '',
  initialQueryType = 'general_copilot',
  initialContext = {},
  crop = 'pineapple',
}) => {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [queryType, setQueryType] = useState<'disease_triage' | 'harvest_decision' | 'market_negotiation' | 'general_copilot'>(initialQueryType);
  const [context, setContext] = useState<Record<string, any>>(initialContext);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIAdvisorResponse | null>(null);
  const [aiStatus, setAiStatus] = useState<AIStatus | null>(null);

  useEffect(() => {
    if (isOpen) {
      apiClient.ai.getStatus().then((st) => setAiStatus(st)).catch(() => {});
      if (initialPrompt && !result) {
        handleSend(initialPrompt, initialQueryType, initialContext);
      }
    }
  }, [isOpen, initialPrompt]);

  const handleSend = async (
    userPrompt: string,
    qType = queryType,
    ctx = context
  ) => {
    if (!userPrompt.trim()) return;
    setLoading(true);
    try {
      const res = await apiClient.ai.askAdvisor({
        prompt: userPrompt,
        query_type: qType,
        crop,
        context: ctx,
        include_manipuri: true,
      });
      setResult(res);
    } catch (err) {
      console.error('AI Advisor error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPreset = (p: typeof PRESET_PROMPTS[number]) => {
    setPrompt(p.prompt);
    setQueryType(p.type);
    setContext(p.context);
    handleSend(p.prompt, p.type, p.context);
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90vh',
          background: '#0B132B',
          color: '#E2E8F0',
          borderRadius: '1.25rem',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 35px rgba(56, 189, 248, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'modalSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.1rem 1.4rem',
            background: 'linear-gradient(90deg, rgba(14, 116, 144, 0.25) 0%, rgba(15, 23, 42, 0.6) 100%)',
            borderBottom: '1px solid rgba(56, 189, 248, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '0.65rem',
                background: 'linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 15px rgba(6, 182, 212, 0.4)',
              }}
            >
              <Bot size={22} color="#FFFFFF" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#F8FAFC' }}>
                  HARVESTLINK AI Copilot
                </h3>
                <span
                  style={{
                    fontSize: '0.65rem',
                    padding: '0.15rem 0.45rem',
                    borderRadius: '9999px',
                    fontWeight: 700,
                    background: aiStatus?.openrouter_configured ? 'rgba(16, 185, 129, 0.2)' : 'rgba(56, 189, 248, 0.18)',
                    color: aiStatus?.openrouter_configured ? '#34D399' : '#38BDF8',
                    border: '1px solid currentColor',
                  }}
                >
                  {aiStatus?.openrouter_configured ? 'OPENROUTER LIVE' : 'OPENROUTER FREE TIER'}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.72rem', color: '#94A3B8' }}>
                Active Model: <code style={{ color: '#38BDF8', fontWeight: 600 }}>{result?.model || aiStatus?.primary_model || 'meta-llama/llama-3.3-70b-instruct:free'}</code>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94A3B8',
              cursor: 'pointer',
              padding: '0.4rem',
              borderRadius: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
            }}
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div style={{ padding: '1.25rem 1.4rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Quick Prompts Carousel */}
          <div>
            <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginBottom: '0.45rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Sparkles size={13} color="#38BDF8" />
              <span>QUICK AGRI-INTELLIGENCE QUERIES</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {PRESET_PROMPTS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectPreset(p)}
                  style={{
                    background: 'rgba(30, 41, 59, 0.7)',
                    border: '1px solid rgba(148, 163, 184, 0.15)',
                    borderRadius: '9999px',
                    padding: '0.3rem 0.65rem',
                    fontSize: '0.72rem',
                    color: '#E2E8F0',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#38BDF8';
                    e.currentTarget.style.background = 'rgba(56, 189, 248, 0.12)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.15)';
                    e.currentTarget.style.background = 'rgba(30, 41, 59, 0.7)';
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Response Display */}
          {result && (
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.85)',
                border: '1px solid rgba(56, 189, 248, 0.2)',
                borderRadius: '0.85rem',
                padding: '1.1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.8rem',
              }}
            >
              {/* Meta row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '0.35rem',
                      background:
                        result.urgency === 'critical'
                          ? 'rgba(239, 68, 68, 0.2)'
                          : result.urgency === 'high'
                          ? 'rgba(249, 115, 22, 0.2)'
                          : 'rgba(16, 185, 129, 0.2)',
                      color:
                        result.urgency === 'critical'
                          ? '#F87171'
                          : result.urgency === 'high'
                          ? '#FB923C'
                          : '#34D399',
                      border: '1px solid currentColor',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                    }}
                  >
                    <ShieldAlert size={12} />
                    {result.urgency} Urgency
                  </span>

                  {result.cached && (
                    <span
                      style={{
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        padding: '0.15rem 0.45rem',
                        borderRadius: '0.35rem',
                        background: 'rgba(234, 179, 8, 0.18)',
                        color: '#FACC15',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.2rem',
                      }}
                    >
                      <Zap size={11} /> Fast Cache (&lt;1ms)
                    </span>
                  )}
                </div>

                <div style={{ fontSize: '0.7rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Clock size={12} />
                  <span>Engine: {result.source === 'openrouter' ? 'OpenRouter Free Cloud' : 'ICAR Manipur Local Fallback'}</span>
                </div>
              </div>

              {/* Main Response Narrative */}
              <div style={{ fontSize: '0.88rem', lineHeight: '1.55', color: '#F1F5F9' }}>
                {result.response}
              </div>

              {/* Actionable Steps Checklist */}
              {result.actionable_steps && result.actionable_steps.length > 0 && (
                <div style={{ marginTop: '0.2rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38BDF8', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Recommended Action Protocol:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {result.actionable_steps.map((step, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '0.5rem',
                          background: 'rgba(30, 41, 59, 0.5)',
                          padding: '0.5rem 0.75rem',
                          borderRadius: '0.5rem',
                          fontSize: '0.8rem',
                          color: '#CBD5E1',
                        }}
                      >
                        <CheckCircle2 size={16} color="#34D399" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Romanized Manipuri Box */}
              {result.manipuri_summary && (
                <div
                  style={{
                    background: 'rgba(56, 189, 248, 0.08)',
                    borderLeft: '3px solid #38BDF8',
                    padding: '0.6rem 0.8rem',
                    borderRadius: '0 0.5rem 0.5rem 0',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.5rem',
                  }}
                >
                  <Languages size={16} color="#38BDF8" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                  <div>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#38BDF8', textTransform: 'uppercase' }}>
                      Manipuri (Meiteilon) Summary:
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#E2E8F0', fontStyle: 'italic', marginTop: '0.1rem' }}>
                      &ldquo;{result.manipuri_summary}&rdquo;
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Loading Skeleton */}
          {loading && (
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px dashed rgba(56, 189, 248, 0.3)',
                borderRadius: '0.85rem',
                padding: '1.5rem',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.6rem',
              }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  border: '3px solid rgba(56, 189, 248, 0.2)',
                  borderTopColor: '#38BDF8',
                  animation: 'spin 0.8s linear infinite',
                }}
              />
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#94A3B8' }}>
                Connecting to OpenRouter Free LLM &amp; synthesizing ICAR agronomic models...
              </p>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div
          style={{
            padding: '0.9rem 1.4rem',
            background: 'rgba(11, 19, 43, 0.95)',
            borderTop: '1px solid rgba(56, 189, 248, 0.15)',
          }}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(prompt);
            }}
            style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}
          >
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask anything about diseases, rain-to-rupee timing, freight, or buyer deals..."
              disabled={loading}
              style={{
                flex: 1,
                background: 'rgba(30, 41, 59, 0.9)',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                borderRadius: '0.65rem',
                padding: '0.65rem 1rem',
                color: '#F8FAFC',
                fontSize: '0.85rem',
                outline: 'none',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#38BDF8')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.2)')}
            />

            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              style={{
                background: prompt.trim() && !loading ? 'linear-gradient(135deg, #06B6D4 0%, #2563EB 100%)' : 'rgba(51, 65, 85, 0.5)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '0.65rem',
                padding: '0.65rem 1.1rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: prompt.trim() && !loading ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'all 0.15s ease',
                boxShadow: prompt.trim() && !loading ? '0 0 15px rgba(6, 182, 212, 0.35)' : 'none',
              }}
            >
              <Send size={15} />
              <span>Ask AI</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
