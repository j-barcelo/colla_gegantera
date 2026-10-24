import { VALIDATION_MESSAGES } from '../constants/messages';

export type FieldValidator = (value: string) => string;

const EMAIL_REGEX = /^[^\s@]+@[^\s@.]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9\s+()-]{6,20}$/;
const MIN_PASSWORD_LENGTH = 8;
const ALLOWED_AVATAR_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_AVATAR_BYTES = 10 * 1024 * 1024;

export const createRequiredValidator = (message: string = VALIDATION_MESSAGES.required): FieldValidator => {
  return (val: string): string => {
    return !val.trim() ? message : '';
  };
};

export const createPhoneValidator = (invalidMessage: string = VALIDATION_MESSAGES.phoneInvalid): FieldValidator => {
  return (val: string): string => {
    const trimmed = val.trim();
    if (!trimmed) return '';
    if (!PHONE_REGEX.test(trimmed)) return invalidMessage;
    return '';
  };
};

export const createEmailValidator = (
  emptyMessage: string = VALIDATION_MESSAGES.emailRequired,
  invalidMessage: string = VALIDATION_MESSAGES.emailInvalid,
): FieldValidator => {
  return (val: string): string => {
    const trimmed = val.trim();
    if (!trimmed) return emptyMessage;
    if (!EMAIL_REGEX.test(trimmed)) return invalidMessage;
    return '';
  };
};

export const createPasswordValidator = (
  minLengthMessage: string = VALIDATION_MESSAGES.passwordMinLength,
): FieldValidator => {
  return (val: string): string => {
    return val.length < MIN_PASSWORD_LENGTH ? minLengthMessage : '';
  };
};

export const createPasswordConfirmationValidator = (
  getPassword: () => string,
  emptyMessage: string = VALIDATION_MESSAGES.passwordConfirmRequired,
  mismatchMessage: string = VALIDATION_MESSAGES.passwordMismatch,
): FieldValidator => {
  return (val: string): string => {
    if (!val) return emptyMessage;
    if (getPassword() !== val) return mismatchMessage;
    return '';
  };
};

export const createAvatarFileValidator = (
  invalidTypeMessage: string = VALIDATION_MESSAGES.avatarInvalidType,
  maxSizeMessage: string = VALIDATION_MESSAGES.avatarMaxSize,
) => {
  return (file: File): string => {
    if (!ALLOWED_AVATAR_TYPES.has(file.type)) return invalidTypeMessage;
    if (file.size > MAX_AVATAR_BYTES) return maxSizeMessage;
    return '';
  };
};

export const validators = {
  required: createRequiredValidator,
  phone: createPhoneValidator,
  email: createEmailValidator,
  password: createPasswordValidator,
  passwordConfirmation: createPasswordConfirmationValidator,
  avatarFile: createAvatarFileValidator,
} as const;
