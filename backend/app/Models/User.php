<?php

namespace App\Models;

use App\Enums\UserStatus;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

#[Fillable(['name', 'surname', 'username', 'email', 'phone', 'address', 'avatar', 'password', 'status'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable {
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    /**
     * The model's default attribute values.
     *
     * @var array<string, mixed>
     */
    protected $attributes = [
        'status' => UserStatus::Pending->value,
    ];

    /**
     * The roles that belong to the user.
     *
     * @return BelongsToMany<Role, $this>
     */
    public function roles(): BelongsToMany {
        return $this->belongsToMany(Role::class);
    }

    /**
     * Determine whether the user has a specific role by slug or name.
     *
     * @param  string|array<int, string>  $roles
     */
    public function hasRole(string|array $roles): bool {
        $rolesList = (array) $roles;

        if ($this->relationLoaded('roles')) {
            return $this->roles->contains(fn (Role $r) => in_array($r->slug, $rolesList, true) || in_array($r->name, $rolesList, true));
        }

        return $this->exists && (
            $this->roles()->whereIn('slug', $rolesList)->exists()
            || $this->roles()->whereIn('name', $rolesList)->exists()
        );
    }

    /**
     * Determine whether the user has administrator privileges.
     */
    public function isAdmin(): bool {
        return $this->hasRole(['admin', Role::ADMIN_SLUG, Role::ADMIN_NAME]);
    }

    /**
     * Determine whether the user is in pending state.
     */
    public function isPending(): bool {
        return $this->status === UserStatus::Pending || $this->status === 'pending';
    }

    /**
     * Determine whether the user is active.
     */
    public function isActive(): bool {
        return $this->status === UserStatus::Active || $this->status === 'active';
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'status' => UserStatus::class,
            'anonymized_at' => 'datetime',
        ];
    }
}
