<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreModuleRequest;
use App\Http\Resources\CourseModuleResource;
use App\Models\ActivityLog;
use App\Models\Course;
use App\Models\CourseModule;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CourseModuleController extends Controller
{
    /**
     * GET /api/v1/courses/{course}/modules
     * List all modules (teacher sees all; student sees published only).
     */
    public function index(Request $request, Course $course): JsonResponse
    {
        $this->authorize('viewAny', [CourseModule::class, $course]);

        $query = $course->modules()->with(['publishedLessons' => fn($q) => $q->select('id', 'module_id', 'title', 'lesson_type', 'duration_minutes', 'reading_time_minutes', 'order_index', 'is_published', 'is_free_preview')]);

        if ($request->user()->isStudent()) {
            $query->published();
        }

        $modules = $query->get();

        // For students: append their completion count per module
        if ($request->user()->isStudent()) {
            $userId     = $request->user()->id;
            $lessonIds  = $modules->pluck('publishedLessons')->flatten()->pluck('id');
            $completed  = \DB::table('lesson_completions')
                              ->where('student_id', $userId)
                              ->whereIn('lesson_id', $lessonIds)
                              ->pluck('lesson_id')
                              ->toArray();

            $modules->each(function ($module) use ($completed) {
                $module->setAttribute(
                    'completed_lesson_ids',
                    collect($completed)->intersect($module->publishedLessons->pluck('id'))->values()
                );
            });
        }

        return response()->json([
            'data'            => CourseModuleResource::collection($modules),
            'total_lessons'   => $course->totalPublishedLessons(),
        ]);
    }

    /**
     * POST /api/v1/courses/{course}/modules
     */
    public function store(StoreModuleRequest $request, Course $course): JsonResponse
    {
        $this->authorize('create', [CourseModule::class, $course]);

        $module = $course->modules()->create([
            ...$request->validated(),
            'order_index' => $request->input('order_index', $course->modules()->max('order_index') + 1),
        ]);

        ActivityLog::record('module.created', $module, ['course_id' => $course->id]);

        return response()->json(new CourseModuleResource($module), 201);
    }

    /**
     * GET /api/v1/courses/{course}/modules/{module}
     */
    public function show(Request $request, Course $course, CourseModule $module): JsonResponse
    {
        $this->authorize('view', $module);
        abort_unless($module->course_id === $course->id, 404);

        $module->load(['lessons' => fn($q) => $request->user()->isStudent()
            ? $q->published()->ordered()
            : $q->ordered()
        ]);

        return response()->json(new CourseModuleResource($module));
    }

    /**
     * PUT /api/v1/courses/{course}/modules/{module}
     */
    public function update(StoreModuleRequest $request, Course $course, CourseModule $module): JsonResponse
    {
        $this->authorize('update', $module);
        abort_unless($module->course_id === $course->id, 404);

        $module->update($request->validated());
        ActivityLog::record('module.updated', $module);

        return response()->json(new CourseModuleResource($module));
    }

    /**
     * DELETE /api/v1/courses/{course}/modules/{module}
     */
    public function destroy(Course $course, CourseModule $module): JsonResponse
    {
        $this->authorize('delete', $module);
        abort_unless($module->course_id === $course->id, 404);

        ActivityLog::record('module.deleted', $module);
        $module->delete(); // soft delete cascades via observer if needed

        return response()->json(['message' => 'Module deleted.']);
    }

    /**
     * POST /api/v1/courses/{course}/modules/reorder
     * Body: { order: ["uuid1", "uuid2", ...] }
     */
    public function reorder(Request $request, Course $course): JsonResponse
    {
        $this->authorize('create', [CourseModule::class, $course]);

        $data = $request->validate([
            'order'   => ['required', 'array'],
            'order.*' => ['uuid'],
        ]);

        foreach ($data['order'] as $index => $moduleId) {
            $course->modules()->where('id', $moduleId)->update(['order_index' => $index]);
        }

        return response()->json(['message' => 'Modules reordered.']);
    }
}
