<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Lesson extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    public $incrementing = false;
    protected $keyType   = 'string';

    protected $fillable = [
        'module_id',
        'title',
        'excerpt',
        'lesson_type',
        'body',
        'body_html',
        'video_url',
        'video_type',
        'duration_minutes',
        'files',
        'assignment_id',
        'order_index',
        'is_published',
        'is_free_preview',
        'reading_time_minutes',
    ];

    protected $casts = [
        'body'            => 'array',    // TipTap JSON
        'files'           => 'array',    // [{name, url, size, mime_type}]
        'is_published'    => 'boolean',
        'is_free_preview' => 'boolean',
        'order_index'     => 'integer',
        'duration_minutes'    => 'integer',
        'reading_time_minutes' => 'integer',
        'created_at'      => 'datetime',
        'updated_at'      => 'datetime',
        'deleted_at'      => 'datetime',
    ];

    // ── Relationships ─────────────────────────────────────────────────────────

    public function module(): BelongsTo
    {
        return $this->belongsTo(CourseModule::class, 'module_id');
    }

    public function assignment(): BelongsTo
    {
        return $this->belongsTo(Assignment::class);
    }

    /**
     * Students who completed this lesson.
     * Pivot: lesson_completions(student_id, lesson_id, completed_at)
     */
    public function completedBy(): BelongsToMany
    {
        return $this->belongsToMany(
            User::class,
            'lesson_completions',
            'lesson_id',
            'student_id'
        )->withPivot('completed_at');
    }

    // ── Scopes ────────────────────────────────────────────────────────────────

    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('order_index');
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /**
     * Check if a given student has completed this lesson.
     */
    public function isCompletedBy(string $studentId): bool
    {
        return $this->completedBy()->where('student_id', $studentId)->exists();
    }

    /**
     * Auto-compute reading time from body word count.
     * Average reading speed: 200 words/minute.
     */
    public function computeReadingTime(): int
    {
        if (empty($this->body)) return 1;

        // Extract all text nodes from TipTap JSON
        $text  = $this->extractText($this->body);
        $words = str_word_count(strip_tags($text));

        return max(1, (int) ceil($words / 200));
    }

    private function extractText(array $node): string
    {
        $text = $node['text'] ?? '';
        foreach ($node['content'] ?? [] as $child) {
            $text .= ' ' . $this->extractText($child);
        }
        return $text;
    }
}
