'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n';
import { api } from '@/lib/api-client';
import { 
  Building2, 
  Search, 
  Filter, 
  PlusCircle, 
  Sparkles, 
  CheckCircle2, 
  MapPin, 
  Scale, 
  Check, 
  Calendar,
  Layers,
  ArrowRight
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
    status: 'open'
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
    status: 'open'
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
    status: 'open'
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
    status: 'open'
  }
];

export const BuyerMarketplace: React.FC = () => {
  const { t } = useTranslation();
  const [lots, setLots] = useState<MarketplaceLot[]>(INITIAL_LOTS);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // New demand order state
  const [variety, setVariety] = useState<'Queen' | 'Kew'>('Queen');
  const [requiredWeight, setRequiredWeight] = useState('2000');
  const [targetBrix, setTargetBrix] = useState('14.5');
  const [maxRate, setMaxRate] = useState('28.50');
  const [targetHub, setTargetHub] = useState('Nilakuthi Food Park, Imphal');

  useEffect(() => {
    api.getMarketplaceLots()
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
        variety: variety,
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
    }, 1500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Buyer Console Header */}
      <div className="glass-card glass-card-accent" style={{ padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <span className="badge badge-gold">BUYER PORTAL</span>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>
                Wholesale Procurement & Marketplace Feed
              </h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '0.35rem' }}>
              Direct verified sourcing from certified pineapple clusters in Churachandpur, Thoubal, and Bishnupur.
            </p>
          </div>

          <button
            onClick={() => setShowOrderModal(true)}
            className="tap-target btn-primary"
            style={{ gap: '0.5rem', fontSize: '0.88rem' }}
          >
            <PlusCircle size={18} />
            Post Institutional Demand Order
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-card" style={{ padding: '1rem 1.25rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <Filter size={16} /> Filter by District:
          </div>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.4rem 0.75rem',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
            }}
          >
            <option value="all">All Horticultural Districts</option>
            <option value="thoubal">Thoubal Cluster</option>
            <option value="churachandpur">Churachandpur (Khousabung)</option>
            <option value="bishnupur">Bishnupur Cluster</option>
          </select>

          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.4rem 0.75rem',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
            }}
          >
            <option value="all">All Grades</option>
            <option value="Grade A">Grade A (Brix &gt; 14.0°)</option>
            <option value="Grade B">Grade B (Brix 12.5 - 14.0°)</option>
          </select>
        </div>

        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          Showing <strong>{filteredLots.length}</strong> verified farm consignments
        </div>
      </div>

      {/* Marketplace Lots Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1.25rem',
      }}>
        {filteredLots.map((lot) => (
          <div
            key={lot.id}
            className="glass-card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="badge badge-gold" style={{ fontFamily: 'var(--font-mono)' }}>
                {lot.lot_code}
              </span>
              <span className={`badge ${lot.grade === 'Grade A' ? 'badge-green' : 'badge-slate'}`}>
                {lot.grade}
              </span>
            </div>

            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {lot.weight_kg} kg {lot.variety} Pineapple
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.2rem' }}>
                <MapPin size={14} style={{ color: 'var(--pineapple-gold)' }} />
                <span>{lot.district} • Farmer: {lot.farmer}</span>
              </div>
            </div>

            <div style={{
              background: 'var(--bg-surface-elevated)',
              padding: '0.75rem',
              borderRadius: 'var(--radius-sm)',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.5rem',
            }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>BRIX SWEETNESS</div>
                <div className="tabular-nums" style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--plantation-green)' }}>
                  {lot.brix}° Brix
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>READY DATE</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {lot.available_date}
                </div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 'auto',
              paddingTop: '0.75rem',
              borderTop: '1px solid var(--border-subtle)',
            }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ASKING RATE</div>
                <div className="tabular-nums" style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--pineapple-gold)' }}>
                  ₹{lot.minimum_rate.toFixed(2)}/kg
                </div>
              </div>

              <button
                className="tap-target btn-primary"
                style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}
                onClick={() => alert(`Bid initiated for ${lot.lot_code} (${lot.weight_kg} kg). The farmer will review net realized payout.`)}
              >
                Submit Offer
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Demand Order Creator Modal */}
      {showOrderModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '1rem',
        }}>
          <div className="glass-card" style={{ maxWidth: '520px', width: '100%', padding: '1.75rem', border: '1px solid var(--pineapple-gold)', background: 'rgba(15, 23, 42, 0.95)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Create Institutional Procurement Demand Order
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Broadcast bulk procurement needs to FPO aggregators in Thoubal and Churachandpur with guaranteed weighbridge settlement terms.
            </p>

            <form onSubmit={handlePlaceOrder} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Pineapple Variety</label>
                <select
                  value={variety}
                  onChange={(e) => setVariety(e.target.value as any)}
                  style={{
                    width: '100%',
                    background: 'var(--bg-app)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.5rem',
                    color: 'var(--text-primary)',
                    marginTop: '0.25rem',
                  }}
                >
                  <option value="Queen">Queen (Fresh Table / Canning Sweet - 14-16° Brix)</option>
                  <option value="Kew">Kew (Large Juicing Variety - 12-14° Brix)</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Required Volume (kg)</label>
                  <input
                    type="number"
                    value={requiredWeight}
                    onChange={(e) => setRequiredWeight(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'var(--bg-app)',
                      border: '1px solid var(--border-medium)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.5rem',
                      color: 'var(--text-primary)',
                      marginTop: '0.25rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Min Sugar (° Brix)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={targetBrix}
                    onChange={(e) => setTargetBrix(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'var(--bg-app)',
                      border: '1px solid var(--border-medium)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.5rem',
                      color: 'var(--text-primary)',
                      marginTop: '0.25rem',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Max Gross Budget (₹ / kg)</label>
                <input
                  type="number"
                  step="0.5"
                  value={maxRate}
                  onChange={(e) => setMaxRate(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'var(--bg-app)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.5rem',
                    color: 'var(--text-primary)',
                    marginTop: '0.25rem',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Delivery Receiving Hub</label>
                <input
                  type="text"
                  value={targetHub}
                  onChange={(e) => setTargetHub(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'var(--bg-app)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.5rem',
                    color: 'var(--text-primary)',
                    marginTop: '0.25rem',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setShowOrderModal(false)}
                  className="tap-target btn-secondary"
                  style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="tap-target btn-primary"
                  style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}
                >
                  {orderSuccess ? 'Order Broadcasted!' : 'Broadcast to FPO Network'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
