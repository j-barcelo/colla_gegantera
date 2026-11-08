<?php

namespace Tests\Unit;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RoleTest extends TestCase {
    use RefreshDatabase;

    public function test_role_has_users_relationship(): void {
        $role = Role::create([
            'name' => Role::ADMIN_NAME,
            'slug' => Role::ADMIN_SLUG,
            'description' => 'Administradors de la colla',
            'type' => 'colla',
        ]);

        $user = User::factory()->create();
        $role->users()->attach($user->id);

        $this->assertTrue($role->users->contains($user));
    }
}
