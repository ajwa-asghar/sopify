import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Startup check (dev mode only)
if (process.env.NODE_ENV === 'development' && !process.env.GEMINI_API_KEY) {
  console.error('⚠️  Gemini API key missing. Check Railway env variables.');
}

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    // Validate API key exists
    if (!process.env.GEMINI_API_KEY) {
      console.error('Missing GEMINI_API_KEY environment variable');
      return NextResponse.json(
        { error: 'AI service not configured. Please add GEMINI_API_KEY to your Railway environment variables.' },
        { status: 500 }
      );
    }

    // Initialize Gemini AI inside the handler to ensure env var is available
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.8,
        maxOutputTokens: 1024,
      }
    });

    const prompt = `You are an expert assistant helping with Standard Operating Procedures and incident management.

Question: ${message}

Provide a clear, helpful response about SOPs, incident response, or operational procedures. Keep it practical and actionable.`;

    console.log('Chatbot: Sending prompt to Gemini...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('Chatbot: Received response length:', text?.length || 0);
    
    if (!text || text.trim().length === 0) {
      // Provide specific answers for common SOP questions
      const lowerMessage = message.toLowerCase();
      let fallbackResponse;
      
      if (lowerMessage.includes('key component') || lowerMessage.includes('effective sop')) {
        fallbackResponse = `Key components of an effective SOP include:

• **Clear Purpose** - Define why the procedure exists and its scope
• **Step-by-Step Instructions** - Detailed, sequential actions anyone can follow
• **Roles & Responsibilities** - Who does what and when
• **Decision Points** - What to do if something goes wrong
• **Tools & Resources** - Required equipment, software, or documentation
• **Quality Checks** - How to verify the procedure was completed correctly
• **Review Process** - Regular updates and improvement cycles

SOPify helps create these structured procedures automatically from incident reports.`;
      } else if (lowerMessage.includes('incident') || lowerMessage.includes('emergency')) {
        fallbackResponse = `For incident management, follow these key principles:

• **Immediate Response** - Assess severity and contain the issue
• **Communication** - Notify stakeholders and document actions taken
• **Investigation** - Identify root cause and contributing factors  
• **Resolution** - Implement fix and verify system restoration
• **Prevention** - Update procedures to prevent recurrence
• **Documentation** - Create or update SOPs based on lessons learned

SOPify automates this process by converting incidents into structured SOPs.`;
      } else if (lowerMessage.includes('compliance') || lowerMessage.includes('regulation')) {
        fallbackResponse = `Compliance requirements for SOPs typically include:

• **Documentation Standards** - Proper version control and approval processes
• **Training Records** - Evidence that staff are trained on procedures
• **Regular Reviews** - Scheduled updates and effectiveness assessments
• **Audit Trails** - Clear records of when and why changes were made
• **Access Controls** - Ensuring procedures are available to authorized personnel
• **Performance Metrics** - Measuring adherence and effectiveness

SOPify helps maintain compliance through automated documentation and tracking.`;
      } else {
        fallbackResponse = `I can help with Standard Operating Procedures and incident management.

Common topics I assist with:
• **SOP Development** - Creating effective, step-by-step procedures
• **Incident Response** - Managing and learning from operational issues  
• **Process Improvement** - Optimizing workflows and reducing errors
• **Compliance** - Meeting regulatory and audit requirements
• **Team Training** - Ensuring consistent procedure execution

What specific aspect would you like to explore?`;
      }
      
      return NextResponse.json({ response: fallbackResponse });
    }

    return NextResponse.json({ response: text });
  } catch (error: any) {
    console.error('Chatbot error:', error);
    return NextResponse.json(
      { error: 'Failed to process your question. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'SOPify AI Assistant is ready' },
    { status: 200 }
  );
}
