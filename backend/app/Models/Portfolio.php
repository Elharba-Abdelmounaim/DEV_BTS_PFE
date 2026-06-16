<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Portfolio extends Model
{
    use HasFactory, HasUuids , SoftDeletes;

    public $incrementing = false;
    protected $keyType   = 'string';

    protected $fillable = [
        'student_id',
        'portfolio_url',
        'custom_domain',
        'theme',
        'bio',
        'skills',
        'social_links',
        'contact_email',
        'resume_url',
        'is_published',
        'last_generated_at',
    ];

    protected $casts = [
        'social_links'      => 'array',
        'is_published'      => 'boolean',
        'last_generated_at' => 'datetime',
        'created_at'        => 'datetime',
        'updated_at'        => 'datetime',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function projects(): HasMany
    {
        return $this->hasMany(Project::class, 'student_id', 'student_id');
    }

    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }
}
