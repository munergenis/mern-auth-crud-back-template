const getEnv = (key: string, defaultValue?: string): string => {
  const value = process.env[key] ?? defaultValue;

  if (value === undefined) {
    throw new Error(`Missing environment variable ${key}`);
  }

  return value;
};

export const NODE_ENV = getEnv('NODE_ENV', 'development');
export const PORT = getEnv('PORT', '4004');
export const MONGO_URI = getEnv('MONGO_URI');
export const APP_ORIGIN = getEnv('APP_ORIGIN');
export const JWT_SECRET = getEnv('JWT_SECRET');
export const JWT_REFRESH_SECRET = getEnv('JWT_REFRESH_SECRET');
// export const EMAIL_SENDER = getEnv('EMAIL_SENDER');
// export const RESEND_API_KEY = getEnv('RESEND_API_KEY');
export const BREVO_SMTP_HOST = getEnv('BREVO_SMTP_HOST');
export const BREVO_SMTP_PORT = getEnv('BREVO_SMTP_PORT');
export const BREVO_SMTP_USER = getEnv('BREVO_SMTP_USER');
export const BREVO_SMTP_PASS = getEnv('BREVO_SMTP_PASS');
export const BREVO_SMTP_FROM_MAIL = getEnv('BREVO_SMTP_FROM_MAIL');
export const BREVO_SMTP_FROM_NAME = getEnv('BREVO_SMTP_FROM_NAME');
