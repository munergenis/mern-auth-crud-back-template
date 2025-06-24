import {
  BREVO_SMTP_HOST,
  BREVO_SMTP_PORT,
  BREVO_SMTP_USER,
  BREVO_SMTP_PASS,
  BREVO_SMTP_FROM_MAIL,
  BREVO_SMTP_FROM_NAME,
} from '../constants/env';
import nodemailer from 'nodemailer';

interface Params {
  html: string;
  subject: string;
  text: string;
  to: string;
}

// const getFromEmail = () =>
//   NODE_ENV === 'development' ? 'onboarding@resend.dev' : EMAIL_SENDER;
// const getToEmail = (to: string) =>
//   NODE_ENV === 'development' ? 'delivered@resend.dev' : to;

// export const sendMail = async ({ html, subject, text, to }: Params) => {
//   return await resend.emails.send({
//     from: getFromEmail(),
//     html,
//     subject,
//     text,
//     to: getToEmail(to),
//   });
// };

const transporter = nodemailer.createTransport({
  host: BREVO_SMTP_HOST,
  port: Number(BREVO_SMTP_PORT),
  auth: {
    user: BREVO_SMTP_USER,
    pass: BREVO_SMTP_PASS,
  },
});

export const sendMail = async ({ html, subject, text, to }: Params) => {
  try {
    const info = await transporter.sendMail({
      from: `"${BREVO_SMTP_FROM_NAME}" <${BREVO_SMTP_FROM_MAIL}>`,
      to,
      subject,
      text,
      html,
    });
    return { error: null, data: info };
  } catch (error) {
    console.error('Error sending mail:', error);
    return { error, data: null };
  }
};
