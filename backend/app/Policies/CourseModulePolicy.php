<?php
// ── CourseModulePolicy.php ─────────────────────────────────────────────────

namespace App\Policies;

use App\Models\Course;
use App\Models\CourseModule;
use App\Models\User;

class CourseModulePolicy
{
    /** Any authenticated user can view module lists for accessible courses. */
    public function viewAny(User $user, Course $course): bool
    {
        return true;
    }

    /** Students see published modules; teachers see all within their course. */
    public function view(User $user, CourseModule $module): bool
    {
        if ($user->isTeacher()) {
            return $module->course->instructor_id === $user->id;
        }
        return $module->is_published;
    }

    /** Only the course instructor can create modules. */
    public function create(User $user, Course $course): bool
    {
        return $user->isTeacher() && $course->instructor_id === $user->id;
    }

    /** Only the course instructor can update modules. */
    public function update(User $user, CourseModule $module): bool
    {
        return $user->isTeacher() && $module->course->instructor_id === $user->id;
    }

    /** Only the course instructor can delete modules. */
    public function delete(User $user, CourseModule $module): bool
    {
        return $user->isTeacher() && $module->course->instructor_id === $user->id;
    }
}
