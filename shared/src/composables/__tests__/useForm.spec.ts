import { describe, expect, it, vi } from 'vitest';
import { ApiError } from '../../utils/api';
import { useForm } from '../useForm';

describe('useForm composable', () => {
  it('validates all registered inputs and resets errors', () => {
    const form = useForm(['email', 'password'] as const);
    const validateEmail = vi.fn().mockReturnValue(false);
    const validatePassword = vi.fn().mockReturnValue(true);

    form.registerInput('email')({ validate: validateEmail, validateIfTouched: vi.fn() } as never);
    form.registerInput('password')({ validate: validatePassword, validateIfTouched: vi.fn() } as never);

    expect(form.validate()).toBe(false);
    expect(validateEmail).toHaveBeenCalledOnce();
    expect(validatePassword).toHaveBeenCalledOnce();

    form.errors.email = 'Error';
    form.generalError.value = 'General';
    form.resetErrors();

    expect(form.errors.email).toBe('');
    expect(form.generalError.value).toBe('');
  });

  it('maps ApiError field errors and credentials errors', () => {
    const form = useForm(['email', 'password'] as const, {
      credentialsMessage: 'Credencials incorrectes',
      connectionMessage: 'Sense connexió',
    });

    form.handleServerErrors(new ApiError('Invalid', 422, { email: ['These credentials do not match'] }));
    expect(form.generalError.value).toBe('Credencials incorrectes');

    form.resetErrors();
    form.handleServerErrors(new ApiError('Invalid', 422, { email: ['Email invàlid'], password: ['Curta'] }));
    expect(form.errors.email).toBe('Email invàlid');
    expect(form.errors.password).toBe('Curta');

    form.resetErrors();
    form.handleServerErrors(new TypeError('Network failure'));
    expect(form.generalError.value).toBe('Sense connexió');
  });
});

