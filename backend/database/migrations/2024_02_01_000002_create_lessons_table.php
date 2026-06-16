<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /*
    |--------------------------------------------------------------------------
    | lessons
    |--------------------------------------------------------------------------
    | A Lesson belongs to a Module and holds the actual learning content:
    | rich text body, video embed, downloadable files, and an optional
    | linked Assignment for hands-on practice.
    |
    | Content storage strategy:
    |   - body: TipTap JSON (stored as jsonb) — fully structured, portable
    |   - video_url: YouTube / Vimeo embed URL or direct upload path
    |   - video_type: 'youtube' | 'vimeo' | 'upload' | null
    |   - files: jsonb array of { name, url, size, mime_type }
    |   - lesson_type: 'video' | 'reading' | 'quiz' | 'lab'
    */

    public function up(): void
    {
        Schema::create('lessons', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('module_id')->constrained('course_modules')->cascadeOnDelete();

            // ── Identity ──────────────────────────────────────────────────────
            $table->string('title');
            $table->text('excerpt')->nullable();          // short description (card preview)
            $table->string('lesson_type')->default('reading'); // 'video' | 'reading' | 'quiz' | 'lab'

            // ── Rich content ──────────────────────────────────────────────────
            $table->jsonb('body')->nullable();            // TipTap JSON document
            $table->text('body_html')->nullable();        // rendered HTML cache (updated on save)

            // ── Video ─────────────────────────────────────────────────────────
            $table->string('video_url')->nullable();      // embed URL or upload path
            $table->string('video_type')->nullable();     // 'youtube' | 'vimeo' | 'upload'
            $table->integer('duration_minutes')->nullable(); // estimated watch time

            // ── Downloadable files ────────────────────────────────────────────
            $table->jsonb('files')->nullable();           // [{name, url, size, mime_type}]

            // ── Optional link to an Assignment for practice ───────────────────
            $table->foreignUuid('assignment_id')
                  ->nullable()
                  ->constrained('assignments')
                  ->nullOnDelete();

            // ── Ordering & visibility ─────────────────────────────────────────
            $table->integer('order_index')->default(0);
            $table->boolean('is_published')->default(false);
            $table->boolean('is_free_preview')->default(false); // non-enrolled can view

            // ── Estimates ─────────────────────────────────────────────────────
            $table->integer('reading_time_minutes')->nullable(); // auto-computed from body

            $table->timestamps();
            $table->softDeletes();

            $table->index(['module_id', 'order_index']);
            $table->index('is_published');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lessons');
    }
};
