import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Startup check (dev mode only)
if (process.env.NODE_ENV === 'development' && !process.env.GEMINI_API_KEY) {
  console.error('⚠️  Gemini API key missing. Check Railway env variables.');
}

export async function GET() {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.error('Missing GEMINI_API_KEY environment variable');
      return NextResponse.json(
        { 
          status: 'error', 
          message: 'GEMINI_API_KEY not found in environment variables',
          solution: 'Please add GEMINI_API_KEY to your Railway environment variables'
        },
        { status: 500 }
      );
    }

    if (!process.env.GEMINI_API_KEY.startsWith('AIza')) {
      console.error('Invalid GEMINI_API_KEY format');
      return NextResponse.json(
        { 
          status: 'error', 
          message: 'Invalid API key format',
          solution: 'Gemini API keys should start with "AIza". Please check your Railway environment variables.'
        },
        { status: 500 }
      );
    }

    // Initialize Gemini AI inside the handler to ensure env var is available
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Use current available Gemini models (as of 2025)
    const modelsToTry = [
      'gemini-2.5-flash',
      'gemini-2.0-flash', 
      'gemini-2.5-pro',
      'gemini-2.0-flash-001',
      'gemini-2.5-flash-lite',
      'gemini-2.0-flash-lite'
    ];
    
    let model;
    let testResult;
    let workingModel = '';
    let modelErrors: string[] = [];
    
    for (const modelName of modelsToTry) {
      try {
        console.log(`Trying model: ${modelName}`);
        model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Say "Hello SOPify!" if you can read this.');
        const response = await result.response;
        testResult = response.text();
        workingModel = modelName;
        console.log(`Success with model: ${modelName}`);
        break; // Success, exit loop
      } catch (error: any) {
        const errorMsg = `${modelName}: ${error.message}`;
        modelErrors.push(errorMsg);
        console.log(`Model ${modelName} failed:`, error.message);
        continue; // Try next model
      }
    }
    
    if (!testResult) {
      return NextResponse.json(
        { 
          status: 'error', 
          message: 'All Gemini models failed',
          error: 'No available models found',
          modelsAttempted: modelsToTry,
          modelErrors: modelErrors,
          apiKey: `${process.env.GEMINI_API_KEY.substring(0, 10)}...`,
          solution: 'Your API key may not have access to any Gemini models, or Google may have updated their model names. Please check Google AI Studio settings and ensure the API key has Gemini API access.'
        },
        { status: 503 }
      );
    }

    return NextResponse.json({
      status: 'success',
      message: 'Gemini API is working correctly',
      workingModel: workingModel,
      testResponse: testResult,
      apiKeyStatus: 'valid'
    });

  } catch (error: any) {
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Failed to test Gemini API',
        error: error.message,
        solution: 'Check your API key and internet connection'
      },
      { status: 500 }
    );
  }
}
