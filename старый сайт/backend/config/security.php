<?php

return [
    // Change this to a random strong string in production
    'jwt_secret' => 'your_secret_key_here_change_in_production', 
    'jwt_algo' => 'HS256',
    'jwt_expiration' => 3600 * 24, // 24 hours
    'cors_origins' => [
        'http://localhost',
        'http://127.0.0.1' 
    ]
];
