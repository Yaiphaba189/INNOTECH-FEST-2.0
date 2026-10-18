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
  Info,
  Scale,
  Award,
  Wallet
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
      }, 700);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Module Header */}
      <div className="glass-card glass-card-accent" style={{ padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <span className="badge badge-orange">MODULE C</span>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Transparent Market Linkage & Guaranteed Net-Returns
              </h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '0.25rem' }}>
              Radical price transparency: upfront itemized deductions showing True Net Realized take-home pay per kilogram.
            </p>
          </div>

          <div style={{
            background: '#FAFAF9',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '0.55rem 0.95rem',
            textAlign: 'right',
          }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>REGISTERED LOT</div>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
              {activeLot.lot_code} • {activeLot.quantity_kg} kg {activeLot.crop_variety}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 600 }}>
              Verified Grade A (14.8° Brix) • Ready {activeLot.ready_date}
            </div>
          </div>
        </div>
      </div>

      {/* Economic Insight Callout */}
      <div style={{
        background: '#FFF7ED',
        border: '1px solid #FDBA74',
        borderRadius: 'var(--radius-md)',
        padding: '1rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.85rem',
      }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: '#FFEDD5',
          color: '#EA580C',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Wallet size={20} />
        </div>
        <div style={{ fontSize: '0.84rem', color: '#7C2D12', lineHeight: 1.5 }}>
          <strong style={{ color: '#9A3412' }}>The Net Return Principle: </strong>
          Conventional brokers advertise high gross rates (₹31.00/kg) but secretly dock 25% for transit shrinkage, paying out only ₹21.73/kg. 
          HARVESTLINK AI itemizes all pooled freight, crates, and fees upfront so you take home <strong style={{ color: '#059669' }}>₹24.38/kg guaranteed (+₹2.65/kg more in your bank account)</strong>.
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
              className="glass-card"
              style={{
                position: 'relative',
                border: isLocked 
                  ? '2px solid #10B981' 
                  : quote.is_recommended 
                  ? '1.5px solid #F97316' 
                  : '1px solid var(--border-subtle)',
                boxShadow: isLocked 
                  ? '0 4px 16px rgba(16, 185, 129, 0.2)' 
                  : quote.is_recommended 
                  ? '0 4px 16px rgba(249, 115, 22, 0.15)' 
                  : 'var(--shadow-card)',
                transition: 'all 0.2s ease',
              }}
            >
              {/* Recommended Badge */}
              {quote.is_recommended && (
                <div style={{
                  position: 'absolute',
                  top: '-10px',
                  right: '20px',
                  background: '#F97316',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '0.7rem',
                  padding: '0.2rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                  boxShadow: '0 2px 8px rgba(249, 115, 22, 0.4)',
                  letterSpacing: '0.04em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                }}>
                  <Sparkles size={11} />
                  RECOMMENDED NET RETURN
                </div>
              )}

              {/* Card Top Row: Buyer Profile & Payout Summary */}
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
                    borderRadius: '12px',
                    background: '#FAFAF9',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#EA580C',
                    flexShrink: 0,
                  }}>
                    <Building2 size={22} />
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {quote.buyer_name}
                      </h4>
                      {quote.escrow_secured && (
                        <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>
                          <ShieldCheck size={11} />
                          Escrow Guaranteed
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                      Delivery: {quote.delivery_location} • Requirement: {quote.minimum_lot_kg} kg min
                    </div>
                  </div>
                </div>

                {/* Net Payout Callout */}
                <div style={{
                  textAlign: 'right',
                  background: '#FAFAF9',
                  padding: '0.6rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                    GUARANTEED NET RETURN
                  </div>
                  <div className="tabular-nums" style={{ fontSize: '1.5rem', fontWeight: 900, color: '#059669', lineHeight: 1.1 }}>
                    ₹{quote.net_farmer_price_per_kg.toFixed(2)}
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}> / kg</span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Gross: ₹{quote.gross_offer_per_kg.toFixed(2)}/kg
                  </div>
                </div>
              </div>

              {/* Itemized Deductions Waterfall Toggle */}
              <div style={{ marginTop: '1rem' }}>
                <button
                  onClick={() => toggleExpand(quote.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#EA580C',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: 0,
                  }}
                >
                  <span>{isExpanded ? 'Hide Itemized Deductions Waterfall' : 'View Itemized Transparent Deductions'}</span>
                  {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                </button>

                {isExpanded && (
                  <div style={{
                    marginTop: '0.75rem',
                    background: '#FAFAF9',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    padding: '0.95rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.55rem',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-primary)' }}>
                      <span>Gross Purchase Offer</span>
                      <strong className="tabular-nums">+₹{quote.gross_offer_per_kg.toFixed(2)} / kg</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#DC2626' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Truck size={13} />
                        Pooled Freight & Transit ({quote.transit_distance_km} km)
                      </span>
                      <span className="tabular-nums">-₹{quote.deductions.freight_per_kg.toFixed(2)} / kg</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#DC2626' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Package size={13} />
                        Standard Ventilated Crates
                      </span>
                      <span className="tabular-nums">-₹{quote.deductions.crate_fee_per_kg.toFixed(2)} / kg</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#DC2626' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Coins size={13} />
                        FPO Aggregation & Platform Fee (1.5%)
                      </span>
                      <span className="tabular-nums">-₹{quote.deductions.platform_fee_per_kg.toFixed(2)} / kg</span>
                    </div>

                    <div style={{
                      borderTop: '1px solid var(--border-medium)',
                      paddingTop: '0.55rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.88rem',
                      color: '#059669',
                      fontWeight: 800,
                    }}>
                      <span>Guaranteed Farmer Bank Payout</span>
                      <span className="tabular-nums">₹{quote.net_farmer_price_per_kg.toFixed(2)} / kg (₹{(quote.net_farmer_price_per_kg * 450).toLocaleString('en-IN', { maximumFractionDigits: 0 })} for 450kg)</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer: Comparison Callout & Lock Deal Action */}
              <div style={{
                marginTop: '1rem',
                paddingTop: '0.75rem',
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem',
              }}>
                <div style={{
                  fontSize: '0.8rem',
                  color: quote.middleman_comparison.cash_advantage_per_kg > 0 ? '#059669' : 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontWeight: 600,
                }}>
                  <Award size={15} style={{ color: '#EA580C' }} />
                  <span>
                    Advantage vs Broker Cash: <strong>+₹{quote.middleman_comparison.cash_advantage_per_kg.toFixed(2)}/kg (+{quote.middleman_comparison.advantage_percentage.toFixed(1)}% higher payout)</strong>
                  </span>
                </div>

                <button
                  onClick={() => handleLockDeal(quote)}
                  disabled={isLocked}
                  className={`tap-target ${isLocked ? 'btn-success' : 'btn-primary'}`}
                  style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}
                >
                  {isLocked ? (
                    <>
                      <CheckCircle size={16} style={{ marginRight: '0.4rem' }} />
                      Deal Locked in Escrow
                    </>
                  ) : (
                    <>
                      <Lock size={16} style={{ marginRight: '0.4rem' }} />
                      Lock Guaranteed Payout
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
