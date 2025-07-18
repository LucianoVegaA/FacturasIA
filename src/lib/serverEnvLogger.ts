// Server-side environment variable logger
export function logServerEnvironment() {
  console.log('='.repeat(60));
  console.log('[SERVER ENV DEBUG] SERVER-SIDE ENVIRONMENT VARIABLES');
  console.log('='.repeat(60));
  
  // General environment info
  console.log('[SERVER ENV DEBUG] Runtime Environment:');
  console.log('[SERVER ENV DEBUG] NODE_ENV:', process.env.NODE_ENV);
  console.log('[SERVER ENV DEBUG] Platform:', process.platform);
  console.log('[SERVER ENV DEBUG] Node version:', process.version);
  console.log('[SERVER ENV DEBUG] Current working directory:', process.cwd());
  console.log('');
  
  // MongoDB variables (server-side only)
  console.log('[SERVER ENV DEBUG] MongoDB Variables:');
  console.log('[SERVER ENV DEBUG] MONGODB_URI exists:', !!process.env.MONGODB_URI);
  console.log('[SERVER ENV DEBUG] MONGODB_URI length:', process.env.MONGODB_URI?.length || 0);
  
  if (process.env.MONGODB_URI) {
    const uri = process.env.MONGODB_URI;
    // Safe logging - show protocol and first part, hide credentials
    const protocolMatch = uri.match(/^[^:]+:/);
    const hostMatch = uri.match(/@([^/]+)/);
    console.log('[SERVER ENV DEBUG] MONGODB_URI protocol:', protocolMatch?.[0] || 'unknown');
    console.log('[SERVER ENV DEBUG] MONGODB_URI host:', hostMatch?.[1] || 'unknown');
    console.log('[SERVER ENV DEBUG] MONGODB_URI starts with:', uri.substring(0, 15) + '...');
  }
  
  console.log('[SERVER ENV DEBUG] MONGODB_DB_NAME:', process.env.MONGODB_DB_NAME || 'undefined');
  console.log('');
  
  // Azure variables (server-side perspective)
  console.log('[SERVER ENV DEBUG] Azure Variables (Server Side):');
  console.log('[SERVER ENV DEBUG] NEXT_PUBLIC_AZURE_AD_CLIENT_ID:', process.env.NEXT_PUBLIC_AZURE_AD_CLIENT_ID || 'undefined');
  console.log('[SERVER ENV DEBUG] NEXT_PUBLIC_AZURE_AD_TENANT_ID:', process.env.NEXT_PUBLIC_AZURE_AD_TENANT_ID || 'undefined');
  console.log('');
  
  // All environment variables count
  const totalEnvVars = Object.keys(process.env).length;
  console.log('[SERVER ENV DEBUG] Total environment variables:', totalEnvVars);
  
  // MongoDB-related variables
  const mongoVars = Object.keys(process.env).filter(key => 
    key.includes('MONGO') || key.includes('DB')
  );
  console.log('[SERVER ENV DEBUG] Database-related variables:', mongoVars.length);
  mongoVars.forEach(key => {
    const value = process.env[key];
    if (key.includes('URI') && value) {
      console.log(`[SERVER ENV DEBUG] ${key}: ${value.substring(0, 20)}... (${value.length} chars)`);
    } else {
      console.log(`[SERVER ENV DEBUG] ${key}: ${value || 'undefined'}`);
    }
  });
  
  // Azure-related variables
  const azureVars = Object.keys(process.env).filter(key => 
    key.includes('AZURE') || key.includes('MSAL')
  );
  console.log('');
  console.log('[SERVER ENV DEBUG] Azure-related variables:', azureVars.length);
  azureVars.forEach(key => {
    console.log(`[SERVER ENV DEBUG] ${key}: ${process.env[key] || 'undefined'}`);
  });
  
  // Deployment-specific variables (common in production environments)
  const deploymentVars = Object.keys(process.env).filter(key => 
    key.includes('WEBSITE') || key.includes('PORT') || key.includes('HOST')
  );
  if (deploymentVars.length > 0) {
    console.log('');
    console.log('[SERVER ENV DEBUG] Deployment-related variables:', deploymentVars.length);
    deploymentVars.forEach(key => {
      console.log(`[SERVER ENV DEBUG] ${key}: ${process.env[key] || 'undefined'}`);
    });
  }
  
  console.log('='.repeat(60));
  console.log('[SERVER ENV DEBUG] END SERVER-SIDE ENVIRONMENT DEBUG');
  console.log('='.repeat(60));
}