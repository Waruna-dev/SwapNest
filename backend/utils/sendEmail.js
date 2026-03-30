import { Resend } from 'resend';

// Use dummy key if RESEND_API_KEY is not set to prevent crashes
const resendApiKey = process.env.RESEND_API_KEY || 're_dummy_key_for_testing';
const resend = new Resend(resendApiKey);

const sendEmail = async (options) => {
  try {
    // If using dummy key, just log and return success
    if (!process.env.RESEND_API_KEY) {
      console.log('Email service not configured. Email functionality disabled.');
      return { success: false, message: 'Email service not configured' };
    }

    const data = await resend.emails.send({
      from: 'SwapNest <onboarding@resend.dev>',
      to: options.email, 
      subject: options.subject,
      html: options.html, 
    });

    return data;
  } catch (error) {
    console.error('Error sending email via Resend:', error);
    throw new Error('Email could not be sent');
  }
};

export default sendEmail;