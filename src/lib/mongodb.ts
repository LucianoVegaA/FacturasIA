import { MongoClient, ServerApiVersion, Db } from 'mongodb';

const uri = process.env.MONGODB_URI?.trim();
const dbName = process.env.MONGODB_DB_NAME?.trim();

console.log('[MongoDB] Environment check:', {
  NODE_ENV: process.env.NODE_ENV,
  MONGODB_URI_EXISTS: !!uri,
  MONGODB_DB_NAME_EXISTS: !!dbName,
  MONGODB_URI_LENGTH: uri?.length || 0,
  MONGODB_DB_NAME_VALUE: dbName // Safe to log DB name
});

if (!uri) {
  console.error('[MongoDB] Missing MONGODB_URI environment variable');
  console.error('[MongoDB] Available environment variables:', Object.keys(process.env).filter(key => key.includes('MONGO')));
  throw new Error('Please define the MONGODB_URI environment variable inside .env and ensure it is not empty.');
}
if (!dbName) {
  console.error('[MongoDB] Missing MONGODB_DB_NAME environment variable');
  throw new Error('Please define the MONGODB_DB_NAME environment variable inside .env and ensure it is not empty.');
}

let client: MongoClient | null = null;
let dbInstance: Db | null = null;

// In development mode, use a global variable so that the MongoClient instance is preserved
// across HMR reloads.
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

export async function connectToDatabase(): Promise<{ client: MongoClient, db: Db }> {
  try {
    console.log(`[MongoDB] Connecting to database in ${process.env.NODE_ENV} mode...`);
    
    if (process.env.NODE_ENV === 'development') {
      // In development mode, use a global variable so that the value
      // is preserved across module reloads caused by HMR (Hot Module Replacement).
      if (!global._mongoClientPromise) {
        if (!uri) { // Double check uri after potential trim
          throw new Error('MONGODB_URI is missing or empty after trim in development.');
        }
        console.log('[MongoDB] Creating new client for development...');
        client = new MongoClient(uri, {
          serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
          }
        });
        global._mongoClientPromise = client.connect();
      }
      client = await global._mongoClientPromise;
      console.log('[MongoDB] Connected successfully in development mode');
    } else {
      // In production mode, it's best to not use a global variable.
      if (!uri) { // Double check uri after potential trim
        throw new Error('MONGODB_URI is missing or empty after trim in production.');
      }
      console.log('[MongoDB] Creating new client for production...');
      client = new MongoClient(uri, {
        serverApi: {
          version: ServerApiVersion.v1,
          strict: true,
          deprecationErrors: true,
        }
      });
      await client.connect();
      console.log('[MongoDB] Connected successfully in production mode');
    }
    
    if (!dbName) { // Double check dbName after potential trim
        throw new Error('MONGODB_DB_NAME is missing or empty after trim.');
    }
    
    dbInstance = client.db(dbName);
    console.log(`[MongoDB] Database instance created for: ${dbName}`);
    
    return { client, db: dbInstance };
  } catch (error: any) {
    console.error('[MongoDB] Connection failed:', error);
    console.error('[MongoDB] Error details:', {
      message: error.message,
      code: error.code,
      name: error.name
    });
    throw error;
  }
}
