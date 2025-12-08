'use client';

import { useState, useCallback, memo } from 'react';
import { AlertTriangle, Clock, Users, FileText } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';
import type { IncidentType, Severity, ActionType } from '@/types';

import type { Incident } from '@/types';

interface IncidentFormProps {
  onSubmit: (incident: Omit<Incident, 'id' | 'timestamp'>) => void;
  isLoading: boolean;
}

const incidentTypes: IncidentType[] = [
  'Server Down',
  'Network Issue',
  'UI Bug',
  'Customer Complaint',
  'Database Error',
  'Security Breach',
  'Performance Issue',
  'Integration Failure',
  'Authentication Issue',
  'Data Corruption',
  'Service Outage',
  'API Failure',
  'Storage Issue',
  'Backup Failure',
  'Monitoring Alert',
  'Configuration Error',
  'Deployment Issue',
  'Third-party Service Down',
  'Resource Exhaustion',
  'Compliance Violation',
  'Custom',
];

const severityLevels: Severity[] = ['Low', 'Medium', 'High'];

const actionTypes: ActionType[] = [
  'Restart Server',
  'Notify Team',
  'Escalate',
  'Monitor System',
  'Contact Vendor',
  'Update Documentation',
  'Inform Stakeholders',
  'Run Diagnostics',
  'Apply Hotfix',
  'Schedule Maintenance',
  'Check Logs',
  'Roll Back Deployment',
  'Scale Resources',
  'Create Backup',
  'Reset Password',
  'Clear Cache',
  'Update Configuration',
  'Block IP Address',
  'Enable Maintenance Mode',
  'Contact Customer',
  'Update Status Page',
  'Generate Report',
  'Custom Action',
];

