import { reactive, ref, type ComponentPublicInstance } from 'vue';
import { FORM_MESSAGES } from '../constants/messages';
import { ApiError } from '../utils/api';

export interface ValidatableInput {
  validate: () => boolean;
  validateIfTouched: () => void;
}

export interface UseFormOptions {
  fallbackMessage?: string;
  connectionMessage?: string;
  credentialsMessage?: string;
}

function isCredentialsErrorMessage(msg: string): boolean {
  return msg.includes('credentials') || msg.includes('records') || msg.includes('credencials');
}

export function useForm<T extends string>(fields: readonly T[], options: UseFormOptions = {}) {
  const initialErrors = Object.fromEntries(fields.map((field) => [field, ''])) as Record<T, string>;
  const errors = reactive(initialErrors) as Record<T, string>;
  const generalError = ref('');
  const inputRefs = new Map<T, ValidatableInput>();

  const registerInput = (field: T) => {
    return (el: Element | ComponentPublicInstance | null): void => {
      if (el && 'validate' in el && typeof el.validate === 'function') {
        inputRefs.set(field, el as unknown as ValidatableInput);
      } else {
        inputRefs.delete(field);
      }
    };
  };

  const resetErrors = (): void => {
    generalError.value = '';
    for (const field of fields) {
      errors[field] = '';
    }
  };

  const validate = (): boolean => {
    generalError.value = '';
    let allValid = true;

    for (const field of fields) {
      const input = inputRefs.get(field);
      if (input && !input.validate()) {
        allValid = false;
      }
    }

    return allValid;
  };

  const validateFieldIfTouched = (field: T): void => {
    inputRefs.get(field)?.validateIfTouched();
  };

  const handleServerErrors = (err: unknown, overrideFallback?: string): void => {
    const fallback = overrideFallback || options.fallbackMessage || FORM_MESSAGES.genericError;
    const connectionMsg = options.connectionMessage || FORM_MESSAGES.connectionError;

    if (!(err instanceof ApiError)) {
      if (err instanceof Error && err.message && !options.connectionMessage) {
        generalError.value = err.message;
        return;
      }
      generalError.value = connectionMsg;
      return;
    }

    if (err.errors) {
      const emailErrMsg = err.errors.email?.[0];
      if (options.credentialsMessage && emailErrMsg && isCredentialsErrorMessage(emailErrMsg)) {
        generalError.value = options.credentialsMessage;
        return;
      }

      for (const field of fields) {
        errors[field] = err.errors[field]?.[0] || '';
      }
      return;
    }

    generalError.value = err.message || fallback;
  };

  return {
    errors,
    generalError,
    registerInput,
    resetErrors,
    validate,
    validateFieldIfTouched,
    handleServerErrors,
  };
}

