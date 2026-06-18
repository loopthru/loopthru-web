import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  LayoutDashboard,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const benefits = [
  {
    title: 'Structured intake',
    description: 'Capture the exact URL, context, and requester details reviewers need.',
    icon: ClipboardCheck,
  },
  {
    title: 'Visible progress',
    description: 'Give teams a shared status instead of asking for updates in chat.',
    icon: Clock3,
  },
  {
    title: 'Ready to operationalize',
    description: 'Start with the demo flow, then replace the mock API with your backend.',
    icon: LayoutDashboard,
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#f8faf7] text-[#172019]">
      <section className="border-b border-[#dbe3d7] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
          <Link to="/" className="text-lg font-semibold">
            LoopThru
          </Link>
          <Link
            to="/demo"
            className="inline-flex items-center gap-2 rounded-md bg-[#173f35] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0f2d27]"
          >
            Request a review
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-12 px-5 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-24">
        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-[#42776c]">
            Review operations for fast teams
          </p>
          <h1 className="max-w-3xl text-5xl font-semibold leading-tight text-[#12231e] md:text-6xl">
            Turn review requests into a trackable workflow.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#4f6259]">
            LoopThru gives requesters a clean intake path and keeps review status visible from
            submission to completion.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/demo"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-[#173f35] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0f2d27]"
            >
              Request a review
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <a
              href="#workflow"
              className="inline-flex items-center justify-center rounded-md border border-[#b8c7be] px-5 py-3 text-sm font-semibold text-[#173f35] transition hover:bg-white"
            >
              View workflow
            </a>
          </div>
        </div>

        <div className="rounded-md border border-[#d7e2d8] bg-white p-5 shadow-sm">
          <div className="rounded-md bg-[#f3f7f2] p-4">
            <div className="flex items-center justify-between border-b border-[#d9e5db] pb-4">
              <div>
                <p className="text-sm font-semibold text-[#173f35]">Request REV-2481</p>
                <p className="text-sm text-[#637268]">Website launch review</p>
              </div>
              <span className="rounded-md bg-[#dceee8] px-3 py-1 text-xs font-semibold text-[#173f35]">
                In review
              </span>
            </div>
            <div className="space-y-4 pt-5">
              {['Intake received', 'Reviewer assigned', 'Findings in progress'].map(
                (label, index) => (
                  <div key={label} className="flex items-center gap-3">
                    <CheckCircle2
                      size={20}
                      className={index < 2 ? 'text-[#2f7d68]' : 'text-[#9cae9f]'}
                      aria-hidden="true"
                    />
                    <span className="text-sm font-medium text-[#314239]">{label}</span>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </section>

      <section id="workflow" className="border-t border-[#dbe3d7] bg-white py-14">
        <div className="mx-auto grid max-w-6xl gap-4 px-5 md:grid-cols-3">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <article key={benefit.title} className="rounded-md border border-[#dbe3d7] p-5">
                <Icon size={22} className="text-[#2f7d68]" aria-hidden="true" />
                <h2 className="mt-4 text-lg font-semibold text-[#172019]">{benefit.title}</h2>
                <p className="mt-2 text-sm leading-6 text-[#5b6d62]">{benefit.description}</p>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
