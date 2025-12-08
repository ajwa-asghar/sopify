import type { MetricsData, Incident } from '@/types';

export const sampleMetrics: MetricsData = {
  incidentsByType: {
    'Server Down': 78,
    'Network Issue': 65,
    'UI Bug': 41,
    'Customer Complaint': 33,
    'Database Error': 52,
    'Security Breach': 12,
    'Performance Issue': 89,
    'Integration Failure': 27,
    'Authentication Issue': 19,
    'Data Corruption': 8,
    'Service Outage': 34,
    'API Failure': 45,
    'Storage Issue': 23,
    'Backup Failure': 15,
    'Monitoring Alert': 156,
    'Configuration Error': 38,
    'Deployment Issue': 29,
    'Third-party Service Down': 21,
    'Resource Exhaustion': 31,
    'Compliance Violation': 6,
    'Custom': 18,
  },
  incidentsBySeverity: {
    'Low': 432,
    'Medium': 287,
    'High': 121,
  },
  complianceRate: 94.2,
  averageResolutionTime: 28,
  efficiencyImprovement: 31.7,
  totalSOPs: 840,
};

export const sampleIncidents: Incident[] = [
  {
    id: '1',
    type: 'Server Down',
    severity: 'High',
    actionsTaken: ['Restart Server', 'Notify Team', 'Escalate'],
    description: 'Production server experienced unexpected downtime due to memory overload',
    timestamp: '2024-01-15T14:30:00Z',
  },
  {
    id: '2',
    type: 'Network Issue',
    severity: 'Medium',
    actionsTaken: ['Monitor System', 'Contact Vendor'],
    description: 'Intermittent connectivity issues affecting west coast users',
    timestamp: '2024-01-15T09:15:00Z',
  },
  {
    id: '3',
    type: 'UI Bug',
    severity: 'Low',
    actionsTaken: ['Apply Hotfix', 'Update Documentation'],
    description: 'Minor display issue on mobile checkout page',
    timestamp: '2024-01-14T16:45:00Z',
  },
  {
    id: '4',
    type: 'Customer Complaint',
    severity: 'Medium',
    actionsTaken: ['Inform Stakeholders', 'Monitor System'],
    description: 'Multiple users reporting slow loading times during peak hours',
    timestamp: '2024-01-14T11:20:00Z',
  },
  {
    id: '5',
    type: 'Database Error',
    severity: 'High',
    actionsTaken: ['Run Diagnostics', 'Notify Team', 'Apply Hotfix'],
    description: 'Database connection timeout causing transaction failures',
    timestamp: '2024-01-13T20:30:00Z',
  },
];

export const chartColors = {
  primary: '#0ea5e9',
  secondary: '#64748b',
  accent: '#0284c7',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  neutral: '#374151',
  slate: '#475569',
};

export const severityColors = {
  Low: '#22c55e',
  Medium: '#f59e0b',
  High: '#ef4444',
};

// Professional, corporate color palette for charts
export const incidentTypeColors = [
  '#0ea5e9', // Primary blue
  '#0284c7', // Darker blue
  '#0369a1', // Navy blue
  '#075985', // Dark blue
  '#64748b', // Slate
  '#475569', // Dark slate
  '#374151', // Gray
  '#1f2937', // Dark gray
  '#111827', // Very dark gray
  '#6366f1', // Indigo
  '#8b5cf6', // Purple
  '#a855f7', // Violet
  '#d946ef', // Fuchsia
  '#ec4899', // Pink
  '#f43f5e', // Rose
  '#ef4444', // Red
  '#f97316', // Orange
  '#f59e0b', // Amber
  '#eab308', // Yellow
  '#84cc16', // Lime
  '#22c55e', // Green
];
