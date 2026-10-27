'use client';

import React from 'react';
import Link from 'next/link';
import { Sprout, Building2, Truck, Phone, Mail, MapPin, BadgeCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="app-footer">
      <div>
        <div className="hl-footer-grid">
          <div className="hl-footer-brand">
            <div className="hl-footer-logo">
              <span className="hl-logo">
                <Sprout size={18} color="#ffffff" strokeWidth={2.4} />
              </span>
              <span>
                HARVESTLINK <em>AI</em>
              </span>
            </div>
            <p>
              Predictive crop intelligence, harvest readiness radar, and direct value chain linkages for Manipur Queen
              Pineapple growers.
            </p>
            <span className="hl-footer-badge">
              <BadgeCheck size={14} />
              GI Registered: Manipur Queen Pineapple (#497)
            </span>
          </div>

          <nav className="hl-footer-col" aria-label="Platform terminals">
            <h3>Platform Terminals</h3>
            <Link href="/farmer">
              <Sprout size={14} />
              <span>Farmer Diagnostic &amp; Picking Radar</span>
            </Link>
            <Link href="/buyer">
              <Building2 size={14} />
              <span>Wholesale Buyer Marketplace</span>
            </Link>
            <Link href="/fpo">
              <Truck size={14} />
              <span>FPO Logistics &amp; Aggregation</span>
            </Link>
          </nav>

          <div className="hl-footer-col">
            <h3>Contact &amp; Helpdesk</h3>
            <div className="hl-footer-line">
              <Phone size={14} />
              <span>
                <strong>1800-180-1551</strong>
                <small>Kisan Call Centre, Toll-Free</small>
              </span>
            </div>
            <div className="hl-footer-line">
              <Mail size={14} />
              <a href="mailto:support@harvestlink-ai.in">support@harvestlink-ai.in</a>
            </div>
            <div className="hl-footer-line">
              <MapPin size={14} />
              <span>Nilakuthi Food Park, Imphal East, Manipur – 795002</span>
            </div>
          </div>
        </div>

        <div className="hl-footer-base">
          <span>
            © 2026 <strong>HARVESTLINK AI</strong>. All rights reserved.
          </span>
          <span>Built for INNOTECH FEST 2.0</span>
        </div>
      </div>
    </footer>
  );
};
