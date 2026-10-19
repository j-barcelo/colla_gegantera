<?php

namespace Tests\Unit\Requests;

use App\Http\Requests\Api\LoginRequest;
use PHPUnit\Framework\TestCase;

class LoginRequestTest extends TestCase {
    public function test_it_is_always_authorized(): void {
        $this->assertTrue((new LoginRequest)->authorize());
    }

    public function test_it_defines_the_expected_fields(): void {
        $rules = (new LoginRequest)->rules();

        $this->assertSame(['email', 'password', 'device_name'], array_keys($rules));
    }

    public function test_email_and_password_are_required(): void {
        $rules = (new LoginRequest)->rules();

        $this->assertContains('required', $rules['email']);
        $this->assertContains('email', $rules['email']);
        $this->assertContains('required', $rules['password']);
    }

    public function test_device_name_is_optional_and_limited_in_length(): void {
        $rules = (new LoginRequest)->rules();

        $this->assertContains('nullable', $rules['device_name']);
        $this->assertContains('max:255', $rules['device_name']);
    }
}
