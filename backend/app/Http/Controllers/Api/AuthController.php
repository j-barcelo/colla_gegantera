<?php

namespace App\Http\Controllers\Api;

use App\Enums\UserStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\LoginRequest;
use App\Http\Requests\Api\RegisterRequest;
use App\Http\Requests\Api\UpdateAvatarRequest;
use App\Http\Requests\Api\UpdatePasswordRequest;
use App\Http\Requests\Api\UpdateProfileRequest;
use App\Http\Resources\UserResource;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller {
    /**
     * Register a new user from a pending invitation.
     */
    public function register(RegisterRequest $request): JsonResponse {
        $validated = $request->validated();

        $user = User::where('email', $validated['email'])->where('status', UserStatus::Pending)->firstOrFail();

        $user->update([
            'name' => $validated['name'],
            'surname' => $validated['surname'],
            'password' => $validated['password'],
            'status' => UserStatus::Active,
            'email_verified_at' => now(),
        ]);

        if ($user->roles()->count() === 0) {
            $defaultRole = Role::firstOrCreate(
                ['slug' => 'portadors'],
                ['name' => Role::DEFAULT_MEMBER_ROLE, 'type' => 'colla'],
            );
            $user->roles()->syncWithoutDetaching([$defaultRole->id]);
        }

        return $this->tokenResponse($user, $validated['device_name'] ?? null, 201);
    }

    /**
     * Authenticate a user and create a token.
     *
     * @throws ValidationException
     */
    public function login(LoginRequest $request): JsonResponse {
        $validated = $request->validated();

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password) || $user->status !== UserStatus::Active) {
            throw ValidationException::withMessages(['email' => [__('auth.failed')]]);
        }

        return $this->tokenResponse($user, $validated['device_name'] ?? null);
    }

    /**
     * Build a standardized authentication token JSON response.
     */
    private function tokenResponse(User $user, ?string $deviceName, int $status = 200): JsonResponse {
        $token = $user->createToken($deviceName ?? 'auth-token')->plainTextToken;

        return response()->json([
            'user' => new UserResource($user),
            'token' => $token,
            'token_type' => 'Bearer',
        ], $status);
    }

    /**
     * Log out the authenticated user by revoking the current token.
     */
    public function logout(Request $request): JsonResponse {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }

    /**
     * Return the authenticated user profile.
     */
    public function me(Request $request): JsonResponse {
        return response()->json(['user' => new UserResource($request->user())]);
    }

    /**
     * Update the authenticated user profile.
     */
    public function updateProfile(UpdateProfileRequest $request): JsonResponse {
        $user = $request->user();
        $user->update($request->validated());

        return response()->json(['user' => new UserResource($user->fresh())]);
    }

    /**
     * Update the authenticated user password.
     */
    public function updatePassword(UpdatePasswordRequest $request): JsonResponse {
        $request->user()->update(['password' => $request->validated()['password']]);

        return response()->json(['message' => 'Password updated successfully']);
    }

    /**
     * Update the authenticated user avatar image.
     */
    public function updateAvatar(UpdateAvatarRequest $request): JsonResponse {
        $user = $request->user();

        if ($user->avatar && str_starts_with($user->avatar, '/storage/avatars/')) {
            Storage::disk('public')->delete(Str::after($user->avatar, '/storage/'));
        }

        $path = $request->file('avatar')->store('avatars', 'public');
        $user->update(['avatar' => '/storage/' . $path]);

        return response()->json(['user' => new UserResource($user->fresh())]);
    }
}
