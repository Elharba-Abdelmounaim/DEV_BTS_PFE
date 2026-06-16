<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * AddDeprecationHeader
 *
 * Attach RFC 8594 Deprecation headers to unversioned /api/* responses
 * when the time comes to sunset the backward-compat aliases.
 *
 * Usage — register in bootstrap/app.php or Kernel.php on the api middleware group:
 *
 *   Route::middleware(['auth:sanctum', AddDeprecationHeader::class])
 *        ->prefix('auth')
 *        ->group(...);
 *
 * Or apply per-route group only to /api/* (non-v1) aliases:
 *
 *   Route::middleware(AddDeprecationHeader::class)->group(function () {
 *       // unversioned alias routes
 *   });
 *
 * The Deprecation header tells API consumers they should migrate to /api/v1/*.
 */
class AddDeprecationHeader
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Only add if this is NOT already a /api/v1/ request
        if (! str_starts_with($request->getPathInfo(), '/api/v1/')) {
            $response->headers->set(
                'Deprecation',
                'true'
            );
            $response->headers->set(
                'Sunset',
                // Set this to the planned removal date (RFC 7231 HTTP-date)
                env('API_V0_SUNSET_DATE', 'Sat, 01 Jan 2026 00:00:00 GMT')
            );
            $response->headers->set(
                'Link',
                '<' . url('/api/v1' . $request->getPathInfo()) . '>; rel="successor-version"'
            );
        }

        return $response;
    }
}
