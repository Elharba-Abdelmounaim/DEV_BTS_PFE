<?php
// ── CourseModuleResource.php ──────────────────────────────────────────────────

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CourseModuleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'course_id'   => $this->course_id,
            'title'       => $this->title,
            'description' => $this->description,
            'order_index' => $this->order_index,
            'is_published'=> $this->is_published,

            // Lesson summaries — always loaded in index
            'lessons' => LessonResource::collection(
                $this->whenLoaded('lessons',
                    fn() => $request->user()?->isStudent()
                        ? $this->lessons->where('is_published', true)->values()
                        : $this->lessons
                )
            ),

            // Student progress data (set dynamically in controller)
            'completed_lesson_ids' => $this->when(
                $this->completed_lesson_ids !== null,
                $this->completed_lesson_ids ?? []
            ),

            'lessons_count'      => $this->publishedLessons()->count(),
            'created_at'         => $this->created_at,
            'updated_at'         => $this->updated_at,
        ];
    }
}
