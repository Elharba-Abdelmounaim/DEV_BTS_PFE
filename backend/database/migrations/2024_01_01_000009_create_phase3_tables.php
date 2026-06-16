<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // ── portfolios ────────────────────────────────────────────────────────
        Schema::create('portfolios', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->foreignUuid('student_id')->constrained('users')->cascadeOnDelete();
            $table->string('portfolio_url')->nullable();
            $table->string('custom_domain')->nullable()->unique();
            $table->string('theme')->default('default');
            $table->text('bio')->nullable();
            $table->text('skills')->nullable();
            $table->jsonb('social_links')->nullable();
            $table->string('contact_email')->nullable();
            $table->string('resume_url')->nullable();
            $table->boolean('is_published')->default(false);
            $table->timestamp('last_generated_at')->nullable();
            $table->timestamps();
            $table->unique('student_id');
        });

        // ── projects ──────────────────────────────────────────────────────────
        Schema::create('projects', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->foreignUuid('student_id')->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('github_repo_url')->nullable();
            $table->string('live_demo_url')->nullable();
            $table->text('technologies')->nullable();
            $table->string('project_type')->default('personal');
            $table->foreignUuid('course_id')->nullable()->constrained('courses')->nullOnDelete();
            $table->foreignUuid('assignment_id')->nullable()->constrained('assignments')->nullOnDelete();
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_public')->default(true);
            $table->string('thumbnail_url')->nullable();
            $table->text('tags')->nullable();
            $table->timestamps();
        });

        // ── deployment_configs ────────────────────────────────────────────────
        Schema::create('deployment_configs', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->foreignUuid('project_id')->constrained('projects')->cascadeOnDelete();
            $table->string('platform');
            $table->string('platform_project_id')->nullable();
            $table->string('deployment_url')->nullable();
            $table->string('status')->default('pending');
            $table->jsonb('environment_vars')->nullable();
            $table->timestamp('last_deployed_at')->nullable();
            $table->timestamps();
        });

        // ── github_webhooks ───────────────────────────────────────────────────
        Schema::create('github_webhooks', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('repository_full_name');
            $table->string('webhook_id')->nullable();
            $table->text('secret_token_encrypted');
            $table->text('events')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->unique(['user_id', 'repository_full_name']);
        });

        // ── activity_logs ─────────────────────────────────────────────────────
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->foreignUuid('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action');
            $table->string('resource_type')->nullable();
            $table->uuid('resource_id')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->jsonb('metadata')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->index(['user_id', 'created_at']);
            $table->index(['resource_type', 'resource_id']);
            $table->index('action');
        });

        // ── system_settings ───────────────────────────────────────────────────
        Schema::create('system_settings', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->text('description')->nullable();
            $table->string('category')->default('general');
            $table->foreignUuid('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        // ── course_resources ──────────────────────────────────────────────────
        Schema::create('course_resources', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->foreignUuid('course_id')->constrained('courses')->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('resource_type');
            $table->string('file_url')->nullable();
            $table->string('external_url')->nullable();
            $table->text('content')->nullable();
            $table->integer('order_index')->default(0);
            $table->boolean('is_public')->default(true);
            $table->foreignUuid('created_by')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
            $table->index(['course_id', 'order_index']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('course_resources');
        Schema::dropIfExists('system_settings');
        Schema::dropIfExists('activity_logs');
        Schema::dropIfExists('github_webhooks');
        Schema::dropIfExists('deployment_configs');
        Schema::dropIfExists('projects');
        Schema::dropIfExists('portfolios');
    }
};
