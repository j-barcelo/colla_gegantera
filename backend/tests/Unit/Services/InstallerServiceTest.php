<?php

namespace Tests\Unit\Services;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Web\Services\InstallerService;

class InstallerServiceTest extends TestCase {
    use RefreshDatabase;

    public function test_updates_environment_file_values_correctly(): void {
        $tempEnv = tempnam(sys_get_temp_dir(), 'env_test_');
        file_put_contents($tempEnv, "APP_NAME=Laravel\nDB_CONNECTION=sqlite\n# DB_HOST=127.0.0.1\n# DB_DATABASE=laravel\n");

        try {
            $service = new InstallerService;
            $service->updateEnvironmentFile($tempEnv, [
                'DB_CONNECTION' => 'mysql',
                'DB_HOST' => 'localhost',
                'DB_DATABASE' => 'colla_db',
                'APP_NAME' => 'Colla Gegantera',
                'NEW_KEY' => 'custom_value',
            ]);

            $updatedContent = (string) file_get_contents($tempEnv);

            $this->assertStringContainsString('DB_CONNECTION=mysql', $updatedContent);
            $this->assertStringContainsString('DB_HOST=localhost', $updatedContent);
            $this->assertStringContainsString('DB_DATABASE=colla_db', $updatedContent);
            $this->assertStringContainsString('APP_NAME="Colla Gegantera"', $updatedContent);
            $this->assertStringContainsString('NEW_KEY=custom_value', $updatedContent);
        } finally {
            if (file_exists($tempEnv)) unlink($tempEnv);
        }
    }

    public function test_is_installed_returns_false_when_no_admin_exists(): void {
        $service = new InstallerService;
        $this->assertFalse($service->isInstalled());
    }

    public function test_is_installed_returns_true_when_admin_user_exists(): void {
        User::factory()->admin()->create();

        $service = new InstallerService;
        $this->assertTrue($service->isInstalled());
    }

    public function test_install_creates_admin_and_updates_env_file(): void {
        $tempEnv = tempnam(sys_get_temp_dir(), 'env_install_');
        file_put_contents($tempEnv, "APP_NAME=Laravel\nDB_CONNECTION=sqlite\n");

        try {
            $service = new InstallerService;
            $admin = $service->install([
                'db_connection' => 'sqlite',
                'admin_name' => 'Carles',
                'admin_surname' => 'Gegant',
                'admin_email' => 'carles@colla.cat',
                'admin_password' => 'secret1234',
            ], $tempEnv);

            $this->assertSame('Carles', $admin->name);
            $this->assertSame('carles@colla.cat', $admin->email);
            $this->assertTrue($admin->isAdmin());
        } finally {
            if (file_exists($tempEnv)) unlink($tempEnv);
        }
    }
}
