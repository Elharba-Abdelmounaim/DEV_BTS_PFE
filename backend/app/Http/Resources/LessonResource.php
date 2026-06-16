<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LessonResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $isTeacher = $request->user()?->isTeacher();

        return [
            'id'                   => $this->id,
            'module_id'            => $this->module_id,
            'title'                => $this->title,
            'excerpt'              => $this->excerpt,
            'lesson_type'          => $this->lesson_type,

            // Full content — only include in single-lesson show responses
            // For list views, body is intentionally omitted for performance
            'body'                 => $this->when(
                $this->relationLoaded('module') || $request->route()->getName() === 'v1.lessons.show',
                $this->body
            ),
            'body_html'            => $this->when(
                $this->body_html !== null,
                $this->body_html
            ),

            'video_url'            => $this->video_url,
            'video_type'           => $this->video_type,
            'duration_minutes'     => $this->duration_minutes,
            'reading_time_minutes' => $this->reading_time_minutes,

            'files'                => $this->files ?? [],

            // Linked assignment (shown in lesson viewer)
            'assignment'           => $this->whenLoaded('assignment', fn() => [
                'id'        => $this->assignment->id,
                'title'     => $this->assignment->title,
                'due_date'  => $this->assignment->due_date,
                'max_score' => $this->assignment->max_score,
            ]),

            'order_index'          => $this->order_index,
            'is_published'         => $this->is_published,
            'is_free_preview'      => $this->is_free_preview,

            // Student-specific: completion status (set dynamically in controller)
            'is_completed'         => $this->when(
                $this->is_completed !== null,
                $this->is_completed ?? false
            ),

            'created_at'           => $this->created_at,
            'updated_at'           => $this->updated_at,
        ];
    }
}
