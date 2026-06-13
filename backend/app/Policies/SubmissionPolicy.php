<?php

namespace App\Policies;

use App\Models\Assignment;
use App\Models\Submission;
use App\Models\User;

class SubmissionPolicy
{
    /**
     * Teachers can view any submission for their courses.
     * Students can view their own submissions.
     */
    public function viewAny(User $user, ?Assignment $assignment = null): bool
    {
        if ($user->isTeacher()) {
            if ($assignment) {
                return $assignment->course->instructor_id === $user->id;
            }
            return true;
        }

        return true; // Filtering handled in controller
    }

    public function view(User $user, Submission $submission): bool
    {
        if ($user->isTeacher()) {
            return $submission->assignment->course->instructor_id === $user->id;
        }

        return $submission->student_id === $user->id;
    }

    /**
     * Students create submissions via Controller logic (enrolment check).
     */
    public function create(User $user): bool
    {
        return $user->isStudent();
    }

    /**
     * Only teachers can update (grade) submissions for their courses.
     */
    public function update(User $user, Submission $submission): bool
    {
        return $user->isTeacher()
            && $submission->assignment->course->instructor_id === $user->id;
    }

    /**
     * Only students can retry their own submissions.
     */
    public function retry(User $user, Submission $submission): bool
    {
        return $user->isStudent() && $submission->student_id === $user->id;
    }
}
