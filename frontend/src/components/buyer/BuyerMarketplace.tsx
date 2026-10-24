'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n';
import { api } from '@/lib/api-client';
import {
  Building2,
  Filter,
  PlusCircle,
  MapPin,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  X,
} from 'lucide-react';

interface MarketplaceLot {
  id: string;
  lot_code: string;
  farmer: string;
  district: string;
  variety: 'Queen' | 'Kew';
  weight_kg: number;
  brix: number;
  grade: 'Grade A' | 'Grade B';
  available_date: string;
  minimum_rate: number;
  status: 'open' | 'matched' | 'settled';
}

const INITIAL_LOTS: MarketplaceLot[] = [
  {
    id: 'lot-1',
    lot_code: 'LOT-PL-048',
    farmer: 'Tombi Singh',
    district: 'Thoubal (Andro)',
    variety: 'Queen',
    weight_kg: 450,
    brix: 14.8,
    grade: 'Grade A',
    available_date: '26 Oct 2026',
    minimum_rate: 28.00,
    status: 'open',
  },
  {
    id: 'lot-2',
    lot_code: 'LOT-PL-051',
    farmer: 'Mangi Meitei',
    district: 'Thoubal (Yairipok)',
    variety: 'Queen',
    weight_kg: 600,
    brix: 14.5,
    grade: 'Grade A',
    available_date: '26 Oct 2026',
    minimum_rate: 28.50,
    status: 'open',
  },
  {
    id: 'lot-3',
    lot_code: 'LOT-PL-062',
    farmer: 'Khaidem Prem',
    district: 'Churachandpur (Khousabung)',
    variety: 'Queen',
    weight_kg: 850,
    brix: 15.2,
    grade: 'Grade A',
    available_date: '27 Oct 2026',
    minimum_rate: 29.00,
    status: 'open',
  },
  {
    id: 'lot-4',
    lot_code: 'LOT-PL-065',
    farmer: 'Ibopishak S.',
    district: 'Thoubal (Nongpok Sekmai)',
    variety: 'Queen',
    weight_kg: 500,
    brix: 13.9,
    grade: 'Grade B',
    available_date: '26 Oct 2026',
    minimum_rate: 24.50,
    status: 'open',
  },
];

