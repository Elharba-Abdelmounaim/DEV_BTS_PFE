<?php

use Monolog\Handler\NullHandler;
use Monolog\Handler\StreamHandler;
use Monolog\Processor\PsrLogMessageProcessor;

return [

    /*
    |--------------------------------------------------------------------------
    | Default Log Channel
    |--------------------------------------------------------------------------
    */
    'default' => env('LOG_CHANNEL', 'stack'),

    /*
    |--------------------------------------------------------------------------
    | Deprecations
    |--------------------------------------------------------------------------
    */
    'deprecations' => [
        'channel' => env('LOG_DEPRECATIONS_CHANNEL', 'null'),
        'trace'   => env('LOG_DEPRECATIONS_TRACE', false),
    ],

    /*
    |--------------------------------------------------------------------------
    | Channels
    |--------------------------------------------------------------------------
    */
    'channels' => [

        /*
        |--------------------------------------------------------------
        | MAIN STACK (PRODUCTION READY)
        |--------------------------------------------------------------
        | - Logtail for external monitoring
        | - daily logs for fallback debugging
        */
        'stack' => [
            'driver' => 'stack',
            'channels' => env('APP_ENV') === 'production'
                ? ['logtail', 'daily']
                : ['daily'],
            'ignore_exceptions' => false,
        ],

        /*
        |--------------------------------------------------------------
        | LOGTAIL (Better Stack)
        |--------------------------------------------------------------
        */
        'logtail' => [
            'driver' => 'custom',
            'via' => App\Logging\LogtailLogger::class,
            'token' => env('LOGTAIL_TOKEN'),
            'level' => env('LOG_LEVEL', 'debug'),
        ],

        /*
        |--------------------------------------------------------------
        | STDOUT (Docker / Kubernetes)
        |--------------------------------------------------------------
        */
        'stdout' => [
            'driver' => 'monolog',
            'handler' => StreamHandler::class,
            'with' => [
                'stream' => 'php://stdout',
            ],
            'processors' => [
                PsrLogMessageProcessor::class,
            ],
            'level' => env('LOG_LEVEL', 'debug'),
        ],

        /*
        |--------------------------------------------------------------
        | DAILY LOG FILES (DEV + fallback)
        |--------------------------------------------------------------
        */
        'daily' => [
            'driver' => 'daily',
            'path' => storage_path('logs/laravel.log'),
            'level' => env('LOG_LEVEL', 'debug'),
            'days' => env('LOG_DAILY_DAYS', 14),
            'replace_placeholders' => true,
        ],

        /*
        |--------------------------------------------------------------
        | SINGLE FILE (optional fallback)
        |--------------------------------------------------------------
        */
        'single' => [
            'driver' => 'single',
            'path' => storage_path('logs/laravel.log'),
            'level' => env('LOG_LEVEL', 'debug'),
        ],

        /*
        |--------------------------------------------------------------
        | EMERGENCY LOG (critical fallback)
        |--------------------------------------------------------------
        */
        'emergency' => [
            'path' => storage_path('logs/laravel.log'),
        ],

        /*
        |--------------------------------------------------------------
        | NULL LOGGER
        |--------------------------------------------------------------
        */
        'null' => [
            'driver' => 'monolog',
            'handler' => NullHandler::class,
        ],
    ],
];