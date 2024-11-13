// generateSecrets.js
// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path');
// eslint-disable-next-line @typescript-eslint/no-require-imports

// Function to manually load environment variables from a .env file
if(process.env.NODE_ENV !== 'production') {
  function loadEnv(filePath) {
    const envFileContent = fs.readFileSync(filePath, 'utf8');
    const lines = envFileContent.split('\n');

    lines.forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        process.env[key.trim()] = removeSurroundingQuotes(value.trim());
      }
    });
  }

  // Function to remove surrounding quotes if present
  function removeSurroundingQuotes(value) {
    if (value.startsWith('"') && value.endsWith('"')) {
      return value.slice(1, -1);
    }
    return value;
  }
  // Load environment variables from .env file
  loadEnv(path.join(__dirname, '.env'));
}



const secrets = {
  type: process.env.GOOGLE_SERVICE_ACCOUNT_TYPE,
  project_id: process.env.GOOGLE_SERVICE_ACCOUNT_PROJECT_ID,
  private_key_id: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY_ID,
  private_key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,
  client_email: process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL,
  client_id: process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_ID,
  auth_uri: process.env.GOOGLE_SERVICE_ACCOUNT_AUTH_URI,
  token_uri: process.env.GOOGLE_SERVICE_ACCOUNT_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.GOOGLE_SERVICE_ACCOUNT_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_X509_CERT_URL,
  universe_domain: process.env.GOOGLE_SERVICE_ACCOUNT_UNIVERSE_DOMAIN,
};

const filePath = path.join(__dirname, './secrets.json');

fs.writeFileSync(filePath, JSON.stringify(secrets, null, 2));

console.log('secrets.json file has been generated.');