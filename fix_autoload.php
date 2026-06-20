<?php
// Manually fix autoload PSR4 for dompdf
$psr4 = require 'vendor/composer/autoload_psr4.php';
$changed = false;

$packages = [
    'Barryvdh\\DomPDF\\' => 'vendor/barryvdh/laravel-dompdf/src',
    'Dompdf\\' => 'vendor/dompdf/dompdf/src',
    'FontLib\\' => 'vendor/dompdf/php-font-lib/src/FontLib',
    'Svg\\' => 'vendor/dompdf/php-svg-lib/src/Svg',
];

foreach ($packages as $prefix => $path) {
    $fullPath = __DIR__ . '/' . $path;
    if (!isset($psr4[$prefix])) {
        echo "Adding $prefix => $path\n";
        $psr4[$prefix] = [$fullPath];
        $changed = true;
    } elseif (!in_array($fullPath, $psr4[$prefix])) {
        echo "Adding path for $prefix\n";
        $psr4[$prefix][] = $fullPath;
        $changed = true;
    }
}

if ($changed) {
    $content = '<?php' . "\n\nreturn " . var_export($psr4, true) . ";\n";
    file_put_contents('vendor/composer/autoload_psr4.php', $content);
    echo "Updated autoload_psr4.php\n";
} else {
    echo "No changes needed\n";
}
