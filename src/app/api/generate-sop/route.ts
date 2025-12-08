import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Incident, SOP, SOPStep } from '@/types';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const incident: Incident = await request.json();

    if (!process.env.GEMINI_API_KEY) {
      console.error('Missing GEMINI_API_KEY environment variable');
      return NextResponse.json(
        { error: 'Gemini API key not configured. Please add GEMINI_API_KEY to your environment variables.' },
        { status: 500 }
      );
    }

    // Validate the API key format
    if (!process.env.GEMINI_API_KEY.startsWith('AIza')) {
      console.error('Invalid GEMINI_API_KEY format');
      return NextResponse.json(
        { error: 'Invalid API key format. Please check your GEMINI_API_KEY.' },
        { status: 500 }
      );
    }

    // Use the fastest available model directly (we know it works from testing)
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash', // Fast model for quick responses
      generationConfig: {
        temperature: 0.1, // Lower temperature for consistent, faster responses
        topK: 20,
        topP: 0.8,
        maxOutputTokens: 2048, // Limit output for faster generation
      }
    });
    
    console.log('Using optimized gemini-2.5-flash model for fast generation');

    // Optimized prompt for comprehensive but efficient SOP generation
    const stepCount = incident.severity === 'High' ? 5 : incident.severity === 'Medium' ? 4 : 3;
    const preventiveCount = incident.severity === 'High' ? 5 : incident.severity === 'Medium' ? 4 : 3;
    
    const prompt = `Create detailed SOP for: ${incident.type} (${incident.severity} severity)
Actions taken: ${incident.actionsTaken.join(', ')}${incident.customActions ? `, ${incident.customActions.join(', ')}` : ''}
${incident.description ? `Context: ${incident.description}` : ''}

Generate ${stepCount} immediate + ${preventiveCount} preventive steps. Return ONLY JSON:

{
  "title": "SOP: ${incident.type} Response Procedure", 
  "trigger": "When ${incident.type.toLowerCase()} occurs affecting system operations and user experience",
  "immediateSteps": [
    {"id": "step_1", "title": "Incident Assessment", "description": "Assess impact scope, affected systems, and user count", "estimatedTime": "5 min", "responsible": "Operations Team", "priority": "high"},
    {"id": "step_2", "title": "Recovery Actions", "description": "Execute primary recovery procedures and system restoration", "estimatedTime": "15 min", "responsible": "Technical Team", "priority": "high"},
    {"id": "step_3", "title": "Verification", "description": "Verify system functionality and service restoration", "estimatedTime": "10 min", "responsible": "QA Team", "priority": "high"}${stepCount > 3 ? ',\n    {"id": "step_4", "title": "Communication", "description": "Notify stakeholders and provide status updates", "estimatedTime": "5 min", "responsible": "Communications", "priority": "medium"}' : ''}${stepCount > 4 ? ',\n    {"id": "step_5", "title": "Documentation", "description": "Document actions taken and prepare incident report", "estimatedTime": "15 min", "responsible": "Documentation Team", "priority": "medium"}' : ''}
  ],
  "preventiveActions": [
    {"id": "prev_1", "title": "System Enhancement", "description": "Implement redundancy and monitoring improvements", "estimatedTime": "2 weeks", "responsible": "DevOps Team", "priority": "high"},
    {"id": "prev_2", "title": "Process Training", "description": "Conduct team training and update procedures", "estimatedTime": "1 week", "responsible": "Training Team", "priority": "medium"},
    {"id": "prev_3", "title": "Monitoring Setup", "description": "Deploy enhanced alerting and detection systems", "estimatedTime": "1 week", "responsible": "Infrastructure Team", "priority": "medium"}${preventiveCount > 3 ? ',\n    {"id": "prev_4", "title": "Automation", "description": "Implement automated recovery and self-healing systems", "estimatedTime": "3 weeks", "responsible": "Automation Team", "priority": "medium"}' : ''}${preventiveCount > 4 ? ',\n    {"id": "prev_5", "title": "Compliance Review", "description": "Audit procedures and ensure regulatory compliance", "estimatedTime": "2 weeks", "responsible": "Compliance Team", "priority": "low"}' : ''}
  ],
  "responsibleTeam": "Operations Team"
}`;

    // Generate SOP using the working model
    console.log('Generating SOP with prompt length:', prompt.length);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log('Received response from Gemini, length:', text.length);

    // Parse the JSON response with robust handling
    let sopData;
    try {
      // Clean the response - remove markdown, code blocks, and extra whitespace
      let cleanText = text.trim();
      
      // Remove code block markers
      cleanText = cleanText.replace(/```json\s*/g, '');
      cleanText = cleanText.replace(/```\s*/g, '');
      
      // Find JSON object if it's embedded in other text
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanText = jsonMatch[0];
      }
      
      console.log('Attempting to parse cleaned JSON:', cleanText.substring(0, 200) + '...');
      sopData = JSON.parse(cleanText);
      
      // Validate that required fields exist
      if (!sopData.title || !sopData.immediateSteps || !sopData.preventiveActions) {
        throw new Error('Missing required SOP fields');
      }
      
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Raw Gemini response:', text);
      
      // Return a fallback SOP instead of failing
      sopData = {
        title: `SOP: ${incident.type} Response Procedure`,
        trigger: `When ${incident.type.toLowerCase()} occurs affecting system operations`,
        immediateSteps: [
          {
            id: "step_1",
            title: "Immediate Assessment",
            description: `Assess the scope and impact of the ${incident.type.toLowerCase()}`,
            estimatedTime: "5 minutes",
            responsible: "Operations Team",
            priority: "high"
          },
          {
            id: "step_2", 
            title: "Execute Actions",
            description: `Implement the following actions: ${incident.actionsTaken.join(', ')}`,
            estimatedTime: "15 minutes",
            responsible: "Technical Team", 
            priority: "high"
          },
          {
            id: "step_3",
            title: "Verify Resolution",
            description: "Confirm that the incident has been resolved and systems are operational",
            estimatedTime: "10 minutes",
            responsible: "Operations Team",
            priority: "high"
          }
        ],
        preventiveActions: [
          {
            id: "prev_1",
            title: "System Monitoring",
            description: "Implement enhanced monitoring to prevent similar incidents",
            estimatedTime: "2 hours", 
            responsible: "DevOps Team",
            priority: "medium"
          },
          {
            id: "prev_2",
            title: "Process Documentation",
            description: "Document lessons learned and update procedures",
            estimatedTime: "1 hour",
            responsible: "Operations Team",
            priority: "low"
          }
        ],
        responsibleTeam: "Operations Team"
      };
    }

    // Create the complete SOP object
    const sop: SOP = {
      id: incident.id,
      title: sopData.title,
      trigger: sopData.trigger,
      immediateSteps: sopData.immediateSteps.map((step: any, index: number) => ({
        ...step,
        id: step.id || `immediate_${index + 1}`,
      })),
      preventiveActions: sopData.preventiveActions.map((step: any, index: number) => ({
        ...step,
        id: step.id || `preventive_${index + 1}`,
      })),
      responsibleTeam: sopData.responsibleTeam,
      severity: incident.severity,
      incidentType: incident.type,
      createdAt: new Date().toISOString(),
    };

    // Store the incident and SOP (in a real app, this would go to a database)
    // For now, we'll just return the SOP
    
    return NextResponse.json(sop);
  } catch (error: any) {
    console.error('Error generating SOP:', error);
    
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();
      
      if (errorMessage.includes('api key') || errorMessage.includes('unauthorized') || errorMessage.includes('invalid key')) {
        return NextResponse.json(
          { error: 'Invalid API key. Please check your GEMINI_API_KEY configuration.' },
          { status: 401 }
        );
      }
      
      if (errorMessage.includes('quota') || errorMessage.includes('limit')) {
        return NextResponse.json(
          { error: 'API quota exceeded. Please try again later or check your Gemini API usage limits.' },
          { status: 429 }
        );
      }
      
      if (errorMessage.includes('model') && errorMessage.includes('not found')) {
        return NextResponse.json(
          { error: 'AI model temporarily unavailable. Please try again in a few minutes.' },
          { status: 503 }
        );
      }
      
      if (errorMessage.includes('network') || errorMessage.includes('timeout')) {
        return NextResponse.json(
          { error: 'Network connection issue. Please check your internet connection and try again.' },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to generate SOP. Please try again. If the problem persists, check your API configuration.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'SOP Generator API is running' },
    { status: 200 }
  );
}
