import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const sendEmail = async (options) => {
  if (!resend) {
    console.log('Email service not configured - skipping email send');
    return { success: true, message: 'Email service not configured' };
  }

  try {
    const data = await resend.emails.send({
      from: 'SwapNest <onboarding@resend.dev>',
      to: options.email, 
      subject: options.subject,
      // CHANGED: We swapped 'text' for 'html'
      html: options.html, 
    });

    return data;
  } catch (error) {
    console.error('Error sending email via Resend:', error);
    throw new Error('Email could not be sent');
  }
};

export default sendEmail;