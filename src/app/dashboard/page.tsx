'use client';

import { BarChart3 } from 'lucide-react';
import { Header } from '@/components/Header';
import { MetricsPanel } from '@/components/MetricsPanel';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-slate-900 to-slate-800">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-white mb-3">
            Analytics Dashboard
          </h1>
          <p className="text-gray-300 leading-relaxed">
            Monitor incident trends, resolution metrics, and operational performance indicators.
          </p>
        </div>

        <div className="space-y-8">
          <MetricsPanel />
        </div>
      </main>
    </div>
  );
}
