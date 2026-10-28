<?php

namespace Tests\Unit\Services;

use Tests\TestCase;
use Web\Services\InstallerService;

class InstallerServiceTest extends TestCase {
    public function test_updates_environment_file_values_correctly(): void {
        $tempEnv = tempnam(sys_get_temp_dir(), 'env_test_');
        file_put_contents($tempEnv, "APP_NAME=Laravel\nDB_CONNECTION=sqlite\n# DB_HOST=127.0.0.1\n# DB_DATABASE=laravel\n");

        try {
            $service = new InstallerService;
            $service->updateEnvironmentFile($tempEnv, [
                'DB_CONNECTION' => 'mysql',
                'DB_HOST' => 'localhost',
                'DB_DATABASE' => 'colla_db',
            ]);

            $updatedContent = (string) file_get_contents($tempEnv);

            $this->assertStringContainsString('DB_CONNECTION=mysql', $updatedContent);
            $this->assertStringContainsString('DB_HOST=localhost', $updatedContent);
            $this->assertStringContainsString('DB_DATABASE=colla_db', $updatedContent);
        } finally {
            if (file_exists($tempEnv)) unlink($tempEnv);
        }
    }

    public function test_ensure_storage_link_returns_boolean(): void {
        $service = new InstallerService;
        $this->assertIsBool($service->ensureStorageLink());
    }
}
