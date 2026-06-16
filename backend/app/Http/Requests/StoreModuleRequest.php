<?php
// ── StoreModuleRequest.php ────────────────────────────────────────────────────

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreModuleRequest extends FormRequest
{
    public function authorize(): bool { return true; } // policy check in controller

    public function rules(): array
    {
        return [
            'title'        => ['required', 'string', 'max:200'],
            'description'  => ['nullable', 'string', 'max:1000'],
            'order_index'  => ['integer', 'min:0'],
            'is_published' => ['boolean'],
        ];
    }
}
