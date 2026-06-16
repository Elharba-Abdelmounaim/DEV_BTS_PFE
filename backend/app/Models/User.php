<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, HasUuids, Notifiable;

    /*
    |--------------------------------------------------------------------------
    | UUID CONFIG
    |--------------------------------------------------------------------------
    */
    public $incrementing = false;
    protected $keyType = 'string';

    /*
    |--------------------------------------------------------------------------
    | AUTH CONFIG (custom password column)
    |--------------------------------------------------------------------------
    */
    

    public function getAuthPassword(): string
    {
        return $this->password_hash;
    }

    /*
    |--------------------------------------------------------------------------
    | MASS ASSIGNMENT
    |--------------------------------------------------------------------------
    */
    protected $fillable = [
        'email',
        'password_hash',
        'first_name',
        'last_name',
        'role',
        'avatar_url',
        'phone',
        'bio',
        'github_username',
        'github_token_encrypted',
        'is_active',
        'is_verified',
        'email_verification_token',
        'password_reset_token',
        'password_reset_expires',
        'last_login',
    ];

    /*
    |--------------------------------------------------------------------------
    | HIDDEN FIELDS (security)
    |--------------------------------------------------------------------------
    */
    protected $hidden = [
        'password_hash',
        'github_token_encrypted',
        'email_verification_token',
        'password_reset_token',
    ];

    /*
    |--------------------------------------------------------------------------
    | CASTS
    |--------------------------------------------------------------------------
    */
    protected $casts = [
        'is_active'              => 'boolean',
        'is_verified'            => 'boolean',
        'last_login'             => 'datetime',
        'password_reset_expires' => 'datetime',
        'created_at'             => 'datetime',
        'updated_at'             => 'datetime',
    ];

    /*
    |--------------------------------------------------------------------------
    | ACCESSORS
    |--------------------------------------------------------------------------
    */
    public function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }

    /*
    |--------------------------------------------------------------------------
    | ROLE HELPERS
    |--------------------------------------------------------------------------
    */
    public function isTeacher(): bool
    {
        return $this->role === 'teacher';
    }

    public function isStudent(): bool
    {
        return $this->role === 'student';
    }

    /*
    |--------------------------------------------------------------------------
    | RELATIONSHIPS
    |--------------------------------------------------------------------------
    */

    // Teacher → Courses
    public function taughtCourses(): HasMany
    {
        return $this->hasMany(Course::class, 'instructor_id');
    }

    // Student → Enrollments
    public function enrollments(): HasMany
    {
        return $this->hasMany(Enrollment::class, 'student_id');
    }

    // Student → Courses (via enrollments)
    public function enrolledCourses(): HasManyThrough
    {
        return $this->hasManyThrough(
            Course::class,
            Enrollment::class,
            'student_id',
            'id',
            'id',
            'course_id'
        );
    }

    // Student → Submissions
    public function submissions(): HasMany
    {
        return $this->hasMany(Submission::class, 'student_id');
    }

    // Student → Portfolio (1-1)
    public function portfolio(): HasOne
    {
        return $this->hasOne(Portfolio::class, 'student_id');
    }

    // Student → Projects
    public function projects(): HasMany
    {
        return $this->hasMany(Project::class, 'student_id');
    }

    // GitHub Webhooks
    public function githubWebhooks(): HasMany
    {
        return $this->hasMany(GitHubWebhook::class);
    }
}