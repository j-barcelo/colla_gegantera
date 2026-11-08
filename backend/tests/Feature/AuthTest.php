<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AuthTest extends TestCase {
    use RefreshDatabase;

    private const string TEST_EMAIL = 'miquel@geganters.cat';
    private const string TEST_PASSWORD = 'secret1234';
    private const string TEST_NAME = 'Miquel';
    private const string TEST_SURNAME = 'Pons';
    private const string TEST_DEVICE = 'Mobile App';
    private const string REGISTER_URL = '/api/register';
    private const string LOGIN_URL = '/api/login';
    private const string BEARER_TOKEN = 'Bearer';

    protected function setUp(): void {
        parent::setUp();
        User::factory()->admin()->create();
    }

    public function test_user_can_register_with_valid_data(): void {
        User::factory()->pending()->create(['email' => self::TEST_EMAIL]);

        $payload = [
            'name' => self::TEST_NAME,
            'surname' => self::TEST_SURNAME,
            'email' => self::TEST_EMAIL,
            'password' => self::TEST_PASSWORD,
            'password_confirmation' => self::TEST_PASSWORD,
            'device_name' => self::TEST_DEVICE,
        ];

        $response = $this->postJson(self::REGISTER_URL, $payload);

        $response->assertCreated()
            ->assertJsonStructure(['user' => ['id', 'name', 'surname', 'email', 'role'], 'token', 'token_type'])
            ->assertJsonPath('user.email', self::TEST_EMAIL)
            ->assertJsonPath('user.name', self::TEST_NAME)
            ->assertJsonPath('user.surname', self::TEST_SURNAME)
            ->assertJsonPath('user.role', 'member')
            ->assertJsonPath('token_type', self::BEARER_TOKEN);

        $this->assertDatabaseHas('users', [
            'email' => self::TEST_EMAIL,
            'name' => self::TEST_NAME,
            'surname' => self::TEST_SURNAME,
        ]);
    }

    public function test_registration_fails_when_validation_errors_occur(): void {
        $response = $this->postJson(self::REGISTER_URL, [
            'name' => '',
            'surname' => '',
            'email' => 'not-an-email',
            'password' => 'short',
            'password_confirmation' => 'mismatch',
        ]);

        $response->assertUnprocessable()->assertJsonValidationErrors(['name', 'surname', 'email', 'password']);
    }

    public function test_user_cannot_register_if_email_is_not_allowed(): void {
        $payload = [
            'name' => 'Usuari No Autoritzat',
            'surname' => 'Sense Invitacio',
            'email' => 'no_autoritzat@geganters.cat',
            'password' => self::TEST_PASSWORD,
            'password_confirmation' => self::TEST_PASSWORD,
        ];

        $response = $this->postJson(self::REGISTER_URL, $payload);

        $response->assertUnprocessable()->assertJsonValidationErrors(['email']);
    }

    public function test_registration_fails_if_email_is_already_taken(): void {
        User::factory()->create(['email' => 'existing@geganters.cat']);

        $response = $this->postJson(self::REGISTER_URL, [
            'name' => 'Another',
            'surname' => 'User',
            'email' => 'existing@geganters.cat',
            'password' => self::TEST_PASSWORD,
            'password_confirmation' => self::TEST_PASSWORD,
        ]);

        $response->assertUnprocessable()->assertJsonValidationErrors(['email']);
    }

    public function test_user_can_login_with_valid_credentials(): void {
        $user = User::factory()->create([
            'email' => self::TEST_EMAIL,
            'password' => Hash::make(self::TEST_PASSWORD),
        ]);

        $response = $this->postJson(self::LOGIN_URL, [
            'email' => self::TEST_EMAIL,
            'password' => self::TEST_PASSWORD,
            'device_name' => self::TEST_DEVICE,
        ]);

        $response->assertOk()
            ->assertJsonStructure(['user' => ['id', 'name', 'email', 'role'], 'token', 'token_type'])
            ->assertJsonPath('user.id', $user->id)
            ->assertJsonPath('user.role', 'member')
            ->assertJsonPath('token_type', self::BEARER_TOKEN);
    }

    public function test_login_fails_with_invalid_password(): void {
        User::factory()->create([
            'email' => self::TEST_EMAIL,
            'password' => Hash::make(self::TEST_PASSWORD),
        ]);

        $response = $this->postJson(self::LOGIN_URL, [
            'email' => self::TEST_EMAIL,
            'password' => 'wrong-password',
        ]);

        $response->assertUnprocessable()->assertJsonValidationErrors(['email']);
    }

    public function test_login_fails_with_unregistered_email(): void {
        $response = $this->postJson(self::LOGIN_URL, [
            'email' => 'nonexistent@geganters.cat',
            'password' => self::TEST_PASSWORD,
        ]);

        $response->assertUnprocessable()->assertJsonValidationErrors(['email']);
    }

    public function test_authenticated_user_can_get_profile(): void {
        $user = User::factory()->create([
            'name' => 'Maria Gegantera',
            'email' => 'maria@geganters.cat',
        ]);

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/user');

        $response->assertOk()
            ->assertJsonPath('user.id', $user->id)
            ->assertJsonPath('user.email', 'maria@geganters.cat');
    }

    public function test_authenticated_user_can_logout(): void {
        $user = User::factory()->create();
        $token = $user->createToken('test-device')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)->postJson('/api/logout');

        $response->assertOk()->assertJson(['message' => 'Logged out successfully']);

        $this->assertDatabaseCount('personal_access_tokens', 0);
    }
}
