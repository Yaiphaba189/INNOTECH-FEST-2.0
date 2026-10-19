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
  Award,
  Wallet,
} from 'lucide-react';
import { BuyerMatchQuote, HarvestLot } from '@/types';
import { MOCK_BUYER_MATCHES, MOCK_ACTIVE_LOT } from '@/lib/mock-data';
import { useFarmer } from '@/context/FarmerContext';
import { BROKER_GROSS_PER_KG, BROKER_SHRINKAGE_PCT, quoteView } from '@/lib/decision';

interface MarketLinkageModuleProps {
  onDealLocked?: (quote: BuyerMatchQuote) => void;
}

export const MarketLinkageModule: React.FC<MarketLinkageModuleProps> = ({
  onDealLocked,
}) => {
  const { t } = useTranslation();
  const { lot: activeLot, quotes, lockedQuoteId: lockedDealId, lockDeal, bestView } = useFarmer();
  const [expandedQuoteId, setExpandedQuoteId] = useState<string | null>(null);

  useEffect(() => {
    if (expandedQuoteId === null && quotes.length) setExpandedQuoteId(quotes.find((q) => q.is_recommended)?.id ?? quotes[0].id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quotes.length]);

  const toggleExpand = (id: string) => {
    setExpandedQuoteId(expandedQuoteId === id ? null : id);
  };

  const handleLockDeal = async (quote: BuyerMatchQuote) => {
    await lockDeal(quote);
    if (onDealLocked) setTimeout(() => onDealLocked(quote), 700);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Net Return Principle Banner */}
      <div
        style={{
          background: '#FFF7ED',
          border: '1px solid #FED7AA',
          borderRadius: 'var(--radius-md)',
          padding: '0.85rem 1.15rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        <div
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '8px',
            background: '#FFEDD5',
            color: '#EA580C',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Wallet size={18} />
        </div>
        <div style={{ fontSize: '0.8rem', color: '#7C2D12', lineHeight: 1.45 }}>
          <strong style={{ color: '#9A3412' }}>True Net Return Guarantee: </strong>
          Conventional brokers advertise high gross prices (₹{BROKER_GROSS_PER_KG}/kg) but dock {Math.round(BROKER_SHRINKAGE_PCT * 100)}% for transit shrinkage. 
          HARVESTLINK AI itemizes freight, crates, and fees upfront so you take home{' '}
          <strong style={{ color: '#059669' }}>₹{bestView?.net.toFixed(2)}/kg guaranteed (+₹{bestView?.advantage.toFixed(2)}/kg net gain)</strong>.
        </div>
      </div>

      {/* Buyer Quotes List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {quotes.map((quote) => {
          const isExpanded = expandedQuoteId === quote.id;
          const isLocked = lockedDealId === quote.id;
          const v = quoteView(quote, activeLot.quantity_kg);
          const netPrice = v.net;
          const grossPrice = v.gross;
          const deliveryLoc = quote.delivery_location || quote.location || 'Hub Location';
          const minLotKg = quote.minimum_lot_kg || 400;
          const transitDist = v.distanceKm;
          const freightPerKg = v.freight;
          const crateFeePerKg = v.crates;
          const platformFeePerKg = v.platform;
          const middlemanAdvantage = v.advantage;
          const middlemanAdvPct = v.advantagePct;

          return (
            <div
              key={quote.id}
              className="glass-card"
              style={{
                padding: '1.25rem',
                border: isLocked
                  ? '2px solid #10B981'
                  : quote.is_recommended
                    ? '1.5px solid var(--brand-orange)'
                    : '1px solid var(--border-subtle)',
              }}
            >
              {/* Card Header: Buyer info & Net Payout */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.85rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: '#F8FAFC',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#EA580C',
                      flexShrink: 0,
                    }}
                  >
                    <Building2 size={20} />
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {quote.buyer_name}
                      </h3>
                      {quote.is_recommended && (
                        <span className="badge badge-orange" style={{ fontSize: '0.62rem' }}>
                          Best Match
                        </span>
                      )}
                      {quote.escrow_secured && (
                        <span className="badge badge-green" style={{ fontSize: '0.62rem' }}>
                          <ShieldCheck size={11} />
                          Escrow Verified
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                      Delivery: {deliveryLoc} • Min Lot: {minLotKg} kg
                    </div>
                  </div>
                </div>

                {/* Net Payout Callout */}
                <div
                  style={{
                    textAlign: 'right',
                    background: '#F8FAFC',
                    padding: '0.45rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                    GUARANTEED NET RETURN
                  </div>
                  <div className="tabular-nums" style={{ fontSize: '1.35rem', fontWeight: 900, color: '#059669', lineHeight: 1.1 }}>
                    ₹{netPrice.toFixed(2)}
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 600 }}> / kg</span>
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                    Gross: ₹{grossPrice.toFixed(2)}/kg
                  </div>
                </div>
              </div>

              {/* Deductions Toggle */}
              <div style={{ marginTop: '0.75rem' }}>
                <button
                  onClick={() => toggleExpand(quote.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#EA580C',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    padding: 0,
                  }}
                >
                  <span>{isExpanded ? 'Hide Transparent Deductions' : 'View Itemized Transparent Deductions'}</span>
                  {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                </button>

                {isExpanded && (
                  <div
                    style={{
                      marginTop: '0.5rem',
                      background: '#F8FAFC',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                      padding: '0.75rem 0.85rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.45rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-primary)' }}>
                      <span>Gross Institutional Offer</span>
                      <strong className="tabular-nums">+₹{grossPrice.toFixed(2)} / kg</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: '#DC2626' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Truck size={12} />
                        Pooled Freight & Transit ({transitDist} km)
                      </span>
                      <span className="tabular-nums">-₹{freightPerKg.toFixed(2)} / kg</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: '#DC2626' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Package size={12} />
                        Standard Ventilated Crates
                      </span>
                      <span className="tabular-nums">-₹{crateFeePerKg.toFixed(2)} / kg</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: '#DC2626' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Coins size={12} />
                        FPO Aggregation & Platform Fee (1.5%)
                      </span>
                      <span className="tabular-nums">-₹{platformFeePerKg.toFixed(2)} / kg</span>
                    </div>

                    <div
                      style={{
                        borderTop: '1px solid var(--border-subtle)',
                        paddingTop: '0.45rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '0.82rem',
                        color: '#059669',
                        fontWeight: 800,
                      }}
                    >
                      <span>Guaranteed Bank Payout</span>
                      <span className="tabular-nums">
                        ₹{netPrice.toFixed(2)} / kg (₹{v.payout.toLocaleString('en-IN')} for {activeLot.quantity_kg}kg lot)
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Action Row */}
              <div
                style={{
                  marginTop: '0.85rem',
                  paddingTop: '0.65rem',
                  borderTop: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.65rem',
                }}
              >
                <div
                  style={{
                    fontSize: '0.76rem',
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    fontWeight: 600,
                  }}
                >
                  <Award size={14} style={{ color: '#EA580C' }} />
                  <span>
                    Advantage vs Broker Cash: <strong>+₹{middlemanAdvantage.toFixed(2)}/kg (+{middlemanAdvPct.toFixed(1)}% higher)</strong>
                  </span>
                </div>

                <button
                  onClick={() => handleLockDeal(quote)}
                  disabled={isLocked}
                  className={`tap-target ${isLocked ? 'btn-success' : 'btn-primary'}`}
                  style={{ padding: '0.4rem 1.15rem', fontSize: '0.82rem', minHeight: '36px' }}
                >
                  {isLocked ? (
                    <>
                      <CheckCircle size={14} style={{ marginRight: '0.35rem' }} />
                      Deal Locked in Escrow
                    </>
                  ) : (
                    <>
                      <Lock size={14} style={{ marginRight: '0.35rem' }} />
                      Lock Guaranteed Deal
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
