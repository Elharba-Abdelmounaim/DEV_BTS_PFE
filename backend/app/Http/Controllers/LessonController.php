<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreLessonRequest;
use App\Http\Resources\LessonResource;
use App\Models\ActivityLog;
use App\Models\Course;
use App\Models\CourseModule;
use App\Models\Lesson;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LessonController extends Controller
{
    /**
     * GET /api/v1/courses/{course}/modules/{module}/lessons
     */
    public function index(Request $request, Course $course, CourseModule $module): JsonResponse
    {
        abort_unless($module->course_id === $course->id, 404);
        $this->authorize('viewAny', [Lesson::class, $module]);

        $query = $module->lessons();
        if ($request->user()->isStudent()) {
            $query->published();
        }

        $lessons = $query->ordered()->get();

        // Append completed flag for authenticated student
        if ($request->user()->isStudent()) {
            $userId    = $request->user()->id;
            $completed = DB::table('lesson_completions')
                            ->where('student_id', $userId)
                            ->whereIn('lesson_id', $lessons->pluck('id'))
                            ->pluck('lesson_id')
                            ->toArray();

            $lessons->each(fn($l) => $l->setAttribute('is_completed', in_array($l->id, $completed)));
        }

        return response()->json(LessonResource::collection($lessons));
    }

    /**
     * POST /api/v1/courses/{course}/modules/{module}/lessons
     */
    public function store(StoreLessonRequest $request, Course $course, CourseModule $module): JsonResponse
    {
        abort_unless($module->course_id === $course->id, 404);
        $this->authorize('create', [Lesson::class, $module]);

        $data = $request->validated();

        // Auto-compute reading time if body provided
        $lesson = new Lesson($data);
        if (! empty($data['body'])) {
            $data['reading_time_minutes'] = $lesson->computeReadingTime();
        }

        $data['order_index'] = $data['order_index'] ?? $module->lessons()->max('order_index') + 1;

        $lesson = $module->lessons()->create($data);

        ActivityLog::record('lesson.created', $lesson, ['module_id' => $module->id]);

        return response()->json(new LessonResource($lesson), 201);
    }

    /**
     * GET /api/v1/courses/{course}/modules/{module}/lessons/{lesson}
     */
    public function show(Request $request, Course $course, CourseModule $module, Lesson $lesson): JsonResponse
    {
        abort_unless($module->course_id === $course->id && $lesson->module_id === $module->id, 404);
        $this->authorize('view', $lesson);

        $lesson->load('assignment:id,title,due_date,max_score');

        // Append completion status for student
        if ($request->user()->isStudent()) {
            $lesson->setAttribute(
                'is_completed',
                $lesson->isCompletedBy($request->user()->id)
            );
        }

        ActivityLog::record('lesson.viewed', $lesson);

        return response()->json(new LessonResource($lesson));
    }

    /**
     * PUT /api/v1/courses/{course}/modules/{module}/lessons/{lesson}
     */
    public function update(StoreLessonRequest $request, Course $course, CourseModule $module, Lesson $lesson): JsonResponse
    {
        abort_unless($module->course_id === $course->id && $lesson->module_id === $module->id, 404);
        $this->authorize('update', $lesson);

        $data = $request->validated();

        // Recompute reading time when body changes
        if (array_key_exists('body', $data) && ! empty($data['body'])) {
            $lesson->fill($data);
            $data['reading_time_minutes'] = $lesson->computeReadingTime();
        }

        $lesson->update($data);
        ActivityLog::record('lesson.updated', $lesson);

        return response()->json(new LessonResource($lesson));
    }

    /**
     * DELETE /api/v1/courses/{course}/modules/{module}/lessons/{lesson}
     */
    public function destroy(Course $course, CourseModule $module, Lesson $lesson): JsonResponse
    {
        abort_unless($module->course_id === $course->id && $lesson->module_id === $module->id, 404);
        $this->authorize('delete', $lesson);

        ActivityLog::record('lesson.deleted', $lesson);
        $lesson->delete();

        return response()->json(['message' => 'Lesson deleted.']);
    }

    /**
     * POST /api/v1/courses/{course}/modules/{module}/lessons/{lesson}/complete
     * Student marks lesson as completed (or un-completes).
     */
    public function complete(Request $request, Course $course, CourseModule $module, Lesson $lesson): JsonResponse
    {
        abort_unless($module->course_id === $course->id && $lesson->module_id === $module->id, 404);
        $this->authorize('complete', $lesson);

        $studentId   = $request->user()->id;
        $isCompleted = $lesson->isCompletedBy($studentId);

        if ($isCompleted) {
            // Toggle off — remove completion
            DB::table('lesson_completions')
              ->where('student_id', $studentId)
              ->where('lesson_id', $lesson->id)
              ->delete();
            $completed = false;
        } else {
            DB::table('lesson_completions')->insertOrIgnore([
                'student_id'   => $studentId,
                'lesson_id'    => $lesson->id,
                'completed_at' => now(),
            ]);
            $completed = true;
            ActivityLog::record('lesson.completed', $lesson);
        }

        // Return updated course progress
        $course->loadCount(['lessons as total_lessons' => fn($q) => $q->where('lessons.is_published', true)]);
        $completedCount = $course->lessons()
                                 ->where('lessons.is_published', true)
                                 ->whereHas('completedBy', fn($q) => $q->where('student_id', $studentId))
                                 ->count();

        return response()->json([
            'is_completed'    => $completed,
            'completed_count' => $completedCount,
            'total_lessons'   => $course->total_lessons,
        ]);
    }

    /**
     * POST /api/v1/courses/{course}/modules/lessons/reorder
     * Body: { module_id: uuid, order: ["lessonId1", ...] }
     */
    public function reorder(Request $request, Course $course, CourseModule $module): JsonResponse
    {
        abort_unless($module->course_id === $course->id, 404);
        $this->authorize('update', $module);

        $data = $request->validate([
            'order'   => ['required', 'array'],
            'order.*' => ['uuid'],
        ]);

        foreach ($data['order'] as $index => $lessonId) {
            $module->lessons()->where('id', $lessonId)->update(['order_index' => $index]);
        }

        return response()->json(['message' => 'Lessons reordered.']);
    }

    /**
     * GET /api/v1/courses/{course}/modules/{module}/lessons/{lesson}/completions
     * Teacher: see which students completed this lesson.
     */
    public function completions(Request $request, Course $course, CourseModule $module, Lesson $lesson): JsonResponse
    {
        abort_unless($module->course_id === $course->id && $lesson->module_id === $module->id, 404);
        $this->authorize('update', $lesson); // teacher only

        $completions = $lesson->completedBy()
                              ->select('users.id', 'users.first_name', 'users.last_name', 'users.email', 'lesson_completions.completed_at')
                              ->get();

        return response()->json(['data' => $completions]);
    }

    /**
     * GET /api/v1/courses/{course}/progress
     * Student: get full progress summary for a course.
     */
    public function progress(Request $request, Course $course): JsonResponse
    {
        $studentId = $request->user()->id;

        $total     = $course->totalPublishedLessons();
        $completed = $course->completedLessonsFor($studentId);

        $moduleProgress = $course->publishedModules()
            ->with(['publishedLessons:id,module_id,title'])
            ->get()
            ->map(function ($module) use ($studentId) {
                $lessonIds    = $module->publishedLessons->pluck('id');
                $doneIds      = DB::table('lesson_completions')
                                  ->where('student_id', $studentId)
                                  ->whereIn('lesson_id', $lessonIds)
                                  ->pluck('lesson_id');
                return [
                    'module_id'        => $module->id,
                    'title'            => $module->title,
                    'total_lessons'    => $lessonIds->count(),
                    'completed_count'  => $doneIds->count(),
                    'completed_ids'    => $doneIds->values(),
                ];
            });

        return response()->json([
            'total_lessons'    => $total,
            'completed_count'  => $completed,
            'percentage'       => $total > 0 ? round(($completed / $total) * 100) : 0,
            'modules'          => $moduleProgress,
        ]);
    }
}
