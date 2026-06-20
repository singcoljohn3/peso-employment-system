<?php
require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$request = Illuminate\Http\Request::capture();
$response = $kernel->handle($request);

$pdo = new PDO('mysql:host=127.0.0.1;dbname=talara', 'root', '');
$stmt = $pdo->query('SELECT id, user_id, payload, last_activity FROM sessions ORDER BY last_activity DESC LIMIT 5');
echo "Sessions in DB:\n";
while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    echo "ID: " . substr($row['id'], 0, 20) . "... User: " . ($row['user_id'] ?? 'NULL') . " Last: " . date('Y-m-d H:i:s', $row['last_activity']) . "\n";
    $payload = base64_decode($row['payload']);
    $data = @unserialize($payload);
    if ($data === false) {
        echo "  FAILED TO UNSERIALIZE PAYLOAD\n";
    } else {
        $loginKey = 'login_web_59ba36addc2b2f9401580f014c7f58ea4e30989d';
        echo "  Has auth key: " . (isset($data['auth']) ? 'YES' : 'NO') . "\n";
        echo "  Has login key: " . (isset($data[$loginKey]) ? 'YES' : 'NO') . "\n";
        if (isset($data[$loginKey])) {
            echo "  Login user_id: " . $data[$loginKey] . "\n";
        }
        echo "  Total keys: " . count($data) . "\n";
    }
}
