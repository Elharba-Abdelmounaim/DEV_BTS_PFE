<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Submission;
use App\Models\Enrollment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function stats(Request $request): JsonResponse
    {
        $user = $request->user();
        $isTeacher = $user->isTeacher();

        if ($isTeacher) {
            $coursesCount = Course::where('instructor_id', $user->id)->count();
            
            $submissionsQuery = Submission::whereHas('assignment.course', function ($q) use ($user) {
                $q->where('instructor_id', $user->id);
            });
            
            $submissionsCount = $submissionsQuery->count();
            $gradedCount = (clone $submissionsQuery)->where('submission_status', 'graded')->count();
            $pendingCount = (clone $submissionsQuery)->where('submission_status', 'pending')->count();
            
            $avgScore = (clone $submissionsQuery)->where('submission_status', 'graded')->avg('final_score');
            
            $enrollmentsCount = Enrollment::whereHas('course', function ($q) use ($user) {
                $q->where('instructor_id', $user->id);
            })->where('status', 'active')->count();

            // Weekly submissions trend for charts
            $submissionTrends = $submissionsQuery
                ->select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as count'))
                ->where('created_at', '>=', now()->subDays(7))
                ->groupBy('date')
                ->orderBy('date', 'ASC')
                ->get();
                
        } else {
            $coursesCount = Enrollment::where('student_id', $user->id)->where('status', 'active')->count();
            
            $submissionsQuery = Submission::where('student_id', $user->id);
            
            $submissionsCount = $submissionsQuery->count();
            $gradedCount = (clone $submissionsQuery)->where('submission_status', 'graded')->count();
            $pendingCount = (clone $submissionsQuery)->where('submission_status', 'pending')->count();
            
            $avgScore = (clone $submissionsQuery)->where('submission_status', 'graded')->avg('final_score');
            
            $enrollmentsCount = $coursesCount; // For student, enrollment count is course count.
            
            // Weekly submissions trend for charts
            $submissionTrends = $submissionsQuery
                ->select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as count'))
                ->where('created_at', '>=', now()->subDays(7))
                ->groupBy('date')
                ->orderBy('date', 'ASC')
                ->get();
        }

        $unreadNotifications = $user->unreadNotifications()->count();

        return response()->json([
            'data' => [
                'coursesCount' => $coursesCount,
                'submissionsCount' => $submissionsCount,
                'gradedCount' => $gradedCount,
                'pendingCount' => $pendingCount,
                'avgScore' => $avgScore ? round($avgScore) : null,
                'unreadNotifications' => $unreadNotifications,
                'enrollmentsCount' => $enrollmentsCount,
                'trends' => $submissionTrends
            ]
        ]);
    }
}