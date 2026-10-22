<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProfileUpdateTest extends TestCase {
    use RefreshDatabase;

    private const string USER_URL = '/api/user';
    private const string PASSWORD_URL = '/api/user/password';
    private const string UPDATED_EMAIL = 'miquel@geganters.cat';
    private const string CURRENT_PASSWORD = 'current-secret-123';
    private const string NEW_PASSWORD = 'new-secret-456';

    public function test_authenticated_user_can_update_profile_fields(): void {
        $user = User::factory()->create([
            'name' => 'Old Name',
            'surname' => 'Old Surname',
            'username' => 'old_user',
            'email' => 'old@geganters.cat',
            'phone' => '600000000',
            'address' => 'Old Address',
        ]);

        Sanctum::actingAs($user);

        $payload = [
            'name' => 'Miquel',
            'surname' => 'Pons',
            'username' => 'miquel_pons',
            'email' => self::UPDATED_EMAIL,
            'phone' => '+34 612 345 678',
            'address' => 'Plaça de la Vila 1, Valls',
        ];

        $response = $this->putJson(self::USER_URL, $payload);

        $response->assertOk()
            ->assertJsonPath('user.id', $user->id)
            ->assertJsonPath('user.name', $payload['name'])
            ->assertJsonPath('user.surname', $payload['surname'])
            ->assertJsonPath('user.username', $payload['username'])
            ->assertJsonPath('user.email', self::UPDATED_EMAIL)
            ->assertJsonPath('user.phone', $payload['phone'])
            ->assertJsonPath('user.address', $payload['address']);

        $this->assertDatabaseHas('users', ['id' => $user->id, ...$payload]);
    }

    public function test_authenticated_user_can_keep_own_email_and_username_on_update(): void {
        $ownUsername = 'maria_g';
        $ownEmail = 'maria@geganters.cat';
        $updatedName = 'Maria Updated';
        $updatedSurname = 'Gegantera Updated';

        $user = User::factory()->create([
            'name' => 'Maria',
            'surname' => 'Gegantera',
            'username' => $ownUsername,
            'email' => $ownEmail,
        ]);

        Sanctum::actingAs($user);

        $response = $this->putJson(self::USER_URL, [
            'name' => $updatedName,
            'surname' => $updatedSurname,
            'username' => $ownUsername,
            'email' => $ownEmail,
            'phone' => null,
            'address' => null,
        ]);

        $response->assertOk()
            ->assertJsonPath('user.name', $updatedName)
            ->assertJsonPath('user.surname', $updatedSurname)
            ->assertJsonPath('user.username', $ownUsername)
            ->assertJsonPath('user.email', $ownEmail);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => $updatedName,
            'surname' => $updatedSurname,
            'username' => $ownUsername,
            'email' => $ownEmail,
        ]);
    }

    public function test_profile_update_rejects_email_and_username_belonging_to_another_user(): void {
        User::factory()->create([
            'username' => 'taken_username',
            'email' => 'taken@geganters.cat',
        ]);

        $user = User::factory()->create([
            'username' => 'my_username',
            'email' => 'me@geganters.cat',
        ]);

        Sanctum::actingAs($user);

        $response = $this->putJson(self::USER_URL, [
            'name' => 'My Name',
            'surname' => 'My Surname',
            'username' => 'taken_username',
            'email' => 'taken@geganters.cat',
        ]);

        $response->assertUnprocessable()->assertJsonValidationErrors(['username', 'email']);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'username' => 'my_username',
            'email' => 'me@geganters.cat',
        ]);
    }

    public function test_profile_update_requires_name_and_surname(): void {
        $user = User::factory()->create();

        Sanctum::actingAs($user);

        $response = $this->putJson(self::USER_URL, [
            'name' => '',
            'surname' => '',
            'email' => $user->email,
        ]);

        $response->assertUnprocessable()->assertJsonValidationErrors(['name', 'surname']);
    }

    public function test_profile_update_rejects_unauthenticated_requests(): void {
        $response = $this->putJson(self::USER_URL, [
            'name' => 'Anon',
            'email' => 'anon@geganters.cat',
        ]);

        $response->assertUnauthorized();
    }

    public function test_authenticated_user_can_update_password_with_valid_current_password(): void {
        $user = User::factory()->create(['password' => Hash::make(self::CURRENT_PASSWORD)]);

        Sanctum::actingAs($user);

        $response = $this->putJson(self::PASSWORD_URL, [
            'current_password' => self::CURRENT_PASSWORD,
            'password' => self::NEW_PASSWORD,
            'password_confirmation' => self::NEW_PASSWORD,
        ]);

        $response->assertOk()->assertJson(['message' => 'Password updated successfully']);

        $this->assertTrue(Hash::check(self::NEW_PASSWORD, $user->fresh()->password));
    }

    public function test_password_update_rejects_invalid_current_password_or_unconfirmed_short_password(): void {
        $user = User::factory()->create(['password' => Hash::make(self::CURRENT_PASSWORD)]);

        Sanctum::actingAs($user);

        $response = $this->putJson(self::PASSWORD_URL, [
            'current_password' => 'wrong-current-password',
            'password' => 'short',
            'password_confirmation' => 'mismatch',
        ]);

        $response->assertUnprocessable()->assertJsonValidationErrors(['current_password', 'password']);

        $this->assertTrue(Hash::check(self::CURRENT_PASSWORD, $user->fresh()->password));
    }

    public function test_password_update_rejects_unauthenticated_requests(): void {
        $response = $this->putJson(self::PASSWORD_URL, [
            'current_password' => self::CURRENT_PASSWORD,
            'password' => self::NEW_PASSWORD,
            'password_confirmation' => self::NEW_PASSWORD,
        ]);

        $response->assertUnauthorized();
    }
}
