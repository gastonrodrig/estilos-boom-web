export type PasswordChecks = {
  hasLowercase: boolean;
  hasUppercase: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
  passedCount: number;
};

export const getPasswordChecks = (value: string): PasswordChecks => {
  const hasLowercase = /[a-z]/.test(value);
  const hasUppercase = /[A-Z]/.test(value);
  const hasNumber = /\d/.test(value);
  const hasSpecial = /[^A-Za-z0-9]/.test(value);

  const passedCount = [
    hasLowercase,
    hasUppercase,
    hasNumber,
    hasSpecial,
  ].filter(Boolean).length;

  return {
    hasLowercase,
    hasUppercase,
    hasNumber,
    hasSpecial,
    passedCount,
  };
};

export const hasMinimumPasswordRequirements = (value: string) => {
  const checks = getPasswordChecks(value);

  return checks.passedCount == 4;
};

export const getPasswordRequirementErrors = (value: string) => {
  const checks = getPasswordChecks(value);

  const errors: string[] = [];

  if (!checks.hasLowercase) {
    errors.push("Letras minúsculas (a-z)");
  }

  if (!checks.hasUppercase) {
    errors.push("Letras mayúsculas (A-Z)");
  }

  if (!checks.hasNumber) {
    errors.push("Números (0-9)");
  }

  if (!checks.hasSpecial) {
    errors.push("Caracteres especiales (ejm.: !@#)");
  }

  return errors;
};
