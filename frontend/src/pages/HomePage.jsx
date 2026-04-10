import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, Calendar, Ticket, Bell, Users,
  BarChart3, Shield, ArrowRight, CheckCircle,
  MapPin, Clock, Star, TrendingUp, LogIn, UserPlus,
  Menu, X, ChevronRight, Sparkles, MonitorSmartphone, Activity
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: <Building2 size={24} />,
      title: 'Facilities & Asset Catalogue',
      description: 'Explore lecture halls, labs, meeting rooms, auditoriums, and shared campus equipment with rich details and live availability.',
      color: '#3b82f6'
    },
    {
      icon: <Calendar size={24} />,
      title: 'Smart Booking Workflow',
      description: 'Reserve campus spaces through a streamlined booking flow with conflict prevention, approval routing, and schedule visibility.',
      color: '#10b981'
    },
    {
      icon: <Ticket size={24} />,
      title: 'Maintenance & Issue Tracking',
      description: 'Raise maintenance requests, monitor progress, and keep facilities operational through structured service workflows.',
      color: '#f59e0b'
    },
    {
      icon: <Bell size={24} />,
      title: 'Instant Notifications',
      description: 'Receive updates for booking approvals, maintenance progress, cancellations, and important campus service alerts.',
      color: '#8b5cf6'
    },
    {
      icon: <BarChart3 size={24} />,
      title: 'Operational Insights',
      description: 'Visualize resource utilization, booking trends, peak hours, and service performance to support better decisions.',
      color: '#ef4444'
    },
    {
      icon: <Shield size={24} />,
      title: 'Role-Based Secure Access',
      description: 'Support students, staff, managers, technicians, and administrators with secure authentication and permission-based access.',
      color: '#06b6d4'
    }
  ];

  const stats = [
    { label: 'Campus Assets Managed', value: '150+', icon: <Building2 size={18} /> },
    { label: 'Weekly Reservations', value: '1,200+', icon: <Calendar size={18} /> },
    { label: 'Active Campus Users', value: '3,500+', icon: <Users size={18} /> },
    { label: 'Service Requests Closed', value: '94%', icon: <CheckCircle size={18} /> }
  ];

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'Why Us', href: '#why-us' },
    { label: 'Contact', href: '#contact' }
  ];

  const quickHighlights = [
    { icon: <Clock size={16} />, text: 'Real-time availability' },
    { icon: <Shield size={16} />, text: 'Secure access control' },
    { icon: <TrendingUp size={16} />, text: 'Usage analytics' }
  ];

  const whyUs = [
    {
      icon: <MonitorSmartphone size={22} />,
      title: 'Designed for everyday campus operations',
      description: 'Built to support the practical needs of students, lecturers, administrators, and maintenance teams in one connected system.'
    },
    {
      icon: <Sparkles size={22} />,
      title: 'Modern and intuitive user experience',
      description: 'A clean interface reduces friction, helping users complete bookings, requests, and approvals faster with less confusion.'
    },
    {
      icon: <MapPin size={22} />,
      title: 'Centralized visibility across resources',
      description: 'Get a unified view of facilities, assets, schedules, and service statuses instead of managing them through scattered channels.'
    }
  ];

  const handleLogin = () => {
    navigate('/login');
  };

  const handleSignup = () => {
    navigate('/signup');
  };

  const handleGetStarted = () => {
    if (user) {
      switch (user.role) {
        case 'ADMIN':
          navigate('/dashboard/admin');
          break;
        case 'MANAGER':
          navigate('/dashboard/manager');
          break;
        case 'TECHNICIAN':
          navigate('/dashboard/technician');
          break;
        default:
          navigate('/dashboard/user');
      }
    } else {
      navigate('/login');
    }
  };

  const handleDashboard = () => {
    if (user) {
      switch (user.role) {
        case 'ADMIN':
          navigate('/dashboard/admin');
          break;
        case 'MANAGER':
          navigate('/dashboard/manager');
          break;
        case 'TECHNICIAN':
          navigate('/dashboard/technician');
          break;
        default:
          navigate('/dashboard/user');
      }
    } else {
      navigate('/login');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Header/Navbar */}
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(10, 12, 18, 0.82)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)'
      }}>
        <div style={{
          maxWidth: 1240,
          margin: '0 auto',
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {/* Logo */}
          <div
            onClick={() => navigate('/')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              cursor: 'pointer'
            }}
          >
            <div style={{
              width: 42,
              height: 42,
              borderRadius: 14,
              background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 30px rgba(59,130,246,0.25)'
            }}>
              <Activity size={22} style={{ color: 'white' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
              <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: -0.3 }}>CampusPulse</span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Smart Campus Operations</span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div style={{ display: 'flex', gap: 32, alignItems: 'center' }} className="desktop-nav">
            {navLinks.map((link, idx) => (
              <a
                key={idx}
                href={link.href}
                style={{
                  color: 'var(--text-secondary)',
                  textDecoration: 'none',
                  fontSize: 14,
                  fontWeight: 500,
                  transition: 'color 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Auth Buttons */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }} className="desktop-buttons">
            {user ? (
              <button
                onClick={handleDashboard}
                style={{
                  padding: '10px 20px',
                  background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: '0 10px 24px rgba(59,130,246,0.24)'
                }}
              >
                Dashboard <ChevronRight size={16} />
              </button>
            ) : (
              <>
                <button
                  onClick={handleLogin}
                  style={{
                    padding: '10px 18px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontSize: 14,
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--accent)';
                    e.currentTarget.style.color = 'var(--accent)';
                    e.currentTarget.style.background = 'rgba(59,130,246,0.06)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                  }}
                >
                  <LogIn size={16} /> Login
                </button>
                <button
                  onClick={handleSignup}
                  style={{
                    padding: '10px 20px',
                    background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: 14,
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    boxShadow: '0 10px 24px rgba(59,130,246,0.24)'
                  }}
                >
                  <UserPlus size={16} /> Sign Up
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer'
            }}
            className="mobile-menu-btn"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div style={{
            padding: '18px 24px',
            background: 'var(--bg-card)',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            gap: 16
          }}>
            {navLinks.map((link, idx) => (
              <a
                key={idx}
                href={link.href}
                style={{
                  color: 'var(--text-secondary)',
                  textDecoration: 'none',
                  fontSize: 16,
                  padding: '8px 0'
                }}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
              {user ? (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleDashboard();
                  }}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    color: 'white',
                    cursor: 'pointer'
                  }}
                >
                  Dashboard
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogin();
                    }}
                    style={{
                      flex: 1,
                      padding: '10px',
                      background: 'transparent',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer'
                    }}
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleSignup();
                    }}
                    style={{
                      flex: 1,
                      padding: '10px',
                      background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
                      border: 'none',
                      borderRadius: 'var(--radius-sm)',
                      color: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section style={{
        position: 'relative',
        overflow: 'hidden',
        padding: '96px 24px 72px',
        background: `
          radial-gradient(circle at top left, rgba(59,130,246,0.16), transparent 28%),
          radial-gradient(circle at top right, rgba(139,92,246,0.12), transparent 24%),
          linear-gradient(180deg, var(--bg) 0%, rgba(59,130,246,0.03) 100%)
        `
      }}>
        <div style={{
          maxWidth: 1240,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 48,
          alignItems: 'center'
        }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 14px',
              background: 'rgba(59,130,246,0.1)',
              border: '1px solid rgba(59,130,246,0.18)',
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--accent)',
              marginBottom: 22
            }}>
              <Sparkles size={14} />
              Digital platform for modern campus operations
            </div>

            <h1 style={{
              fontSize: 'clamp(40px, 6vw, 64px)',
              fontWeight: 800,
              lineHeight: 1.05,
              marginBottom: 20,
              letterSpacing: '-0.03em'
            }}>
              Manage campus facilities,
              <span style={{
                display: 'block',
                background: 'linear-gradient(135deg, #ffffff, var(--accent), #8b5cf6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                bookings, and maintenance
              </span>
              with <span style={{ color: 'var(--accent)' }}>CampusPulse</span>
            </h1>

            <p style={{
              fontSize: 'clamp(16px, 2vw, 18px)',
              color: 'var(--text-secondary)',
              marginBottom: 28,
              maxWidth: 640,
              lineHeight: 1.7
            }}>
              CampusPulse brings together facility discovery, booking workflows,
              maintenance reporting, notifications, and operational analytics in a single
              platform built for universities and institutions.
            </p>

            <div style={{
              display: 'flex',
              gap: 16,
              flexWrap: 'wrap',
              marginBottom: 28
            }}>
              <button
                onClick={handleGetStarted}
                style={{
                  padding: '14px 30px',
                  background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: 16,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: '0 12px 30px rgba(59,130,246,0.24)'
                }}
              >
                Get Started <ArrowRight size={18} />
              </button>

              <button
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                style={{
                  padding: '14px 28px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: 16,
                  fontWeight: 500
                }}
              >
                Explore Features
              </button>
            </div>

            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 18
            }}>
              {quickHighlights.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    color: 'var(--text-secondary)',
                    fontSize: 14
                  }}
                >
                  <span style={{
                    width: 28,
                    height: 28,
                    borderRadius: 999,
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent)'
                  }}>
                    {item.icon}
                  </span>
                  {item.text}
                </div>
              ))}
            </div>
          </div>

          {/* Preview Card */}
          <div>
            <div style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 24,
              padding: 24,
              boxShadow: '0 20px 50px rgba(0,0,0,0.22)'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1.25fr 0.9fr',
                gap: 16,
                marginBottom: 16
              }}>
                <div style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 20,
                  padding: 20
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 18
                  }}>
                    <div>
                      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>
                        Today’s overview
                      </div>
                      <div style={{ fontSize: 18, fontWeight: 700 }}>
                        Campus activity snapshot
                      </div>
                    </div>
                    <div style={{
                      width: 42,
                      height: 42,
                      borderRadius: 14,
                      background: 'rgba(59,130,246,0.12)',
                      color: 'var(--accent)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <BarChart3 size={20} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gap: 12 }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 14px',
                      borderRadius: 14,
                      background: 'rgba(255,255,255,0.03)'
                    }}>
                      <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Lecture Hall A2</span>
                      <span style={{ color: '#10b981', fontSize: 13, fontWeight: 600 }}>Available</span>
                    </div>

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 14px',
                      borderRadius: 14,
                      background: 'rgba(255,255,255,0.03)'
                    }}>
                      <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Computer Lab 04</span>
                      <span style={{ color: '#f59e0b', fontSize: 13, fontWeight: 600 }}>Booked 2–4 PM</span>
                    </div>

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 14px',
                      borderRadius: 14,
                      background: 'rgba(255,255,255,0.03)'
                    }}>
                      <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Projector Unit P-12</span>
                      <span style={{ color: '#8b5cf6', fontSize: 13, fontWeight: 600 }}>In use</span>
                    </div>
                  </div>
                </div>

                <div style={{
                  display: 'grid',
                  gap: 16
                }}>
                  <div style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 20,
                    padding: 18
                  }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 6 }}>
                      Pending service tickets
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 10 }}>12</div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: 13,
                      color: '#f59e0b'
                    }}>
                      <Ticket size={14} /> 4 high priority
                    </div>
                  </div>

                  <div style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 20,
                    padding: 18
                  }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 6 }}>
                      Booking success rate
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 10 }}>98%</div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: 13,
                      color: '#10b981'
                    }}>
                      <CheckCircle size={14} /> Stable system flow
                    </div>
                  </div>
                </div>
              </div>

              <div style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 20,
                padding: 18,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16,
                flexWrap: 'wrap'
              }}>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 4 }}>
                    Trusted by campus teams
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>
                    One platform for facilities, services, and scheduling
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: '#fbbf24' }}>
                  <Star size={16} fill="#fbbf24" />
                  <Star size={16} fill="#fbbf24" />
                  <Star size={16} fill="#fbbf24" />
                  <Star size={16} fill="#fbbf24" />
                  <Star size={16} fill="#fbbf24" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{
        padding: '28px 24px 64px',
        borderBottom: '1px solid var(--border)'
      }}>
        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 20
        }}>
          {stats.map((stat, idx) => (
            <div
              key={idx}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 20,
                padding: 24,
                textAlign: 'center'
              }}
            >
              <div style={{
                width: 42,
                height: 42,
                margin: '0 auto 14px',
                borderRadius: 12,
                background: 'rgba(59,130,246,0.1)',
                color: 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {stat.icon}
              </div>
              <div style={{ fontSize: 34, fontWeight: 800, color: 'var(--accent)', marginBottom: 6 }}>
                {stat.value}
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={{ padding: '88px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <div style={{
              display: 'inline-block',
              padding: '6px 14px',
              background: 'rgba(139,92,246,0.1)',
              borderRadius: 999,
              fontSize: 12,
              color: '#a78bfa',
              fontWeight: 600,
              marginBottom: 16
            }}>
              Core platform capabilities
            </div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, marginBottom: 14 }}>
              Everything you need to run campus operations
            </h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: 720, margin: '0 auto', lineHeight: 1.7 }}>
              From discovering assets and handling reservations to tracking maintenance and viewing trends,
              CampusPulse supports the daily flow of operational work across your institution.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
            {features.map((feature, idx) => (
              <div
                key={idx}
                style={{
                  background: 'var(--bg-card)',
                  borderRadius: 22,
                  border: '1px solid var(--border)',
                  padding: 26,
                  transition: 'all 0.3s',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.08)'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-6px)';
                  e.currentTarget.style.borderColor = feature.color;
                  e.currentTarget.style.boxShadow = '0 18px 34px rgba(0,0,0,0.14)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.08)';
                }}
              >
                <div style={{
                  width: 52,
                  height: 52,
                  borderRadius: 16,
                  background: `${feature.color}18`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 20,
                  color: feature.color
                }}>
                  {feature.icon}
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>{feature.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.65, marginBottom: 16 }}>
                  {feature.description}
                </p>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  color: feature.color,
                  fontWeight: 600,
                  fontSize: 14
                }}>
                  Learn more <ChevronRight size={16} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Us Section */}
      <section
        id="why-us"
        style={{
          padding: '88px 24px',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.01), rgba(59,130,246,0.03))',
          borderTop: '1px solid rgba(255,255,255,0.04)',
          borderBottom: '1px solid rgba(255,255,255,0.04)'
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 38px)', fontWeight: 800, marginBottom: 14 }}>
              Why choose CampusPulse?
            </h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: 700, margin: '0 auto', lineHeight: 1.7 }}>
              Campus operations involve people, places, schedules, approvals, and maintenance requests.
              A centralized system improves coordination, transparency, and service quality.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 24
          }}>
            {whyUs.map((item, idx) => (
              <div
                key={idx}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 22,
                  padding: 26
                }}
              >
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: 'rgba(59,130,246,0.12)',
                  color: 'var(--accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 18
                }}>
                  {item.icon}
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>{item.title}</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.65, fontSize: 14 }}>
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '88px 24px',
        textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(99,102,241,0.08) 100%)'
      }}>
        <div style={{
          maxWidth: 760,
          margin: '0 auto',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 28,
          padding: '42px 28px'
        }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, marginBottom: 14 }}>
            Ready to transform campus operations?
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 30, maxWidth: 620, marginInline: 'auto', lineHeight: 1.7 }}>
            Join hundreds of students and staff using CampusPulse to manage campus resources efficiently.
          </p>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 14,
            flexWrap: 'wrap'
          }}>
            <button
              onClick={handleGetStarted}
              style={{
                padding: '14px 30px',
                background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                color: 'white',
                cursor: 'pointer',
                fontSize: 16,
                fontWeight: 600,
                boxShadow: '0 12px 30px rgba(59,130,246,0.24)'
              }}
            >
              Start Now
            </button>

            {!user && (
              <button
                onClick={handleSignup}
                style={{
                  padding: '14px 30px',
                  background: 'transparent',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: 16,
                  fontWeight: 500
                }}
              >
                Create Account
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        id="contact"
        style={{
          padding: '42px 24px',
          borderTop: '1px solid var(--border)',
          color: 'var(--text-muted)',
          fontSize: 13
        }}
      >
        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
          flexWrap: 'wrap'
        }}>
          <div>
            <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-secondary)' }}>CampusPulse</p>
            <p style={{ margin: '6px 0 0' }}>Smart Campus Operations Platform</p>
          </div>
          <p style={{ margin: 0 }}>&copy; 2026 CampusPulse. All rights reserved.</p>
        </div>
      </footer>

      {/* Mobile Responsive Styles */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .desktop-buttons {
            display: none !important;
          }
          .mobile-menu-btn {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
};

export default HomePage;