// File: utils/email.ts
import nodemailer from "nodemailer";

// Configure the email transporter with the provided environment variables.
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  secure: true, // use TLS, as port is 465
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Sends an email using the configured transporter.
 * @param options - The email options (to, subject, html).
 */
export const sendEmail = async (options: EmailOptions) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM, // e.g., "Focal <help.focaloptical@gmail.com>"
    to: options.to,
    subject: options.subject,
    html: options.html,
  };

  try {
    // Attempt to send the email
    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${options.to}`);
    return { success: true, message: "Email sent successfully." };
  } catch (error: any) {
    console.error("[sendEmail] Error sending email:", error);
    // Throw an error to be caught by the calling API route
    throw new Error(`Could not send email. ${error.message}`);
  }
};

/**
 * Constructs and sends a verification email to a new user.
 * @param email - The recipient's email address.
 * @param token - The verification token to include in the link.
 */
export const sendVerificationEmail = async (email: string, token: string) => {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify?token=${token}`;

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="text-align: center; color: #000;">Welcome to Focal Optical!</h2>
        <p>Thanks for signing up. Please verify your email address by clicking the link below to complete your registration.</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #000; color: #fff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-size: 16px;">
            Verify Your Email
          </a>
        </p>
        <p>If you did not create an account, no further action is required.</p>
        <p style="font-size: 0.9em; color: #777;">This link will expire in 1 hour.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;"/>
        <p style="font-size: 0.8em; color: #999;">
          If you're having trouble clicking the button, copy and paste the URL below into your web browser:<br/>
          <a href="${verificationUrl}" style="color: #007bff;">${verificationUrl}</a>
        </p>
      </div>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: "Verify your email address for Focal Optical",
    html: emailHtml,
  });
};
