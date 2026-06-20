<?php
$json = json_decode(file_get_contents('vendor/composer/installed.json'), true);
$packages = $json['packages'] ?? $json;
foreach ($packages as $pkg) {
    if (str_contains($pkg['name'] ?? '', 'dompdf')) {
        echo $pkg['name'] . "\n";
        echo "  autoload: " . json_encode($pkg['autoload'] ?? []) . "\n";
    }
}
// Check where Dompdf namespace should map
$loader = require 'vendor/autoload.php';
echo "\nLooking for Dompdf\\Dompdf:\n";
$file = $loader->findFile('Dompdf\\Dompdf');
echo ($file ? "Found: $file" : "NOT FOUND") . "\n";

echo "\nLooking for Barryvdh\\DomPDF\\ServiceProvider:\n";
$file = $loader->findFile('Barryvdh\\DomPDF\\ServiceProvider');
echo ($file ? "Found: $file" : "NOT FOUND") . "\n";
