<?php

namespace Web\Services;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class InstallerService {
    /**
     * Determine whether the application has completed initial installation.
     */
    public function isInstalled(): bool {
        try {
            return Schema::hasTable('users') && User::query()->where('role', UserRole::Admin)->exists();
        } catch (\Throwable) {
            return false;
        }
    }

    /**
     * Configure the database, run migrations, and create the initial administrator user.
     *
     * @param  array<string, mixed>  $data
     */
    public function install(array $data, ?string $envPath = null): User {
        $connection = (string) $data['db_connection'];

        $envValues = $this->configureDatabase($connection, $data);

        Artisan::call('migrate', ['--force' => true, '--no-interaction' => true]);

        $admin = new User([
            'name' => (string) $data['admin_name'],
            'surname' => (isset($data['admin_surname']) && $data['admin_surname'] !== '') ? (string) $data['admin_surname'] : null,
            'email' => (string) $data['admin_email'],
            'password' => (string) $data['admin_password'],
        ]);
        $admin->role = UserRole::Admin;
        $admin->save();

        $this->ensureStorageLink();

        $targetEnvPath = $envPath ?? (app()->runningUnitTests() ? null : base_path('.env'));
        if ($targetEnvPath !== null && file_exists($targetEnvPath)) {
            $this->updateEnvironmentFile($targetEnvPath, $envValues);
        }

        return $admin;
    }

    /**
     * Apply database configuration at runtime and return the environment key-value pairs to persist.
     *
     * @param  array<string, mixed>  $data
     * @return array<string, string>
     */
    protected function configureDatabase(string $connection, array $data): array {
        config(['database.default' => $connection]);

        if ($connection === 'sqlite') {
            $sqliteDatabase = (string) config('database.connections.sqlite.database', database_path('database.sqlite'));

            if ($sqliteDatabase !== ':memory:' && !file_exists($sqliteDatabase)) {
                $directory = dirname($sqliteDatabase);
                if (!is_dir($directory)) mkdir($directory, 0755, true);
                touch($sqliteDatabase);
            }

            $envValues = ['DB_CONNECTION' => 'sqlite'];
        } else {
            $host = (string) ($data['db_host'] ?? '127.0.0.1');
            $port = (string) ($data['db_port'] ?? ($connection === 'pgsql' ? '5432' : '3306'));
            $database = (string) ($data['db_database'] ?? 'laravel');
            $username = (string) ($data['db_username'] ?? 'root');
            $password = (string) ($data['db_password'] ?? '');

            config([
                "database.connections.{$connection}.host" => $host,
                "database.connections.{$connection}.port" => $port,
                "database.connections.{$connection}.database" => $database,
                "database.connections.{$connection}.username" => $username,
                "database.connections.{$connection}.password" => $password,
            ]);

            $envValues = [
                'DB_CONNECTION' => $connection,
                'DB_HOST' => $host,
                'DB_PORT' => $port,
                'DB_DATABASE' => $database,
                'DB_USERNAME' => $username,
                'DB_PASSWORD' => $password,
            ];
        }

        $isInMemorySqlite = $connection === 'sqlite' && config('database.connections.sqlite.database') === ':memory:';

        if (!$isInMemorySqlite) {
            DB::purge($connection);
            DB::reconnect($connection);
        }

        return $envValues;
    }

    /**
     * Update key-value pairs in the given environment file only when content changes.
     *
     * @param  array<string, string>  $values
     */
    public function updateEnvironmentFile(string $envPath, array $values): void {
        $originalContent = (string) file_get_contents($envPath);
        $content = $originalContent;

        foreach ($values as $key => $value) {
            $formattedValue = str_contains($value, ' ') ? '"' . $value . '"' : $value;
            $pattern = "/^#?\s*{$key}=.*/m";

            if (preg_match($pattern, $content)) {
                $content = (string) preg_replace($pattern, "{$key}={$formattedValue}", $content);
            } else {
                $content = rtrim($content) . PHP_EOL . "{$key}={$formattedValue}" . PHP_EOL;
            }
        }

        if ($content !== $originalContent) file_put_contents($envPath, $content);
    }

    /**
     * Create the public storage symbolic link if it does not already exist.
     */
    public function ensureStorageLink(): bool {
        $link = public_path('storage');
        if (file_exists($link)) return true;

        try {
            Artisan::call('storage:link');

            return true;
        } catch (\Throwable) {
            return false;
        }
    }
}
