import { NextResponse } from 'next/server';

export async function GET() {
  // Debug endpoint to check environment variables (DO NOT USE IN PRODUCTION)
  const hasKey = !!process.env.GEMINI_API_KEY;
  const keyLength = process.env.GEMINI_API_KEY?.length || 0;
  const keyPrefix = process.env.GEMINI_API_KEY?.substring(0, 10) || 'NOT_SET';
  const nodeEnv = process.env.NODE_ENV;
  
  // Get all env vars that start with GEMINI
  const geminiVars = Object.keys(process.env)
    .filter(key => key.includes('GEMINI'))
    .map(key => ({
      name: key,
      hasValue: !!process.env[key],
      length: process.env[key]?.length || 0,
      prefix: process.env[key]?.substring(0, 10) || 'NOT_SET'
    }));

  return NextResponse.json({
    status: hasKey ? 'FOUND' : 'MISSING',
    message: hasKey 
      ? 'GEMINI_API_KEY is available' 
      : 'GEMINI_API_KEY is NOT available',
    details: {
      hasKey,
      keyLength,
      keyPrefix: keyPrefix + '...',
      nodeEnv,
      allGeminiVars: geminiVars,
      allEnvKeys: Object.keys(process.env).filter(k => k.includes('GEMINI') || k.includes('NODE'))
    },
    instructions: hasKey 
      ? 'API key is configured correctly!' 
      : 'Please add GEMINI_API_KEY to Railway environment variables and redeploy.'
  }, {
    status: hasKey ? 200 : 500
  });
}

