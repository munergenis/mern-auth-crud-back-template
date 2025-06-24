// Maximum number of password reset emails allowed per user within the defined time window
export const PASSWORD_RESET_EMAIL_RATE_LIMIT = 2;

// Time window (in minutes) during which the password reset email rate limit applies per user
export const PASSWORD_RESET_EMAIL_WINDOW_MINUTES = 5;

// Maximum number of email verification emails allowed per user within the defined time window
export const EMAIL_VERIFICATION_EMAIL_RATE_LIMIT = 3;

// Time window (in minutes) during which the email verification email rate limit applies per user
export const EMAIL_VERIFICATION_EMAIL_WINDOW_MINUTES = 10;

// Number of days a session remains valid before expiring
export const SESSION_DURATION_DAYS = 30;

// Number of days before an email verification code expires
export const EMAIL_VERIFICATION_CODE_DURATION_DAYS = 365;

// Number of hours before a password reset verification code expires
export const PASSWORD_RESET_VERIFICATION_CODE_DURATION_HOURS = 1;

// Number of hours before session expiry when a refresh is triggered
export const SESSION_REFRESH_THRESHOLD_HOURS = 24;

// Number of minutes an access token remains valid after being issued
export const ACCESS_TOKEN_DURATION_MINUTES = 15;

// Number of days a refresh token remains valid after being issued
export const REFRESH_TOKEN_DURATION_DAYS = 30;
