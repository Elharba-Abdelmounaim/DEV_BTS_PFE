<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Portfolio;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PortfolioController extends Controller
{
    /**
     * GET /api/portfolio
     * Returns the authenticated student's portfolio.
     */
    public function show(Request $request): JsonResponse
    {
        $portfolio = Portfolio::firstOrCreate(
            ['student_id' => $request->user()->id],
            ['theme' => 'default', 'is_published' => false]
        );

        $portfolio->load(['projects' => fn($q) => $q->orderBy('is_featured', 'desc')->orderBy('created_at', 'desc')]);

        return response()->json($portfolio);
    }

    /**
     * PUT /api/portfolio
     * Update the authenticated student's portfolio.
     */
    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'bio'           => ['nullable', 'string', 'max:1000'],
            'skills'        => ['nullable', 'string'],
            'contact_email' => ['nullable', 'email'],
            'resume_url'    => ['nullable', 'url'],
            'portfolio_url' => ['nullable', 'url'],
            'theme'         => ['nullable', 'string', 'in:default,dark,minimal,ocean'],
            'social_links'  => ['nullable', 'array'],
            'social_links.github'   => ['nullable', 'url'],
            'social_links.linkedin' => ['nullable', 'url'],
            'social_links.twitter'  => ['nullable', 'url'],
            'social_links.website'  => ['nullable', 'url'],
        ]);

        $portfolio = Portfolio::updateOrCreate(
            ['student_id' => $request->user()->id],
            $data
        );

        ActivityLog::record('portfolio.updated', $portfolio);

        return response()->json($portfolio);
    }

    /**
     * POST /api/portfolio/publish
     * Toggle portfolio visibility.
     */
    public function publish(Request $request): JsonResponse
    {
        $portfolio = Portfolio::firstOrCreate(['student_id' => $request->user()->id]);
        $portfolio->update([
            'is_published'      => ! $portfolio->is_published,
            'last_generated_at' => $portfolio->is_published ? null : now(),
        ]);

        ActivityLog::record(
            $portfolio->is_published ? 'portfolio.published' : 'portfolio.unpublished',
            $portfolio
        );

        return response()->json([
            'message'      => $portfolio->is_published ? 'Portfolio published.' : 'Portfolio unpublished.',
            'is_published' => $portfolio->is_published,
        ]);
    }

    // ── Projects ──────────────────────────────────────────────────────────────

    public function projects(Request $request): JsonResponse
    {
        $projects = $request->user()
            ->projects()
            ->orderBy('is_featured', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['data' => $projects]);
    }

    public function storeProject(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title'           => ['required', 'string', 'max:200'],
            'description'     => ['nullable', 'string'],
            'github_repo_url' => ['nullable', 'url'],
            'live_demo_url'   => ['nullable', 'url'],
            'technologies'    => ['nullable', 'string'],
            'project_type'    => ['required', 'in:personal,assignment'],
            'course_id'       => ['nullable', 'uuid', 'exists:courses,id'],
            'assignment_id'   => ['nullable', 'uuid', 'exists:assignments,id'],
            'is_featured'     => ['boolean'],
            'is_public'       => ['boolean'],
            'tags'            => ['nullable', 'string'],
        ]);

        $project = $request->user()->projects()->create($data);

        ActivityLog::record('project.created', $project);

        return response()->json($project, 201);
    }

    public function updateProject(Request $request, string $projectId): JsonResponse
    {
        $project = $request->user()->projects()->findOrFail($projectId);

        $data = $request->validate([
            'title'           => ['sometimes', 'string', 'max:200'],
            'description'     => ['nullable', 'string'],
            'github_repo_url' => ['nullable', 'url'],
            'live_demo_url'   => ['nullable', 'url'],
            'technologies'    => ['nullable', 'string'],
            'is_featured'     => ['boolean'],
            'is_public'       => ['boolean'],
            'tags'            => ['nullable', 'string'],
        ]);

        $project->update($data);

        ActivityLog::record('project.updated', $project);

        return response()->json($project);
    }

    public function destroyProject(Request $request, string $projectId): JsonResponse
    {
        $project = $request->user()->projects()->findOrFail($projectId);

        ActivityLog::record('project.deleted', $project);
        $project->delete();

        return response()->json(['message' => 'Project deleted.']);
    }
}
