<?php
$pdo = new PDO('mysql:host=127.0.0.1;dbname=talara', 'root', '');
$stmt = $pdo->query('SELECT id, user_id, payload FROM sessions WHERE user_id = 23 ORDER BY last_activity DESC LIMIT 1');
if ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    echo "Session ID: " . $row['id'] . "\n";
    echo "User ID: " . $row['user_id'] . "\n";
    $payload = unserialize(base64_decode($row['payload']));
    $key = 'login_web_59ba36addc2b2f9401580f014c7f58ea4e30989d';
    echo "Has auth: " . (isset($payload['auth']) ? 'yes' : 'no') . "\n";
    echo "Has login key: " . (isset($payload[$key]) ? 'yes' : 'no') . "\n";
    if (isset($payload[$key])) {
        echo "User ID in session: " . $payload[$key] . "\n";
    }
} else {
    echo "No session found for user 23\n";
}
