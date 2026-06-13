<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCourseRequest;

use App\Http\Resources\CourseResource;
use App\Models\Course;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Log;

class CourseController extends Controller
{
    // ── GET /api/courses ──────────────────────────────────────────────────
    // Students see all active courses; teachers see their own
    public function index(Request $request): AnonymousResourceCollection
    {
        $user = $request->user();

        $query = Course::with('instructor')
                       ->withCount(['enrollments' => fn($q) => $q->where('status', 'active')]);

        if ($user->isTeacher()) {
            $query->where('instructor_id', $user->id);
        } else {
            $query->active();
        }

        return CourseResource::collection($query->latest()->paginate(20));
    }

    // ── POST /api/courses ─────────────────────────────────────────────────
    public function store(StoreCourseRequest $request): CourseResource
    {
        $this->authorize('create', Course::class);

        $course = $request->user()->taughtCourses()->create($request->validated());

        return new CourseResource($course->load('instructor'));
    }
    // ── GET /api/courses/{course} ─────────────────────────────────────────
    public function show(Request $request, Course $course): CourseResource
    {
        $user = $request->user();

        $course->load([
            'instructor',
            'assignments' => function ($q) use ($user) {
                $q->orderBy('due_date');
                if ($user->isStudent()) {
                    $q->published();
                }
            },
        ]);

        return new CourseResource($course);
    }

    // ── PUT /api/courses/{course} ─────────────────────────────────────────
    public function update(StoreCourseRequest $request, Course $course): CourseResource
    {
        $this->authorize('update', $course);
        $course->update($request->validated());

        return new CourseResource($course);
    }

    // ── DELETE /api/courses/{course} ──────────────────────────────────────
    public function destroy(Course $course): JsonResponse
    {
        $this->authorize('delete', $course);
        $course->delete();

        return response()->json(['message' => 'Course deleted.'], 200);
    }
}
