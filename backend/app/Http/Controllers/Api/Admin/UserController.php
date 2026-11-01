<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\UserStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class UserController extends Controller {
    private const string SELF_ADMIN_PROTECTION_MESSAGE = "No et pots treure el rol d'administrador a tu mateix.";

    /**
     * Display a listing of registered and pending users.
     */
    public function index(): JsonResponse {
        $users = User::with('roles')
            ->orderByRaw("CASE WHEN status = 'pending' THEN 1 ELSE 0 END, name ASC")
            ->get();

        return response()->json(['data' => UserResource::collection($users)->resolve()]);
    }

    /**
     * Invite a new user by creating a pending user record.
     */
    public function store(Request $request): JsonResponse {
        $validated = $request->validate([
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'name' => ['nullable', 'string', 'max:255'],
            'surname' => ['nullable', 'string', 'max:255'],
            'roles' => ['nullable', 'array'],
            'roles.*' => ['string', 'max:50'],
        ], [
            'email.unique' => 'Aquest correu ja està registrat o autoritzat.',
        ]);

        $user = User::create([
            'email' => strtolower($validated['email']),
            'name' => $validated['name'] ?? null,
            'surname' => $validated['surname'] ?? null,
            'status' => UserStatus::Pending,
        ]);

        if (!empty($validated['roles'])) {
            $this->syncRolesFromNames($user, $validated['roles']);
        } else {
            $defaultRole = Role::firstOrCreate(
                ['slug' => 'portadors'],
                ['name' => Role::DEFAULT_MEMBER_ROLE, 'type' => 'colla'],
            );
            $user->roles()->syncWithoutDetaching([$defaultRole->id]);
        }

        return response()->json([
            'message' => 'Correu autoritzat correctament.',
            'data' => (new UserResource($user->load('roles')))->resolve(),
        ], 201);
    }

    /**
     * Update a user's details and role.
     */
    public function update(Request $request, User $user): JsonResponse {
        $validated = $request->validate([
            'role' => ['sometimes', 'nullable', 'string', 'max:50'],
            'roles' => ['sometimes', 'nullable', 'array'],
            'roles.*' => ['string', 'max:50'],
            'name' => ['sometimes', $user->isPending() ? 'nullable' : 'required', 'string', 'max:255'],
            'surname' => ['sometimes', 'nullable', 'string', 'max:255'],
            'email' => ['sometimes', 'required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'phone' => ['sometimes', 'nullable', 'string', 'max:30'],
            'address' => ['sometimes', 'nullable', 'string', 'max:255'],
        ]);

        $protectionError = $this->checkSelfAdminProtection($request, $user, $validated);
        if ($protectionError) {
            return $protectionError;
        }

        $this->applyRolesUpdate($user, $validated);

        if (!empty($validated)) {
            $user->fill($validated);
        }

        $user->save();

        return response()->json([
            'message' => 'Usuari actualitzat correctament.',
            'data' => (new UserResource($user->load('roles')))->resolve(),
        ]);
    }

    /**
     * Remove a pending user invitation or delete a user.
     */
    public function destroy(Request $request, string $id): JsonResponse {
        $cleanId = (int) str_replace('pending_', '', $id);

        if ((int) $request->user()?->id === $cleanId) {
            return response()->json([
                'message' => 'No et pots eliminar a tu mateix.',
            ], 403);
        }

        $user = User::findOrFail($cleanId);
        $isPending = $user->isPending();
        $user->delete();

        return response()->json([
            'message' => $isPending ? 'Invitació eliminada correctament.' : 'Usuari eliminat correctament.',
        ]);
    }

    private function hasAdminRole(array $roles): bool {
        return in_array('admin', $roles, true) || in_array(Role::ADMIN_NAME, $roles, true);
    }

    private function checkSelfAdminProtection(Request $request, User $user, array $validated): ?JsonResponse {
        if ((int) $request->user()?->id !== (int) $user->id) {
            return null;
        }

        if (isset($validated['roles']) && !$this->hasAdminRole($validated['roles'])) {
            return response()->json(['message' => self::SELF_ADMIN_PROTECTION_MESSAGE], 403);
        }

        if (isset($validated['role'])) {
            $roleVal = strtolower((string) $validated['role']);
            if ($roleVal !== 'admin' && $roleVal !== Role::ADMIN_SLUG) {
                return response()->json(['message' => self::SELF_ADMIN_PROTECTION_MESSAGE], 403);
            }
        }

        return null;
    }

    /**
     * @param  array<int, string>  $roleNames
     */
    private function syncRolesFromNames(User $user, array $roleNames): void {
        $roleIds = array_map(function (string $roleName) {
            $slug = Str::slug($roleName);
            $type = in_array($slug, ['admin', Role::ADMIN_SLUG], true) ? 'system' : 'colla';

            return Role::firstOrCreate(['slug' => $slug], ['name' => $roleName, 'type' => $type])->id;
        }, $roleNames);

        $user->roles()->sync($roleIds);
    }

    private function syncRolesFromRoleString(User $user, string $role): void {
        $isAdmin = in_array(strtolower($role), ['admin', Role::ADMIN_SLUG], true);

        if ($isAdmin) {
            $adminRole = Role::firstOrCreate(['slug' => Role::ADMIN_SLUG], ['name' => Role::ADMIN_NAME, 'type' => 'system']);
            $user->roles()->syncWithoutDetaching([$adminRole->id]);

            return;
        }

        $adminRole = Role::whereIn('slug', ['admin', Role::ADMIN_SLUG])->first();
        if ($adminRole) {
            $user->roles()->detach($adminRole->id);
        }
    }

    private function applyRolesUpdate(User $user, array &$validated): void {
        if (isset($validated['roles'])) {
            $this->syncRolesFromNames($user, $validated['roles']);
            unset($validated['roles']);

            return;
        }

        if (isset($validated['role'])) {
            $this->syncRolesFromRoleString($user, (string) $validated['role']);
            unset($validated['role']);
        }
    }
}
