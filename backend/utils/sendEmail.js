import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (options) => {
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