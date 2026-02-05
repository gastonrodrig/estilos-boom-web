export type AuthStatus =
  | "not-authenticated"
  | "authenticated"
  | "checking"
  | "first-login-password"
  | "sending-reset-email"
  | "reset-email-sent"
  | "changing-password";
