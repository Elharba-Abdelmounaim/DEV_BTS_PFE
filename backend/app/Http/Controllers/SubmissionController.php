<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSubmissionRequest;
use App\Http\Resources\SubmissionResource;
use App\Jobs\GradeSubmissionJob;
use App\Models\Assignment;
use App\Models\Enrollment;
use App\Models\Submission;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
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
    public function store(StoreSubmissionRequest $request): SubmissionResource|JsonResponse
    {
        $assignment = Assignment::findOrFail($request->assignment_id);
        $user       = $request->user();

        // Guard: student must be enrolled in the course
        $isEnrolled = Enrollment::where('student_id', $user->id)
                                ->where('course_id', $assignment->course_id)
                                ->where('status', 'active')
                                ->exists();

        abort_unless($isEnrolled, 403, 'You must be enrolled in this course to submit assignments.');

        if ($assignment->isPastDue() && ! $assignment->late_submission_allowed) {
            return response()->json([
                'message' => 'The assignment is past due and late submissions are not allowed.',
                'errors'  => ['assignment_id' => ['Submission deadline passed.']]
            ], 422);
        }

        $alreadySubmitted = Submission::where('assignment_id', $assignment->id)
                                      ->where('student_id', $user->id)
                                      ->exists();

        if ($alreadySubmitted) {
            return response()->json([
                'message' => 'You have already submitted for this assignment.',
                'errors'  => ['assignment_id' => ['Duplicate submission.']]
            ], 422);
        }

        $submission = Submission::create([
            'assignment_id'     => $assignment->id,
            'student_id'        => $user->id,
            'github_repo_url'   => $request->github_repo_url,
            'github_branch'     => $request->github_branch ?? 'main',
            'github_commit_sha' => $request->github_commit_sha,
            'student_notes'     => $request->student_notes,
            'submitted_at'      => now(),
            'submission_status' => $assignment->isAutoGradable() ? 'queued' : 'pending',
            'is_late'           => $assignment->isPastDue(),
        ]);

        public function isAutoGradable(): bool
            {
                $testCases = $this->test_cases;
                $dockerConfig = $this->docker_config;
                
                if (is_string($testCases)) {
                    $testCases = json_decode($testCases, true);
                }
                if (is_string($dockerConfig)) {
                    $dockerConfig = json_decode($dockerConfig, true);
                }
                
                return ! empty($testCases) && ! empty($dockerConfig);
            }

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

    // ── POST /api/submissions/{submission}/retry ──────────────────────────
    public function retry(Request $request, Submission $submission): JsonResponse
    {
        $this->authorize('retry', $submission);

        abort_unless($submission->isFailed(), 422, 'Only failed submissions can be retried.');

        $submission->update([
            'submission_status' => 'queued',
            'retry_count'       => $submission->retry_count + 1,
        ]);

        GradeSubmissionJob::dispatch($submission);

        return response()->json(['message' => 'Grading retry queued.']);
    }
}
