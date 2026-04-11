import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, Users,
  Shield, ArrowRight, CheckCircle,
  MapPin, Clock, TrendingUp, LogIn, UserPlus,
  Menu, X, ChevronRight, Sparkles, MonitorSmartphone,
  Building2, Mail, Phone, MapPin as MapPinIcon, Globe,
  Twitter, Github, Linkedin, Instagram, Facebook
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

import facilitiesImage from '../components/images/facilities.jpg';
import bookingImage from '../components/images/booking.jpg';
import maintenanceImage from '../components/images/maintenance.jpg';
import notificationsImage from '../components/images/notifications.jpg';
import analyticsImage from '../components/images/analytics.jpg';
import securityImage from '../components/images/security.jpg';
import logoImage from '../components/images/logo.png';
import heroBackgroundImage from '../components/images/background.jpg';

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      image: facilitiesImage,
      title: 'Facilities & Asset Catalogue',
      description: 'Explore lecture halls, labs, meeting rooms, auditoriums, and shared campus equipment with rich details and live availability.',
      color: '#3b82f6'
    },
    {
      image: bookingImage,
      title: 'Smart Booking Workflow',
      description: 'Reserve campus spaces through a streamlined booking flow with conflict prevention, approval routing, and schedule visibility.',
      color: '#10b981'
    },
    {
      image: maintenanceImage,
      title: 'Maintenance & Issue Tracking',
      description: 'Raise maintenance requests, monitor progress, and keep facilities operational through structured service workflows.',
      color: '#f59e0b'
    },
    {
      image: notificationsImage,
      title: 'Instant Notifications',
      description: 'Receive updates for booking approvals, maintenance progress, cancellations, and important campus service alerts.',
      color: '#8b5cf6'
    },
    {
      image: analyticsImage,
      title: 'Operational Insights',
      description: 'Visualize resource utilization, booking trends, peak hours, and service performance to support better decisions.',
      color: '#ef4444'
    },
    {
      image: securityImage,
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

  const handleEmailClick = () => {
    window.location.href = 'mailto:support@campuspulse.com';
  };

  const handlePhoneClick = () => {
    window.location.href = 'tel:+1234567890';
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
          {/* Logo with Image */}
          <div
            onClick={() => navigate('/')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              cursor: 'pointer'
            }}
          >
            <img
              src={logoImage}
              alt="CampusPulse Logo"
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                objectFit: 'cover'
              }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/42x42?text=CP';
              }}
            />
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

      {/* Hero Section with Background Image */}
      <section style={{
        position: 'relative',
        overflow: 'hidden',
        padding: '120px 24px 88px',
        backgroundImage: `url(${heroBackgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        isolation: 'isolate'
      }}>
        {/* Dark Overlay for better text readability */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(10,12,18,0.85) 0%, rgba(10,12,18,0.75) 100%)',
          zIndex: 0
        }} />
        
        <div style={{
          position: 'absolute',
          top: -120,
          left: -120,
          width: 260,
          height: 260,
          borderRadius: '50%',
          background: 'rgba(59,130,246,0.12)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
          zIndex: 0
        }} />
        <div style={{
          position: 'absolute',
          top: -60,
          right: -100,
          width: 240,
          height: 240,
          borderRadius: '50%',
          background: 'rgba(139,92,246,0.12)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
          zIndex: 0
        }} />

        <div style={{
          maxWidth: 980,
          margin: '0 auto',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '7px 16px',
            background: 'rgba(59,130,246,0.1)',
            border: '1px solid rgba(59,130,246,0.18)',
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--accent)',
            marginBottom: 24,
            backdropFilter: 'blur(8px)'
          }}>
            <Sparkles size={14} />
            Digital platform for modern campus operations
          </div>

          <h1 style={{
            fontSize: 'clamp(42px, 6vw, 72px)',
            fontWeight: 800,
            lineHeight: 1.02,
            marginBottom: 22,
            letterSpacing: '-0.04em',
            maxWidth: 900,
            marginInline: 'auto'
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
            fontSize: 'clamp(17px, 2vw, 20px)',
            color: 'var(--text-secondary)',
            marginBottom: 34,
            maxWidth: 760,
            marginInline: 'auto',
            lineHeight: 1.8
          }}>
            CampusPulse brings together facility discovery, booking workflows,
            maintenance reporting, notifications, and operational analytics in a single
            platform built for universities and institutions.
          </p>

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 16,
            flexWrap: 'wrap',
            marginBottom: 32
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
            justifyContent: 'center',
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
                  fontSize: 14,
                  padding: '10px 14px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 999
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
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 3,
                background: 'linear-gradient(90deg, var(--accent), rgba(139,92,246,0.9))'
              }} />
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

      {/* Features Section with Images */}
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
                  overflow: 'hidden',
                  transition: 'all 0.3s',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
                  position: 'relative'
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
                  height: 210,
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  <img
                    src={feature.image}
                    alt={feature.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.4s ease'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  />
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.72), rgba(0,0,0,0.12) 45%, rgba(0,0,0,0.08))'
                  }} />
                  <div style={{
                    position: 'absolute',
                    bottom: 16,
                    left: 18,
                    right: 18,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div style={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      background: feature.color,
                      boxShadow: `0 0 18px ${feature.color}`
                    }} />
                    <div style={{
                      padding: '5px 10px',
                      borderRadius: 999,
                      background: 'rgba(255,255,255,0.12)',
                      color: '#fff',
                      fontSize: 12,
                      fontWeight: 600,
                      border: '1px solid rgba(255,255,255,0.16)'
                    }}>
                      Active Feature
                    </div>
                  </div>
                </div>

                <div style={{ padding: 24 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>{feature.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7, marginBottom: 0 }}>
                    {feature.description}
                  </p>
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
                  padding: 26,
                  transition: 'all 0.25s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 14px 28px rgba(0,0,0,0.12)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
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
          padding: '42px 28px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            width: 180,
            height: 180,
            borderRadius: '50%',
            background: 'rgba(59,130,246,0.12)',
            filter: 'blur(50px)',
            top: -70,
            right: -50,
            pointerEvents: 'none'
          }} />
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, marginBottom: 14, position: 'relative', zIndex: 1 }}>
            Ready to transform campus operations?
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 30, maxWidth: 620, marginInline: 'auto', lineHeight: 1.7, position: 'relative', zIndex: 1 }}>
            Join hundreds of students and staff using CampusPulse to manage campus resources efficiently.
          </p>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 14,
            flexWrap: 'wrap',
            position: 'relative',
            zIndex: 1
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

      {/* Footer with Contact Info & Social Media */}
      <footer
        id="contact"
        style={{
          padding: '48px 24px 32px',
          borderTop: '1px solid var(--border)',
          background: 'var(--bg-card)'
        }}
      >
        <div style={{
          maxWidth: 1200,
          margin: '0 auto'
        }}>
          {/* Footer Main Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 40,
            marginBottom: 40
          }}>
            {/* Brand Column */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <img
                  src={logoImage}
                  alt="CampusPulse Logo"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    objectFit: 'cover'
                  }}
                />
                <span style={{ fontSize: 18, fontWeight: 700 }}>CampusPulse</span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.6, marginBottom: 16 }}>
                Smart Campus Operations Platform — simplifying facility management, bookings, and maintenance for modern educational institutions.
              </p>
              {/* Social Media Icons */}
              <div style={{ display: 'flex', gap: 12 }}>
                <a
                  href="https://twitter.com/campuspulse"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                    color: 'var(--text-secondary)'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = '#1DA1F2';
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }}
                >
                  <Twitter size={18} />
                </a>
                <a
                  href="https://github.com/campuspulse"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                    color: 'var(--text-secondary)'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = '#333';
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }}
                >
                  <Github size={18} />
                </a>
                <a
                  href="https://linkedin.com/company/campuspulse"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                    color: 'var(--text-secondary)'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = '#0077b5';
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }}
                >
                  <Linkedin size={18} />
                </a>
                <a
                  href="https://instagram.com/campuspulse"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                    color: 'var(--text-secondary)'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = '#E4405F';
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }}
                >
                  <Instagram size={18} />
                </a>
                <a
                  href="https://facebook.com/campuspulse"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                    color: 'var(--text-secondary)'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = '#1877f2';
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }}
                >
                  <Facebook size={18} />
                </a>
              </div>
            </div>

            {/* Quick Links Column */}
            <div>
              <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: 'var(--text-primary)' }}>Quick Links</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ marginBottom: 10 }}>
                  <a href="#features" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: 13, transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>Features</a>
                </li>
                <li style={{ marginBottom: 10 }}>
                  <a href="#why-us" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: 13, transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>Why Us</a>
                </li>
                <li style={{ marginBottom: 10 }}>
                  <a href="/resources" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: 13, transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>Resources</a>
                </li>
                <li style={{ marginBottom: 10 }}>
                  <a href="/bookings" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: 13, transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>Bookings</a>
                </li>
                <li style={{ marginBottom: 10 }}>
                  <a href="/tickets" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: 13, transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>Support</a>
                </li>
              </ul>
            </div>

            {/* Contact Info Column */}
            <div>
              <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: 'var(--text-primary)' }}>Contact Us</h4>
              <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                <Mail size={16} style={{ color: 'var(--accent)' }} />
                <a
                  href="mailto:support@campuspulse.com"
                  onClick={handleEmailClick}
                  style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: 13, transition: 'color 0.2s', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  support@campuspulse.com
                </a>
              </div>
              <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                <Phone size={16} style={{ color: 'var(--accent)' }} />
                <a
                  href="tel:+1234567890"
                  onClick={handlePhoneClick}
                  style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: 13, transition: 'color 0.2s', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  +1 (234) 567-890
                </a>
              </div>
              <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                <MapPinIcon size={16} style={{ color: 'var(--accent)' }} />
                <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                  123 University Avenue,<br />
                  Innovation Campus,<br />
                  Colombo, Sri Lanka
                </span>
              </div>
              <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                <Globe size={16} style={{ color: 'var(--accent)' }} />
                <a
                  href="https://campuspulse.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: 13, transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  www.campuspulse.com
                </a>
              </div>
            </div>

            {/* Newsletter Column */}
            <div>
              <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: 'var(--text-primary)' }}>Stay Updated</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 16 }}>
                Subscribe to our newsletter for updates and insights.
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="email"
                  placeholder="Your email address"
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-primary)',
                    fontSize: 13,
                    outline: 'none'
                  }}
                  onFocus={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
                />
                <button
                  style={{
                    padding: '10px 16px',
                    background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 500
                  }}
                >
                  Subscribe
                </button>
              </div>
            </div>
          </div>

          {/* Footer Bottom Bar */}
          <div style={{
            paddingTop: 24,
            borderTop: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16
          }}>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 12 }}>
              &copy; 2026 CampusPulse. All rights reserved.
            </p>
            <div style={{ display: 'flex', gap: 20 }}>
              <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: 12, transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>Privacy Policy</a>
              <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: 12, transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>Terms of Service</a>
              <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: 12, transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>Cookie Policy</a>
            </div>
          </div>
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