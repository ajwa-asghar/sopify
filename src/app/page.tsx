'use client';

import { useState } from 'react';
import { FileText, ArrowRight, BarChart3, MessageSquare, Shield } from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { IncidentForm } from '@/components/IncidentForm';
import { SOPDisplay } from '@/components/SOPDisplay';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import type { Incident, SOP } from '@/types';

export default function Home() {
  const [currentIncident, setCurrentIncident] = useState<Incident | null>(null);
  const [currentSOP, setCurrentSOP] = useState<SOP | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const scrollToMainContent = () => {
    document.getElementById('main-content')?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  const handleIncidentSubmit = async (incidentData: Omit<Incident, 'id' | 'timestamp'>) => {
    setIsLoading(true);
    setError(null);
    setCompletedSteps(new Set());

    // Create complete incident object with required fields
    const incident: Incident = {
      ...incidentData,
      id: `incident_${Date.now()}`,
      timestamp: new Date().toISOString(),
    };

    setCurrentIncident(incident);
    setCurrentSOP(null);

    try {
      console.log('Sending incident to API:', incident);
      const response = await fetch('/api/generate-sop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(incident),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error(errorData.error || 'Failed to generate SOP');
      }

      const sop: SOP = await response.json();
      console.log('Received SOP:', sop);
      setCurrentSOP(sop);
    } catch (err) {
      console.error('Error generating SOP:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStepCompletion = (stepId: string, completed: boolean) => {
    setCompletedSteps(prev => {
      const newSet = new Set(prev);
      if (completed) {
        newSet.add(stepId);
      } else {
        newSet.delete(stepId);
      }
      return newSet;
    });
  };

  return (
    <div className="min-h-screen page-transition">
      {/* Hero Section */}
      <div className="relative min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-indigo-900 overflow-hidden fade-in">
        {/* Hero Navigation */}
        <nav className="relative z-20 flex items-center justify-between p-6">
          {/* sopify Logo */}
          <div className="flex items-center">
            <span className="text-2xl font-bold text-white tracking-tight">sopify</span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/dashboard" prefetch={true} className="text-gray-300 hover:text-white transition-colors">
              Analytics
            </Link>
            <Link href="/chatbot" prefetch={true} className="text-gray-300 hover:text-white transition-colors">
              AI Assistant
            </Link>
            <button 
              onClick={scrollToMainContent}
              className="bg-white text-slate-800 px-6 py-2 rounded-full font-medium hover:bg-gray-100 transition-colors flex items-center space-x-2"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 px-6 py-16 max-w-7xl mx-auto items-center min-h-[80vh]">
          {/* Left Content */}
          <div className="space-y-8">
            
            <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
              Smart Solutions for
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                Operational Excellence
              </span>
            </h1>
            
            <p className="text-lg text-gray-300 leading-relaxed max-w-xl">
              Transform operational incidents into structured, actionable Standard Operating Procedures. 
              Automate compliance tracking, enhance team efficiency, and build enterprise-grade operational resilience.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={scrollToMainContent}
                className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <span>Start Building SOPs</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <Link 
                href="/dashboard"
                prefetch={true}
                className="border border-gray-400 text-gray-300 hover:text-white hover:border-gray-300 px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <BarChart3 className="w-4 h-4" />
                <span>View Analytics</span>
              </Link>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">500+</div>
                <div className="text-sm text-gray-400">SOPs Created</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">98%</div>
                <div className="text-sm text-gray-400">Compliance Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">45%</div>
                <div className="text-sm text-gray-400">Time Saved</div>
              </div>
            </div>
          </div>

          {/* Right Content - Image */}
          <div className="relative">
            <div className="relative z-10">
              <img 
                src="https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                alt="Digital process mapping and corporate SOP workflow system"
                className="rounded-2xl shadow-2xl w-full h-auto"
              />
            </div>
            {/* Floating Cards */}
            <div className="absolute -top-4 -left-4 bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-green-400" />
                <span className="text-white text-sm font-medium">Compliance Ready</span>
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-blue-400" />
                <span className="text-white text-sm font-medium">AI Powered</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <button 
          onClick={scrollToMainContent}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce cursor-pointer group"
        >
          <div className="w-6 h-10 border-2 border-white/30 group-hover:border-white/60 rounded-full flex justify-center transition-colors">
            <div className="w-1 h-3 bg-white/50 group-hover:bg-white/80 rounded-full mt-2 transition-colors"></div>
          </div>
        </button>
      </div>

      {/* Main Application Content */}
      <div id="main-content" className="min-h-screen bg-gradient-to-b from-indigo-900 via-slate-900 to-slate-800">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-white mb-3">
              Incident Management System
            </h1>
            <p className="text-gray-300 leading-relaxed">
              Create structured Standard Operating Procedures from incident reports for improved operational efficiency.
            </p>
          </div>

        <div className="space-y-8">
            {/* Incident Form */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg">
              <div className="px-6 py-5 border-b border-slate-700">
                <h2 className="text-lg font-medium text-white flex items-center">
                  <FileText className="mr-2 w-5 h-5 text-gray-300" />
                  Incident Report
                </h2>
                <p className="text-sm text-gray-300 mt-1">
                  Enter incident details to generate a structured response procedure
                </p>
              </div>
            <div className="p-6">
              <IncidentForm onSubmit={handleIncidentSubmit} isLoading={isLoading} />
            </div>
          </div>

            {/* Loading State */}
            {isLoading && (
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-8">
                <div className="flex flex-col items-center space-y-4">
                  <LoadingSpinner />
                  <p className="text-gray-300 text-sm">Generating SOP...</p>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-900/30 backdrop-blur-sm border border-red-700 rounded-lg p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-medium text-red-200 mb-1">
                      Generation Failed
                    </h3>
                    <p className="text-sm text-red-300">{error}</p>
                  </div>
                  <button 
                    onClick={() => setError(null)}
                    className="ml-4 text-red-400 hover:text-red-200 text-sm"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}

          {/* SOP Display */}
          {currentSOP && (
            <SOPDisplay 
              sop={currentSOP} 
              completedSteps={completedSteps}
              onStepCompletion={handleStepCompletion}
              onNewSOP={() => setCurrentSOP(null)}
            />
          )}
          </div>
        </main>
      </div>
    </div>
  );
}