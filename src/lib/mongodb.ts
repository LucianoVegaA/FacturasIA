import { MongoClient, ServerApiVersion, Db } from 'mongodb';

// Centralized environment validation
function validateEnvironment() {
  const uri = process.env.MONGODB_URI?.trim();
  const dbName = process.env.MONGODB_DB_NAME?.trim();
  
  if (!uri) {
    const error = new Error('MONGODB_URI environment variable is required');
    console.error('[MongoDB] Missing MONGODB_URI');
    console.error('[MongoDB] Available env vars:', Object.keys(process.env).filter(k => k.includes('MONGO')));
    throw error;
  }
  
  if (!dbName) {
    const error = new Error('MONGODB_DB_NAME environment variable is required');
    console.error('[MongoDB] Missing MONGODB_DB_NAME');
    throw error;
  }
  
  return { uri, dbName };
}

// Global variables for connection management
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;
let connectionPromise: Promise<{ client: MongoClient, db: Db }> | null = null;

// In development mode, use a global variable so that the MongoClient instance is preserved
// across HMR reloads.
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

export async function connectToDatabase(): Promise<{ client: MongoClient, db: Db }> {
  // Return cached connection if available
  if (cachedClient && cachedDb) {
    try {
      await cachedClient.db('admin').command({ ping: 1 });
      return { client: cachedClient, db: cachedDb };
    } catch (error) {
      console.log('[MongoDB] Cached connection failed ping, reconnecting...');
      cachedClient = null;
      cachedDb = null;
    }
  }

  // Return existing connection promise if in progress
  if (connectionPromise) {
    console.log('[MongoDB] Connection already in progress, waiting...');
    return await connectionPromise;
  }

  // Create new connection
  connectionPromise = createConnection();
  
  try {
    const result = await connectionPromise;
    connectionPromise = null;
    return result;
  } catch (error) {
    connectionPromise = null;
    throw error;
  }
}

async function createConnection(): Promise<{ client: MongoClient, db: Db }> {
  const { uri, dbName } = validateEnvironment();
  
  console.log(`[MongoDB] Creating new connection (${process.env.NODE_ENV} mode)`);
  
  const clientOptions = {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
    // Production-optimized settings
    maxPoolSize: process.env.NODE_ENV === 'production' ? 20 : 10,
    minPoolSize: 5,
    maxIdleTimeMS: 30000,
    serverSelectionTimeoutMS: 15000,
    connectTimeoutMS: 15000,
    heartbeatFrequencyMS: 10000,
    retryWrites: true,
    retryReads: true,
  };

  if (process.env.NODE_ENV === 'development') {
    // In development mode, use a global variable for HMR compatibility
    if (!global._mongoClientPromise) {
      console.log('[MongoDB] Creating new development client');
      const client = new MongoClient(uri, clientOptions);
      global._mongoClientPromise = client.connect();
    }
    
    const client = await global._mongoClientPromise;
    const db = client.db(dbName);
    
    // Verify connection
    await db.admin().command({ ping: 1 });
    console.log('[MongoDB] Development connection verified');
    
    // Cache for reuse
    cachedClient = client;
    cachedDb = db;
    
    return { client, db };
  } else {
    // Production mode - create fresh connection
    console.log('[MongoDB] Creating production client');
    const client = new MongoClient(uri, clientOptions);
    
    // Connect with timeout
    const timeoutMs = 20000;
    const connectPromise = client.connect();
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`MongoDB connection timeout after ${timeoutMs}ms`)), timeoutMs);
    });
    
    await Promise.race([connectPromise, timeoutPromise]);
    
    const db = client.db(dbName);
    
    // Verify connection
    await db.admin().command({ ping: 1 });
    console.log('[MongoDB] Production connection verified');
    
    // Cache for reuse
    cachedClient = client;
    cachedDb = db;
    
    return { client, db };
  }
}

// Graceful shutdown
export async function closeConnection(): Promise<void> {
  if (cachedClient) {
    console.log('[MongoDB] Closing connection');
    await cachedClient.close();
    cachedClient = null;
    cachedDb = null;
  }
}

// Health check function
export async function checkConnection(): Promise<boolean> {
  try {
    if (!cachedClient || !cachedDb) {
      return false;
    }
    await cachedClient.db('admin').command({ ping: 1 });
    return true;
  } catch (error) {
    console.error('[MongoDB] Health check failed:', error);
    return false;
  }
}
