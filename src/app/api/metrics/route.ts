import { NextRequest, NextResponse } from 'next/server';
import { sampleMetrics, sampleIncidents } from '@/data/sampleData';
import type { MetricsData } from '@/types';

export async function GET(request: NextRequest) {
  try {
    // In a real application, this would fetch from a database
    // For the MVP, we return simulated metrics
    
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '30d';
    const incidentType = searchParams.get('type');

    let metrics: MetricsData = { ...sampleMetrics };

    // Filter by incident type if specified
    if (incidentType && incidentType !== 'all') {
      const filteredIncidents = sampleIncidents.filter(
        incident => incident.type === incidentType
      );
      
      // Recalculate metrics based on filtered data
      metrics = {
        ...metrics,
        totalSOPs: filteredIncidents.length,
        // In a real app, you'd recalculate all metrics based on filtered data
      };
    }

    // Simulate different metrics based on time range
    if (timeRange === '7d') {
      metrics.totalSOPs = Math.floor(metrics.totalSOPs * 0.2);
      metrics.complianceRate = Math.min(metrics.complianceRate + 2, 100);
    } else if (timeRange === '90d') {
      metrics.totalSOPs = Math.floor(metrics.totalSOPs * 3.5);
      metrics.complianceRate = Math.max(metrics.complianceRate - 3, 0);
    }

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { incident } = await request.json();
    
    // In a real application, this would save the incident to a database
    // and update metrics accordingly
    
    console.log('Storing incident:', incident);
    
    // For now, just return success
    return NextResponse.json({ success: true, message: 'Incident stored successfully' });
  } catch (error) {
    console.error('Error storing incident:', error);
    return NextResponse.json(
      { error: 'Failed to store incident' },
      { status: 500 }
    );
  }
}

// Additional endpoint for incident history
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Return paginated incident history
    const incidents = sampleIncidents.slice(offset, offset + limit);
    const total = sampleIncidents.length;

    return NextResponse.json({
      incidents,
      total,
      hasMore: offset + limit < total,
    });
  } catch (error) {
    console.error('Error fetching incident history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch incident history' },
      { status: 500 }
    );
  }
}

