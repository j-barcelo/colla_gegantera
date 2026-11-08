<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminUsersTest extends TestCase {
    use RefreshDatabase;

    private const string ADMIN_USERS_URL = '/api/admin/users';
    private const string TEST_NEW_EMAIL = 'nou@gegants.cat';
    private const string TEST_UPDATED_NAME = 'Nom Nou';
    private const string TEST_UPDATED_SURNAME = 'Cognom Nou';

    private User $adminUser;

    protected function setUp(): void {
        parent::setUp();
        $this->adminUser = User::factory()->admin()->create([
            'name' => 'Admin',
            'surname' => 'Principal',
        ]);
    }

    public function test_unauthenticated_user_cannot_list_users(): void {
        $response = $this->getJson(self::ADMIN_USERS_URL);

        $response->assertUnauthorized();
    }

    public function test_non_admin_member_cannot_list_users(): void {
        $member = User::factory()->create();
        Sanctum::actingAs($member);

        $response = $this->getJson(self::ADMIN_USERS_URL);

        $response->assertForbidden();
    }

    public function test_admin_can_list_users(): void {
        User::factory()->create([
            'name' => 'Miquel',
            'surname' => 'Pons Gomila',
        ]);
        User::factory()->pending()->create([
            'email' => 'pendent@gegants.cat',
        ]);

        Sanctum::actingAs($this->adminUser);

        $response = $this->getJson(self::ADMIN_USERS_URL);

        $response->assertOk()
            ->assertJsonStructure(['data' => ['*' => ['id', 'name', 'surname', 'email', 'role', 'avatar', 'is_pending']]])
            ->assertJsonCount(3, 'data');
    }

    public function test_admin_can_allow_new_email(): void {
        Sanctum::actingAs($this->adminUser);

        $response = $this->postJson(self::ADMIN_USERS_URL, ['email' => self::TEST_NEW_EMAIL]);

        $response->assertCreated()
            ->assertJsonPath('data.email', self::TEST_NEW_EMAIL)
            ->assertJsonPath('data.is_pending', true);

        $this->assertDatabaseHas('users', [
            'email' => self::TEST_NEW_EMAIL,
            'status' => 'pending',
        ]);
    }

    public function test_admin_cannot_allow_already_registered_or_allowed_email(): void {
        Sanctum::actingAs($this->adminUser);

        $response = $this->postJson(self::ADMIN_USERS_URL, ['email' => $this->adminUser->email]);

        $response->assertUnprocessable();
    }

    public function test_admin_can_update_user_role(): void {
        $member = User::factory()->create();
        Sanctum::actingAs($this->adminUser);

        $response = $this->putJson(self::ADMIN_USERS_URL . '/' . $member->id, [
            'name' => self::TEST_UPDATED_NAME,
            'surname' => self::TEST_UPDATED_SURNAME,
            'phone' => '600112233',
            'address' => 'Carrer Nou 1',
            'role' => 'admin',
        ]);

        $response->assertOk()
            ->assertJsonPath('data.name', self::TEST_UPDATED_NAME)
            ->assertJsonPath('data.surname', self::TEST_UPDATED_SURNAME)
            ->assertJsonPath('data.phone', '600112233')
            ->assertJsonPath('data.address', 'Carrer Nou 1')
            ->assertJsonPath('data.role', 'admin');

        $refreshed = $member->fresh();
        $this->assertTrue($refreshed->isAdmin());
        $this->assertEquals(self::TEST_UPDATED_NAME, $refreshed->name);
        $this->assertEquals(self::TEST_UPDATED_SURNAME, $refreshed->surname);
    }

    public function test_admin_can_delete_pending_invitation(): void {
        $pending = User::factory()->pending()->create(['email' => 'cancel@gegants.cat']);
        Sanctum::actingAs($this->adminUser);

        $response = $this->deleteJson(self::ADMIN_USERS_URL . '/' . $pending->id);

        $response->assertOk();
        $this->assertDatabaseMissing('users', ['id' => $pending->id, 'deleted_at' => null]);
    }

    public function test_admin_cannot_remove_own_admin_role(): void {
        Sanctum::actingAs($this->adminUser);

        // Attempting to change role to member
        $response = $this->putJson(self::ADMIN_USERS_URL . '/' . $this->adminUser->id, [
            'role' => 'member',
        ]);
        $response->assertForbidden();

        // Attempting to change roles array without 'Administració'
        $responseRoles = $this->putJson(self::ADMIN_USERS_URL . '/' . $this->adminUser->id, [
            'roles' => ['Portadors'],
        ]);
        $responseRoles->assertForbidden();

        $this->assertTrue($this->adminUser->fresh()->isAdmin());
    }

    public function test_admin_cannot_delete_themselves(): void {
        Sanctum::actingAs($this->adminUser);

        $response = $this->deleteJson(self::ADMIN_USERS_URL . '/' . $this->adminUser->id);

        $response->assertForbidden();
        $this->assertDatabaseHas('users', ['id' => $this->adminUser->id]);
    }

    public function test_admin_can_allow_email_with_explicit_roles(): void {
        Sanctum::actingAs($this->adminUser);

        $response = $this->postJson(self::ADMIN_USERS_URL, [
            'email' => 'musics@gegants.cat',
            'roles' => ['Músics', 'Grallers'],
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.email', 'musics@gegants.cat')
            ->assertJsonCount(2, 'data.roles');
    }

    public function test_admin_can_update_user_roles_with_array(): void {
        $member = User::factory()->create();
        Sanctum::actingAs($this->adminUser);

        $response = $this->putJson(self::ADMIN_USERS_URL . '/' . $member->id, [
            'roles' => ['Portadors', 'Caps de Colla'],
        ]);

        $response->assertOk()
            ->assertJsonCount(2, 'data.roles');
    }

    public function test_admin_can_downgrade_another_admin_to_member(): void {
        $otherAdmin = User::factory()->admin()->create();
        Sanctum::actingAs($this->adminUser);

        $response = $this->putJson(self::ADMIN_USERS_URL . '/' . $otherAdmin->id, [
            'role' => 'member',
        ]);

        $response->assertOk();
        $this->assertFalse($otherAdmin->fresh()->isAdmin());
    }

    public function test_admin_can_delete_registered_member(): void {
        $member = User::factory()->create();
        Sanctum::actingAs($this->adminUser);

        $response = $this->deleteJson(self::ADMIN_USERS_URL . '/' . $member->id);

        $response->assertOk()
            ->assertJsonPath('message', 'Usuari eliminat correctament.');
        $this->assertDatabaseMissing('users', ['id' => $member->id, 'deleted_at' => null]);
    }
}
