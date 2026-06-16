<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DeploymentConfig extends Model
{
    use HasUuids;

    public $incrementing = false;
    protected $keyType   = 'string';
    protected $table     = 'deployment_configs';

    protected $fillable = [
        'project_id', 'platform', 'platform_project_id',
        'deployment_url', 'status', 'environment_vars', 'last_deployed_at',
    ];

    protected $casts = [
        'environment_vars' => 'array',
        'last_deployed_at' => 'datetime',
        'created_at'       => 'datetime',
        'updated_at'       => 'datetime',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }
}
