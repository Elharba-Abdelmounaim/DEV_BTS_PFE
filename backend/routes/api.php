<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Controllers
|--------------------------------------------------------------------------
*/

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\AssignmentController;
use App\Http\Controllers\SubmissionController;
use App\Http\Controllers\EnrollmentController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\CourseResourceController;
use App\Http\Controllers\PortfolioController;
use App\Http\Controllers\WebhookController;
use App\Http\Controllers\CourseModuleController;
use App\Http\Controllers\LessonController;

/*
|--------------------------------------------------------------------------
| DevEduHub API — Versioned Architecture
|--------------------------------------------------------------------------
| /api/v1 → official API
| /api    → legacy support
|--------------------------------------------------------------------------
*/

# ============================================================
# 🔵 V1 API (OFFICIAL)
# ============================================================

Route::prefix('v1')->group(function () {

    /*
    |-------------------------
    | AUTH
    |-------------------------
    */
    Route::middleware('throttle:5,1')->prefix('auth')->group(function () {
        Route::post('register', [AuthController::class, 'register']);
        Route::post('login',    [AuthController::class, 'login']);
        Route::get('verify/{token}', [AuthController::class, 'verifyEmail']);
    });

    Route::middleware('auth:sanctum')->prefix('auth')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('me',      [AuthController::class, 'me']);
    });

    /*
    |-------------------------
    | COURSES
    |-------------------------
    */
    Route::middleware('auth:sanctum')->group(function () {
        Route::apiResource('courses', CourseController::class);
    });

    /*
    |-------------------------
    | ASSIGNMENTS
    |-------------------------
    */
    Route::middleware('auth:sanctum')->group(function () {

        Route::get('courses/{course}/assignments', [AssignmentController::class, 'index']);
        Route::apiResource('assignments', AssignmentController::class)->except(['index']);

        Route::patch('assignments/{assignment}/publish', [AssignmentController::class, 'togglePublish']);
    });

    /*
    |-------------------------
    | SUBMISSIONS
    |-------------------------
    */
    Route::middleware('auth:sanctum')->group(function () {

        Route::middleware('throttle:10,1')->post(
            'submissions',
            [SubmissionController::class, 'store']
        );

        Route::middleware('throttle:3,60')->post(
            'submissions/{submission}/retry',
            [SubmissionController::class, 'retry']
        );

        Route::get('submissions', [SubmissionController::class, 'index']);
        Route::get('submissions/my', [SubmissionController::class, 'mySubmissions']);
        Route::get('submissions/{submission}', [SubmissionController::class, 'show']);
        Route::patch('submissions/{submission}', [SubmissionController::class, 'update']);
        Route::get('assignments/{assignment}/submissions', [SubmissionController::class, 'byAssignment']);
    });

    /*
    |-------------------------
    | ENROLLMENTS
    |-------------------------
    */
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('enrollments', [EnrollmentController::class, 'index']);
        Route::post('enrollments', [EnrollmentController::class, 'store']);
        Route::delete('enrollments/{enrollment}', [EnrollmentController::class, 'destroy']);
    });

    /*
    |-------------------------
    | NOTIFICATIONS
    |-------------------------
    */
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('notifications', [NotificationController::class, 'index']);
        Route::get('notifications/unread', [NotificationController::class, 'unread']);
        Route::post('notifications/{id}/read', [NotificationController::class, 'markRead']);
        Route::post('notifications/read-all', [NotificationController::class, 'markAllRead']);
    });

    /*
    |-------------------------
    | PORTFOLIO
    |-------------------------
    */
    Route::middleware('auth:sanctum')->prefix('portfolio')->group(function () {

        Route::get('/', [PortfolioController::class, 'show']);
        Route::put('/', [PortfolioController::class, 'update']);
        Route::post('publish', [PortfolioController::class, 'publish']);

        Route::get('projects', [PortfolioController::class, 'projects']);
        Route::post('projects', [PortfolioController::class, 'storeProject']);
        Route::put('projects/{id}', [PortfolioController::class, 'updateProject']);
        Route::delete('projects/{id}', [PortfolioController::class, 'destroyProject']);
    });

    /*
    |-------------------------
    | COURSE RESOURCES
    |-------------------------
    */
    Route::middleware('auth:sanctum')->prefix('courses/{course}/resources')->group(function () {
        Route::get('/', [CourseResourceController::class, 'index']);
        Route::post('/', [CourseResourceController::class, 'store']);
        Route::post('reorder', [CourseResourceController::class, 'reorder']);
        Route::put('{resource}', [CourseResourceController::class, 'update']);
        Route::delete('{resource}', [CourseResourceController::class, 'destroy']);
    });

    /*
    |-------------------------
    | WEBHOOKS
    |-------------------------
    */
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('webhooks/register', [WebhookController::class, 'register']);
        Route::delete('webhooks/{webhook}', [WebhookController::class, 'destroy']);
    });

    /*
    |-------------------------
    | LESSONS SYSTEM (NEW CORE LMS)
    |-------------------------
    */
    Route::middleware('auth:sanctum')->prefix('courses/{course}')->group(function () {

        // Modules
        Route::get('modules', [CourseModuleController::class, 'index']);
        Route::post('modules', [CourseModuleController::class, 'store']);
        Route::post('modules/reorder', [CourseModuleController::class, 'reorder']);

        Route::get('modules/{module}', [CourseModuleController::class, 'show']);
        Route::put('modules/{module}', [CourseModuleController::class, 'update']);
        Route::delete('modules/{module}', [CourseModuleController::class, 'destroy']);

        // Lessons
        Route::prefix('modules/{module}/lessons')->group(function () {

            Route::get('/', [LessonController::class, 'index']);
            Route::post('/', [LessonController::class, 'store']);
            Route::post('reorder', [LessonController::class, 'reorder']);

            Route::get('{lesson}', [LessonController::class, 'show']);
            Route::put('{lesson}', [LessonController::class, 'update']);
            Route::delete('{lesson}', [LessonController::class, 'destroy']);

            Route::post('{lesson}/complete', [LessonController::class, 'complete']);
            Route::get('{lesson}/completions', [LessonController::class, 'completions']);
        });

        Route::get('progress', [LessonController::class, 'progress']);
    });
});

