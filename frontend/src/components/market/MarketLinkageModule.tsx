'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n';
import { 
  Building2, 
  CheckCircle, 
  ChevronDown, 
  ChevronUp, 
  Lock, 
  ShieldCheck, 
  Truck, 
  Package, 
  Coins, 
  ArrowRight,
  TrendingDown,
  Sparkles,
  Info
} from 'lucide-react';
import { BuyerMatchQuote, HarvestLot } from '@/types';
import { MOCK_BUYER_MATCHES, MOCK_ACTIVE_LOT } from '@/lib/mock-data';
import { api } from '@/lib/api-client';

interface MarketLinkageModuleProps {
  onDealLocked?: (quote: BuyerMatchQuote) => void;
}

export const MarketLinkageModule: React.FC<MarketLinkageModuleProps> = ({
  onDealLocked
}) => {
  const { t } = useTranslation();
  const [quotes, setQuotes] = useState<BuyerMatchQuote[]>(MOCK_BUYER_MATCHES);
  const [activeLot] = useState<HarvestLot>(MOCK_ACTIVE_LOT);
  const [expandedQuoteId, setExpandedQuoteId] = useState<string | null>('quote-001');
  const [lockedDealId, setLockedDealId] = useState<string | null>(null);

  useEffect(() => {
    api.getBuyerMatches('lot-chura-tombi-500')
      .then((data) => {
        if (data && data.length > 0) {
          setQuotes(data);
          setExpandedQuoteId(data[0].id);
        }
      })
      .catch((err) => console.warn('Matches fetch error:', err));
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedQuoteId(expandedQuoteId === id ? null : id);
  };

  const handleLockDeal = async (quote: BuyerMatchQuote) => {
    setLockedDealId(quote.id);
    setQuotes((prev) =>
      prev.map((q) => (q.id === quote.id ? { ...q, status: 'locked' } : q))
    );
    try {
      await api.acceptDeal(quote.id);
    } catch (err) {
      console.warn('Deal accept error:', err);
    }
    if (onDealLocked) {
      setTimeout(() => {
        onDealLocked(quote);
      }, 600);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Module Header */}
      <div className="glass-card glass-card-accent" style={{ padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <span className="badge badge-gold">MODULE C</span>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>
                {t('moduleCTitle')}
              </h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '0.35rem' }}>
              Radical price transparency: upfront itemized deductions showing True Net Realized take-home pay per kilogram.
            </p>
          </div>

          <div style={{
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '0.5rem 0.85rem',
            textAlign: 'right',
          }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>REGISTERED CONSIGNMENT</div>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
              {activeLot.lot_code} • {activeLot.quantity_kg} kg {activeLot.crop_variety}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--plantation-green)' }}>
              Verified Grade A (14.5° Brix) • Ready {activeLot.ready_date}
            </div>
          </div>
        </div>
      </div>

      {/* Economic Insight Callout: The Net Return Principle (Part 3, Sec 8.2) */}
      <div style={{
        background: 'var(--pineapple-gold-bg)',
        border: '1px solid rgba(217, 119, 6, 0.25)',
        borderRadius: 'var(--radius-md)',
        padding: '0.85rem 1.15rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
      }}>
        <Info size={22} style={{ color: 'var(--pineapple-gold)', flexShrink: 0 }} />
        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
          <strong style={{ color: 'var(--text-primary)' }}>The Net Return Economic Principle: </strong>
          Conventional brokers advertise high gross rates (e.g. ₹31.00/kg) but secretly deduct 25% for transit shrinkage and handling. 
          HARVESTLINK AI deducts all pooled logistics, packaging, and platform fees upfront so farmers see their exact guaranteed bank payout before committing.
        </div>
      </div>

      {/* Buyer Cards Deck */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {quotes.map((quote) => {
          const isExpanded = expandedQuoteId === quote.id;
          const isLocked = lockedDealId === quote.id;

          return (
            <div
              key={quote.id}
              className={`glass-card ${quote.is_recommended ? 'glass-card-accent' : ''}`}
              style={{
                position: 'relative',
                border: isLocked 
                  ? '2px solid var(--plantation-green)' 
                  : quote.is_recommended 
                  ? '1px solid var(--pineapple-gold)' 
                  : '1px solid var(--border-subtle)',
                transition: 'all 0.25s ease',
              }}
            >
              {/* Recommended Badge */}
              {quote.is_recommended && (
                <div style={{
                  position: 'absolute',
                  top: '-10px',
                  right: '24px',
                  background: 'linear-gradient(90deg, #F59E0B, #D97706)',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '0.7rem',
                  padding: '0.2rem 0.65rem',
                  borderRadius: 'var(--radius-full)',
                  letterSpacing: '0.04em',
                }}>
                  ★ RECOMMENDED MATCH (HIGHEST NET TAKE-HOME)
                </div>
              )}

              {/* Main Card Header & Summary */}
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: 'var(--radius-md)',
                    background: quote.is_recommended ? 'rgba(245, 158, 11, 0.15)' : 'var(--bg-surface-elevated)',
                    color: quote.is_recommended ? 'var(--pineapple-gold)' : 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                  }}>
                    <Building2 size={24} />
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {quote.buyer_name}
                      </h3>
                      <span className="badge badge-slate" style={{ fontSize: '0.68rem' }}>
                        {quote.buyer_type}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                      {quote.location} • {quote.distance_km} km transit
                    </p>
                  </div>
                </div>

                {/* Pricing Columns: Gross vs Net Realized */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>GROSS OFFER</div>
                    <div className="tabular-nums" style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', textDecoration: 'line-through' }}>
                      ₹{quote.gross_rate_per_kg.toFixed(2)}/kg
                    </div>
                  </div>

                  <div style={{
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.4rem 0.85rem',
                    textAlign: 'right',
                  }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--plantation-green)', fontWeight: 700 }}>
                      TRUE NET TAKE-HOME
                    </div>
                    <div className="tabular-nums" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      ₹{quote.net_rate_per_kg.toFixed(2)} <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>/ kg</span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>TOTAL PAYOUT ({activeLot.quantity_kg} kg)</div>
                    <div className="tabular-nums" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--pineapple-gold)' }}>
                      ₹{quote.total_payout.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Expand Inspector & Lock Deal */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: '1rem',
                paddingTop: '0.85rem',
                borderTop: '1px solid var(--border-subtle)',
              }}>
                <button
                  onClick={() => toggleExpand(quote.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-gold)',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  <span>{isExpanded ? 'Hide Itemized Deductions' : 'Inspect Exact Rupee Deductions'}</span>
                </button>

                <div>
                  {isLocked ? (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      color: 'var(--plantation-green)',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                    }}>
                      <ShieldCheck size={20} />
                      <span>{t('dealLocked')} (Consignment Committed)</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleLockDeal(quote)}
                      className="tap-target btn-primary"
                      style={{ padding: '0.5rem 1.25rem', fontSize: '0.88rem', gap: '0.4rem' }}
                    >
                      <Lock size={16} />
                      {t('acceptDeal')}
                    </button>
                  )}
                </div>
              </div>

              {/* Expandable Deductions Inspector Panel */}
              {isExpanded && (
                <div style={{
                  marginTop: '1rem',
                  background: 'var(--bg-surface-elevated)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--pineapple-gold)', textTransform: 'uppercase' }}>
                    Itemized Cost Decomposition:
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                    <div style={{ background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', padding: '0.65rem', borderRadius: 'var(--radius-sm)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                        <Truck size={14} /> Shared Freight via FPO
                      </div>
                      <div className="tabular-nums" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--alert-crimson)', marginTop: '0.2rem' }}>
                        - ₹{quote.deductions.shared_freight.toFixed(2)} / kg
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                        Combined load saving ₹1.85/kg over solo truck
                      </div>
                    </div>

                    <div style={{ background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', padding: '0.65rem', borderRadius: 'var(--radius-sm)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                        <Package size={14} /> Crates & Packaging
                      </div>
                      <div className="tabular-nums" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--alert-crimson)', marginTop: '0.2rem' }}>
                        - ₹{quote.deductions.crates_packaging.toFixed(2)} / kg
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                        Standardized 20kg food-grade plastic lugs
                      </div>
                    </div>

                    <div style={{ background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', padding: '0.65rem', borderRadius: 'var(--radius-sm)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                        <Coins size={14} /> Platform Fee (1.4%)
                      </div>
                      <div className="tabular-nums" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--alert-crimson)', marginTop: '0.2rem' }}>
                        - ₹{quote.deductions.platform_fee.toFixed(2)} / kg
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                        Quality inspection & smart-contract escrow
                      </div>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'var(--bg-app)',
                    border: '1px solid var(--border-subtle)',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.78rem',
                    color: 'var(--text-primary)',
                  }}>
                    <div>
                      <strong>Payment Terms:</strong> {quote.payment_terms}
                    </div>
                    <div>
                      <strong>Pickup Window:</strong> {quote.pickup_window}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
