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
          background: '#fbf4ea',
          border: '1px solid #fed7aa',
          borderRadius: '8px',
          padding: '0.85rem 1.15rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        <Wallet size={20} style={{ color: '#783f0a', flexShrink: 0 }} />
        <div style={{ fontSize: '13px', color: '#783f0a', lineHeight: 1.5 }}>
          <strong style={{ color: '#783f0a' }}>True Net Return Guarantee: </strong>
          Conventional brokers advertise high gross prices (₹{BROKER_GROSS_PER_KG}/kg) but dock {Math.round(BROKER_SHRINKAGE_PCT * 100)}% for transit shrinkage. 
          HARVESTLINK AI itemizes freight, crates, and fees upfront so you take home{' '}
          <strong style={{ color: '#F97316' }}>₹{bestView?.net.toFixed(2)}/kg guaranteed (+₹{bestView?.advantage.toFixed(2)}/kg net gain)</strong>.
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
          const isPositiveAdv = middlemanAdvantage >= 0;

          return (
            <div
              key={quote.id}
              style={{
                padding: '1.25rem',
                borderRadius: '8px',
                background: '#FFFFFF',
                border: isLocked
                  ? '2px solid #F97316'
                  : quote.is_recommended
                    ? '1.5px solid #FB923C'
                    : '1px solid #F1E4D8',
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
                  <Building2 size={22} style={{ color: '#21170F', flexShrink: 0 }} />

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#21170F', margin: 0 }}>
                        {quote.buyer_name}
                      </h3>
                      {quote.is_recommended && (
                        <span className="badge badge-orange" style={{ fontSize: '11px', fontWeight: 600 }}>
                          Best Match
                        </span>
                      )}
                      {quote.escrow_secured && (
                        <span className="badge badge-green" style={{ fontSize: '11px', fontWeight: 600 }}>
                          <ShieldCheck size={12} />
                          Escrow Verified
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6E5A4A', marginTop: '0.2rem' }}>
                      Delivery: {deliveryLoc} • Min Lot: {minLotKg} kg
                    </div>
                  </div>
                </div>

                {/* Net Payout Callout */}
                <div
                  style={{
                    textAlign: 'right',
                    background: '#FFF5ED',
                    padding: '0.5rem 0.95rem',
                    borderRadius: '6px',
                    border: '1px solid #F1E4D8',
                  }}
                >
                  <div style={{ fontSize: '11px', color: '#6E5A4A', fontWeight: 600 }}>
                    GUARANTEED NET RETURN
                  </div>
                  <div className="tabular-nums" style={{ fontSize: '20px', fontWeight: 700, color: '#F97316', lineHeight: 1.15, marginTop: '2px' }}>
                    ₹{netPrice.toFixed(2)}
                    <span style={{ fontSize: '12px', color: '#6E5A4A', fontWeight: 500 }}> / kg</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#6E5A4A', marginTop: '2px' }}>
                    Gross: ₹{grossPrice.toFixed(2)}/kg
                  </div>
                </div>
              </div>

              {/* Deductions Toggle */}
              <div style={{ marginTop: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => toggleExpand(quote.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#F97316',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: 0,
                  }}
                >
                  <span>{isExpanded ? 'Hide Transparent Deductions' : 'View Itemized Transparent Deductions'}</span>
                  {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {isExpanded && (
                  <div
                    style={{
                      marginTop: '0.5rem',
                      background: '#FFF5ED',
                      borderRadius: '6px',
                      border: '1px solid #F1E4D8',
                      padding: '0.75rem 0.95rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.45rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#21170F' }}>
                      <span>Gross Institutional Offer</span>
                      <strong className="tabular-nums">+₹{grossPrice.toFixed(2)} / kg</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#a11920' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Truck size={13} />
                        Pooled Freight & Transit ({transitDist} km)
                      </span>
                      <span className="tabular-nums">-₹{freightPerKg.toFixed(2)} / kg</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#a11920' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Package size={13} />
                        Standard Ventilated Crates
                      </span>
                      <span className="tabular-nums">-₹{crateFeePerKg.toFixed(2)} / kg</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#a11920' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Coins size={13} />
                        FPO Aggregation & Platform Fee (1.5%)
                      </span>
                      <span className="tabular-nums">-₹{platformFeePerKg.toFixed(2)} / kg</span>
                    </div>

                    <div
                      style={{
                        borderTop: '1px solid #F1E4D8',
                        paddingTop: '0.45rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '13px',
                        color: '#F97316',
                        fontWeight: 700,
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
                  paddingTop: '0.75rem',
                  borderTop: '1px solid #F1E4D8',
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                }}
              >
                <div
                  style={{
                    fontSize: '13px',
                    color: isPositiveAdv ? '#F97316' : '#a11920',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontWeight: 600,
                  }}
                >
                  <Award size={15} style={{ color: isPositiveAdv ? '#F97316' : '#a11920' }} />
                  <span>
                    {isPositiveAdv ? 'Advantage vs Broker Cash:' : 'Difference vs Broker Cash:'}{' '}
                    <strong className="tabular-nums">
                      {isPositiveAdv
                        ? `+₹${middlemanAdvantage.toFixed(2)}/kg (+${middlemanAdvPct.toFixed(1)}% higher)`
                        : `-₹${Math.abs(middlemanAdvantage).toFixed(2)}/kg (${Math.abs(middlemanAdvPct).toFixed(1)}% lower)`}
                    </strong>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleLockDeal(quote)}
                  disabled={isLocked}
                  className="tap-target"
                  style={{
                    padding: '0.45rem 1.15rem',
                    fontSize: '13px',
                    minHeight: '38px',
                    fontWeight: 600,
                    borderRadius: '6px',
                    cursor: isLocked ? 'default' : 'pointer',
                    background: isLocked ? '#F97316' : '#FB923C',
                    color: '#ffffff',
                    border: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  {isLocked ? (
                    <>
                      <CheckCircle size={14} />
                      <span>Deal Locked in Escrow</span>
                    </>
                  ) : (
                    <>
                      <Lock size={14} />
                      <span>Lock Guaranteed Deal</span>
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
