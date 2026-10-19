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
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Sparkles,
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

  // Form states
  const [loginPhone, setLoginPhone] = useState('+919862000001');
  const [loginPassword, setLoginPassword] = useState('innotech2026');

  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('+91');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('farmer');

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
      setErrorMsg('Please enter a valid mobile number');
      return;
    }

    try {
      const user = await login(cleanPhone, loginPassword);
      setSuccessMsg('Signed in successfully!');
      setTimeout(() => {
        onClose();
        router.push(`/${user.role}`);
      }, 300);
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please check credentials.');
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
      setErrorMsg('Please enter a valid mobile number');
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
      });
      setSuccessMsg(`Account created for ${user.full_name}!`);
      setTimeout(() => {
        onClose();
        router.push(`/${user.role}`);
      }, 300);
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed.');
    }
  };

  const handleQuickDemo = async (targetRole: UserRole) => {
    const demo = DEMO_USERS[targetRole];
    setErrorMsg(null);
    setLoginPhone(demo.phone);
    setLoginPassword(demo.pass);
    try {
      const user = await login(demo.phone, demo.pass);
      setSuccessMsg(`Signed in as ${demo.name} (${user.role.toUpperCase()})`);
      setTimeout(() => {
        onClose();
        router.push(`/${user.role}`);
      }, 250);
    } catch (err: any) {
      setErrorMsg(err.message || 'Demo sign in failed.');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.5)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: '1rem',
      }}
    >
      <div
        className="glass-card"
        style={{
          maxWidth: '420px',
          width: '100%',
          background: '#FFFFFF',
          borderRadius: '20px',
          padding: '1.5rem',
          boxShadow: '0 20px 45px -10px rgba(15, 23, 42, 0.2)',
        }}
      >
        {/* Header with Close */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
              }}
            >
              <Sprout size={16} strokeWidth={2.4} />
            </div>
            <span style={{ fontWeight: 900, fontSize: '1.05rem', color: '#0F172A' }}>
              HARVESTLINK <span style={{ color: '#F97316' }}>AI</span>
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#94A3B8',
              padding: '0.2rem',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div
          style={{
            display: 'flex',
            background: '#F1F5F9',
            padding: '0.2rem',
            borderRadius: 'var(--radius-full)',
            marginBottom: '1rem',
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
              padding: '0.45rem',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: activeTab === 'login' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'login' ? '#EA580C' : 'var(--text-muted)',
              boxShadow: activeTab === 'login' ? '0 1px 3px rgba(15, 23, 42, 0.08)' : 'none',
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
              padding: '0.45rem',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: activeTab === 'signup' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'signup' ? '#EA580C' : 'var(--text-muted)',
              boxShadow: activeTab === 'signup' ? '0 1px 3px rgba(15, 23, 42, 0.08)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            Create Account
          </button>
        </div>

        {/* Alert Messages */}
        {errorMsg && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.55rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              background: '#FEF2F2',
              border: '1px solid #FECACA',
              color: '#DC2626',
              fontSize: '0.76rem',
              fontWeight: 600,
              marginBottom: '0.85rem',
            }}
          >
            <AlertCircle size={14} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.55rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              background: '#ECFDF5',
              border: '1px solid #A7F3D0',
              color: '#059669',
              fontSize: '0.76rem',
              fontWeight: 600,
              marginBottom: '0.85rem',
            }}
          >
            <CheckCircle2 size={14} style={{ flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* SIGN IN TAB */}
        {activeTab === 'login' && (
          <div>
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                  Mobile Number
                </label>
                <div style={{ position: 'relative' }}>
                  <Phone size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                  <input
                    type="tel"
                    value={loginPhone}
                    onChange={(e) => setLoginPhone(e.target.value)}
                    placeholder="+919862000001"
                    required
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem 0.55rem 2.15rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.82rem',
                      background: '#F8FAFC',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    style={{
                      width: '100%',
                      padding: '0.55rem 2.15rem 0.55rem 2.15rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.82rem',
                      background: '#F8FAFC',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#94A3B8',
                      padding: 0,
                    }}
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="tap-target btn-primary"
                style={{ width: '100%', padding: '0.6rem', fontSize: '0.84rem', marginTop: '0.2rem', gap: '0.4rem' }}
              >
                <span>{isLoading ? 'Verifying...' : 'Sign In'}</span>
                <ArrowRight size={14} />
              </button>
            </form>

            {/* Quick Demo Switcher */}
            <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.5rem', color: '#EA580C', fontSize: '0.7rem', fontWeight: 800 }}>
                <Sparkles size={12} />
                <span>1-TAP DEMO SWITCH</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem' }}>
                <button
                  type="button"
                  onClick={() => handleQuickDemo('admin')}
                  disabled={isLoading}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.4rem 0.55rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid #C7D2FE',
                    background: '#EEF2FF',
                    cursor: 'pointer',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    color: '#4F46E5',
                  }}
                >
                  <ShieldCheck size={13} />
                  <span>Admin</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemo('farmer')}
                  disabled={isLoading}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.4rem 0.55rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid #A7F3D0',
                    background: '#ECFDF5',
                    cursor: 'pointer',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    color: '#059669',
                  }}
                >
                  <Sprout size={13} />
                  <span>Farmer</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemo('buyer')}
                  disabled={isLoading}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.4rem 0.55rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid #BFDBFE',
                    background: '#EFF6FF',
                    cursor: 'pointer',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    color: '#2563EB',
                  }}
                >
                  <Building2 size={13} />
                  <span>Buyer</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemo('fpo')}
                  disabled={isLoading}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.4rem 0.55rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid #FED7AA',
                    background: '#FFF7ED',
                    cursor: 'pointer',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    color: '#EA580C',
                  }}
                >
                  <Truck size={13} />
                  <span>FPO</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SIGN UP TAB */}
        {activeTab === 'signup' && (
          <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>
                Full Name
              </label>
              <input
                type="text"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="e.g. Tombi Singh"
                required
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.82rem',
                  background: '#F8FAFC',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>
                Mobile Number
              </label>
              <input
                type="tel"
                value={regPhone}
                onChange={(e) => setRegPhone(e.target.value)}
                placeholder="+919862000001"
                required
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.82rem',
                  background: '#F8FAFC',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>
                Role
              </label>
              <select
                value={regRole}
                onChange={(e) => setRegRole(e.target.value as UserRole)}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.82rem',
                  background: '#F8FAFC',
                }}
              >
                <option value="farmer">Farmer</option>
                <option value="buyer">Buyer</option>
                <option value="fpo">FPO Logistics</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>
                Password
              </label>
              <input
                type="password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.82rem',
                  background: '#F8FAFC',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="tap-target btn-primary"
              style={{ width: '100%', padding: '0.6rem', fontSize: '0.84rem', marginTop: '0.3rem', gap: '0.4rem' }}
            >
              <span>{isLoading ? 'Creating...' : 'Register'}</span>
              <ArrowRight size={14} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
