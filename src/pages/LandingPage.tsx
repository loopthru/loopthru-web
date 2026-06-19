import { useState, useEffect, useRef, type ReactNode, type RefObject } from "react";
import { ChevronDown, Eye, Search, Users } from "lucide-react";

const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "Problem", href: "#problem" },
  { label: "Solution", href: "#solution" },
  { label: "Architecture", href: "#architecture" },
];

const EVAL_DOMAINS = ["Security", "Compliance", "Reliability", "Cost"];

const PROBLEMS = [
  {
    icon: "ðŸ”",
    title: "Static scanners lack context",
    lead: "Static analysis can flag a policy violation or misconfiguration. It cannot tell you what to do about it.",
    points: ["How severe is the risk?", "What business impact exists?", "Which compliance frameworks are affected?", "Should this change be approved?"],
    takeaway: "Developers receive findings, not decisions.",
  },
  {
    icon: "ðŸ‘",
    title: "CSPM is reactive",
    lead: "Cloud security posture tools give you visibility into what is already running â€” after it is already running.",
    points: ["Resources may already be exposed", "Compliance violations may already exist", "Security teams have to investigate", "Engineering teams have to remediate"],
    takeaway: "The cost of fixing it only goes up once infrastructure reaches production.",
  },
  {
    icon: "ðŸ‘¥",
    title: "Governance doesn't scale",
    lead: "Security, compliance, operations, and cost reviews still run through people alongside a Change Advisory Board.",
    points: ["Manual from end to end", "Slow and gets slower with every new environment", "Hard to standardize across reviewers", "Depends on who is available, not just on policy"],
    takeaway: "As cloud environments grow, governance becomes the bottleneck.",
  },
];

const AGENTS = [
  {
    label: "Security Agent",
    color: "#4F46E5",
    bg: "#EEF2FF",
    border: "#C7D2FE",
    evaluates: ["Public exposure risks", "Encryption settings", "IAM permissions", "Security best practices"],
    outputs: ["Findings", "Severity levels", "Recommendations", "Security decision"],
  },
  {
    label: "Compliance Agent",
    color: "#7C3AED",
    bg: "#F5F3FF",
    border: "#DDD6FE",
    evaluates: ["CIS Benchmarks", "SOC 2 controls", "PCI DSS requirements", "Internal governance policies"],
    outputs: ["Compliance findings", "Framework mappings", "Compliance decision"],
  },
  {
    label: "Reliability Agent",
    color: "#0891B2",
    bg: "#ECFEFF",
    border: "#A5F3FC",
    evaluates: ["Availability concerns", "Backup configurations", "Disaster recovery readiness", "Operational resilience"],
    outputs: ["Reliability findings", "Reliability decision"],
  },
  {
    label: "Cost Agent",
    color: "#D97706",
    bg: "#FFFBEB",
    border: "#FDE68A",
    evaluates: ["Resource sizing", "Cloud spend impact", "Optimization opportunities", "Operational efficiency"],
    outputs: ["Cost findings", "Cost decision"],
  },
];

const ARCHITECTURE = [
  {
    step: "01",
    title: "Evidence Engine",
    desc: "Transforms infrastructure definitions into normalized governance evidence. Parses Terraform plans, extracts resource attributes, normalizes data, and generates reviewer inputs.",
    color: "#4F46E5",
    bg: "#EEF2FF",
  },
];

const DECISIONS = [
  { label: "Approve", desc: "Change meets all governance thresholds. Safe to deploy.", color: "#065F46", bg: "#D1FAE5", border: "#6EE7B7", dot: "#10B981" },
  { label: "Warn", desc: "Change can proceed with specific remediation steps completed first.", color: "#92400E", bg: "#FEF3C7", border: "#FCD34D", dot: "#F59E0B" },
  { label: "Block", desc: "Change presents unacceptable risk. Deployment blocked pending remediation.", color: "#7F1D1D", bg: "#FEE2E2", border: "#FCA5A5", dot: "#EF4444" },
];

