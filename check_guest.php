<?php
$_SERVER['HTTP_HOST'] = 'localhost';
$_SERVER['SERVER_NAME'] = 'localhost';
$_SERVER['DOCUMENT_ROOT'] = __DIR__;
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$kernel->bootstrap();
$router = $app->make('router');
$middleware = $router->getMiddleware();
echo 'guest: ' . ($middleware['guest'] ?? 'NOT REGISTERED') . PHP_EOL;
echo 'auth: ' . ($middleware['auth'] ?? 'NOT REGISTERED') . PHP_EOL;
