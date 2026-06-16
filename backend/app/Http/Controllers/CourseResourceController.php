<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Course;
use App\Models\CourseResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CourseResourceController extends Controller
{
    /**
     * GET /api/courses/{course}/resources
     */
    public function index(Request $request, Course $course): JsonResponse
    {
        $this->authorize('view', $course);

        $query = $course->resources()->orderBy('order_index');

        // Students only see public resources
        if ($request->user()->isStudent()) {
            $query->where('is_public', true);
        }

        return response()->json(['data' => $query->get()]);
    }

    /**
     * POST /api/courses/{course}/resources
     */
    public function store(Request $request, Course $course): JsonResponse
    {
        $this->authorize('update', $course);

        $data = $request->validate([
            'title'         => ['required', 'string', 'max:200'],
            'description'   => ['nullable', 'string'],
            'resource_type' => ['required', 'in:file,link,video,document'],
            'file_url'      => ['nullable', 'url'],
            'external_url'  => ['nullable', 'url'],
            'content'       => ['nullable', 'string'],
            'order_index'   => ['integer', 'min:0'],
            'is_public'     => ['boolean'],
        ]);

        $resource = $course->resources()->create([
            ...$data,
            'created_by'  => $request->user()->id,
            'order_index' => $data['order_index'] ?? $course->resources()->max('order_index') + 1,
        ]);

        ActivityLog::record('course_resource.created', $resource, ['course_id' => $course->id]);

        return response()->json($resource, 201);
    }

    /**
     * PUT /api/courses/{course}/resources/{resource}
     */
    public function update(Request $request, Course $course, CourseResource $resource): JsonResponse
    {
        $this->authorize('update', $course);
        abort_unless($resource->course_id === $course->id, 404);

        $data = $request->validate([
            'title'         => ['sometimes', 'string', 'max:200'],
            'description'   => ['nullable', 'string'],
            'file_url'      => ['nullable', 'url'],
            'external_url'  => ['nullable', 'url'],
            'content'       => ['nullable', 'string'],
            'order_index'   => ['integer', 'min:0'],
            'is_public'     => ['boolean'],
        ]);

        $resource->update($data);
        ActivityLog::record('course_resource.updated', $resource);

        return response()->json($resource);
    }

    /**
     * DELETE /api/courses/{course}/resources/{resource}
     */
    public function destroy(Request $request, Course $course, CourseResource $resource): JsonResponse
    {
        $this->authorize('update', $course);
        abort_unless($resource->course_id === $course->id, 404);

        ActivityLog::record('course_resource.deleted', $resource);
        $resource->delete();

        return response()->json(['message' => 'Resource deleted.']);
    }

    /**
     * POST /api/courses/{course}/resources/reorder
     * Accepts: { order: ["uuid1", "uuid2", ...] }
     */
    public function reorder(Request $request, Course $course): JsonResponse
    {
        $this->authorize('update', $course);

        $data = $request->validate([
            'order'   => ['required', 'array'],
            'order.*' => ['uuid'],
        ]);

        foreach ($data['order'] as $index => $resourceId) {
            $course->resources()
                ->where('id', $resourceId)
                ->update(['order_index' => $index]);
        }

        return response()->json(['message' => 'Resources reordered.']);
    }
}
