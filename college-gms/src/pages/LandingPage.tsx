import { Link } from 'react-router-dom'
import {
  FileEdit,
  UserCheck,
  CheckCircle2,
  ArrowRight,
  Shield,
  Clock,
  Eye,
  MessageSquare,
  Lock,
  BarChart3,
  Zap,
  TrendingUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import './LandingPage.css'

export default function LandingPage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="lp-hero" id="hero">
        {/* Background decorations */}
        <div className="lp-hero-glow lp-hero-glow--1" />
        <div className="lp-hero-glow lp-hero-glow--2" />
        <div className="lp-hero-grid" />

        <div className="lp-hero-content">
          <Badge variant="outline" className="lp-hero-badge">
            <Zap className="lp-hero-badge-icon" />
            Trusted by 1,200+ students
          </Badge>

          <h1 className="lp-hero-title">
            Your Campus Voice,
            <br />
            <span className="lp-hero-title--accent">Amplified.</span>
          </h1>

          <p className="lp-hero-subtitle">
            A transparent grievance platform that turns student concerns into
            real action — with clear accountability at every step.
          </p>

          <div className="lp-hero-actions">
            <Button asChild size="lg" className="lp-btn-primary">
              <Link to="/register">
                Get Started
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="lp-btn-outline">
              <Link to="/login">Sign In</Link>
            </Button>
          </div>

          {/* Metrics strip */}
          <div className="lp-hero-metrics">
            <div className="lp-metric">
              <span className="lp-metric-value">1,247</span>
              <span className="lp-metric-label">Issues Filed</span>
            </div>
            <Separator orientation="vertical" className="lp-metric-sep" />
            <div className="lp-metric">
              <span className="lp-metric-value">94%</span>
              <span className="lp-metric-label">Resolved</span>
            </div>
            <Separator orientation="vertical" className="lp-metric-sep" />
            <div className="lp-metric">
              <span className="lp-metric-value">2.3d</span>
              <span className="lp-metric-label">Avg. Turnaround</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="lp-section" id="how-it-works">
        <div className="lp-section-inner">
          <div className="lp-section-header">
            <Badge variant="secondary" className="lp-section-badge">
              How It Works
            </Badge>
            <h2 className="lp-section-title">Three simple steps to resolution</h2>
            <p className="lp-section-desc">
              No bureaucracy, no runaround — just a clear path from concern to
              closure.
            </p>
          </div>

          <div className="lp-steps">
            {/* Step 1 */}
            <div className="lp-step">
              <div className="lp-step-number">01</div>
              <div className="lp-step-icon">
                <FileEdit />
              </div>
              <h3 className="lp-step-title">Submit</h3>
              <p className="lp-step-desc">
                Describe your issue with supporting details. Attachments and
                categorization make routing instant.
              </p>
            </div>

            {/* Connector */}
            <div className="lp-step-connector">
              <ArrowRight />
            </div>

            {/* Step 2 */}
            <div className="lp-step">
              <div className="lp-step-number">02</div>
              <div className="lp-step-icon">
                <UserCheck />
              </div>
              <h3 className="lp-step-title">Assign</h3>
              <p className="lp-step-desc">
                Your grievance is routed to the right department and staff member
                for prompt attention.
              </p>
            </div>

            {/* Connector */}
            <div className="lp-step-connector">
              <ArrowRight />
            </div>

            {/* Step 3 */}
            <div className="lp-step">
              <div className="lp-step-number">03</div>
              <div className="lp-step-icon">
                <CheckCircle2 />
              </div>
              <h3 className="lp-step-title">Resolve</h3>
              <p className="lp-step-desc">
                Track progress in real-time, receive updates, and confirm
                resolution — all in one place.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="lp-section lp-section--alt" id="features">
        <div className="lp-section-inner">
          <div className="lp-section-header">
            <Badge variant="secondary" className="lp-section-badge">
              Why Redress
            </Badge>
            <h2 className="lp-section-title">Built for trust &amp; transparency</h2>
            <p className="lp-section-desc">
              Every feature is designed to make accountability effortless.
            </p>
          </div>

          <div className="lp-features-grid">
            <div className="lp-feature-card">
              <div className="lp-feature-icon">
                <Eye />
              </div>
              <h4>Real-Time Tracking</h4>
              <p>Follow your issue from submission to resolution with live status updates.</p>
            </div>

            <div className="lp-feature-card">
              <div className="lp-feature-icon">
                <Lock />
              </div>
              <h4>Secure &amp; Private</h4>
              <p>Your identity and data are protected with role-based access and encryption.</p>
            </div>

            <div className="lp-feature-card">
              <div className="lp-feature-icon">
                <MessageSquare />
              </div>
              <h4>In-App Discussion</h4>
              <p>Comment threads keep all communication transparent and in one place.</p>
            </div>

            <div className="lp-feature-card">
              <div className="lp-feature-icon">
                <BarChart3 />
              </div>
              <h4>Analytics Dashboard</h4>
              <p>Admins get a bird's-eye view of trends, resolution rates, and workloads.</p>
            </div>

            <div className="lp-feature-card">
              <div className="lp-feature-icon">
                <Shield />
              </div>
              <h4>Role-Based Access</h4>
              <p>Students, staff, and admins each see exactly what they need — nothing more.</p>
            </div>

            <div className="lp-feature-card">
              <div className="lp-feature-icon">
                <Clock />
              </div>
              <h4>Fast Turnaround</h4>
              <p>Smart routing and priority labels ensure urgent issues are handled first.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Banner ── */}
      <section className="lp-stats-banner">
        <div className="lp-stats-banner-inner">
          <div className="lp-stat-block">
            <TrendingUp className="lp-stat-block-icon" />
            <div>
              <span className="lp-stat-block-value">94%</span>
              <span className="lp-stat-block-label">Resolution rate</span>
            </div>
          </div>
          <div className="lp-stat-block">
            <Clock className="lp-stat-block-icon" />
            <div>
              <span className="lp-stat-block-value">2.3 Days</span>
              <span className="lp-stat-block-label">Avg. resolution time</span>
            </div>
          </div>
          <div className="lp-stat-block">
            <MessageSquare className="lp-stat-block-icon" />
            <div>
              <span className="lp-stat-block-value">3,800+</span>
              <span className="lp-stat-block-label">Comments exchanged</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="lp-cta" id="cta">
        <div className="lp-cta-inner">
          <h2 className="lp-cta-title">Ready to be heard?</h2>
          <p className="lp-cta-desc">
            Join your peers and start making campus life better — one issue at a
            time.
          </p>
          <div className="lp-cta-actions">
            <Button asChild size="lg" className="lp-btn-primary lp-btn--lg">
              <Link to="/register">
                Create Your Account
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="lg" className="lp-btn-ghost">
              <Link to="/submit">
                <FileEdit data-icon="inline-start" />
                File a Grievance
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
