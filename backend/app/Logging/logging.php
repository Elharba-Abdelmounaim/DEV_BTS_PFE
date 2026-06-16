<?php

use Monolog\Handler\NullHandler;
use Monolog\Handler\StreamHandler;
use Monolog\Handler\SyslogUdpHandler;

return [

    'default' => env('LOG_CHANNEL', 'stack'),

    'deprecations' => [
        'channel' => env('LOG_DEPRECATIONS_CHANNEL', 'null'),
        'trace'   => false,
    ],

    'channels' => [

        // ── Primary stack: logtail in production, daily in dev ────────────────
        'stack' => [
            'driver'            => 'stack',
            'channels'          => env('APP_ENV') === 'production'
                ? ['logtail', 'daily']
                : ['daily'],
            'ignore_exceptions' => false,
        ],

        // ── Logtail (Better Stack) HTTP ingestion ─────────────────────────────
        // Install: composer require logtail/monolog-logtail
        // Set LOGTAIL_TOKEN in .env
        'logtail' => [
            'driver' => 'custom',
            'via'    => App\Logging\LogtailLogger::class,
            'token'  => env('LOGTAIL_TOKEN'),
            'level'  => env('LOG_LEVEL', 'debug'),
        ],

        // ── Structured JSON for stdout (Docker / Kubernetes) ──────────────────
        'stdout' => [
            'driver'    => 'monolog',
            'handler'   => StreamHandler::class,
            'formatter' => Monolog\Formatter\JsonFormatter::class,
            'with'      => ['stream' => 'php://stdout'],
            'level'     => env('LOG_LEVEL', 'debug'),
        ],

        // ── Daily rotating file (dev fallback) ────────────────────────────────
        'daily' => [
            'driver' => 'daily',
            'path'   => storage_path('logs/laravel.log'),
            'level'  => env('LOG_LEVEL', 'debug'),
            'days'   => 14,
        ],

        // ── Single file ───────────────────────────────────────────────────────
        'single' => [
            'driver' => 'single',
            'path'   => storage_path('logs/laravel.log'),
            'level'  => env('LOG_LEVEL', 'debug'),
        ],

        // ── Emergency log ─────────────────────────────────────────────────────
        'emergency' => [
            'path' => storage_path('logs/laravel.log'),
        ],

        'null' => [
            'driver'  => 'monolog',
            'handler' => NullHandler::class,
        ],
    ],
];
