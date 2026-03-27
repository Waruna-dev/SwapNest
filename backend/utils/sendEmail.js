import { Resend } from 'resend';

// Initialize Resend with your API key from the .env file
const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (options) => {
  try {
    const data = await resend.emails.send({
      // IMPORTANT FOR TESTING: Until you verify a real domain name later, 
      // Resend requires you to send FROM this specific onboarding address.
      from: 'SwapNest <onboarding@resend.dev>',
      
      to: options.email, 
      subject: options.subject,
      text: options.message,
    });

    return data;
  } catch (error) {
    console.error('Error sending email via Resend:', error);
    throw new Error('Email could not be sent');
  }
};

export default sendEmail;