# ============================================================
# 🟡 LEGACY API (BACKWARD COMPATIBILITY)
# ============================================================

Route::middleware('throttle:5,1')->group(function () {
    Route::post('auth/register', [AuthController::class, 'register']);
    Route::post('auth/login',    [AuthController::class, 'login']);
    Route::get('auth/verify/{token}', [AuthController::class, 'verifyEmail']);
});

Route::middleware('auth:sanctum')->group(function () {

    Route::post('auth/logout', [AuthController::class, 'logout']);
    Route::get('auth/me',      [AuthController::class, 'me']);

    Route::apiResource('courses', CourseController::class);

    Route::get('courses/{course}/assignments', [AssignmentController::class, 'index']);
    Route::apiResource('assignments', AssignmentController::class)->except(['index']);
    Route::patch('assignments/{assignment}/publish', [AssignmentController::class, 'togglePublish']);

    Route::post('submissions', [SubmissionController::class, 'store']);
    Route::post('submissions/{submission}/retry', [SubmissionController::class, 'retry']);

    Route::get('submissions', [SubmissionController::class, 'index']);
    Route::get('submissions/my', [SubmissionController::class, 'mySubmissions']);
    Route::get('submissions/{submission}', [SubmissionController::class, 'show']);

    Route::get('enrollments', [EnrollmentController::class, 'index']);
    Route::post('enrollments', [EnrollmentController::class, 'store']);
    Route::delete('enrollments/{enrollment}', [EnrollmentController::class, 'destroy']);

    Route::get('notifications', [NotificationController::class, 'index']);
    Route::get('notifications/unread', [NotificationController::class, 'unread']);
    Route::post('notifications/{id}/read', [NotificationController::class, 'markRead']);
    Route::post('notifications/read-all', [NotificationController::class, 'markAllRead']);

    Route::get('portfolio', [PortfolioController::class, 'show']);
});

# ============================================================
# 🟢 WEBHOOKS (NEVER VERSIONED)
# ============================================================

Route::post('webhooks/github', [WebhookController::class, 'githubPush']);