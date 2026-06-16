<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /*
    |--------------------------------------------------------------------------
    | lesson_completions
    |--------------------------------------------------------------------------
    | Tracks which students have marked each lesson as complete.
    | Used to compute per-student progress bars.
    |
    | Composite PK (student_id, lesson_id) prevents duplicate completions.
    | completed_at is when the student clicked "Mark as completed".
    */

    public function up(): void
    {
        Schema::create('lesson_completions', function (Blueprint $table) {
            $table->foreignUuid('student_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('lesson_id')->constrained('lessons')->cascadeOnDelete();
            $table->timestamp('completed_at')->useCurrent();

            $table->primary(['student_id', 'lesson_id']);
            $table->index(['student_id', 'lesson_id']);   // explicit for query planner
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lesson_completions');
    }
};
