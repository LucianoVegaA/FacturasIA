import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('[ENV API] Environment debug endpoint called');
    
    // Gather environment information
    const envInfo = {
      nodeEnv: process.env.NODE_ENV,
      platform: process.platform,
      nodeVersion: process.version,
      cwd: process.cwd(),
      
      // MongoDB info (sanitized)
      mongodb: {
        uriExists: !!process.env.MONGODB_URI,
        uriLength: process.env.MONGODB_URI?.length || 0,
        uriStartsWith: process.env.MONGODB_URI?.substring(0, 15) + '...' || 'undefined',
        dbName: process.env.MONGODB_DB_NAME || 'undefined',
        protocol: process.env.MONGODB_URI?.match(/^[^:]+:/)?.[0] || 'unknown'
      },
      
      // Azure info
      azure: {
        clientId: process.env.NEXT_PUBLIC_AZURE_AD_CLIENT_ID || 'undefined',
        tenantId: process.env.NEXT_PUBLIC_AZURE_AD_TENANT_ID || 'undefined'
      },
      
      // Environment variables counts
      stats: {
        totalEnvVars: Object.keys(process.env).length,
        mongoRelatedVars: Object.keys(process.env).filter(key => key.includes('MONGO')).length,
        azureRelatedVars: Object.keys(process.env).filter(key => key.includes('AZURE')).length,
        nextPublicVars: Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC_')).length
      },
      
      // List of variable names (no values for security)
      variableNames: {
        mongo: Object.keys(process.env).filter(key => key.includes('MONGO')),
        azure: Object.keys(process.env).filter(key => key.includes('AZURE')),
        nextPublic: Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC_')),
        deployment: Object.keys(process.env).filter(key => 
          key.includes('WEBSITE') || key.includes('PORT') || key.includes('HOST')
        )
      },
      
      timestamp: new Date().toISOString()
    };
    
    // Log to server console as well
    console.log('[ENV API] Environment Info:', JSON.stringify(envInfo, null, 2));
    
    return NextResponse.json(envInfo);
    
  } catch (error: any) {
    console.error('[ENV API] Error gathering environment info:', error);
    
    return NextResponse.json({ 
      error: 'Failed to gather environment information',
      message: error?.message || 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}