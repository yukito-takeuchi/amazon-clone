import { Resend } from 'resend';

// Initialize Resend client
export const resend = new Resend(process.env.RESEND_API_KEY);

console.log('📧 Resend Configuration:');
console.log('  - API Key:', process.env.RESEND_API_KEY ? 'Provided ✓' : 'Missing ✗');
console.log('  - From Email:', process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev');
console.log('  - Email Enabled:', process.env.EMAIL_ENABLED === 'true' ? 'Yes' : 'No');
