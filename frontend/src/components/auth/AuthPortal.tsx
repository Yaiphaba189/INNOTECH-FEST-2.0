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
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Sparkles,
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
      setSuccessMsg(`Welcome, ${user.full_name}! Entering ${user.role.toUpperCase()} terminal...`);
      router.push(user.role === 'buyer' || user.role === 'fpo' ? `/${user.role}` : '/farmer');
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
      setSuccessMsg(`Account created for ${user.full_name}! Entering terminal...`);
      router.push(user.role === 'buyer' || user.role === 'fpo' ? `/${user.role}` : '/farmer');
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Phone number may already exist.');
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
      router.push(user.role === 'buyer' || user.role === 'fpo' ? `/${user.role}` : '/farmer');
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
        background: 'var(--bg-app)',
      }}
    >
      {/* Brand Navigation Header */}
      <header
        style={{
          padding: '0.85rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-subtle)',
          background: '#ffffff',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '6px',
              background: '#FB923C',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
            }}
          >
            <Sprout size={20} strokeWidth={2.4} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontWeight: 900, fontSize: '1.25rem', color: '#0F172A', letterSpacing: '-0.025em' }}>
                HARVESTLINK
              </span>
              <span style={{ fontWeight: 900, fontSize: '1.25rem', color: '#FB923C' }}>
                AI
              </span>
              <span className="badge badge-orange" style={{ fontSize: '0.62rem' }}>
                INNOTECH 2.0
              </span>
            </div>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0, fontWeight: 500 }}>
              Predictive Crop Decision Terminal • Manipur Horticulture
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#F97316', fontSize: '0.74rem', fontWeight: 700 }}>
          <span className="pulse-dot pulse-dot-green" />
          <span>RBAC Security Active</span>
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
            maxWidth: '1000px',
            width: '100%',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2.5rem',
            alignItems: 'center',
          }}
        >
          {/* Left Hero Column: Architecture & Value Proposition */}
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.25rem 0.65rem',
                borderRadius: 'var(--radius-full)',
                background: '#FFF7ED',
                border: '1px solid #FED7AA',
                color: '#FB923C',
                fontSize: '0.72rem',
                fontWeight: 800,
                marginBottom: '0.85rem',
              }}
            >
              <ShieldCheck size={13} />
              <span>STRICT ROLE-BASED ACCESS CONTROL</span>
            </div>

            <h1
              style={{
                fontSize: '2.2rem',
                fontWeight: 900,
                color: '#0F172A',
                letterSpacing: '-0.03em',
                lineHeight: 1.2,
                marginBottom: '0.85rem',
              }}
            >
              Unified Agricultural Intelligence for Manipur
            </h1>

            <p style={{ fontSize: '0.92rem', color: '#475569', lineHeight: 1.6, marginBottom: '1.75rem' }}>
              Tailored predictive agronomy, transparent price linkage, and collective FPO logistics for Manipur’s Queen & Kew pineapple clusters.
            </p>

            {/* Clean Value Highlights */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 0.95rem',
                  background: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid var(--border-subtle)',
                  boxShadow: 'var(--shadow-subtle)',
                }}
              >
                <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'var(--accent-green-light)', color: '#F97316', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Sprout size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--text-primary)' }}>Farmer Terminal</div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>AI disease triage, thermal GDD picking radar & net-take home pay.</div>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 0.95rem',
                  background: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid var(--border-subtle)',
                  boxShadow: 'var(--shadow-subtle)',
                }}
              >
                <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Building2 size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--text-primary)' }}>Buyer Marketplace</div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Brix-verified wholesale lots with escrow-secured procurement.</div>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 0.95rem',
                  background: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid var(--border-subtle)',
                  boxShadow: 'var(--shadow-subtle)',
                }}
              >
                <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#FFF7ED', color: '#FB923C', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Truck size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--text-primary)' }}>FPO Collective Logistics</div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Multi-farm truck capacity pooling (≥75%) & QR digital gate-passes.</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Clean Authentication Card */}
          <div
            className="glass-card"
            style={{
              padding: '1.75rem',
              borderRadius: '20px',
              border: '1px solid var(--border-subtle)',
              boxShadow: '0 12px 35px -8px rgba(15, 23, 42, 0.1)',
            }}
          >
            {/* Segmented Auth Toggle */}
            <div
              style={{
                display: 'flex',
                background: '#F1F5F9',
                padding: '0.25rem',
                borderRadius: 'var(--radius-full)',
                marginBottom: '1.25rem',
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
                  padding: '0.5rem',
                  borderRadius: 'var(--radius-full)',
                  border: 'none',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: activeTab === 'login' ? '#FFFFFF' : 'transparent',
                  color: activeTab === 'login' ? '#FB923C' : 'var(--text-muted)',
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
                  setSuccessMsg(null);
                }}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  borderRadius: 'var(--radius-full)',
                  border: 'none',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: activeTab === 'signup' ? '#FFFFFF' : 'transparent',
                  color: activeTab === 'signup' ? '#FB923C' : 'var(--text-muted)',
                  boxShadow: activeTab === 'signup' ? '0 1px 3px rgba(15, 23, 42, 0.08)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                Create Account
              </button>
            </div>

            {/* Error / Success Notifications */}
            {errorMsg && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  background: '#FEF2F2',
                  border: '1px solid #FECACA',
                  color: '#DC2626',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  marginBottom: '1rem',
                }}
              >
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--accent-green-light)',
                  border: '1px solid var(--accent-green-border)',
                  color: '#F97316',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  marginBottom: '1rem',
                }}
              >
                <CheckCircle2 size={15} style={{ flexShrink: 0 }} />
                <span>{successMsg}</span>
              </div>
            )}

            {/* TAB 1: SIGN IN */}
            {activeTab === 'login' && (
              <div>
                <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                      Mobile Number
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Phone size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                      <input
                        type="tel"
                        value={loginPhone}
                        onChange={(e) => setLoginPhone(e.target.value)}
                        placeholder="+919862000001"
                        required
                        style={{
                          width: '100%',
                          padding: '0.6rem 0.85rem 0.6rem 2.25rem',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-subtle)',
                          fontSize: '0.84rem',
                          color: 'var(--text-primary)',
                          background: '#F8FAFC',
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                      Password
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        style={{
                          width: '100%',
                          padding: '0.6rem 2.25rem 0.6rem 2.25rem',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-subtle)',
                          fontSize: '0.84rem',
                          color: 'var(--text-primary)',
                          background: '#F8FAFC',
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
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="tap-target btn-primary"
                    style={{
                      width: '100%',
                      padding: '0.65rem',
                      fontSize: '0.88rem',
                      borderRadius: 'var(--radius-md)',
                      marginTop: '0.25rem',
                      gap: '0.45rem',
                    }}
                  >
                    <span>{isLoading ? 'Verifying...' : 'Sign In to Terminal'}</span>
                    <ArrowRight size={15} />
                  </button>
                </form>

                {/* Streamlined 1-Tap Demo Switcher */}
                <div style={{ marginTop: '1.25rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.65rem', color: '#FB923C', fontSize: '0.72rem', fontWeight: 800 }}>
                    <Sparkles size={13} />
                    <span>QUICK DEMO ACCESS (1-TAP)</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.45rem' }}>
                    <button
                      type="button"
                      onClick={() => handleQuickDemo('admin')}
                      disabled={isLoading}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        padding: '0.45rem 0.65rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid #E5D2C2',
                        background: '#FFF5ED',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#21170F',
                        textAlign: 'left',
                      }}
                    >
                      <ShieldCheck size={14} />
                      <span>Super Admin</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickDemo('farmer')}
                      disabled={isLoading}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        padding: '0.45rem 0.65rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--accent-green-border)',
                        background: 'var(--accent-green-light)',
                        cursor: 'pointer',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        color: '#F97316',
                        textAlign: 'left',
                      }}
                    >
                      <Sprout size={14} />
                      <span>Farmer</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickDemo('buyer')}
                      disabled={isLoading}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        padding: '0.45rem 0.65rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid #BFDBFE',
                        background: '#EFF6FF',
                        cursor: 'pointer',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        color: '#2563EB',
                        textAlign: 'left',
                      }}
                    >
                      <Building2 size={14} />
                      <span>Buyer</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickDemo('fpo')}
                      disabled={isLoading}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        padding: '0.45rem 0.65rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid #FED7AA',
                        background: '#FFF7ED',
                        cursor: 'pointer',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        color: '#FB923C',
                        textAlign: 'left',
                      }}
                    >
                      <Truck size={14} />
                      <span>FPO Lead</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: SIGN UP */}
            {activeTab === 'signup' && (
              <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
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
                      padding: '0.55rem 0.75rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.84rem',
                      background: '#F8FAFC',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
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
                      padding: '0.55rem 0.75rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.84rem',
                      background: '#F8FAFC',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                    Role Assignment
                  </label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as UserRole)}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.84rem',
                      background: '#F8FAFC',
                    }}
                  >
                    <option value="farmer">Smallholder Farmer</option>
                    <option value="buyer">Institutional / Wholesale Buyer</option>
                    <option value="fpo">FPO Logistics Coordinator</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                    Create Password
                  </label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    required
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.84rem',
                      background: '#F8FAFC',
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="tap-target btn-primary"
                  style={{
                    width: '100%',
                    padding: '0.65rem',
                    fontSize: '0.88rem',
                    borderRadius: 'var(--radius-md)',
                    marginTop: '0.35rem',
                    gap: '0.45rem',
                  }}
                >
                  <span>{isLoading ? 'Creating Account...' : 'Register Account'}</span>
                  <ArrowRight size={15} />
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
