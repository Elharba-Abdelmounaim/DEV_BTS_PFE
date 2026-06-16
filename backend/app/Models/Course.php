<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Course extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    public $incrementing = false;
    protected $keyType = 'string';

    /*
    |--------------------------------------------------------------------------
    | Mass Assignment
    |--------------------------------------------------------------------------
    */
    protected $fillable = [
        'instructor_id',
        'code',
        'title',
        'description',
        'academic_year',
        'semester',
        'credits',
        'max_students',
        'is_active',
    ];

    /*
    |--------------------------------------------------------------------------
    | Casts
    |--------------------------------------------------------------------------
    */
    protected $casts = [
        'is_active'     => 'boolean',
        'academic_year'  => 'integer',
        'credits'        => 'integer',
        'max_students'   => 'integer',
        'created_at'     => 'datetime',
        'updated_at'     => 'datetime',
        'deleted_at'     => 'datetime',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function instructor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'instructor_id');
    }

    public function assignments(): HasMany
    {
        return $this->hasMany(Assignment::class);
    }

    public function enrollments(): HasMany
    {
        return $this->hasMany(Enrollment::class);
    }

    public function students(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'enrollments', 'course_id', 'student_id')
            ->withPivot(['status', 'final_grade', 'enrollment_date'])
            ->withTimestamps();
    }

    /*
    |--------------------------------------------------------------------------
    | LESSON SYSTEM (LMS CORE)
    |--------------------------------------------------------------------------
    */

    public function modules(): HasMany
    {
        return $this->hasMany(CourseModule::class)
            ->orderBy('order_index');
    }

    public function publishedModules(): HasMany
    {
        return $this->hasMany(CourseModule::class)
            ->where('is_published', true)
            ->orderBy('order_index');
    }

    public function lessons(): HasManyThrough
    {
        return $this->hasManyThrough(
            Lesson::class,
            CourseModule::class,
            'course_id',
            'module_id',
            'id',
            'id'
        )->orderBy('lessons.order_index');
    }

    /*
    |--------------------------------------------------------------------------
    | Scopes
    |--------------------------------------------------------------------------
    */

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /*
    |--------------------------------------------------------------------------
    | Business Logic
    |--------------------------------------------------------------------------
    */

    public function hasCapacity(): bool
    {
        return $this->enrollments()
            ->where('status', 'active')
            ->count() < $this->max_students;
    }

    public function totalPublishedLessons(): int
    {
        return $this->lessons()
            ->where('lessons.is_published', true)
            ->count();
    }

    public function completedLessonsFor(string $studentId): int
    {
        return $this->lessons()
            ->whereHas('completedBy', function ($q) use ($studentId) {
                $q->where('student_id', $studentId);
            })
            ->count();
    }
}