const FAQS = [
  { q: "How does LoopThru integrate with my existing CI/CD pipeline?", a: "LoopThru is designed to integrate into pull request workflows. The planned CI/CD integration will allow teams to trigger a LoopThru review for each infrastructure change, using the Terraform plan generated during the pull request process. The review output can then support approval, warning, or blocking decisions before the change is merged or deployed." },
  { q: "What infrastructure definitions does the Evidence Engine support?", a: "For the current hackathon demo, the Evidence Engine supports Terraform plan outputs. It parses Terraform plan data, extracts resource changes, and converts them into structured governance evidence for reviewer agents." },
  { q: "How are compliance frameworks mapped?", a: "Compliance checks are mapped based on the configured compliance framework for the review. The Compliance Agent evaluates the generated evidence against the selected framework and produces findings, framework mappings, and a compliance-oriented recommendation." },
  { q: "Is the governance output auditable?", a: "Yes. The review process is auditable through the Band.ai platform, where agent interactions, review outputs, and decision context can be inspected. LoopThru also plans to support downloadable review records so teams can retain governance evidence outside the platform." },
  { q: "Can we run LoopThru on-premises?", a: "Not yet. The current version is focused on the hosted hackathon demo and cloud-based review workflow. On-premises deployment is not currently supported, but it is a possible future direction for teams with stricter data residency or internal governance requirements." },
];

type RevealProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
};

type FlowStepItem = {
  label?: string;
  step?: string;
  title: string;
  sub: string;
  accent?: boolean;
  dark?: boolean;
};

type FlowItem = FlowStepItem | "agents" | null;

