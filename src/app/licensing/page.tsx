import { Metadata } from 'next';
import Link from 'next/link';
import { Check, X, ShieldAlert, ShieldCheck, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Commercial Licensing Terms — Single vs Unlimited Site Rights | Wefik.world',
  description:
    'Plain-language license terms for Wefik.world digital products. What Single-Site and Unlimited-Site licenses allow, restrictions, and agency client handoff rules.',
  alternates: {
    canonical: 'https://wefik.world/licensing',
  },
};

export default function LicensingPage() {
  return (
    <div className="w-full min-h-screen py-16 bg-soft border-b border-border">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate mb-6">
          <Link href="/" className="hover:text-ink transition-colors">Home</Link>
          <span>/</span>
          <span className="text-ink font-semibold">Licensing Terms</span>
        </nav>

        {/* Hero */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-border shadow-xs mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-deep-green">
            Legal Transparency
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-ink tracking-tight mt-2 mb-4">
            Commercial Licensing Terms
          </h1>
          <p className="text-sm sm:text-base text-slate leading-relaxed font-normal">
            We believe software licenses should be simple, fair, and written in plain English. You are purchasing commercial rights to use our production-grade digital assets to build high-performance websites for yourself or paying clients.
          </p>
        </div>

        {/* License Comparison Table */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-xs mb-10 overflow-x-auto">
          <h2 className="text-xl font-bold text-ink mb-6">License Matrix Overview</h2>

          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border text-slate uppercase tracking-wider font-semibold">
                <th className="py-3 pr-4">Feature / Usage Right</th>
                <th className="py-3 px-4 text-center">Single-Site</th>
                <th className="py-3 px-4 text-center bg-lime/10 text-deep-green font-bold rounded-t-xl">
                  Unlimited-Site
                </th>
                <th className="py-3 pl-4 text-center">All-Access Deal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-ink">
              <tr>
                <td className="py-3.5 pr-4 font-medium">Production Website Deployments</td>
                <td className="py-3.5 px-4 text-center">1 Domain</td>
                <td className="py-3.5 px-4 text-center bg-lime/10 font-semibold">Unlimited</td>
                <td className="py-3.5 pl-4 text-center font-semibold">Unlimited</td>
              </tr>
              <tr>
                <td className="py-3.5 pr-4 font-medium">Local & Staging Environments</td>
                <td className="py-3.5 px-4 text-center"><Check className="w-4 h-4 text-deep-green mx-auto" /></td>
                <td className="py-3.5 px-4 text-center bg-lime/10"><Check className="w-4 h-4 text-deep-green mx-auto" /></td>
                <td className="py-3.5 pl-4 text-center"><Check className="w-4 h-4 text-deep-green mx-auto" /></td>
              </tr>
              <tr>
                <td className="py-3.5 pr-4 font-medium">Use for Paying Client Websites</td>
                <td className="py-3.5 px-4 text-center"><Check className="w-4 h-4 text-deep-green mx-auto" /></td>
                <td className="py-3.5 px-4 text-center bg-lime/10"><Check className="w-4 h-4 text-deep-green mx-auto" /></td>
                <td className="py-3.5 pl-4 text-center"><Check className="w-4 h-4 text-deep-green mx-auto" /></td>
              </tr>
              <tr>
                <td className="py-3.5 pr-4 font-medium">Client Handoff (No extra fee for client)</td>
                <td className="py-3.5 px-4 text-center"><Check className="w-4 h-4 text-deep-green mx-auto" /></td>
                <td className="py-3.5 px-4 text-center bg-lime/10"><Check className="w-4 h-4 text-deep-green mx-auto" /></td>
                <td className="py-3.5 pl-4 text-center"><Check className="w-4 h-4 text-deep-green mx-auto" /></td>
              </tr>
              <tr>
                <td className="py-3.5 pr-4 font-medium">Full Source Code Modification</td>
                <td className="py-3.5 px-4 text-center"><Check className="w-4 h-4 text-deep-green mx-auto" /></td>
                <td className="py-3.5 px-4 text-center bg-lime/10"><Check className="w-4 h-4 text-deep-green mx-auto" /></td>
                <td className="py-3.5 pl-4 text-center"><Check className="w-4 h-4 text-deep-green mx-auto" /></td>
              </tr>
              <tr>
                <td className="py-3.5 pr-4 font-medium">Lifetime Bug Fixes & Security Updates</td>
                <td className="py-3.5 px-4 text-center"><Check className="w-4 h-4 text-deep-green mx-auto" /></td>
                <td className="py-3.5 px-4 text-center bg-lime/10"><Check className="w-4 h-4 text-deep-green mx-auto" /></td>
                <td className="py-3.5 pl-4 text-center"><Check className="w-4 h-4 text-deep-green mx-auto" /></td>
              </tr>
              <tr>
                <td className="py-3.5 pr-4 font-medium">Reselling or Redistributing Source Code</td>
                <td className="py-3.5 px-4 text-center"><X className="w-4 h-4 text-rose-500 mx-auto" /></td>
                <td className="py-3.5 px-4 text-center bg-lime/10"><X className="w-4 h-4 text-rose-500 mx-auto" /></td>
                <td className="py-3.5 pl-4 text-center"><X className="w-4 h-4 text-rose-500 mx-auto" /></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Detailed Breakdown Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Permitted */}
          <div className="p-6 rounded-2xl bg-white border border-border">
            <div className="flex items-center gap-2 mb-4 text-deep-green font-bold text-sm">
              <ShieldCheck className="w-5 h-5" />
              <span>What You Are Free to Do</span>
            </div>
            <ul className="space-y-3 text-xs text-slate">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-deep-green flex-shrink-0 mt-0.5" />
                <span>Build websites for commercial clients and bill them freely.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-deep-green flex-shrink-0 mt-0.5" />
                <span>Modify, translate, restyle, or customize any part of the source code.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-deep-green flex-shrink-0 mt-0.5" />
                <span>Deploy on staging and localhost domains without consuming activation slots.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-deep-green flex-shrink-0 mt-0.5" />
                <span>Combine our templates with third-party libraries, APIs, or CMS engines.</span>
              </li>
            </ul>
          </div>

          {/* Prohibited */}
          <div className="p-6 rounded-2xl bg-white border border-border">
            <div className="flex items-center gap-2 mb-4 text-rose-600 font-bold text-sm">
              <ShieldAlert className="w-5 h-5" />
              <span>Strictly Prohibited Actions</span>
            </div>
            <ul className="space-y-3 text-xs text-slate">
              <li className="flex items-start gap-2">
                <X className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                <span>Reselling raw themes, plugins, or templates on competing marketplaces.</span>
              </li>
              <li className="flex items-start gap-2">
                <X className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                <span>Sharing your license key or direct download URLs on public forums or warez sites.</span>
              </li>
              <li className="flex items-start gap-2">
                <X className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                <span>Claiming intellectual property ownership of the underlying core codebase.</span>
              </li>
              <li className="flex items-start gap-2">
                <X className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                <span>Creating a clone or competing digital marketplace using our exact templates.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Client Handoff Policy */}
        <div className="p-8 rounded-3xl bg-white border border-border mb-12">
          <h3 className="text-lg font-bold text-ink mb-2">Agency Client Handoff Procedure</h3>
          <p className="text-xs sm:text-sm text-slate leading-relaxed mb-4">
            When completing a project for a client, you can transfer full administrative control of their WordPress site or static web host. The client does NOT need to purchase an additional license unless they wish to receive direct engineering support from Wefik or download new updates independently.
          </p>
          <div className="p-4 rounded-xl bg-soft border border-border text-xs text-ink">
            <strong>Pro-tip for Agencies:</strong> If you purchase our Unlimited-Site License or Lifetime All-Access Deal, you can maintain client websites perpetually under your master agency license key.
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button asChild className="bg-ink hover:bg-black text-white rounded-xl h-11 px-8 font-semibold text-xs shadow-sm">
            <Link href="/pricing" className="flex items-center gap-2">
              <span>View Membership & License Pricing</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
