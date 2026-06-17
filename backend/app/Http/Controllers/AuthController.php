<?php

namespace App\Http\Controllers;

use App\Http\Requests\RegisterRequest;
use App\Http\Requests\LoginRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    // ── POST /api/auth/register ───────────────────────────────────────────
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'first_name'               => $request->first_name,
            'last_name'                => $request->last_name,
            'email'                    => $request->email,
            'password_hash'            => Hash::make($request->password),
            'role'                     => $request->role,          // 'teacher' | 'student'
            'github_username'          => $request->github_username,
            'email_verification_token' => Str::random(64),
            'is_active'                => true,
            'is_verified'              => false,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user'  => new UserResource($user),
        ], 201);
    }

    // ── POST /api/auth/login ──────────────────────────────────────────────
    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password_hash)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        if (! $user->is_active) {
            return response()->json(['message' => 'Account is deactivated.'], 403);
        }

        // Revoke old tokens to prevent token accumulation
        $user->tokens()->delete();

        $token = $user->createToken('auth_token')->plainTextToken;
        $user->update(['last_login' => now()]);

        return response()->json([
            'token' => $token,
            'user'  => new UserResource($user),
        ]);
    }

    // ── POST /api/auth/logout ─────────────────────────────────────────────
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully.']);
    }

    // ── GET /api/auth/me ──────────────────────────────────────────────────
    public function me(Request $request): UserResource
    {
        return new UserResource($request->user());
    }

    // ── GET /api/auth/verify/{token} ──────────────────────────────────────
    public function verifyEmail(string $token): JsonResponse
    {
        $user = User::where('email_verification_token', $token)->firstOrFail();

        $user->update([
            'is_verified'              => true,
            'email_verification_token' => null,
        ]);

        return response()->json(['message' => 'Email verified successfully.']);
    }

    // ── POST /api/auth/verify-email?token=... ─────────────────────────────
    public function verifyEmailQuery(Request $request): JsonResponse
    {
        $token = $request->query('token');

        if (! $token) {
            return response()->json(['message' => 'Token is required.'], 400);
        }

        $user = User::where('email_verification_token', $token)->firstOrFail();

        $user->update([
            'is_verified'              => true,
            'email_verification_token' => null,
        ]);

        return response()->json(['message' => 'Email verified successfully.']);
    }

    // ── PUT /api/auth/update ──────────────────────────────────────────────
    public function update(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'first_name'      => ['required', 'string', 'max:255'],
            'last_name'       => ['required', 'string', 'max:255'],
            'email'           => ['required', 'string', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'github_username' => ['nullable', 'string', 'max:255'],
            'bio'             => ['nullable', 'string', 'max:500'],
            'phone'           => ['nullable', 'string', 'max:20'],
            'location'        => ['nullable', 'string', 'max:255'],
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'Profile updated successfully.',
            'user'    => new UserResource($user),
        ]);
    }

    // ── POST /api/auth/change-password ────────────────────────────────────
    public function changePassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => ['required', 'current_password'],
            'password'         => ['required', 'confirmed', 'min:8'],
        ]);

        $request->user()->update([
            'password_hash' => Hash::make($request->password),
        ]);

        return response()->json(['message' => 'Password changed successfully.']);
    }

    // ── POST /api/auth/avatar ─────────────────────────────────────────────
    public function updateAvatar(Request $request): JsonResponse
    {
        $request->validate([
            'avatar' => ['required', 'image', 'max:5120'], // 5MB
        ]);

        $user = $request->user();
        
        if ($request->hasFile('avatar')) {
            $path = $request->file('avatar')->store('avatars', 'public');
            
            // Delete old avatar if it exists and is local
            if ($user->avatar_url && str_contains($user->avatar_url, '/storage/avatars/')) {
                $oldPath = str_replace(asset('storage/'), '', $user->avatar_url);
                \Illuminate\Support\Facades\Storage::disk('public')->delete($oldPath);
            }

            $user->update(['avatar_url' => asset('storage/' . $path)]);
        }

        return response()->json([
            'message' => 'Avatar updated successfully.',
            'user'    => new UserResource($user),
        ]);
    }
}