function useScrollReveal(): [RefObject<HTMLDivElement | null>, boolean] {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.12 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

function Reveal({ children, delay = 0, className = "" }: RevealProps) {
  const [ref, visible] = useScrollReveal();
  return (
    <div ref={ref} className={className} style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(24px)", transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms` }}>
      {children}
    </div>
  );
}

function HeroDemoPreview() {
  const topRisks = ["Missing encryption", "Bucket policy unknown"];

  return (
    <div className="card" style={{ padding: 24 }}>
      <div style={{ background: "#F8FAFC", borderRadius: 10, padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid #E2E8F0", paddingBottom: 16, marginBottom: 18 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#4F46E5", letterSpacing: "-0.01em" }}>Terraform Plan Review</div>
            <div style={{ fontSize: 13, color: "#64748B", marginTop: 2 }}>AWS S3 infrastructure change</div>
          </div>
          <span style={{ background: "#EEF2FF", color: "#4F46E5", border: "1px solid #C7D2FE", borderRadius: 6, padding: "4px 10px", fontSize: 12, fontWeight: 600 }}>Demo ready</span>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          {["Terraform", "AWS", "S3"].map((tag) => (
            <span key={tag} className="badge" style={{ background: "#EEF2FF", color: "#4F46E5", borderColor: "#C7D2FE" }}>{tag}</span>
          ))}
        </div>

        <pre style={{ background: "#0F172A", color: "#F8FAFC", borderRadius: 8, padding: 16, fontSize: 12, lineHeight: 1.65, overflow: "hidden", marginBottom: 16, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>{`{
  "resource": "aws_s3_bucket.app_logs",
  "actions": ["create"],
  "public_access_block": true
}`}</pre>

        <div style={{ border: "1px solid #E2E8F0", borderRadius: 8, background: "#fff", overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", padding: "12px 14px", borderBottom: "1px solid #E2E8F0" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#0F172A", letterSpacing: "-0.01em" }}>Review summary</div>
              <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>Auditable recommendation preview</div>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
              <span style={{ borderRadius: 999, background: "#FEE2E2", color: "#7F1D1D", padding: "4px 8px", fontSize: 11, fontWeight: 700 }}>Block Deployment</span>
              <span style={{ borderRadius: 999, background: "#FFFBEB", color: "#92400E", padding: "4px 8px", fontSize: 11, fontWeight: 700 }}>Risk 82</span>
            </div>
          </div>

          <div style={{ padding: 14 }}>
            <div style={{ borderLeft: "3px solid #DC2626", background: "#FEE2E2", borderRadius: 6, padding: "10px 12px", color: "#7F1D1D", fontSize: 12, lineHeight: 1.55, marginBottom: 12 }}>
              Multiple agents found high-severity gaps in the app logs S3 resource. Remediation is required before approval.
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
              {topRisks.map((risk) => (
                <div key={risk} style={{ border: "1px solid #FDE68A", background: "#FFFBEB", borderRadius: 6, padding: "9px 10px" }}>
                  <div style={{ color: "#92400E", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>Top risk</div>
                  <div style={{ color: "#1E293B", fontSize: 12, lineHeight: 1.35 }}>{risk}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "52px 1fr", gap: 12, alignItems: "start" }}>
              <span style={{ width: "fit-content", borderRadius: 999, background: "#FEE2E2", color: "#7F1D1D", padding: "4px 9px", fontSize: 10, fontWeight: 800, textTransform: "uppercase" }}>High</span>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#64748B", marginBottom: 4 }}>AWS_S3_BUCKET.APP_LOGS</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A", marginBottom: 5 }}>Server-side encryption not configured</div>
                <div style={{ fontSize: 12, lineHeight: 1.45, color: "#475569", marginBottom: 9 }}>The bucket plan has no server-side encryption configured.</div>
                <div style={{ display: "flex", gap: 4, flexWrap: "nowrap", minWidth: 0, overflow: "hidden" }}>  
                  {["security-agent", "compliance-agent", "reliability-agent", "cost-agent"].map((chip) => (
                    <span
                      key={chip}
                      style={{
                        border: "1px solid #C7D2FE",
                        background: "#EEF2FF",
                        color: "#4F46E5",
                        borderRadius: 999,
                        padding: "3px 6px",
                        fontSize: 9,
                        fontWeight: 700,
                        lineHeight: 1.2,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div style={{ fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif", color: "#0F172A", background: "#fff", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        .grad-text { background: linear-gradient(135deg, #4F46E5, #06B6D4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .grad-btn { background: linear-gradient(135deg, #4F46E5, #06B6D4); color: #fff; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 600; letter-spacing: -0.01em; text-decoration: none; transition: opacity 0.2s, transform 0.15s; }
        .grad-btn:hover { opacity: 0.9; transform: translateY(-1px); }
        .ghost-btn { background: transparent; color: #4F46E5; border: 1px solid #C7D2FE; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; padding: 11px 22px; border-radius: 8px; font-size: 14px; font-weight: 600; letter-spacing: -0.01em; text-decoration: none; transition: background 0.15s, transform 0.15s; }
        .ghost-btn:hover { background: #EEF2FF; transform: translateY(-1px); }
        .card { background: #fff; border: 1px solid #E2E8F0; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s; }
        .card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(79,70,229,0.12); border-color: #A5B4FC; }
        .section-label { font-size: 12px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: #4F46E5; }
        .display-heading { font-size: clamp(2rem, 4vw, 3.25rem); font-weight: 700; letter-spacing: -0.03em; line-height: 1.15; color: #0F172A; }
        .sub-heading { font-size: clamp(1.25rem, 2.5vw, 1.75rem); font-weight: 600; letter-spacing: -0.02em; line-height: 1.3; color: #0F172A; }
        .body-text { font-size: 16px; line-height: 1.75; color: #475569; }
        .caption { font-size: 13px; color: #94A3B8; }
        .badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 600; border: 1px solid; }
        .faq-item { border-bottom: 1px solid #F1F5F9; }
        .faq-btn { width: 100%; text-align: left; background: none; border: none; cursor: pointer; padding: 20px 0; display: flex; justify-content: space-between; align-items: center; font-size: 15px; font-weight: 600; color: #0F172A; }
        .faq-body { overflow: hidden; transition: max-height 0.35s ease; }
        .faq-chevron { transition: transform 0.3s ease; }
        .pipe-step { background: #fff; border: 1px solid #E2E8F0; border-radius: 10px; padding: 14px 18px; text-align: center; flex: 1; min-width: 0; }
        .pipe-arrow { color: #CBD5E1; font-size: 18px; flex-shrink: 0; }
        .decision-reveal { height: 100%; }
        @media (max-width: 720px) {
          .grid-2 { grid-template-columns: 1fr !important; }
          .grid-3 { grid-template-columns: 1fr !important; }
          .grid-4 { grid-template-columns: 1fr 1fr !important; }
          .nav-links { display: none !important; }
          .hero-grid { grid-template-columns: 1fr !important; }
          .pipe-row { flex-direction: column !important; align-items: stretch !important; }
          .pipe-arrow { transform: rotate(90deg); align-self: center; }
        }
      `}</style>

      {/* Navbar */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, transition: "box-shadow 0.3s, border-color 0.3s", background: "rgba(255,255,255,0.94)", backdropFilter: "blur(12px)", borderBottom: "1px solid #E2E8F0", boxShadow: scrolled ? "0 8px 24px rgba(15,23,42,0.08)" : "none" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: "-0.02em", background: "linear-gradient(135deg,#4F46E5,#06B6D4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>LoopThru</span>
          <div className="nav-links" style={{ display: "flex", gap: 32 }}>
            {NAV_LINKS.map(l => <a key={l.href} href={l.href} style={{ fontSize: 14, fontWeight: 500, color: "#475569", textDecoration: "none", transition: "color 0.15s" }} onMouseEnter={e => e.currentTarget.style.color="#4F46E5"} onMouseLeave={e => e.currentTarget.style.color="#475569"}>{l.label}</a>)}
          </div>
          <a href="/demo" className="grad-btn" style={{ padding: "9px 18px", fontSize: 13 }}>Run a review</a>
        </div>
      </nav>

      {/* Hero */}
      <section id="home" style={{ background: "linear-gradient(180deg, #F8FAFC 0%, #fff 100%)", padding: "80px 24px 100px" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", display: "grid", gap: 60, alignItems: "center" }} className="hero-grid" data-cols="2">
          <style>{`.hero-grid { grid-template-columns: 1.1fr 0.9fr; }`}</style>
          <div>
            <Reveal>
              <div className="section-label" style={{ marginBottom: 16 }}>AI-POWERED INFRASTRUCTURE GOVERNANCE PLATFORM</div>
              <h1 className="display-heading" style={{ marginBottom: 20 }}>
                Should this infrastructure<br /><span className="grad-text">change be deployed?</span>
              </h1>
              <p className="body-text" style={{ maxWidth: 520, marginBottom: 32 }}>
                LoopThru transforms Terraform plans into governance evidence and coordinates a multi-agent review across Security, Compliance, Reliability, and Cost to deliver an auditable deployment recommendation.
              </p>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <a href="/demo" className="grad-btn">Run a Review</a>
                <a href="#solution" className="ghost-btn">See How It Works</a>
              </div>
            </Reveal>
          </div>

          <Reveal delay={120}>
            <HeroDemoPreview />
          </Reveal>
        </div>
      </section>

      {/* Problem */}
      <section id="problem" style={{ background: "#fff", padding: "80px 24px", borderTop: "1px solid #E2E8F0" }}>
        <div style={{ maxWidth: 1040, margin: "0 auto" }}>
          <Reveal>
            <div style={{ maxWidth: 620, marginBottom: 40 }}>
              <div className="section-label" style={{ marginBottom: 12 }}>Problem</div>
              <h2 className="sub-heading" style={{ marginBottom: 12 }}>Delivery automated. Governance didn't.</h2>
              <p className="body-text">Cloud infrastructure delivery now runs almost entirely on its own, but the review process still depends on tools and workflows that stop short of a deployment decision.</p>
            </div>
          </Reveal>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }} className="grid-3">
            {PROBLEMS.map((p, i) => {
              const ProblemIcon = [Search, Eye, Users][i];
              const accent = i === 0
                ? { color: "#4F46E5", bg: "#EEF2FF", border: "#C7D2FE" }
                : i === 1
                  ? { color: "#0891B2", bg: "#ECFEFF", border: "#A5F3FC" }
                  : { color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" };

              return (
                <Reveal key={p.title} delay={i * 80}>
                  <article className="card" style={{ height: "100%", padding: 24, display: "flex", flexDirection: "column" }}>
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: accent.bg, border: `1px solid ${accent.border}`, color: accent.color, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
                      <ProblemIcon size={22} strokeWidth={2.2} aria-hidden="true" />
                    </div>
                    <h3 style={{ fontWeight: 700, fontSize: 17, letterSpacing: "-0.02em", color: "#0F172A", lineHeight: 1.35, marginBottom: 10 }}>{p.title}</h3>
                    <p style={{ fontSize: 14, lineHeight: 1.7, color: "#475569", marginBottom: 16 }}>{p.lead}</p>
                    <ul style={{ listStyle: "none", display: "grid", gap: 8, marginBottom: 18 }}>
                      {p.points.slice(0, 3).map((pt) => (
                        <li key={pt} style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 13, lineHeight: 1.5, color: "#475569" }}>
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: accent.color, flexShrink: 0, marginTop: 7, opacity: 0.75 }} />
                          {pt}
                        </li>
                      ))}
                    </ul>
                    <p style={{ marginTop: "auto", borderTop: "1px solid #F1F5F9", paddingTop: 14, fontWeight: 700, fontSize: 13, lineHeight: 1.55, color: "#0F172A" }}>{p.takeaway}</p>
                  </article>
                </Reveal>
              );
            })}
          </div>

          <Reveal>
            <div style={{ marginTop: 32, border: "1px solid #C7D2FE", borderRadius: 12, padding: "26px 28px", background: "linear-gradient(135deg, #EEF2FF 0%, #ECFEFF 100%)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: 18, letterSpacing: "-0.01em", color: "#0F172A", marginBottom: 4 }}>This is the gap LoopThru closes.</p>
                <p style={{ fontSize: 14, lineHeight: 1.6, color: "#475569" }}>It turns infrastructure findings into a clear governance recommendation before deployment.</p>
              </div>
              <a href="#solution" className="grad-btn" style={{ display: "inline-flex", flexShrink: 0 }}>See our solution</a>
            </div>
          </Reveal>
        </div>
      </section>
      {/* Solution flow */}
      <section id="solution" style={{ background: "#F8FAFC", padding: "80px 24px", borderTop: "1px solid #E2E8F0" }}>
        <div style={{ maxWidth: 1040, margin: "0 auto" }}>
          <Reveal>
            <div style={{ display: "grid", gridTemplateColumns: "1.05fr 0.95fr", gap: 40, alignItems: "center", marginBottom: 48 }} className="grid-2">
              <div>
                <div className="section-label" style={{ marginBottom: 12 }}>Solution</div>
                <h2 className="sub-heading" style={{ marginBottom: 18, maxWidth: 560 }}>Evidence-driven infrastructure governance for <span className="grad-text">pre-deployment decisions.</span></h2>
                <p className="body-text" style={{ marginBottom: 18, maxWidth: 590 }}>
                  LoopThru helps engineering teams evaluate cloud infrastructure changes before they reach production. It turns Terraform evidence into structured governance output that teams can review, audit, and use in delivery workflows.
                </p>
                <p className="body-text" style={{ maxWidth: 590 }}>
                  Instead of relying on static analysis or waiting for production findings, LoopThru coordinates specialized reviews and generates a clear deployment recommendation.
                </p>
              </div>

              <div className="card" style={{ padding: 28, background: "#fff" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: "linear-gradient(135deg,#4F46E5,#06B6D4)", flexShrink: 0 }} />
                  <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#64748B" }}>Decision layer</span>
                </div>
                <blockquote style={{ borderLeft: "3px solid #4F46E5", paddingLeft: 18, marginBottom: 22 }}>
                  <p style={{ fontSize: "clamp(1.2rem, 2vw, 1.55rem)", fontWeight: 700, color: "#0F172A", letterSpacing: "-0.02em", lineHeight: 1.35 }}>
                    "Should this infrastructure change be deployed?"
                  </p>
                </blockquote>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: "#475569", marginBottom: 22 }}>
                  Security, Compliance, Reliability, and Cost reviewers evaluate the evidence before the compiler produces an auditable recommendation.
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {EVAL_DOMAINS.map((d, i) => (
                    <span
                      key={d}
                      className="badge"
                      style={{
                        background: i === 3 ? "#FFFBEB" : i === 2 ? "#ECFEFF" : "#EEF2FF",
                        color: i === 3 ? "#D97706" : i === 2 ? "#0891B2" : "#4F46E5",
                        borderColor: i === 3 ? "#FDE68A" : i === 2 ? "#A5F3FC" : "#C7D2FE",
                        justifyContent: "center",
                      }}
                    >
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>

        </div>
      </section>

      {/* Architecture */}
      <section id="architecture" style={{ background: "#fff", padding: "80px 24px", borderTop: "1px solid #E2E8F0" }}>
        <div style={{ maxWidth: 1040, margin: "0 auto" }}>
          <Reveal>
            <div className="section-label" style={{ marginBottom: 12 }}>Architecture</div>
            <h2 className="sub-heading" style={{ marginBottom: 12 }}>How LoopThru works</h2>
            <p className="body-text" style={{ maxWidth: 680, marginBottom: 40 }}>
              Every infrastructure change passes through evidence generation, multi-agent review orchestrated in Band, and governance decisioning before deployment.
            </p>
          </Reveal>
          {/* Flow steps */}
          <div className="card" style={{ padding: "32px 28px", background: "#fff", marginBottom: 24 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
            {([
              { label: "Input", title: "Infrastructure Change", sub: "Terraform plan · IaC definition", accent: false, dark: false },
              null,
              { step: "01", title: "Evidence Engine", sub: "Parses and normalizes data", accent: true },
              null,
              "agents",
              null,
              { step: "04", title: "Governance Decision", sub: "Auditable Â· Structured Â· Actionable", dark: true },
            ] as FlowItem[]).map((item, i) => {
              if (item === null) return (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "6px 0" }}>
                  <div style={{ width: 1, height: 20, background: "#CBD5E1" }} />
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4F46E5", opacity: 0.5 }} />
                </div>
              );
              if (item === "agents") return (
                <Reveal key={i} delay={200}>
                  <div style={{ width: "100%", maxWidth: 560, background: "#fff", border: "1px solid #E2E8F0", borderRadius: 10, padding: "18px 24px", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#94A3B8", marginBottom: 4 }}>Step 03</div>
                    <div style={{ fontWeight: 700, fontSize: 16, letterSpacing: "-0.01em", color: "#0F172A", marginBottom: 4 }}>Parallel Agent Reviews</div>
                    <div style={{ fontSize: 12, color: "#94A3B8", marginBottom: 12 }}>Specialized reviewer agents evaluate the evidence</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
                      {AGENTS.map(a => (
                        <div key={a.label} style={{ background: a.bg, border: `1px solid ${a.border}`, borderRadius: 8, padding: "10px 8px", textAlign: "center", fontSize: 12, fontWeight: 700, color: a.color }}>
                          {a.label.replace(" Agent", "")}
                        </div>
                      ))}
                    </div>
                  </div>
                </Reveal>
              );
              return (
                <Reveal key={i} delay={i * 40}>
                  <div style={{ width: "100%", maxWidth: 560, background: item.dark ? "#0F172A" : item.accent ? "#EEF2FF" : "#fff", border: item.dark ? "none" : item.accent ? "1px solid #A5B4FC" : "1px solid #E2E8F0", borderRadius: 10, padding: "18px 24px", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                    {(item.label || item.step) && <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: item.dark ? "#64748B" : item.accent ? "#4F46E5" : "#94A3B8", marginBottom: 4 }}>{item.label || `Step ${item.step}`}</div>}
                    <div style={{ fontWeight: 700, fontSize: 16, letterSpacing: "-0.01em", color: item.dark ? "#F8FAFC" : "#0F172A" }}>{item.title}</div>
                    <div style={{ fontSize: 12, color: item.dark ? "#64748B" : "#94A3B8", marginTop: 4 }}>{item.sub}</div>
                  </div>
                </Reveal>
              );
            })}
            </div>
          </div>
        </div>
      </section>

      <section style={{ background: "#F8FAFC", padding: "80px 24px", borderTop: "1px solid #E2E8F0" }}>
        <div style={{ maxWidth: 1040, margin: "0 auto" }}>
          <Reveal>
            <div className="section-label" style={{ marginBottom: 12 }}>Components</div>
            <h2 className="sub-heading" style={{ marginBottom: 12 }}>How each component works</h2>
            <p className="body-text" style={{ marginBottom: 40 }}>Evidence generation and specialized reviewer agents work together to turn infrastructure changes into governance-ready findings.</p>
          </Reveal>
          <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 20 }}>
            {ARCHITECTURE.map((c, i) => (
              <Reveal key={c.title} delay={i * 80}>
                <div className="card" style={{ padding: "28px 32px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                    <span style={{ background: c.bg, color: c.color, border: `1px solid ${c.color}40`, borderRadius: 6, padding: "3px 10px", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>{c.title}</span>
                  </div>
                  <p className="body-text" style={{ fontSize: 15 }}>{c.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }} className="grid-2">
            {AGENTS.map((a, i) => (
              <Reveal key={a.label} delay={i * 60}>
                <div className="card" style={{ padding: 24 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: a.bg, border: `1px solid ${a.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ width: 14, height: 14, borderRadius: "50%", background: a.color }} />
                    </div>
                    <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: "-0.01em", color: "#0F172A" }}>{a.label}</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#94A3B8", marginBottom: 8 }}>Evaluates</div>
                      {a.evaluates.map(e => <div key={e} style={{ display: "flex", gap: 6, alignItems: "flex-start", fontSize: 12, color: "#475569", marginBottom: 6 }}><span style={{ width: 4, height: 4, borderRadius: "50%", background: a.color, flexShrink: 0, marginTop: 5 }} />{e}</div>)}
                    </div>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#94A3B8", marginBottom: 8 }}>Outputs</div>
                      {a.outputs.map(o => <div key={o} style={{ display: "flex", gap: 6, alignItems: "flex-start", fontSize: 12, color: "#475569", marginBottom: 6 }}><span style={{ width: 4, height: 4, borderRadius: "50%", background: a.color, flexShrink: 0, marginTop: 5 }} />{o}</div>)}
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Governance Decisions */}
      <section style={{ background: "#fff", padding: "80px 24px", borderTop: "1px solid #E2E8F0" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <Reveal>
            <div className="section-label" style={{ marginBottom: 12 }}>Governance decisions</div>
            <h2 className="sub-heading" style={{ marginBottom: 12 }}>Three possible outcomes</h2>
            <p className="body-text" style={{ marginBottom: 40 }}>LoopThru generates one of three governance outcomes every review ends with a clear, auditable answer.</p>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, alignItems: "stretch" }} className="grid-3">
            {DECISIONS.map((d, i) => (
              <Reveal key={d.label} delay={i * 70} className="decision-reveal">
                <div style={{ height: "100%", minHeight: 150, background: d.bg, border: `1px solid ${d.border}`, borderRadius: 12, padding: 24, display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 10 }}>
                    <span style={{ width: 10, height: 10, borderRadius: "50%", background: d.dot, flexShrink: 0 }} />
                    <span style={{ fontWeight: 700, fontSize: 15, color: d.color, letterSpacing: "-0.01em", lineHeight: 1.3 }}>{d.label}</span>
                  </div>
                  <p style={{ fontSize: 13, color: d.color, lineHeight: 1.6 }}>{d.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ background: "#F8FAFC", padding: "80px 24px", borderTop: "1px solid #E2E8F0" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <Reveal>
            <div className="section-label" style={{ marginBottom: 12 }}>FAQ</div>
            <h2 className="sub-heading" style={{ marginBottom: 40 }}>Frequently asked questions</h2>
          </Reveal>
          {FAQS.map((faq, i) => (
            <Reveal key={i} delay={i * 40}>
              <div className="faq-item">
                <button className="faq-btn" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span>{faq.q}</span>
                  <ChevronDown className="faq-chevron" size={18} style={{ transform: openFaq === i ? "rotate(180deg)" : "none", color: "#4F46E5", flexShrink: 0, marginLeft: 16 }} aria-hidden="true" />
                </button>
                <div className="faq-body" style={{ maxHeight: openFaq === i ? "300px" : "0" }}>
                  <p style={{ paddingBottom: 20, fontSize: 14, lineHeight: 1.7, color: "#475569" }}>{faq.a}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "80px 24px", background: "#0F172A" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
          <Reveal>
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "#06B6D4", marginBottom: 16 }}>Ready to govern every change?</div>
            <h2 style={{ fontWeight: 700, fontSize: "clamp(1.75rem, 3vw, 2.5rem)", letterSpacing: "-0.03em", color: "#F8FAFC", lineHeight: 1.2, marginBottom: 16 }}>
              Start your first review today.
            </h2>
            <p style={{ fontSize: 15, lineHeight: 1.7, color: "#64748B", marginBottom: 36 }}>
              See how LoopThru turns infrastructure evidence into an auditable deployment decision â€” before anything reaches production.
            </p>
            <a href="/demo" className="grad-btn" style={{ padding: "14px 28px", fontSize: 15, display: "inline-flex" }}>Run a review</a>
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: "#0F172A", borderTop: "1px solid #1E293B", padding: "28px 24px" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <span style={{ fontWeight: 700, fontSize: 16, background: "linear-gradient(135deg,#4F46E5,#06B6D4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>LoopThru</span>
          <span className="caption" style={{ color: "#334155" }}>Â© 2026 LoopThru. AI-POWERED INFRASTRUCTURE GOVERNANCE PLATFORM.</span>
        </div>
      </footer>
    </div>
  );
}




