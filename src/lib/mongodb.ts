import { MongoClient, ServerApiVersion, Db } from 'mongodb';

const uri = process.env.MONGODB_URI?.trim();
const dbName = process.env.MONGODB_DB_NAME?.trim();

if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env and ensure it is not empty.');
}
if (!dbName) {
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
  if (process.env.NODE_ENV === 'development') {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    if (!global._mongoClientPromise) {
      if (!uri) { // Double check uri after potential trim
        throw new Error('MONGODB_URI is missing or empty after trim in development.');
      }
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
  } else {
    // In production mode, it's best to not use a global variable.
    if (!uri) { // Double check uri after potential trim
      throw new Error('MONGODB_URI is missing or empty after trim in production.');
    }
    client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      }
    });
    await client.connect();
  }
  if (!dbName) { // Double check dbName after potential trim
      throw new Error('MONGODB_DB_NAME is missing or empty after trim.');
  }
  dbInstance = client.db(dbName);
  return { client, db: dbInstance };
}
