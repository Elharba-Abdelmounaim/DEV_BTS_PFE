<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

class ActivityLog extends Model
{
    use HasUuids;

    public $incrementing  = false;
    protected $keyType    = 'string';
    public $timestamps    = false;      // only created_at
    protected $table      = 'activity_logs';

    protected $fillable = [
        'user_id', 'action', 'resource_type',
        'resource_id', 'ip_address', 'user_agent', 'metadata',
    ];

    protected $casts = [
        'metadata'   => 'array',
        'created_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Convenience factory — call from controllers or model observers.
     *
     * ActivityLog::record('submission.created', $submission, ['score' => 87]);
     */
    public static function record(
        string  $action,
        ?Model  $resource = null,
        array   $metadata = []
    ): self {
        return static::create([
            'user_id'       => Auth::id(),
            'action'        => $action,
            'resource_type' => $resource ? class_basename($resource) : null,
            'resource_id'   => $resource?->getKey(),
            'ip_address'    => Request::ip(),
            'user_agent'    => Request::userAgent(),
            'metadata'      => $metadata ?: null,
        ]);
    }
}