export const IncidentForm = memo(function IncidentForm({ onSubmit, isLoading }: IncidentFormProps) {
  const [type, setType] = useState<IncidentType | ''>('');
  const [customType, setCustomType] = useState('');
  const [severity, setSeverity] = useState<Severity | ''>('');
  const [actionsTaken, setActionsTaken] = useState<ActionType[]>([]);
  const [customActions, setCustomActions] = useState<string[]>([]);
  const [customActionInput, setCustomActionInput] = useState('');
  const [description, setDescription] = useState('');
  const [affectedSystems, setAffectedSystems] = useState<string[]>([]);
  const [systemInput, setSystemInput] = useState('');
  const [estimatedImpact, setEstimatedImpact] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!type) {
      newErrors.type = 'Please select an incident type';
    } else if (type === 'Custom' && !customType.trim()) {
      newErrors.customType = 'Please specify the custom incident type';
    }
    
    if (!severity) newErrors.severity = 'Please select a severity level';
    if (actionsTaken.length === 0 && customActions.length === 0) {
      newErrors.actions = 'Please select at least one action taken';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    onSubmit({
      type: type as IncidentType,
      customType: type === 'Custom' ? customType.trim() : undefined,
      severity: severity as Severity,
      actionsTaken,
      customActions: customActions.length > 0 ? customActions : undefined,
      description: description.trim() || undefined,
      affectedSystems: affectedSystems.length > 0 ? affectedSystems : undefined,
      estimatedImpact: estimatedImpact.trim() || undefined,
    });
  }, [type, customType, severity, actionsTaken, customActions, description, affectedSystems, estimatedImpact, validateForm, onSubmit]);

  const handleActionToggle = (action: ActionType) => {
    setActionsTaken(prev => 
      prev.includes(action) 
        ? prev.filter(a => a !== action)
        : [...prev, action]
    );
    if (errors.actions) {
      setErrors(prev => ({ ...prev, actions: '' }));
    }
  };

  const addCustomAction = () => {
    if (customActionInput.trim() && !customActions.includes(customActionInput.trim())) {
      setCustomActions([...customActions, customActionInput.trim()]);
      setCustomActionInput('');
    }
  };

  const removeCustomAction = (action: string) => {
    setCustomActions(customActions.filter(a => a !== action));
  };

  const addAffectedSystem = () => {
    if (systemInput.trim() && !affectedSystems.includes(systemInput.trim())) {
      setAffectedSystems([...affectedSystems, systemInput.trim()]);
      setSystemInput('');
    }
  };

  const removeAffectedSystem = (system: string) => {
    setAffectedSystems(affectedSystems.filter(s => s !== system));
  };

  const getSeverityIcon = (sev: Severity) => {
    switch (sev) {
      case 'High': return '🔴';
      case 'Medium': return '🟡';
      case 'Low': return '🟢';
      default: return '';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Incident Type Section */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-900 dark:text-white">
          Incident Type
        </label>
        <div className="space-y-4">
          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value as IncidentType);
              if (errors.type) setErrors(prev => ({ ...prev, type: '' }));
            }}
            className={`form-select text-base ${errors.type ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
          >
            <option value="">Select incident category...</option>
            {incidentTypes.map((t) => (
              <option key={t} value={t}>
                {t === 'Custom' ? 'Custom / Other' : t}
              </option>
            ))}
          </select>
          
          {type === 'Custom' && (
            <div>
              <input
                type="text"
                value={customType}
                onChange={(e) => {
                  setCustomType(e.target.value);
                  if (errors.customType) setErrors(prev => ({ ...prev, customType: '' }));
                }}
                placeholder="Specify your custom incident type..."
                className={`form-input ${errors.customType ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
              />
              {errors.customType && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.customType}</p>
              )}
            </div>
          )}
        </div>
        {errors.type && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.type}</p>
        )}
      </div>

      {/* Severity Level */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-900 dark:text-white">
          Severity Level
        </label>
        <div className="grid grid-cols-3 gap-4">
          {severityLevels.map((sev) => (
            <button
              key={sev}
              type="button"
              onClick={() => {
                setSeverity(sev);
                if (errors.severity) setErrors(prev => ({ ...prev, severity: '' }));
              }}
              className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                severity === sev
                  ? sev === 'High'
                    ? 'border-red-500 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 shadow-lg'
                    : sev === 'Medium'
                    ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300 shadow-lg'
                    : 'border-green-500 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 shadow-lg'
                  : 'border-gray-200 dark:border-dark-700 hover:border-gray-300 dark:hover:border-dark-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-800'
              }`}
            >
              <div className="flex flex-col items-center space-y-2">
                <span className="text-2xl">{getSeverityIcon(sev)}</span>
                <span className="font-semibold text-lg">{sev}</span>
                <span className="text-xs text-center opacity-75">
                  {sev === 'High' ? 'Critical Impact' : sev === 'Medium' ? 'Moderate Impact' : 'Minor Impact'}
                </span>
              </div>
            </button>
          ))}
        </div>
        {errors.severity && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.severity}</p>
        )}
      </div>

      {/* Actions Taken */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-900 dark:text-white">
          Actions Taken
        </label>
        
        {/* Standard Actions */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Standard Response Actions</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {actionTypes.filter(action => action !== 'Custom Action').map((action) => (
              <button
                key={action}
                type="button"
                onClick={() => handleActionToggle(action)}
                className={`p-4 rounded-lg border text-sm transition-all duration-200 text-left ${
                  actionsTaken.includes(action)
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300 shadow-md'
                    : 'border-gray-200 dark:border-dark-700 hover:border-gray-300 dark:hover:border-dark-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-800'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                    actionsTaken.includes(action) ? 'bg-primary-500' : 'bg-gray-300 dark:bg-dark-600'
                  }`} />
                  <span className="font-medium">{action}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Actions */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Custom Actions</h4>
          <div className="space-y-3">
            <div className="flex space-x-3">
              <input
                type="text"
                value={customActionInput}
                onChange={(e) => setCustomActionInput(e.target.value)}
                placeholder="Add custom action taken..."
                className="form-input flex-1"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomAction())}
              />
              <button
                type="button"
                onClick={addCustomAction}
                className="btn-secondary px-4 py-2"
                disabled={!customActionInput.trim()}
              >
                Add
              </button>
            </div>
            {customActions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {customActions.map((action) => (
                  <span
                    key={action}
                    className="inline-flex items-center space-x-2 px-3 py-2 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded-lg text-sm font-medium"
                  >
                    <span>{action}</span>
                    <button
                      type="button"
                      onClick={() => removeCustomAction(action)}
                      className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {errors.actions && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.actions}</p>
        )}
      </div>

      {/* Affected Systems */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-900 dark:text-white">
          Affected Systems
        </label>
        <div className="space-y-3">
          <div className="flex space-x-3">
            <input
              type="text"
              value={systemInput}
              onChange={(e) => setSystemInput(e.target.value)}
              placeholder="e.g., Web Server, Database, API Gateway..."
              className="form-input flex-1"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAffectedSystem())}
            />
            <button
              type="button"
              onClick={addAffectedSystem}
              className="btn-secondary px-4 py-2"
              disabled={!systemInput.trim()}
            >
              Add
            </button>
          </div>
          {affectedSystems.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {affectedSystems.map((system) => (
                <span
                  key={system}
                  className="inline-flex items-center space-x-2 px-3 py-2 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-lg text-sm font-medium"
                >
                  <span>{system}</span>
                  <button
                    type="button"
                    onClick={() => removeAffectedSystem(system)}
                    className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Impact Assessment */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-900 dark:text-white">
          Impact Assessment
        </label>
        <select
          value={estimatedImpact}
          onChange={(e) => setEstimatedImpact(e.target.value)}
          className="form-select"
        >
          <option value="">Select estimated impact...</option>
          <option value="Service Unavailable">Complete Service Unavailable</option>
          <option value="Degraded Performance">Degraded Performance</option>
          <option value="Limited Functionality">Limited Functionality</option>
          <option value="User Experience Issues">User Experience Issues</option>
          <option value="Data Integrity Concerns">Data Integrity Concerns</option>
          <option value="Security Compromise">Security Compromise</option>
          <option value="Compliance Issues">Compliance Issues</option>
          <option value="Minor Issues">Minor Issues</option>
        </select>
      </div>

      {/* Description */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-900 dark:text-white">
          Description (Optional)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Provide comprehensive details about the incident, including timeline, symptoms, and any relevant context..."
          rows={6}
          className="form-input resize-none"
        />
        <div className="flex justify-between items-center text-sm">
          <p className="text-gray-500 dark:text-gray-400">
            {description.length}/1000 characters
          </p>
          <span className="text-gray-500 dark:text-gray-400">Optional but recommended for better SOP generation</span>
        </div>
      </div>

      {/* Form Summary */}
      {(type || severity || actionsTaken.length > 0 || customActions.length > 0) && (
        <div className="p-6 bg-gray-50 dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700">
          <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
            <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
            <span>Incident Summary</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {type && (
              <div>
                <span className="font-semibold text-gray-700 dark:text-gray-300">Type:</span>
                <span className="ml-2 text-gray-900 dark:text-white">
                  {type === 'Custom' ? customType || 'Custom' : type}
                </span>
              </div>
            )}
            {severity && (
              <div>
                <span className="font-semibold text-gray-700 dark:text-gray-300">Severity:</span>
                <span className={`ml-2 font-medium ${
                  severity === 'High' ? 'text-red-600 dark:text-red-400' :
                  severity === 'Medium' ? 'text-yellow-600 dark:text-yellow-400' :
                  'text-green-600 dark:text-green-400'
                }`}>{severity}</span>
              </div>
            )}
            {(actionsTaken.length > 0 || customActions.length > 0) && (
              <div className="md:col-span-2">
                <span className="font-semibold text-gray-700 dark:text-gray-300">Actions Taken:</span>
                <div className="mt-2 flex flex-wrap gap-1">
                  {[...actionsTaken, ...customActions].map((action, index) => (
                    <span key={index} className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded text-xs font-medium">
                      {action}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {affectedSystems.length > 0 && (
              <div className="md:col-span-2">
                <span className="font-semibold text-gray-700 dark:text-gray-300">Affected Systems:</span>
                <div className="mt-2 flex flex-wrap gap-1">
                  {affectedSystems.map((system) => (
                    <span key={system} className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded text-xs font-medium">
                      {system}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-md font-medium disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Generating SOP...
            </span>
          ) : (
            'Generate SOP'
          )}
        </button>
      </div>
    </form>
  );
});