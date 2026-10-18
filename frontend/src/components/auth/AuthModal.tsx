'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';
import { DEMO_USERS } from '@/lib/api-client';
import { useRouter } from 'next/navigation';
import {
  X,
  Lock,
  Phone,
  User,
  Sprout,
  Building2,
  Truck,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'login',
}) => {
  const router = useRouter();
  const { login, register, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>(initialTab);

  // Login form state
  const [loginPhone, setLoginPhone] = useState('+919862000001');
  const [loginPassword, setLoginPassword] = useState('innotech2026');

  // Sign up form state
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('+91');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('farmer');
  const [regLanguage, setRegLanguage] = useState<'en' | 'mn_bengali' | 'mn_mayek'>('en');

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

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
      setSuccessMsg('Signed in successfully!');
      setTimeout(() => {
        onClose();
        router.push(`/${user.role}`);
      }, 350);
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
      setSuccessMsg(`Welcome to HarvestLink AI, ${regName.trim()}!`);
      setTimeout(() => {
        onClose();
        router.push(`/${user.role}`);
      }, 400);
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
      setSuccessMsg(`Switched to ${demo.name} (${demo.role.toUpperCase()})`);
      setTimeout(() => {
        onClose();
        router.push(`/${user.role}`);
      }, 300);
    } catch (err: any) {
      setErrorMsg(err.message || 'Demo sign in failed.');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        backgroundColor: 'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: '520px',
          maxHeight: '92vh',
          overflowY: 'auto',
          background: '#FFFFFF',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid #E2E8F0',
          padding: '1.75rem',
          position: 'relative',
        }}
      >
        {/* Modal Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: '#F1F5F9',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#64748B',
            transition: 'all 0.15s ease',
          }}
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>

        {/* Brand Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
            }}
          >
            <Sprout size={20} strokeWidth={2.4} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
              HARVESTLINK <span style={{ color: '#F97316' }}>AI</span>
            </h3>
            <p style={{ fontSize: '0.75rem', color: '#64748B', margin: 0 }}>
              Role-Based Agriculture Intelligence & Market Linkage
            </p>
          </div>
        </div>

        {/* Tab Switcher: Sign In vs Sign Up */}
        <div
          style={{
            display: 'flex',
            background: '#F1F5F9',
            padding: '0.25rem',
            borderRadius: '12px',
            marginTop: '1.25rem',
            marginBottom: '1.25rem',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setErrorMsg(null);
            }}
            style={{
              flex: 1,
              padding: '0.55rem',
              borderRadius: '9px',
              border: 'none',
              fontSize: '0.86rem',
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
            }}
            style={{
              flex: 1,
              padding: '0.55rem',
              borderRadius: '9px',
              border: 'none',
              fontSize: '0.86rem',
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

        {/* Notification Alerts */}
        {errorMsg && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.65rem 0.85rem',
              borderRadius: '10px',
              background: '#FEF2F2',
              border: '1px solid #FECACA',
              color: '#DC2626',
              fontSize: '0.8rem',
              fontWeight: 600,
              marginBottom: '1rem',
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
              padding: '0.65rem 0.85rem',
              borderRadius: '10px',
              background: '#ECFDF5',
              border: '1px solid #A7F3D0',
              color: '#059669',
              fontSize: '0.8rem',
              fontWeight: 600,
              marginBottom: '1rem',
            }}
          >
            <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ── TAB 1: SIGN IN FORM ─────────────────────────────────────────── */}
        {activeTab === 'login' && (
          <div>
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Mobile Phone Number
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
                  Password
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
                <span>{isLoading ? 'Signing In...' : 'Sign In to Terminal'}</span>
                <ArrowRight size={16} />
              </button>
            </form>

            {/* Quick 1-Tap Demo Logins */}
            <div style={{ marginTop: '1.5rem', borderTop: '1px solid #E2E8F0', paddingTop: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.75rem', color: '#EA580C', fontSize: '0.75rem', fontWeight: 800 }}>
                <Sparkles size={14} />
                <span>1-TAP QUICK DEMO LOGINS (HACKATHON ACCELERATOR)</span>
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
                  <span style={{ fontSize: '0.72rem', color: '#EA580C', fontWeight: 700 }}>Log In →</span>
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
                  <span style={{ fontSize: '0.72rem', color: '#EA580C', fontWeight: 700 }}>Log In →</span>
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
                        Thoubal Cluster • Route & Capacity Pooling
                      </div>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#EA580C', fontWeight: 700 }}>Log In →</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: SIGN UP / REGISTER FORM ─────────────────────────────── */}
        {activeTab === 'signup' && (
          <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            {/* Full Name */}
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

            {/* Mobile Phone Number */}
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

            {/* Role Selection Cards */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                Select Your System Role
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                {/* Farmer Role */}
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
                  <span style={{ fontSize: '0.62rem', color: '#94A3B8', textAlign: 'center' }}>Diagnosis & Net Price</span>
                </button>

                {/* Buyer Role */}
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
                  <span style={{ fontSize: '0.62rem', color: '#94A3B8', textAlign: 'center' }}>Wholesale Lots & Escrow</span>
                </button>

                {/* FPO Logistics Role */}
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
                  <span style={{ fontSize: '0.62rem', color: '#94A3B8', textAlign: 'center' }}>Pooling & QR Pass</span>
                </button>
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                Set Password (Min 6 Characters)
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

            {/* Language Preference */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                Interface Language
              </label>
              <select
                value={regLanguage}
                onChange={(e) => setRegLanguage(e.target.value as any)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '10px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.85rem',
                  color: '#0F172A',
                  outline: 'none',
                  background: '#FAFAF9',
                }}
              >
                <option value="en">English (Default)</option>
                <option value="mn_bengali">মৈতৈলোন্ (Manipuri - Bengali Script)</option>
                <option value="mn_mayek">ꯃꯩꯇꯩꯂꯣꯟ (Manipuri - Meetei Mayek)</option>
              </select>
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
                marginTop: '0.5rem',
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
  );
};
