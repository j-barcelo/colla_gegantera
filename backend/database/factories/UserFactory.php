<?php

namespace Database\Factories;

use App\Enums\UserStatus;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory {
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array {
        return [
            'name' => fake()->name(),
            'surname' => fake()->lastName(),
            'username' => fake()->unique()->userName(),
            'email' => fake()->unique()->safeEmail(),
            'phone' => fake()->phoneNumber(),
            'address' => fake()->address(),
            'avatar' => null,
            'status' => UserStatus::Active,
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
        ];
    }

    /**
     * Indicate that the model has administrator privileges.
     */
    public function admin(): static {
        return $this->afterCreating(function (User $user) {
            $adminRole = Role::firstOrCreate(
                ['slug' => Role::ADMIN_SLUG],
                ['name' => Role::ADMIN_NAME, 'type' => 'system'],
            );
            $user->roles()->syncWithoutDetaching([$adminRole->id]);
        });
    }

    /**
     * Indicate that the user is in pending invitation state.
     */
    public function pending(): static {
        return $this->state(fn () => [
            'name' => null,
            'surname' => null,
            'username' => null,
            'password' => null,
            'email_verified_at' => null,
            'status' => UserStatus::Pending,
        ]);
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static {
        return $this->state(fn () => ['email_verified_at' => null]);
    }
}
