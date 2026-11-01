<?php

namespace Tests\Unit\Requests;

use App\Http\Requests\Api\RegisterRequest;
use PHPUnit\Framework\TestCase;

class RegisterRequestTest extends TestCase {
    public function test_it_is_always_authorized(): void {
        $this->assertTrue((new RegisterRequest)->authorize());
    }

    public function test_it_defines_the_expected_fields(): void {
        $rules = (new RegisterRequest)->rules();

        $this->assertSame(['name', 'surname', 'email', 'password', 'device_name'], array_keys($rules));
    }

    public function test_required_fields_are_marked_as_required(): void {
        $rules = (new RegisterRequest)->rules();

        foreach (['name', 'surname', 'email', 'password'] as $field) {
            $this->assertContains('required', $rules[$field], "{$field} must be required");
        }
        $this->assertContains('nullable', $rules['device_name']);
    }

    public function test_email_must_be_valid_and_require_invitation(): void {
        $rules = (new RegisterRequest)->rules();

        $this->assertContains('email', $rules['email']);
        $this->assertTrue(
            collect($rules['email'])->contains(fn ($rule) => is_object($rule) && str_contains(get_class($rule), 'Exists')),
            'Email rule must check existence in users table with pending status',
        );
    }

    public function test_password_requires_minimum_length_and_confirmation(): void {
        $rules = (new RegisterRequest)->rules();

        $this->assertContains('min:8', $rules['password']);
        $this->assertContains('confirmed', $rules['password']);
    }
}
