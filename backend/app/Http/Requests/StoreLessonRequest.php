<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreLessonRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'title'               => ['required', 'string', 'max:200'],
            'excerpt'             => ['nullable', 'string', 'max:500'],
            'lesson_type'         => ['required', 'in:video,reading,quiz,lab'],
            'body'                => ['nullable', 'array'],    // TipTap JSON
            'body_html'           => ['nullable', 'string'],   // pre-rendered HTML
            'video_url'           => ['nullable', 'url', 'max:500'],
            'video_type'          => ['nullable', 'in:youtube,vimeo,upload'],
            'duration_minutes'    => ['nullable', 'integer', 'min:1', 'max:600'],
            'files'               => ['nullable', 'array'],
            'files.*.name'        => ['required', 'string', 'max:200'],
            'files.*.url'         => ['required', 'url'],
            'files.*.size'        => ['nullable', 'integer'],
            'files.*.mime_type'   => ['nullable', 'string'],
            'assignment_id'       => ['nullable', 'uuid', 'exists:assignments,id'],
            'order_index'         => ['integer', 'min:0'],
            'is_published'        => ['boolean'],
            'is_free_preview'     => ['boolean'],
        ];
    }
}
