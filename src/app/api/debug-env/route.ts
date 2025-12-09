import { NextResponse } from 'next/server';

export async function GET() {
  // Debug endpoint to check environment variables
  const possibleKeys = [
    'GEMINI_API_KEY',
    'GEMINIAPIKEY', 
    'gemini_api_key',
    'GOOGLE_GEMINI_API_KEY'
  ];
  
  const foundKey = possibleKeys.find(key => !!process.env[key]);
  const apiKey = foundKey ? process.env[foundKey] : null;
  
  const hasKey = !!apiKey;
  const keyLength = apiKey?.length || 0;
  const keyPrefix = apiKey?.substring(0, 10) || 'NOT_SET';
  const nodeEnv = process.env.NODE_ENV;
  const port = process.env.PORT;
  const railwayEnv = process.env.RAILWAY_ENVIRONMENT;
  
  // Get all env vars
  const allEnvKeys = Object.keys(process.env).sort();
  const geminiVars = allEnvKeys
    .filter(key => key.includes('GEMINI') || key.includes('API') || key.includes('KEY'))
    .map(key => ({
      name: key,
      hasValue: !!process.env[key],
      length: process.env[key]?.length || 0,
      prefix: process.env[key]?.substring(0, 15) || 'NOT_SET',
      isValid: process.env[key]?.startsWith('AIza') || false
    }));

  return NextResponse.json({
    status: hasKey ? 'FOUND' : 'MISSING',
    message: hasKey 
      ? `✅ GEMINI_API_KEY is available (found as: ${foundKey})` 
      : '❌ GEMINI_API_KEY is NOT available',
    details: {
      foundKeyName: foundKey || null,
      hasKey,
      keyLength,
      keyPrefix: keyPrefix + '...',
      keyValid: apiKey?.startsWith('AIza') || false,
      nodeEnv,
      port,
      railwayEnv,
      totalEnvVars: allEnvKeys.length,
      checkedKeys: possibleKeys.map(k => ({
        name: k,
        exists: !!process.env[k],
        value: process.env[k] ? `${process.env[k]?.substring(0, 10)}...` : null
      })),
      allGeminiVars: geminiVars,
      sampleEnvKeys: allEnvKeys.slice(0, 20) // First 20 for debugging
    },
    instructions: hasKey 
      ? '✅ API key is configured correctly! The issue might be elsewhere.' 
      : '❌ Please verify in Railway:\n1. Variable name is exactly "GEMINI_API_KEY"\n2. Variable is under "Service Variables" (not project-level)\n3. Value starts with "AIzaSy..."\n4. Click "Redeploy" or restart the service after adding the variable'
  }, {
    status: hasKey ? 200 : 500
  });
}