export const BuyerMarketplace: React.FC = () => {
  const { t } = useTranslation();
  const [lots, setLots] = useState<MarketplaceLot[]>(INITIAL_LOTS);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Demand order state
  const [variety, setVariety] = useState<'Queen' | 'Kew'>('Queen');
  const [requiredWeight, setRequiredWeight] = useState('2000');
  const [targetBrix, setTargetBrix] = useState('14.5');
  const [maxRate, setMaxRate] = useState('28.50');
  const [targetHub, setTargetHub] = useState('Nilakuthi Food Park, Imphal');

  useEffect(() => {
    api
      .getMarketplaceLots()
      .then((data) => {
        if (data && data.length > 0) {
          setLots(data);
        }
      })
      .catch((err) => console.warn('Marketplace lots fetch error:', err));
  }, []);

  const filteredLots = lots.filter((lot) => {
    const matchDistrict = selectedDistrict === 'all' || lot.district.toLowerCase().includes(selectedDistrict.toLowerCase());
    const matchGrade = selectedGrade === 'all' || lot.grade === selectedGrade;
    return matchDistrict && matchGrade;
  });

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.broadcastDemandOrder({
        variety,
        required_weight_kg: parseFloat(requiredWeight) || 2000,
        min_brix: parseFloat(targetBrix) || 14.5,
        max_rate_per_kg: parseFloat(maxRate) || 28.5,
        receiving_hub: targetHub,
      });
    } catch (err) {
      console.warn('Order broadcast error:', err);
    }
    setOrderSuccess(true);
    setTimeout(() => {
      setShowOrderModal(false);
      setOrderSuccess(false);
    }, 1200);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Buyer Console Header */}
      <div
        style={{
          padding: '1.25rem 1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          background: '#FFFFFF',
          border: '1px solid #F1E4D8',
          borderRadius: '8px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span className="badge badge-orange" style={{ fontSize: '11px', fontWeight: 600 }}>
              BUYER TERMINAL
            </span>
            <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#21170F' }}>
              Wholesale Pineapple Marketplace Feed
            </h1>
          </div>
          <p style={{ color: '#6E5A4A', fontSize: '13px', marginTop: '0.25rem' }}>
            Direct procurement from verified smallholder clusters in Churachandpur and Thoubal.
          </p>
        </div>

        <button
          onClick={() => setShowOrderModal(true)}
          className="tap-target btn-primary"
          style={{ gap: '0.4rem', fontSize: '13px', minHeight: '40px', fontWeight: 600 }}
        >
          <PlusCircle size={15} />
          <span>Post Demand Order</span>
        </button>
      </div>

      {/* Clean Filter Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          padding: '0.2rem 0.25rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '12px', color: '#6E5A4A', fontWeight: 600 }}>
            <Filter size={14} style={{ color: '#FB923C' }} />
            <span>FILTER:</span>
          </div>

          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            style={{
              background: '#FFFFFF',
              border: '1px solid #E5D2C2',
              borderRadius: '6px',
              padding: '0.4rem 0.85rem',
              color: '#21170F',
              fontSize: '13px',
              fontWeight: 500,
            }}
          >
            <option value="all">All Clusters</option>
            <option value="thoubal">Thoubal Cluster</option>
            <option value="churachandpur">Churachandpur (Khousabung)</option>
          </select>

          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            style={{
              background: '#FFFFFF',
              border: '1px solid #E5D2C2',
              borderRadius: '6px',
              padding: '0.4rem 0.85rem',
              color: '#21170F',
              fontSize: '13px',
              fontWeight: 500,
            }}
          >
            <option value="all">All Grades</option>
            <option value="Grade A">Grade A (&gt;14.0° Brix)</option>
            <option value="Grade B">Grade B (12.5 - 14.0° Brix)</option>
          </select>
        </div>

        <div style={{ fontSize: '13px', color: '#6E5A4A' }}>
          Showing <strong>{filteredLots.length}</strong> verified farm lots
        </div>
      </div>

      {/* Marketplace Lots Grid */}
      <div
        className="buyer-lot-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1rem',
        }}
      >
        {filteredLots.map((lot) => (
          <div
            key={lot.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              padding: '1.25rem',
              background: '#FFFFFF',
              border: '1px solid #F1E4D8',
              borderRadius: '8px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="badge badge-orange" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 600 }}>
                {lot.lot_code}
              </span>
              <span className={`badge ${lot.grade === 'Grade A' ? 'badge-orange' : 'badge-slate'}`} style={{ fontSize: '12px', fontWeight: 600 }}>
                {lot.grade}
              </span>
            </div>

            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#21170F' }}>
                {lot.weight_kg} kg {lot.variety} Pineapple
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#6E5A4A', fontSize: '12px', marginTop: '0.25rem' }}>
                <MapPin size={13} style={{ color: '#FB923C' }} />
                <span>{lot.district} • {lot.farmer}</span>
              </div>
            </div>

            <div
              style={{
                background: '#FFF5ED',
                padding: '0.75rem 0.85rem',
                borderRadius: '6px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.5rem',
                border: '1px solid #F1E4D8',
              }}
            >
              <div>
                <div style={{ fontSize: '12px', color: '#6E5A4A', fontWeight: 600 }}>SWEETNESS</div>
                <div className="tabular-nums" style={{ fontSize: '16px', fontWeight: 700, color: '#F97316' }}>
                  {lot.brix}° Brix
                </div>
              </div>

              <div>
                <div style={{ fontSize: '12px', color: '#6E5A4A', fontWeight: 600 }}>READY DATE</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#21170F', marginTop: '0.15rem' }}>
                  {lot.available_date}
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: 'auto',
                paddingTop: '0.75rem',
                borderTop: '1px solid #F1E4D8',
              }}
            >
              <div>
                <div style={{ fontSize: '12px', color: '#6E5A4A', fontWeight: 600 }}>ASKING RATE</div>
                <div className="tabular-nums" style={{ fontSize: '18px', fontWeight: 700, color: '#FB923C' }}>
                  ₹{lot.minimum_rate.toFixed(2)}
                  <span style={{ fontSize: '12px', color: '#6E5A4A', fontWeight: 400 }}>/kg</span>
                </div>
              </div>

              <button
                className="tap-target btn-primary"
                style={{ padding: '0.45rem 0.95rem', fontSize: '13px', minHeight: '38px', gap: '0.35rem', fontWeight: 600 }}
                onClick={() => alert(`Bid initiated for ${lot.lot_code} (${lot.weight_kg} kg). The farmer will review net payout.`)}
              >
                <span>Submit Offer</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Demand Order Creator Modal */}
      {showOrderModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1rem',
          }}
        >
          <div className="glass-card" style={{ maxWidth: '460px', width: '100%', padding: '1.5rem', background: '#FFFFFF' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Post Institutional Demand Order
              </h3>
              <button
                type="button"
                onClick={() => setShowOrderModal(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Broadcast bulk procurement volume to FPO aggregators in Manipur.
            </p>

            <form onSubmit={handlePlaceOrder} style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <div>
                <label style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Pineapple Variety</label>
                <select
                  value={variety}
                  onChange={(e) => setVariety(e.target.value as any)}
                  style={{
                    width: '100%',
                    background: '#F8FAFC',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.45rem',
                    color: 'var(--text-primary)',
                    marginTop: '0.15rem',
                    fontSize: '0.82rem',
                  }}
                >
                  <option value="Queen">Queen (Table Sweet - 14-16° Brix)</option>
                  <option value="Kew">Kew (Large Juicing Variety - 12-14° Brix)</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                <div>
                  <label style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Required Volume (kg)</label>
                  <input
                    type="number"
                    value={requiredWeight}
                    onChange={(e) => setRequiredWeight(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#F8FAFC',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.45rem',
                      color: 'var(--text-primary)',
                      marginTop: '0.15rem',
                      fontSize: '0.82rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Min Sugar (° Brix)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={targetBrix}
                    onChange={(e) => setTargetBrix(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#F8FAFC',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.45rem',
                      color: 'var(--text-primary)',
                      marginTop: '0.15rem',
                      fontSize: '0.82rem',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Max Gross Rate (₹ / kg)</label>
                <input
                  type="number"
                  step="0.5"
                  value={maxRate}
                  onChange={(e) => setMaxRate(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#F8FAFC',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.45rem',
                    color: 'var(--text-primary)',
                    marginTop: '0.15rem',
                    fontSize: '0.82rem',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Delivery Receiving Hub</label>
                <input
                  type="text"
                  value={targetHub}
                  onChange={(e) => setTargetHub(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#F8FAFC',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.45rem',
                    color: 'var(--text-primary)',
                    marginTop: '0.15rem',
                    fontSize: '0.82rem',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowOrderModal(false)}
                  className="tap-target btn-secondary"
                  style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="tap-target btn-primary"
                  style={{ padding: '0.4rem 1.15rem', fontSize: '0.8rem' }}
                >
                  {orderSuccess ? 'Order Broadcasted!' : 'Broadcast to FPO'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
