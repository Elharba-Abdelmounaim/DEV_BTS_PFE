<?php
// CourseResource.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CourseResource extends Model
{
    use HasUuids;

    public $incrementing = false;
    protected $keyType   = 'string';
    protected $table     = 'course_resources';

    protected $fillable = [
        'course_id', 'title', 'description', 'resource_type',
        'file_url', 'external_url', 'content',
        'order_index', 'is_public', 'created_by',
    ];

    protected $casts = [
        'is_public'   => 'boolean',
        'order_index' => 'integer',
        'created_at'  => 'datetime',
        'updated_at'  => 'datetime',
    ];

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
