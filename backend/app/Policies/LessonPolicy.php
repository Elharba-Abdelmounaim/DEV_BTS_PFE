<?php

namespace App\Policies;

use App\Models\Lesson;
use App\Models\CourseModule;
use App\Models\User;

class LessonPolicy
{
    public function viewAny(User $user, CourseModule $module): bool
    {
        return true;
    }

    /**
     * Students: can view if lesson is published AND (enrolled OR free preview).
     * Teachers: can view any lesson in their own course.
     */
    public function view(User $user, Lesson $lesson): bool
    {
        $course = $lesson->module->course;

        if ($user->isTeacher()) {
            return $course->instructor_id === $user->id;
        }

        if (! $lesson->is_published) {
            return false;
        }

        if ($lesson->is_free_preview) {
            return true;
        }

        // Must be enrolled with active status
        return $course->enrollments()
                      ->where('student_id', $user->id)
                      ->where('status', 'active')
                      ->exists();
    }

    public function create(User $user, CourseModule $module): bool
    {
        return $user->isTeacher() && $module->course->instructor_id === $user->id;
    }

    public function update(User $user, Lesson $lesson): bool
    {
        return $user->isTeacher() && $lesson->module->course->instructor_id === $user->id;
    }

    public function delete(User $user, Lesson $lesson): bool
    {
        return $user->isTeacher() && $lesson->module->course->instructor_id === $user->id;
    }

    /** Only enrolled students can mark lessons complete. */
    public function complete(User $user, Lesson $lesson): bool
    {
        if ($user->isTeacher()) return false;

        return $lesson->module->course->enrollments()
                      ->where('student_id', $user->id)
                      ->where('status', 'active')
                      ->exists();
    }
}
