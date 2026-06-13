<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSubmissionRequest;
use App\Http\Resources\SubmissionResource;
use App\Models\Assignment;
use App\Models\Enrollment;
use App\Models\Submission;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class SubmissionController extends Controller
{
    // ── GET /api/submissions ──────────────────────────────────────────────
    public function index(Request $request): AnonymousResourceCollection
    {
        $user = $request->user();

        $query = Submission::with(['assignment:id,title,course_id,due_date', 'student:id,first_name,last_name,email']);

        if ($user->isTeacher()) {
            // Teachers see submissions for their own courses
            $query->whereHas('assignment.course', function ($q) use ($user) {
                $q->where('instructor_id', $user->id);
            });
        } else {
            // Students only see their own
            $query->where('student_id', $user->id);
        }

        return SubmissionResource::collection($query->latest('submitted_at')->paginate(20));
    }

    // ── POST /api/submissions ─────────────────────────────────────────────
    public function store(StoreSubmissionRequest $request): SubmissionResource
    {
        $assignment = Assignment::findOrFail($request->assignment_id);
        $user       = $request->user();

        // Guard: student must be enrolled in the course
        $isEnrolled = Enrollment::where('student_id', $user->id)
                                ->where('course_id', $assignment->course_id)
                                ->where('status', 'active')
                                ->exists();

        abort_unless($isEnrolled, 403, 'You must be enrolled in this course to submit assignments.');

        $submission = Submission::create([
            'assignment_id'     => $assignment->id,
            'student_id'        => $user->id,
            'github_repo_url'   => $request->github_repo_url,
            'github_branch'     => $request->github_branch ?? 'main',
            'github_commit_sha' => $request->github_commit_sha,
            'student_notes'     => $request->student_notes,
            'submitted_at'      => now(),
            'submission_status' => 'pending',
            'is_late'           => $assignment->isPastDue(),
        ]);

        return new SubmissionResource($submission->load(['assignment', 'student']));
    }

    // ── GET /api/submissions/{submission} ─────────────────────────────────
    public function show(Submission $submission): SubmissionResource
    {
        $this->authorize('view', $submission);

        return new SubmissionResource($submission->load(['assignment', 'student']));
    }

    // ── PATCH /api/submissions/{submission} ───────────────────────────────
    // Used by teachers to manually grade or update feedback
    public function update(Request $request, Submission $submission): SubmissionResource
    {
        $this->authorize('update', $submission);

        $validated = $request->validate([
            'final_score'      => ['nullable', 'numeric', 'min:0', 'max:1000'],
            'teacher_feedback' => ['nullable', 'string', 'max:5000'],
        ]);

        $submission->update($validated);

        return new SubmissionResource($submission);
    }

    public function mySubmissions(Request $request): AnonymousResourceCollection
    {
        $user = $request->user();

        $query = Submission::with(['assignment:id,title,course_id,due_date', 'student:id,first_name,last_name,email'])
                           ->where('student_id', $user->id)
                           ->latest('submitted_at');

        return SubmissionResource::collection($query->paginate(20));
    }

    // ── GET /api/assignments/{assignment}/submissions ─────────────────────
    public function byAssignment(Assignment $assignment): AnonymousResourceCollection
    {
        $this->authorize('viewAny', [Submission::class, $assignment]);

        $submissions = $assignment->submissions()
                                  ->with('student:id,first_name,last_name,email')
                                  ->latest('submitted_at')
                                  ->paginate(20);

        return SubmissionResource::collection($submissions);
    }
}
