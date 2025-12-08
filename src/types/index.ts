export interface Incident {
  id: string;
  type: IncidentType;
  customType?: string;
  severity: Severity;
  actionsTaken: ActionType[];
  customActions?: string[];
  description?: string;
  timestamp: string;
  affectedSystems?: string[];
  estimatedImpact?: string;
}

export interface SOP {
  id: string;
  title: string;
  trigger: string;
  immediateSteps: SOPStep[];
  preventiveActions: SOPStep[];
  responsibleTeam: string;
  severity: Severity;
  incidentType: IncidentType;
  createdAt: string;
}

export interface SOPStep {
  id: string;
  title: string;
  description: string;
  estimatedTime?: string;
  responsible?: string;
  priority: 'high' | 'medium' | 'low';
  completed?: boolean;
}

export type IncidentType = 
  | 'Server Down' 
  | 'Network Issue' 
  | 'UI Bug' 
  | 'Customer Complaint'
  | 'Database Error'
  | 'Security Breach'
  | 'Performance Issue'
  | 'Integration Failure'
  | 'Authentication Issue'
  | 'Data Corruption'
  | 'Service Outage'
  | 'API Failure'
  | 'Storage Issue'
  | 'Backup Failure'
  | 'Monitoring Alert'
  | 'Configuration Error'
  | 'Deployment Issue'
  | 'Third-party Service Down'
  | 'Resource Exhaustion'
  | 'Compliance Violation'
  | 'Custom';

export type Severity = 'Low' | 'Medium' | 'High';

export type ActionType = 
  | 'Restart Server'
  | 'Notify Team'
  | 'Escalate'
  | 'Monitor System'
  | 'Contact Vendor'
  | 'Update Documentation'
  | 'Inform Stakeholders'
  | 'Run Diagnostics'
  | 'Apply Hotfix'
  | 'Schedule Maintenance'
  | 'Check Logs'
  | 'Roll Back Deployment'
  | 'Scale Resources'
  | 'Create Backup'
  | 'Reset Password'
  | 'Clear Cache'
  | 'Update Configuration'
  | 'Block IP Address'
  | 'Enable Maintenance Mode'
  | 'Contact Customer'
  | 'Update Status Page'
  | 'Generate Report'
  | 'Custom Action';

export interface MetricsData {
  incidentsByType: { [key in IncidentType]: number };
  incidentsBySeverity: { [key in Severity]: number };
  complianceRate: number;
  averageResolutionTime: number;
  efficiencyImprovement: number;
  totalSOPs: number;
}

export interface ExportOptions {
  format: 'pdf' | 'docx' | 'html';
  includeMetrics?: boolean;
  includeTimeline?: boolean;
}
