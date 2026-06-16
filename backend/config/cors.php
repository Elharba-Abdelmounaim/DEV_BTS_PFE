<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie', 'login', 'logout', 'register'],

    'allowed_methods' => ['*'],

    // الحل: سمح لكل preview URLs ديال Vercel
    'allowed_origins' => ['*'],  // ← سمح لكل origins (development فقط)

    // أو أحسن: pattern باش يسمح لكل URLs ديال Vercel
    // 'allowed_origins' => [],
    // 'allowed_origins_patterns' => [
    //     '/^https:\/\/dev-bts-.*\.vercel\.app$/',
    // ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,
];