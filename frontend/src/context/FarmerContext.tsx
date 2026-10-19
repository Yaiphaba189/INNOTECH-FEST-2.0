'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { BuyerMatchQuote, HarvestLot } from '@/types';
import { MOCK_ACTIVE_LOT, MOCK_BUYER_MATCHES, MOCK_DISPATCH_RUN } from '@/lib/mock-data';
import { api } from '@/lib/api-client';
import {
  DEMO_RAIN,
  Decision,
  RainForecast,
  computeCostOfWaiting,
  decisionFromApi,
  fetchRainForecast,
  pickBestQuote,
  quoteView,
} from '@/lib/decision';

// Tombi Hillside Terraces, Khousabung (Churachandpur): the seeded farm behind lot-chura-tombi-500
const FARM_LAT = 24.3335;
const FARM_LNG = 93.6742;

type BookingState = 'idle' | 'booking' | 'booked';

interface FarmerContextType {
  lot: HarvestLot;
  quotes: BuyerMatchQuote[];
  bestQuote: BuyerMatchQuote | null;
  bestView: ReturnType<typeof quoteView> | null;
  rain: RainForecast;
  decision: Decision | null;
  /** True when the numbers came from the backend /lots/{id}/decision response. */
  fromBackend: boolean;
  lockedQuoteId: string | null;
  booking: BookingState;
  truck: { registration: string; capacityKg: number; otherKg: number; fillAfterPct: number };
  lockDeal: (quote: BuyerMatchQuote) => Promise<void>;
  pickAndBook: () => Promise<void>;
}

const FarmerContext = createContext<FarmerContextType | undefined>(undefined);

export const FarmerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lot, setLot] = useState<HarvestLot>(MOCK_ACTIVE_LOT);
  const [quotes, setQuotes] = useState<BuyerMatchQuote[]>(MOCK_BUYER_MATCHES);
  const [rain, setRain] = useState<RainForecast>(DEMO_RAIN);
  const [apiDecision, setApiDecision] = useState<Decision | null>(null);
  const [lockedQuoteId, setLockedQuoteId] = useState<string | null>(null);
  const [booking, setBooking] = useState<BookingState>('idle');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [matches, res] = await Promise.all([api.getBuyerMatches(MOCK_ACTIVE_LOT.id), api.getLotDecision(MOCK_ACTIVE_LOT.id)]);
      if (cancelled) return;
      if (matches?.length) setQuotes(matches);
      if (res) {
        const d = decisionFromApi(res.decision);
        setApiDecision(d);
        setLot((l) => ({ ...l, quantity_kg: res.lot_kg, estimated_brix: d.brixNow }));
        setRain({
          mm: res.rain.rain_mm,
          etaHours: res.rain.eta_hours,
          source: res.rain.source,
          liveMm: res.live_mm ?? (res.rain.source === 'demo' ? null : res.rain.rain_mm),
          asOf: res.rain.as_of,
        });
      } else {
        // Backend unreachable: browser-side forecast, same decision maths.
        fetchRainForecast(FARM_LAT, FARM_LNG).then((r) => !cancelled && setRain(r));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const bestQuote = useMemo(() => pickBestQuote(quotes), [quotes]);
  const bestView = useMemo(() => (bestQuote ? quoteView(bestQuote, lot.quantity_kg) : null), [bestQuote, lot.quantity_kg]);
  const decision = useMemo(
    () => apiDecision ?? (bestView ? computeCostOfWaiting(lot, bestView.net, rain) : null),
    [apiDecision, bestView, lot, rain]
  );

  const truck = useMemo(() => {
    const cap = MOCK_DISPATCH_RUN.vehicle_capacity_kg;
    const otherKg = MOCK_DISPATCH_RUN.current_payload_kg - MOCK_ACTIVE_LOT.quantity_kg;
    return {
      registration: MOCK_DISPATCH_RUN.vehicle_registration,
      capacityKg: cap,
      otherKg,
      fillAfterPct: Math.round(((otherKg + lot.quantity_kg) / cap) * 1000) / 10,
    };
  }, [lot.quantity_kg]);

  const lockDeal = useCallback(async (quote: BuyerMatchQuote) => {
    setLockedQuoteId(quote.id);
    setQuotes((prev) => prev.map((q) => (q.id === quote.id ? { ...q, status: 'locked' } : q)));
    try {
      await api.acceptDeal(quote.id);
    } catch (err) {
      console.warn('Deal accept error:', err);
    }
  }, []);

  const pickAndBook = useCallback(async () => {
    if (!bestQuote || booking !== 'idle') return;
    setBooking('booking');
    await lockDeal(bestQuote);
    setBooking('booked');
  }, [bestQuote, booking, lockDeal]);

  const value: FarmerContextType = {
    lot, quotes, bestQuote, bestView, rain, decision, fromBackend: apiDecision !== null,
    lockedQuoteId, booking, truck, lockDeal, pickAndBook,
  };
  return <FarmerContext.Provider value={value}>{children}</FarmerContext.Provider>;
};

export function useFarmer(): FarmerContextType {
  const ctx = useContext(FarmerContext);
  if (!ctx) throw new Error('useFarmer must be used within a FarmerProvider');
  return ctx;
}
