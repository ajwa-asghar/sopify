'use client';

import { useState, useCallback, memo } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  Download, 
  Share, 
  Clock, 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  Circle,
  Copy,
  FileText
} from 'lucide-react';
import { getSeverityColor, formatDate, calculateCompletionTime } from '@/lib/utils';
import type { SOP, SOPStep } from '@/types';

interface SOPDisplayProps {
  sop: SOP;
  onNewSOP: () => void;
  completedSteps?: Set<string>;
  onStepCompletion?: (stepId: string, completed: boolean) => void;
}

export const SOPDisplay = memo(function SOPDisplay({ sop, onNewSOP, completedSteps = new Set(), onStepCompletion }: SOPDisplayProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['immediate']));
  const [isExporting, setIsExporting] = useState(false);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const toggleStepCompletion = (stepId: string) => {
    const isCompleting = !completedSteps.has(stepId);
    
    if (onStepCompletion) {
      onStepCompletion(stepId, isCompleting);
    }
    
    // Add a subtle visual feedback for completion
    if (isCompleting && typeof window !== 'undefined') {
      const button = document.querySelector(`[data-step-id="${stepId}"]`);
      if (button) {
        button.classList.add('animate-bounce');
        setTimeout(() => button.classList.remove('animate-bounce'), 600);
      }
    }
  };

  const handleExport = async (format: 'pdf' | 'docx' | 'html') => {
    setIsExporting(true);
    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sop,
          format,
          completedSteps: Array.from(completedSteps),
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${sop.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sop,
          format: 'clipboard',
          completedSteps: Array.from(completedSteps)
        })
      });
      
      const data = await response.json();
      await navigator.clipboard.writeText(data.text);
      return true;
    } catch (error) {
      console.error('Failed to copy comprehensive format:', error);
      // Fallback to simple format
      try {
        const simpleText = `SOP: ${sop.title}\n\n` +
          `Severity: ${sop.severity} | Type: ${sop.incidentType} | Team: ${sop.responsibleTeam}\n\n` +
          `PROBLEM: ${sop.trigger}\n\n` +
          `IMMEDIATE ACTIONS:\n` +
          sop.immediateSteps.map((step, i) => `${i+1}. ${step.title}\n   ${step.description}`).join('\n') +
          `\n\nPREVENTIVE MEASURES:\n` +
          sop.preventiveActions.map((step, i) => `${i+1}. ${step.title}\n   ${step.description}`).join('\n');
        await navigator.clipboard.writeText(simpleText);
        return true;
      } catch (fallbackError) {
        console.error('Fallback copy also failed:', fallbackError);
        return false;
      }
    }
  };

  const renderStepCard = (step: SOPStep, isCompleted: boolean, stepIndex: number) => (
    <div
      key={step.id}
      className={`step-card transition-all duration-300 ${
        isCompleted ? 'step-card-completed shadow-lg transform scale-[1.02]' : 'hover:shadow-lg hover:scale-[1.01]'
      }`}
    >
      <div className="flex items-start space-x-4">
        {/* Step number and completion indicator */}
        <div className="flex-shrink-0 flex flex-col items-center">
          <button
            onClick={() => toggleStepCompletion(step.id)}
            data-step-id={step.id}
            className="focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-full transform hover:scale-110 transition-all duration-200"
            title={isCompleted ? "Mark as incomplete" : "Mark as complete"}
          >
            {isCompleted ? (
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
            ) : (
              <div className="w-10 h-10 bg-gray-100 dark:bg-dark-700 border-3 border-gray-300 dark:border-dark-600 rounded-full flex items-center justify-center hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-950 hover:shadow-md transition-all duration-200 cursor-pointer">
                <Circle className="w-6 h-6 text-gray-400 dark:text-gray-500" />
              </div>
            )}
          </button>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-3">
            <h4 className={`text-lg font-bold leading-tight ${
              isCompleted 
                ? 'text-green-800 dark:text-green-200' 
                : 'text-gray-900 dark:text-white'
            }`}>
              {step.title}
            </h4>
            <div className="flex items-center space-x-2 ml-6 flex-shrink-0">
              {step.estimatedTime && (
                <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full font-semibold">
                  {step.estimatedTime}
                </span>
              )}
              {step.priority === 'high' && (
                <span className="text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-3 py-1 rounded-full font-semibold">
                  High Priority
                </span>
              )}
            </div>
          </div>
          
          <p className={`text-base leading-relaxed mb-4 ${
            isCompleted 
              ? 'text-green-700 dark:text-green-300' 
              : 'text-gray-700 dark:text-gray-300'
          }`}>
            {step.description}
          </p>
          
          {step.responsible && (
            <div className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-dark-700 rounded-lg">
              <div className="p-1.5 bg-purple-100 dark:bg-purple-900 rounded-md">
                <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                Responsible: {step.responsible}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const completionPercentage = Math.round(
    (completedSteps.size / (sop.immediateSteps.length + sop.preventiveActions.length)) * 100
  ) || 0;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-4">
                <div className={`px-4 py-2 rounded-xl text-sm font-bold ${getSeverityColor(sop.severity)} border-2`}>
                  {sop.severity} Priority
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-dark-800 px-3 py-2 rounded-lg">
                  Generated {formatDate(sop.createdAt)}
                </span>
              </div>
              
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
                {sop.title}
              </h1>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-3 p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-orange-800 dark:text-orange-200">Incident Type</p>
                    <p className="text-orange-600 dark:text-orange-400">{sop.incidentType}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-blue-800 dark:text-blue-200">Estimated Time</p>
                    <p className="text-blue-600 dark:text-blue-400">{calculateCompletionTime([...sop.immediateSteps, ...sop.preventiveActions])}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-purple-800 dark:text-purple-200">Responsible Team</p>
                    <p className="text-purple-600 dark:text-purple-400">{sop.responsibleTeam}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 ml-8">
              <button onClick={onNewSOP} className="btn-secondary">
                Create New SOP
              </button>
              <button 
                className="btn-primary flex items-center space-x-2"
                onClick={() => handleExport('pdf')}
                disabled={isExporting}
              >
                <Download className="w-5 h-5" />
                <span>{isExporting ? 'Exporting...' : 'Export PDF'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-gray-50 dark:bg-dark-800 rounded-xl p-6 border border-gray-200 dark:border-dark-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Completion Progress
            </h3>
            <div className="text-right">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {completionPercentage}%
              </span>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {completedSteps.size} of {sop.immediateSteps.length + sop.preventiveActions.length} steps completed
              </p>
            </div>
          </div>
          <div className="w-full bg-gray-200 dark:bg-dark-700 rounded-full h-4 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-green-500 to-green-600 h-4 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          {completionPercentage > 0 && (
            <p className="text-sm text-green-600 dark:text-green-400 mt-2 font-medium">
              Great progress! Keep following the steps to complete the SOP.
            </p>
          )}
        </div>
      </div>

      {/* Trigger Section */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-3">
            <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-xl">
              <AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <span>Problem / Trigger</span>
          </h2>
        </div>
        <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950 border border-orange-200 dark:border-orange-800 rounded-xl p-6">
          <p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed font-medium">{sop.trigger}</p>
        </div>
      </div>

      {/* Immediate Steps */}
      <div className="card">
        <button
          onClick={() => toggleSection('immediate')}
          className="w-full flex items-center justify-between py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-4">
            <div className="p-3 bg-red-100 dark:bg-red-900 rounded-xl">
              <div className="w-6 h-6 bg-red-600 dark:bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">!</span>
              </div>
            </div>
            <div>
              <span>Immediate Actions</span>
              <div className="text-sm text-gray-500 dark:text-gray-400 font-normal">
                {sop.immediateSteps.length} critical steps
              </div>
            </div>
          </h2>
          <div className="flex items-center space-x-2">
            <div className="text-right">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {sop.immediateSteps.filter(step => completedSteps.has(step.id)).length} / {sop.immediateSteps.length} completed
              </p>
            </div>
            {expandedSections.has('immediate') ? (
              <ChevronDown className="w-6 h-6 text-gray-500 dark:text-gray-400" />
            ) : (
              <ChevronRight className="w-6 h-6 text-gray-500 dark:text-gray-400" />
            )}
          </div>
        </button>

        {expandedSections.has('immediate') && (
          <div className="mt-6 space-y-4 animate-slide-up">
            {sop.immediateSteps.map((step, index) => 
              renderStepCard(step, completedSteps.has(step.id), index)
            )}
          </div>
        )}
      </div>

      {/* Preventive Actions */}
      <div className="card">
        <button
          onClick={() => toggleSection('preventive')}
          className="w-full flex items-center justify-between py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl">
              <div className="w-6 h-6 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">P</span>
              </div>
            </div>
            <div>
              <span>Preventive Measures</span>
              <div className="text-sm text-gray-500 dark:text-gray-400 font-normal">
                {sop.preventiveActions.length} preventive steps
              </div>
            </div>
          </h2>
          <div className="flex items-center space-x-2">
            <div className="text-right">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {sop.preventiveActions.filter(step => completedSteps.has(step.id)).length} / {sop.preventiveActions.length} completed
              </p>
            </div>
            {expandedSections.has('preventive') ? (
              <ChevronDown className="w-6 h-6 text-gray-500 dark:text-gray-400" />
            ) : (
              <ChevronRight className="w-6 h-6 text-gray-500 dark:text-gray-400" />
            )}
          </div>
        </button>

        {expandedSections.has('preventive') && (
          <div className="mt-6 space-y-4 animate-slide-up">
            {sop.preventiveActions.map((step, index) => 
              renderStepCard(step, completedSteps.has(step.id), index)
            )}
          </div>
        )}
      </div>

      {/* Export & Share Options */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-3">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-xl">
              <Share className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <span>Export & Share</span>
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Download or share this SOP in various formats for your team
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => handleExport('pdf')}
            disabled={isExporting}
            className="group flex flex-col items-center space-y-3 p-6 border-2 border-gray-200 dark:border-dark-700 rounded-xl hover:border-red-300 dark:hover:border-red-700 hover:bg-red-50 dark:hover:bg-red-950 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="p-3 bg-red-100 dark:bg-red-900 rounded-xl group-hover:bg-red-200 dark:group-hover:bg-red-800 transition-colors">
              <FileText className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-gray-900 dark:text-white">PDF Document</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Professional format</p>
            </div>
          </button>
          
          <button
            onClick={() => handleExport('docx')}
            disabled={isExporting}
            className="group flex flex-col items-center space-y-3 p-6 border-2 border-gray-200 dark:border-dark-700 rounded-xl hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
              <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-gray-900 dark:text-white">Word Document</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Editable format</p>
            </div>
          </button>
          
          <button
            onClick={() => handleExport('html')}
            disabled={isExporting}
            className="group flex flex-col items-center space-y-3 p-6 border-2 border-gray-200 dark:border-dark-700 rounded-xl hover:border-purple-300 dark:hover:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-950 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-xl group-hover:bg-purple-200 dark:group-hover:bg-purple-800 transition-colors">
              <FileText className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-gray-900 dark:text-white">Interactive HTML</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Clickable checklist</p>
            </div>
          </button>
          
          <button
            onClick={async (e) => {
              const success = await copyToClipboard();
              const button = e.currentTarget;
              const titleEl = button.querySelector('.font-semibold') as HTMLElement | null;
              const subtitleEl = button.querySelector('.text-sm') as HTMLElement | null;
              
              if (success && titleEl && subtitleEl) {
                titleEl.textContent = 'Copied Successfully!';
                titleEl.style.color = '#22c55e';
                subtitleEl.textContent = 'Comprehensive format';
                setTimeout(() => {
                  if (titleEl && subtitleEl) {
                    titleEl.textContent = 'Copy to Clipboard';
                    titleEl.style.color = '';
                    subtitleEl.textContent = 'Comprehensive format';
                  }
                }, 2000);
              } else if (titleEl && subtitleEl) {
                titleEl.textContent = 'Copy Failed';
                titleEl.style.color = '#ef4444';
                setTimeout(() => {
                  if (titleEl) {
                    titleEl.textContent = 'Copy to Clipboard';
                    titleEl.style.color = '';
                  }
                }, 2000);
              }
            }}
            className="group flex flex-col items-center space-y-3 p-6 border-2 border-gray-200 dark:border-dark-700 rounded-xl hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-dark-800 transition-all duration-200"
          >
            <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-xl group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition-colors">
              <Copy className="w-8 h-8 text-gray-600 dark:text-gray-400" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-gray-900 dark:text-white">Copy to Clipboard</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Comprehensive format</p>
            </div>
          </button>
        </div>
        
        {isExporting && (
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 dark:border-blue-400 border-t-transparent"></div>
              <p className="text-blue-800 dark:text-blue-200 font-medium">Preparing your export...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});