'use client';

import { useEffect, useState } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { TrendingUp, Shield, Clock, FileText, BarChart3, Target } from 'lucide-react';
import { sampleMetrics } from '@/data/sampleData';
import type { MetricsData } from '@/types';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export function MetricsPanel() {
  const [metrics, setMetrics] = useState<MetricsData>(sampleMetrics);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading metrics
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  // Professional, muted color scheme
  const colors = {
    primary: '#64748b',
    secondary: '#71717a', 
    success: '#059669',
    warning: '#d97706',
    danger: '#dc2626',
    gray: '#6b7280'
  };

  const incidentTypeData = {
    labels: Object.keys(metrics.incidentsByType).map(type => 
      type.length > 12 ? type.substring(0, 12) + '...' : type
    ),
    datasets: [
      {
        label: 'Incidents',
        data: Object.values(metrics.incidentsByType),
        backgroundColor: [
          colors.primary + '20',
          colors.secondary + '20',
          colors.success + '20',
          colors.warning + '20',
          colors.danger + '20'
        ],
        borderColor: [
          colors.primary,
          colors.secondary,
          colors.success,
          colors.warning,
          colors.danger
        ],
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const severityData = {
    labels: Object.keys(metrics.incidentsBySeverity),
    datasets: [
      {
        label: 'Severity Distribution',
        data: Object.values(metrics.incidentsBySeverity),
        backgroundColor: [
          colors.success + '40',
          colors.warning + '40',
          colors.danger + '40'
        ],
        borderColor: [
          colors.success,
          colors.warning,
          colors.danger
        ],
        borderWidth: 3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 13,
            family: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
            weight: '500' as const
          },
          color: '#374151'
        },
      },
      tooltip: {
        backgroundColor: '#1f2937',
        titleColor: '#f9fafb',
        bodyColor: '#f9fafb',
        borderColor: '#374151',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        displayColors: false,
        titleFont: {
          size: 14,
          weight: '600'
        },
        bodyFont: {
          size: 13,
          weight: '400'
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: '#6b7280',
          font: {
            size: 12,
            weight: '400'
          },
          callback: function(value: any): string {
            return Math.floor(value).toString();
          }
        },
        grid: {
          color: '#e5e7eb',
          lineWidth: 1
        }
      },
      x: {
        ticks: {
          color: '#6b7280',
          font: {
            size: 12,
            weight: '400'
          },
          maxRotation: 0,
        },
        grid: {
          display: false
        }
      },
    },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 13,
            family: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
            weight: '500' as const
          },
          color: '#374151'
        },
      },
      tooltip: {
        backgroundColor: '#1f2937',
        titleColor: '#f9fafb',
        bodyColor: '#f9fafb',
        borderColor: '#374151',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        displayColors: false,
        titleFont: {
          size: 14,
          weight: '600'
        },
        bodyFont: {
          size: 13,
          weight: '400'
        },
        callbacks: {
          label: function(context: any): string {
            const value = context.parsed;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${context.label}: ${value} (${percentage}%)`;
          }
        }
      },
    },
  };

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-gray-200 dark:bg-gray-700 h-32 rounded-xl"></div>
          <div className="bg-gray-200 dark:bg-gray-700 h-32 rounded-xl"></div>
          <div className="bg-gray-200 dark:bg-gray-700 h-32 rounded-xl"></div>
          <div className="bg-gray-200 dark:bg-gray-700 h-32 rounded-xl"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gray-200 dark:bg-gray-700 h-80 rounded-xl"></div>
          <div className="bg-gray-200 dark:bg-gray-700 h-80 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-dark-900 p-6 rounded-xl border border-gray-200 dark:border-dark-800 text-center">
          <div className="flex items-center justify-center mb-3">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
            {metrics.compliance}%
          </div>
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
            COMPLIANCE
          </div>
          <div className="text-xs text-green-600 dark:text-green-400 mt-1">
            +2.3% vs last month
          </div>
        </div>

        <div className="bg-white dark:bg-dark-900 p-6 rounded-xl border border-gray-200 dark:border-dark-800 text-center">
          <div className="flex items-center justify-center mb-3">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
            +{metrics.efficiency}%
          </div>
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
            EFFICIENCY
          </div>
          <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
            +5.2% vs last month
          </div>
        </div>

        <div className="bg-white dark:bg-dark-900 p-6 rounded-xl border border-gray-200 dark:border-dark-800 text-center">
          <div className="flex items-center justify-center mb-3">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
            {metrics.avgResolutionTime}
          </div>
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
            AVG RESOLUTION
          </div>
          <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">
            -8m vs last month
          </div>
        </div>

        <div className="bg-white dark:bg-dark-900 p-6 rounded-xl border border-gray-200 dark:border-dark-800 text-center">
          <div className="flex items-center justify-center mb-3">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-1">
            {metrics.totalSOPs}
          </div>
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
            TOTAL SOPS
          </div>
          <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">
            +47 this month
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Incident Distribution Chart */}
        <div className="bg-white dark:bg-dark-900 p-6 rounded-xl border border-gray-200 dark:border-dark-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
            <BarChart3 className="mr-3 w-5 h-5 text-gray-500" />
            Incident Distribution
          </h3>
          <div className="h-80">
            <Bar data={incidentTypeData} options={chartOptions} />
          </div>
        </div>

        {/* Severity Distribution Chart */}
        <div className="bg-white dark:bg-dark-900 p-6 rounded-xl border border-gray-200 dark:border-dark-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
            <Target className="mr-3 w-5 h-5 text-gray-500" />
            Severity Distribution
          </h3>
          <div className="h-80">
            <Pie data={severityData} options={pieOptions} />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-dark-900 p-6 rounded-xl border border-gray-200 dark:border-dark-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Clock className="mr-3 w-5 h-5 text-gray-500" />
          Recent Activity
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-dark-800">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-900 dark:text-white font-medium">Server outage SOP completed</span>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">2 hours ago</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-dark-800">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-900 dark:text-white font-medium">Network incident resolved</span>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">4 hours ago</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-sm text-gray-900 dark:text-white font-medium">UI bug report SOP created</span>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">6 hours ago</span>
          </div>
        </div>
      </div>
    </div>
  );
}