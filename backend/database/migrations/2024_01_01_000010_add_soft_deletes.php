<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /*
    |--------------------------------------------------------------------------
    | Add soft delete support to core tables
    |--------------------------------------------------------------------------
    | Using nullable deleted_at — fully backward-compatible.
    | Existing rows are unaffected. Deleted records become queryable via
    | Model::withTrashed() for audit and restore purposes.
    */

    public function up(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            $table->softDeletes();  // adds deleted_at nullable timestamp
        });

        Schema::table('assignments', function (Blueprint $table) {
            $table->softDeletes();
        });

        Schema::table('submissions', function (Blueprint $table) {
            $table->softDeletes();
        });

        // Phase 3 tables
        Schema::table('portfolios', function (Blueprint $table) {
            $table->softDeletes();
        });

        Schema::table('projects', function (Blueprint $table) {
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::table('courses',     fn($t) => $t->dropSoftDeletes());
        Schema::table('assignments', fn($t) => $t->dropSoftDeletes());
        Schema::table('submissions', fn($t) => $t->dropSoftDeletes());
        Schema::table('portfolios',  fn($t) => $t->dropSoftDeletes());
        Schema::table('projects',    fn($t) => $t->dropSoftDeletes());
    }
};
