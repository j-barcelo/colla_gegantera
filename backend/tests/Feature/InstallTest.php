<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class InstallTest extends TestCase {
    use RefreshDatabase;

    private const string INSTALL_URL = '/install';
    private const string HOME_URL = '/';
    private const string ADMIN_NAME = 'Joan';
    private const string ADMIN_SURNAME = 'Geganter';
    private const string ADMIN_EMAIL = 'admin@geganters.cat';
    private const string ADMIN_PASSWORD = 'password1234';

    public function test_home_redirects_to_install_when_application_is_not_installed(): void {
        $response = $this->get(self::HOME_URL);

        $response->assertRedirect(self::INSTALL_URL);
    }

    public function test_api_returns_503_when_application_is_not_installed(): void {
        $response = $this->getJson('/api/message');

        $response->assertStatus(503)->assertJson(['message' => 'L\'aplicació encara no està instal·lada.', 'installed' => false]);
    }

    public function test_install_page_renders_when_application_is_not_installed(): void {
        $response = $this->get(self::INSTALL_URL);

        $response->assertOk()->assertViewIs('install')->assertSee('Instal·lació inicial');
    }

    public function test_can_complete_installation_with_sqlite_and_create_admin_user(): void {
        $response = $this->post(self::INSTALL_URL, [
            'db_connection' => 'sqlite',
            'admin_name' => self::ADMIN_NAME,
            'admin_surname' => self::ADMIN_SURNAME,
            'admin_email' => self::ADMIN_EMAIL,
            'admin_password' => self::ADMIN_PASSWORD,
            'admin_password_confirmation' => self::ADMIN_PASSWORD,
        ]);

        $response->assertRedirect(self::HOME_URL);

        $admin = User::query()->where('email', self::ADMIN_EMAIL)->first();

        $this->assertNotNull($admin);
        $this->assertSame(self::ADMIN_NAME, $admin->name);
        $this->assertSame(self::ADMIN_SURNAME, $admin->surname);
        $this->assertSame(UserRole::Admin, $admin->role);
        $this->assertTrue($admin->isAdmin());
        $this->assertTrue(Hash::check(self::ADMIN_PASSWORD, $admin->password));
    }

    public function test_install_routes_redirect_to_home_when_application_is_already_installed(): void {
        User::factory()->admin()->create();

        $this->get(self::HOME_URL)->assertOk()->assertViewIs('home');
        $this->get(self::INSTALL_URL)->assertRedirect(self::HOME_URL);
        $this->post(self::INSTALL_URL, [
            'db_connection' => 'sqlite',
            'admin_name' => 'Another',
            'admin_email' => 'another@geganters.cat',
            'admin_password' => self::ADMIN_PASSWORD,
            'admin_password_confirmation' => self::ADMIN_PASSWORD,
        ])->assertRedirect(self::HOME_URL);

        $this->assertDatabaseCount('users', 1);
    }

    public function test_install_fails_when_required_fields_are_missing(): void {
        $response = $this->from(self::INSTALL_URL)->post(self::INSTALL_URL, [
            'db_connection' => 'invalid-driver',
            'admin_name' => '',
            'admin_email' => 'not-an-email',
            'admin_password' => 'short',
            'admin_password_confirmation' => 'mismatch',
        ]);

        $response->assertRedirect(self::INSTALL_URL)->assertSessionHasErrors(['db_connection', 'admin_name', 'admin_email', 'admin_password']);
    }

    public function test_install_requires_server_credentials_when_mysql_or_pgsql_is_selected(): void {
        $response = $this->from(self::INSTALL_URL)->post(self::INSTALL_URL, [
            'db_connection' => 'mysql',
            'db_host' => '',
            'db_port' => '',
            'db_database' => '',
            'db_username' => '',
            'admin_name' => self::ADMIN_NAME,
            'admin_email' => self::ADMIN_EMAIL,
            'admin_password' => self::ADMIN_PASSWORD,
            'admin_password_confirmation' => self::ADMIN_PASSWORD,
        ]);

        $response->assertRedirect(self::INSTALL_URL)->assertSessionHasErrors(['db_host', 'db_port', 'db_database', 'db_username']);
    }
}
