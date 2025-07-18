import { NextRequest, NextResponse } from 'next/server';
import { checkConnection, connectToDatabase } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    console.log('[Health Check] Starting MongoDB health check...');
    
    // First try the quick health check
    const isHealthy = await checkConnection();
    
    if (isHealthy) {
      console.log('[Health Check] MongoDB connection is healthy');
      return NextResponse.json({ 
        status: 'healthy', 
        mongodb: 'connected',
        timestamp: new Date().toISOString(),
        message: 'MongoDB connection is working properly'
      });
    }
    
    // If quick check fails, try a full connection test
    console.log('[Health Check] Quick check failed, attempting full connection test...');
    
    const start = Date.now();
    const { db } = await connectToDatabase();
    
    // Test database operations
    await db.admin().command({ ping: 1 });
    await db.collection('Datos').countDocuments({}, { limit: 1 });
    
    const duration = Date.now() - start;
    
    console.log(`[Health Check] Full connection test successful (${duration}ms)`);
    
    return NextResponse.json({ 
      status: 'healthy', 
      mongodb: 'connected',
      responseTime: `${duration}ms`,
      timestamp: new Date().toISOString(),
      message: 'MongoDB connection restored and working properly'
    });
    
  } catch (error: any) {
    console.error('[Health Check] MongoDB health check failed:', error?.message || error);
    
    return NextResponse.json({ 
      status: 'unhealthy', 
      mongodb: 'disconnected',
      error: error?.message || 'Unknown database error',
      timestamp: new Date().toISOString(),
      message: 'MongoDB connection failed'
    }, { status: 503 });
  }
}