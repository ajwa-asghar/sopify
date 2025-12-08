import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY not found' },
        { status: 500 }
      );
    }

    // Make direct API call to list models
    const response = await fetch('https://generativelanguage.googleapis.com/v1/models?key=' + process.env.GEMINI_API_KEY);
    
    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { 
          error: 'Failed to list models',
          status: response.status,
          message: errorText
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Filter for models that support generateContent
    const generateContentModels = data.models?.filter((model: any) => 
      model.supportedGenerationMethods?.includes('generateContent')
    ) || [];

    return NextResponse.json({
      status: 'success',
      totalModels: data.models?.length || 0,
      generateContentModels: generateContentModels.map((model: any) => ({
        name: model.name.replace('models/', ''),
        displayName: model.displayName,
        description: model.description,
        supportedMethods: model.supportedGenerationMethods
      })),
      rawData: data
    });

  } catch (error: any) {
    return NextResponse.json(
      { 
        error: 'Failed to fetch models',
        message: error.message 
      },
      { status: 500 }
    );
  }
}
