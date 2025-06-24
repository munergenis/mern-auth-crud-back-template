import resend from '../../config/resend';
import { NODE_ENV, EMAIL_SENDER } from '../constants/env';

interface Params {
  html: string;
  subject: string;
  text: string;
  to: string;
}

const getFromEmail = () =>
  NODE_ENV === 'development' ? 'onboarding@resend.dev' : EMAIL_SENDER;
const getToEmail = (to: string) =>
  NODE_ENV === 'development' ? 'delivered@resend.dev' : to;

export const sendMail = async ({ html, subject, text, to }: Params) => {
  return await resend.emails.send({
    from: getFromEmail(),
    html,
    subject,
    text,
    to: getToEmail(to),
  });
};
