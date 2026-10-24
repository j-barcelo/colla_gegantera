import { describe, expect, it } from 'vitest';
import { validators } from '../validators';

describe('validators', () => {
  it('validates required fields and supports custom messages', () => {
    const defaultRequired = validators.required();
    const customMsg = 'CUSTOM_REQUIRED_MESSAGE';
    const customRequired = validators.required(customMsg);

    expect(defaultRequired('   ')).not.toBe('');
    expect(defaultRequired('Miquel')).toBe('');
    expect(customRequired('')).toBe(customMsg);
    expect(customRequired('Pons Gomila')).toBe('');
  });

  it('validates email format and supports custom messages', () => {
    const defaultEmail = validators.email();
    const customEmptyMsg = 'CUSTOM_EMPTY_EMAIL';
    const customInvalidMsg = 'CUSTOM_INVALID_EMAIL';
    const customEmail = validators.email(customEmptyMsg, customInvalidMsg);

    expect(defaultEmail('')).not.toBe('');
    expect(customEmail('')).toBe(customEmptyMsg);
    expect(defaultEmail('invalid-email')).not.toBe('');
    expect(customEmail('invalid@domain')).toBe(customInvalidMsg);
    expect(defaultEmail('miquel@geganters.cat')).toBe('');
  });

  it('accepts empty or valid phone numbers and rejects invalid formats', () => {
    const defaultPhone = validators.phone();
    expect(defaultPhone('')).toBe('');
    expect(defaultPhone('abc')).not.toBe('');
    expect(defaultPhone('123')).not.toBe('');
    expect(defaultPhone('668 30 58 60')).toBe('');
  });

  it('enforces minimum password length and dynamic password confirmation match', () => {
    const defaultPassword = validators.password();
    expect(defaultPassword('1234567')).not.toBe('');
    expect(defaultPassword('12345678')).toBe('');

    let current = 'secret123';
    const confirmValidator = validators.passwordConfirmation(() => current);
    expect(confirmValidator('')).not.toBe('');
    expect(confirmValidator('mismatch')).not.toBe('');
    expect(confirmValidator('secret123')).toBe('');
    current = 'updated123';
    expect(confirmValidator('secret123')).not.toBe('');
  });

  it('validates avatar file MIME type and size limits', () => {
    const validateAvatar = validators.avatarFile('INVALID_TYPE', 'MAX_SIZE');
    const validPng = new File(['img-bytes'], 'avatar.png', { type: 'image/png' });
    const invalidPdf = new File(['pdf-bytes'], 'doc.pdf', { type: 'application/pdf' });
    const oversizedJpg = new File([new Uint8Array(10 * 1024 * 1024 + 10)], 'huge.jpg', { type: 'image/jpeg' });

    expect(validateAvatar(validPng)).toBe('');
    expect(validateAvatar(invalidPdf)).toBe('INVALID_TYPE');
    expect(validateAvatar(oversizedJpg)).toBe('MAX_SIZE');
  });
});
