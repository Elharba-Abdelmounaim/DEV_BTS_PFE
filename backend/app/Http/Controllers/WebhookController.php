<?php

namespace App\Http\Controllers;

use App\Jobs\GradeSubmissionJob;
use App\Models\ActivityLog;
use App\Models\GitHubWebhook;
use App\Models\Submission;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Log;

class WebhookController extends Controller
{
    /**
     * POST /api/webhooks/github
     *
     * Receives a GitHub push event, verifies the HMAC signature,
     * finds any pending submission whose repo matches, and dispatches
     * GradeSubmissionJob automatically.
     *
     * No auth middleware — this is called by GitHub's servers.
     */
    public function githubPush(Request $request): JsonResponse
    {
        $signature = $request->header('X-Hub-Signature-256', '');
        $event     = $request->header('X-GitHub-Event', '');
        $payload   = $request->getContent();

        // Only act on push events
        if ($event !== 'push') {
            return response()->json(['message' => "Event '{$event}' ignored."], 200);
        }

        $repoFullName = data_get($request->json()->all(), 'repository.full_name');
        $cloneUrl     = data_get($request->json()->all(), 'repository.clone_url');
        $headCommit   = data_get($request->json()->all(), 'head_commit.id');

        if (! $repoFullName) {
            return response()->json(['message' => 'Missing repository.full_name'], 400);
        }

        // Find the registered webhook for this repo
        $webhook = GitHubWebhook::where('repository_full_name', $repoFullName)
            ->where('is_active', true)
            ->first();

        if (! $webhook) {
            Log::info("[Webhook] No active webhook registered for {$repoFullName}");
            return response()->json(['message' => 'No webhook registered for this repo.'], 200);
        }

        // ── Verify HMAC signature ─────────────────────────────────────────────
        if (! $webhook->verifySignature($payload, $signature)) {
            Log::warning("[Webhook] Invalid signature for {$repoFullName}");
            return response()->json(['message' => 'Invalid signature.'], 401);
        }

        // ── Find matching pending submission ───────────────────────────────────
        $repoHttps  = "https://github.com/{$repoFullName}";
        $repoSsh    = "git@github.com:{$repoFullName}.git";

        $submission = Submission::where(function ($q) use ($repoHttps, $repoSsh) {
                $q->where('github_repo_url', $repoHttps)
                  ->orWhere('github_repo_url', $repoSsh);
            })
            ->where('submission_status', 'pending')
            ->whereHas('assignment', fn($q) => $q->whereNotNull('test_cases')->whereNotNull('docker_config'))
            ->latest('submitted_at')
            ->first();

        if (! $submission) {
            Log::info("[Webhook] No pending auto-gradable submission found for {$repoFullName}");
            return response()->json(['message' => 'No matching submission to grade.'], 200);
        }

        // Pin the commit SHA from the push event
        if ($headCommit) {
            $submission->update([
                'github_commit_sha' => $headCommit,
                'submission_status' => 'queued',
            ]);
        }

        // Dispatch grading job
        GradeSubmissionJob::dispatch($submission)->onQueue('grading');

        ActivityLog::record('webhook.grading_triggered', $submission, [
            'repo'       => $repoFullName,
            'commit_sha' => $headCommit,
        ]);

        Log::info("[Webhook] Grading dispatched for submission {$submission->id}");

        return response()->json([
            'message'       => 'Grading queued.',
            'submission_id' => $submission->id,
        ], 200);
    }

    /**
     * POST /api/webhooks/register
     *
     * Teacher or student registers a GitHub repo to trigger auto-grading on push.
     */
    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'repository_full_name' => ['required', 'string', 'regex:/^[\w\-\.]+\/[\w\-\.]+$/'],
        ]);

        $secret  = bin2hex(random_bytes(20));   // 40-char hex — used as HMAC secret

        $webhook = GitHubWebhook::updateOrCreate(
            [
                'user_id'              => $request->user()->id,
                'repository_full_name' => $data['repository_full_name'],
            ],
            [
                'secret_token_encrypted' => Crypt::encryptString($secret),
                'events'                 => 'push',
                'is_active'              => true,
            ]
        );

        ActivityLog::record('webhook.registered', $webhook, [
            'repository' => $data['repository_full_name'],
        ]);

        return response()->json([
            'message'              => 'Webhook registered. Add this secret to your GitHub repo webhook settings.',
            'webhook_url'          => url('/api/webhooks/github'),
            'secret'               => $secret,          // shown only once
            'repository_full_name' => $webhook->repository_full_name,
        ], 201);
    }

    /**
     * DELETE /api/webhooks/{webhook}
     */
    public function destroy(Request $request, GitHubWebhook $webhook): JsonResponse
    {
        abort_unless($webhook->user_id === $request->user()->id, 403);

        $webhook->update(['is_active' => false]);

        ActivityLog::record('webhook.deregistered', $webhook);

        return response()->json(['message' => 'Webhook deactivated.']);
    }
}
