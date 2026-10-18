'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';
import { DEMO_USERS } from '@/lib/api-client';
import { useRouter } from 'next/navigation';
import { Footer } from '@/components/common/Footer';
import {
  Sprout,
  Building2,
  Truck,
  Lock,
  Phone,
  User,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Cpu,
  Layers,
  Coins,
  MapPin
} from 'lucide-react';

export const AuthPortal: React.FC = () => {
  const router = useRouter();
  const { login, register, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');

  // Form states
  const [loginPhone, setLoginPhone] = useState('+919862000001');
  const [loginPassword, setLoginPassword] = useState('innotech2026');

  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('+91');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('farmer');
  const [regLanguage, setRegLanguage] = useState<'en' | 'mn_bengali' | 'mn_mayek'>('en');

  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanPhone = loginPhone.trim();
    if (!cleanPhone || cleanPhone.length < 10) {
      setErrorMsg('Please enter a valid mobile number (+91...)');
      return;
    }

    try {
      const user = await login(cleanPhone, loginPassword);
      setSuccessMsg(`Welcome back, ${user.full_name}! Entering ${user.role.toUpperCase()} terminal...`);
      router.push(`/${user.role}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please check your phone number and password.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!regName.trim() || regName.trim().length < 2) {
      setErrorMsg('Please enter your full name');
      return;
    }

    const cleanPhone = regPhone.trim();
    if (!cleanPhone || cleanPhone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number with country code');
      return;
    }

    if (!regPassword || regPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters');
      return;
    }

    try {
      const user = await register({
        full_name: regName.trim(),
        phone_number: cleanPhone,
        password: regPassword,
        role: regRole,
        preferred_language: regLanguage,
      });
      setSuccessMsg(`Account created for ${user.full_name}! Entering ${user.role.toUpperCase()} terminal...`);
      router.push(`/${user.role}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Sign up failed. This phone number may already be registered.');
    }
  };

  const handleQuickDemo = async (targetRole: UserRole) => {
    const demo = DEMO_USERS[targetRole];
    setErrorMsg(null);
    setLoginPhone(demo.phone);
    setLoginPassword(demo.pass);
    try {
      const user = await login(demo.phone, demo.pass);
      setSuccessMsg(`Authenticated as ${demo.name} (${user.role.toUpperCase()})`);
      router.push(`/${user.role}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Demo sign in failed.');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'radial-gradient(ellipse at 50% 20%, #FFF7ED 0%, #F8FAFC 70%, #F1F5F9 100%)',
      }}
    >
      {/* Brand Navigation Header */}
      <header
        style={{
          padding: '1.25rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(226, 232, 240, 0.7)',
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)',
            }}
          >
            <Sprout size={24} strokeWidth={2.4} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <span style={{ fontWeight: 900, fontSize: '1.35rem', color: '#18181B', letterSpacing: '-0.02em' }}>
                HARVESTLINK
              </span>
              <span style={{ fontWeight: 900, fontSize: '1.35rem', color: '#F97316' }}>
                AI
              </span>
              <span className="badge badge-orange" style={{ fontSize: '0.62rem' }}>
                INNOTECH 2.0
              </span>
            </div>
            <p style={{ fontSize: '0.74rem', color: '#64748B', margin: 0, fontWeight: 500 }}>
              Predictive Crop Decision Terminal • Manipur Horticulture
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#059669', fontSize: '0.78rem', fontWeight: 700 }}>
          <span className="pulse-dot pulse-dot-green" />
          <span>Role-Based Security Active</span>
        </div>
      </header>

      {/* Main Authentication Container */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2.5rem 1.25rem',
        }}
      >
        <div
          style={{
            maxWidth: '1040px',
            width: '100%',
            display: 'grid',
            gridTemplateColumns: '1.1fr 0.9fr',
            gap: '2.5rem',
            alignItems: 'center',
          }}
          className="auth-portal-grid"
        >
          {/* Left Hero Column: Architecture & Value Proposition */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.3rem 0.75rem', borderRadius: 'var(--radius-full)', background: '#FFF7ED', border: '1px solid #FED7AA', color: '#EA580C', fontSize: '0.78rem', fontWeight: 800, marginBottom: '1rem' }}>
              <ShieldCheck size={14} />
              <span>STRICT ROLE-BASED ACCESS CONTROL (RBAC)</span>
            </div>

            <h1
              style={{
                fontSize: '2.45rem',
                fontWeight: 900,
                color: '#0F172A',
                letterSpacing: '-0.03em',
                lineHeight: 1.15,
                marginBottom: '1rem',
              }}
            >
              Unified Agricultural Intelligence for Manipur
            </h1>

            <p style={{ fontSize: '0.98rem', color: '#475569', lineHeight: 1.6, marginBottom: '2rem' }}>
              Sign in with your verified credentials or select an authorized role to unlock tailored predictive agronomy, transparent price linkage, and collective FPO logistics.
            </p>

            {/* Feature Capability Badges */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ background: '#FFFFFF', padding: '1rem', borderRadius: '14px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#059669', fontWeight: 800, fontSize: '0.85rem' }}>
                  <Sprout size={16} />
                  <span>Farmer Terminal</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.35rem', lineHeight: 1.45 }}>
                  Vision disease triage, thermal GDD sweet-spot picking radar & radical net take-home price transparency.
                </p>
              </div>

              <div style={{ background: '#FFFFFF', padding: '1rem', borderRadius: '14px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#2563EB', fontWeight: 800, fontSize: '0.85rem' }}>
                  <Building2 size={16} />
                  <span>Buyer Marketplace</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.35rem', lineHeight: 1.45 }}>
                  Brix-verified wholesale pineapple lots, instant escrow contracts & direct farm procurement.
                </p>
              </div>

              <div style={{ background: '#FFFFFF', padding: '1rem', borderRadius: '14px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#EA580C', fontWeight: 800, fontSize: '0.85rem' }}>
                  <Truck size={16} />
                  <span>FPO Logistics</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.35rem', lineHeight: 1.45 }}>
                  Multi-farm truck capacity pooling (82% optimal fill) & dynamic QR-coded digital gate-passes.
                </p>
              </div>

              <div style={{ background: '#FFFFFF', padding: '1rem', borderRadius: '14px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#7C3AED', fontWeight: 800, fontSize: '0.85rem' }}>
                  <Cpu size={16} />
                  <span>Edge & Offline AI</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.35rem', lineHeight: 1.45 }}>
                  Local IndexedDB queuing, client-side WebP compression & seamless auto-sync over 2G hills.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Login / Sign Up Card */}
          <div
            className="glass-card"
            style={{
              background: '#FFFFFF',
              borderRadius: '22px',
              border: '1px solid #E2E8F0',
              padding: '2rem',
              boxShadow: '0 20px 45px -12px rgba(0, 0, 0, 0.12)',
            }}
          >
            {/* Tab Switcher */}
            <div
              style={{
                display: 'flex',
                background: '#F1F5F9',
                padding: '0.3rem',
                borderRadius: '12px',
                marginBottom: '1.5rem',
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setActiveTab('login');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                style={{
                  flex: 1,
                  padding: '0.6rem',
                  borderRadius: '9px',
                  border: 'none',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: activeTab === 'login' ? '#FFFFFF' : 'transparent',
                  color: activeTab === 'login' ? '#EA580C' : '#64748B',
                  boxShadow: activeTab === 'login' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('signup');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                style={{
                  flex: 1,
                  padding: '0.6rem',
                  borderRadius: '9px',
                  border: 'none',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: activeTab === 'signup' ? '#FFFFFF' : 'transparent',
                  color: activeTab === 'signup' ? '#EA580C' : '#64748B',
                  boxShadow: activeTab === 'signup' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                Create Account
              </button>
            </div>

            {/* Notification Messages */}
            {errorMsg && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem',
                  borderRadius: '10px',
                  background: '#FEF2F2',
                  border: '1px solid #FECACA',
                  color: '#DC2626',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  marginBottom: '1.25rem',
                }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem',
                  borderRadius: '10px',
                  background: '#ECFDF5',
                  border: '1px solid #A7F3D0',
                  color: '#059669',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  marginBottom: '1.25rem',
                }}
              >
                <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
                <span>{successMsg}</span>
              </div>
            )}

            {/* ── TAB 1: SIGN IN ────────────────────────────────────────── */}
            {activeTab === 'login' && (
              <div>
                <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                      Registered Mobile Number
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Phone size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                      <input
                        type="tel"
                        value={loginPhone}
                        onChange={(e) => setLoginPhone(e.target.value)}
                        placeholder="+919862000001"
                        required
                        style={{
                          width: '100%',
                          padding: '0.7rem 0.85rem 0.7rem 2.35rem',
                          borderRadius: '10px',
                          border: '1px solid #CBD5E1',
                          fontSize: '0.88rem',
                          color: '#0F172A',
                          outline: 'none',
                          background: '#FAFAF9',
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                      Account Password
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        style={{
                          width: '100%',
                          padding: '0.7rem 2.35rem 0.7rem 2.35rem',
                          borderRadius: '10px',
                          border: '1px solid #CBD5E1',
                          fontSize: '0.88rem',
                          color: '#0F172A',
                          outline: 'none',
                          background: '#FAFAF9',
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: 'absolute',
                          right: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#94A3B8',
                          padding: 0,
                        }}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary tap-target"
                    style={{
                      padding: '0.8rem',
                      fontSize: '0.92rem',
                      fontWeight: 800,
                      borderRadius: '10px',
                      marginTop: '0.35rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <span>{isLoading ? 'Verifying Credentials...' : 'Sign In to Terminal'}</span>
                    <ArrowRight size={16} />
                  </button>
                </form>

                {/* Quick 1-Tap Demo Switcher */}
                <div style={{ marginTop: '1.5rem', borderTop: '1px solid #E2E8F0', paddingTop: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.75rem', color: '#EA580C', fontSize: '0.75rem', fontWeight: 800 }}>
                    <Sparkles size={14} />
                    <span>1-TAP QUICK ROLES (HACKATHON ACCELERATOR)</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                    {/* Super Admin Demo (All Access) */}
                    <button
                      type="button"
                      onClick={() => handleQuickDemo('admin')}
                      disabled={isLoading}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '10px',
                        border: '1.5px solid #C7D2FE',
                        background: 'linear-gradient(135deg, #EEF2FF 0%, #FFFFFF 100%)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s ease',
                        boxShadow: '0 2px 6px rgba(99, 102, 241, 0.08)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flex: 1, minWidth: 0 }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#E0E7FF', color: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <ShieldCheck size={18} strokeWidth={2.4} />
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                            <span>Mission Director</span>
                            <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#4F46E5', background: '#EEF2FF', border: '1px solid #C7D2FE', padding: '0.1rem 0.35rem', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                              SUPER ADMIN (ALL ACCESS)
                            </span>
                          </div>
                          <div style={{ fontSize: '0.7rem', color: '#4F46E5', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            State Directorate • Full Access to Farmer, Buyer & FPO
                          </div>
                        </div>
                      </div>
                      <span style={{ fontSize: '0.72rem', color: '#4F46E5', fontWeight: 800, flexShrink: 0, marginLeft: '0.5rem' }}>Enter All →</span>
                    </button>

                    {/* Farmer Demo */}
                    <button
                      type="button"
                      onClick={() => handleQuickDemo('farmer')}
                      disabled={isLoading}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '10px',
                        border: '1px solid #E2E8F0',
                        background: '#FAFAF9',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Sprout size={16} />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0F172A' }}>
                            Tombi Singh <span style={{ fontSize: '0.68rem', color: '#059669', background: '#ECFDF5', padding: '0.1rem 0.35rem', borderRadius: '4px', marginLeft: '0.35rem' }}>FARMER</span>
                          </div>
                          <div style={{ fontSize: '0.7rem', color: '#64748B' }}>
                            Andro Terraces • Queen Pineapple Grower
                          </div>
                        </div>
                      </div>
                      <span style={{ fontSize: '0.72rem', color: '#EA580C', fontWeight: 700 }}>Enter →</span>
                    </button>

                    {/* Buyer Demo */}
                    <button
                      type="button"
                      onClick={() => handleQuickDemo('buyer')}
                      disabled={isLoading}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '10px',
                        border: '1px solid #E2E8F0',
                        background: '#FAFAF9',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Building2 size={16} />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0F172A' }}>
                            Manipur Fruit Processing Co-op <span style={{ fontSize: '0.68rem', color: '#2563EB', background: '#EFF6FF', padding: '0.1rem 0.35rem', borderRadius: '4px', marginLeft: '0.35rem' }}>BUYER</span>
                          </div>
                          <div style={{ fontSize: '0.7rem', color: '#64748B' }}>
                            Nilakuthi Food Park, Imphal East
                          </div>
                        </div>
                      </div>
                      <span style={{ fontSize: '0.72rem', color: '#EA580C', fontWeight: 700 }}>Enter →</span>
                    </button>

                    {/* FPO Demo */}
                    <button
                      type="button"
                      onClick={() => handleQuickDemo('fpo')}
                      disabled={isLoading}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '10px',
                        border: '1px solid #E2E8F0',
                        background: '#FAFAF9',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#FFF7ED', color: '#EA580C', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Truck size={16} />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0F172A' }}>
                            Rajen Meitei <span style={{ fontSize: '0.68rem', color: '#EA580C', background: '#FFF7ED', padding: '0.1rem 0.35rem', borderRadius: '4px', marginLeft: '0.35rem' }}>FPO LOGISTICS</span>
                          </div>
                          <div style={{ fontSize: '0.7rem', color: '#64748B' }}>
                            Thoubal Cluster • Truck Pooling & Routing
                          </div>
                        </div>
                      </div>
                      <span style={{ fontSize: '0.72rem', color: '#EA580C', fontWeight: 700 }}>Enter →</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB 2: SIGN UP ────────────────────────────────────────── */}
            {activeTab === 'signup' && (
              <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Full Name
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                    <input
                      type="text"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="e.g. Tombi Singh"
                      required
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem 0.65rem 2.35rem',
                        borderRadius: '10px',
                        border: '1px solid #CBD5E1',
                        fontSize: '0.88rem',
                        color: '#0F172A',
                        outline: 'none',
                        background: '#FAFAF9',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Mobile Number
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+919862123456"
                      required
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem 0.65rem 2.35rem',
                        borderRadius: '10px',
                        border: '1px solid #CBD5E1',
                        fontSize: '0.88rem',
                        color: '#0F172A',
                        outline: 'none',
                        background: '#FAFAF9',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Select Your System Role
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => setRegRole('farmer')}
                      style={{
                        padding: '0.65rem 0.45rem',
                        borderRadius: '10px',
                        border: regRole === 'farmer' ? '2px solid #F97316' : '1px solid #E2E8F0',
                        background: regRole === 'farmer' ? '#FFF7ED' : '#FAFAF9',
                        color: regRole === 'farmer' ? '#EA580C' : '#64748B',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.25rem',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <Sprout size={18} />
                      <span style={{ fontSize: '0.78rem', fontWeight: 800 }}>Farmer</span>
                      <span style={{ fontSize: '0.62rem', color: '#94A3B8', textAlign: 'center' }}>Crop & Pricing</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRegRole('buyer')}
                      style={{
                        padding: '0.65rem 0.45rem',
                        borderRadius: '10px',
                        border: regRole === 'buyer' ? '2px solid #F97316' : '1px solid #E2E8F0',
                        background: regRole === 'buyer' ? '#FFF7ED' : '#FAFAF9',
                        color: regRole === 'buyer' ? '#EA580C' : '#64748B',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.25rem',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <Building2 size={18} />
                      <span style={{ fontSize: '0.78rem', fontWeight: 800 }}>Buyer</span>
                      <span style={{ fontSize: '0.62rem', color: '#94A3B8', textAlign: 'center' }}>Wholesale Lots</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRegRole('fpo')}
                      style={{
                        padding: '0.65rem 0.45rem',
                        borderRadius: '10px',
                        border: regRole === 'fpo' ? '2px solid #F97316' : '1px solid #E2E8F0',
                        background: regRole === 'fpo' ? '#FFF7ED' : '#FAFAF9',
                        color: regRole === 'fpo' ? '#EA580C' : '#64748B',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.25rem',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <Truck size={18} />
                      <span style={{ fontSize: '0.78rem', fontWeight: 800 }}>FPO Lead</span>
                      <span style={{ fontSize: '0.62rem', color: '#94A3B8', textAlign: 'center' }}>Logistics Route</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Password (Min 6 Characters)
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      style={{
                        width: '100%',
                        padding: '0.65rem 2.35rem 0.65rem 2.35rem',
                        borderRadius: '10px',
                        border: '1px solid #CBD5E1',
                        fontSize: '0.88rem',
                        color: '#0F172A',
                        outline: 'none',
                        background: '#FAFAF9',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#94A3B8',
                        padding: 0,
                      }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary tap-target"
                  style={{
                    padding: '0.75rem',
                    fontSize: '0.92rem',
                    fontWeight: 800,
                    borderRadius: '10px',
                    marginTop: '0.35rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <span>{isLoading ? 'Creating Account...' : 'Create Account & Enter'}</span>
                  <ArrowRight size={16} />
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
