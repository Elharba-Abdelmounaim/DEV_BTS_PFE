<?php

namespace App\Http\Controllers;

use App\Services\AIService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AIController extends Controller
{
    private AIService $aiService;

    public function __construct(AIService $aiService)
    {
        $this->aiService = $aiService;
    }

    public function recommendations(Request $request): JsonResponse
    {
        return response()->json([
            'data' => $this->aiService->getRecommendations($request->user())
        ]);
    }

    public function insights(Request $request): JsonResponse
    {
        return response()->json([
            'data' => $this->aiService->getPerformanceInsights($request->user())
        ]);
    }

    public function chat(Request $request): JsonResponse
    {
        $request->validate(['query' => 'required|string']);
        $response = $this->aiService->askLearningAssistant($request->user(), $request->input('query'));

        return response()->json([
            'reply' => $response
        ]);
    }
}