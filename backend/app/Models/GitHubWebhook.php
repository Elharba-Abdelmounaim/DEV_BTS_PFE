<?php
// GitHubWebhook.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Crypt;

class GitHubWebhook extends Model
{
    use HasUuids;

    public $incrementing = false;
    protected $keyType   = 'string';
    protected $table     = 'github_webhooks';

    protected $fillable = [
        'user_id', 'repository_full_name', 'webhook_id',
        'secret_token_encrypted', 'events', 'is_active',
    ];

    protected $casts = [
        'is_active'  => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /** Decrypt the HMAC secret for signature verification. */
    public function getSecretTokenAttribute(): string
    {
        return Crypt::decryptString($this->secret_token_encrypted);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Verify X-Hub-Signature-256 header against the payload.
     */
    public function verifySignature(string $payload, string $signature): bool
    {
        $expected = 'sha256=' . hash_hmac('sha256', $payload, $this->secret_token);
        return hash_equals($expected, $signature);
    }
}
