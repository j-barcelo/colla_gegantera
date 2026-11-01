<?php

namespace Tests\Unit\Models;

use App\Models\Role;
use App\Models\User;
use PHPUnit\Framework\TestCase;

class UserTest extends TestCase {
    public function test_only_profile_fields_are_mass_assignable(): void {
        $this->assertSame(
            ['name', 'surname', 'username', 'email', 'phone', 'address', 'avatar', 'password', 'status'],
            (new User)->getFillable(),
        );
    }

    public function test_sensitive_attributes_are_hidden_from_serialization(): void {
        $hidden = (new User)->getHidden();

        $this->assertContains('password', $hidden);
        $this->assertContains('remember_token', $hidden);
    }

    public function test_it_does_not_leak_password_when_converted_to_array(): void {
        $user = new User;
        $user->setRawAttributes(['name' => 'Maria', 'email' => 'maria@geganters.cat', 'password' => 'hash']);

        $this->assertArrayNotHasKey('password', $user->toArray());
    }

    public function test_identifies_administrator_role_correctly(): void {
        $admin = new User;
        $adminRole = new Role(['name' => Role::ADMIN_NAME, 'slug' => Role::ADMIN_SLUG]);
        $admin->setRelation('roles', collect([$adminRole]));

        $member = new User;
        $memberRole = new Role(['name' => 'Portadors', 'slug' => 'portadors']);
        $member->setRelation('roles', collect([$memberRole]));

        $this->assertTrue($admin->isAdmin());
        $this->assertFalse($member->isAdmin());
    }
}
