import { SESClient } from '@aws-sdk/client-ses';

// Initialize SES client
export const sesClient = new SESClient({
  region: process.env.AWS_REGION || 'ap-northeast-1',
  credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
    ? {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      }
    : undefined, // Use IAM role if running on AWS
});

console.log('📧 SES Configuration:');
console.log('  - Region:', process.env.AWS_REGION || 'ap-northeast-1');
console.log('  - Credentials:', process.env.AWS_ACCESS_KEY_ID ? 'Provided' : 'IAM Role');
console.log('  - From Email:', process.env.SES_FROM_EMAIL || 'Not set');
