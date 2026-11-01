<?php

namespace App\Http\Resources;

use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin User
 */
class UserResource extends JsonResource {
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array {
        $rolesList = [];
        if ($this->exists && $this->relationLoaded('roles')) {
            $rolesList = $this->roles->pluck('name')->values()->all();
        } elseif ($this->exists) {
            $rolesList = $this->roles()->pluck('name')->values()->all();
        }

        if (empty($rolesList)) {
            $rolesList = $this->isAdmin() ? [Role::ADMIN_NAME] : [Role::DEFAULT_MEMBER_ROLE];
        }

        return [
            'id' => $this->id,
            'name' => $this->name,
            'surname' => $this->surname,
            'username' => $this->username,
            'email' => $this->email,
            'status' => $this->status?->value ?? (string) $this->status,
            'is_pending' => $this->isPending(),
            'role' => $this->isAdmin() ? 'admin' : 'member',
            'roles' => $rolesList,
            'phone' => $this->phone,
            'address' => $this->address,
            'avatar' => $this->avatar,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
