<?php

namespace Database\Seeders;

use App\Models\Barangay;
use Illuminate\Database\Seeder;

class BarangaySeeder extends Seeder
{
    public function run(): void
    {
        $barangays = [
            ['name' => 'Awang',        'lat' => 8.4787, 'lng' => 124.4785],
            ['name' => 'Bagocboc',     'lat' => 8.4203, 'lng' => 124.5012],
            ['name' => 'Barra',        'lat' => 8.5084, 'lng' => 124.6072],
            ['name' => 'Bonbon',       'lat' => 8.5246, 'lng' => 124.5708],
            ['name' => 'Cauyonan',     'lat' => 8.3275, 'lng' => 124.4472],
            ['name' => 'Igpit',        'lat' => 8.5095, 'lng' => 124.5879],
            ['name' => 'Limonda',      'lat' => 8.3353, 'lng' => 124.4285],
            ['name' => 'Luyongbonbon', 'lat' => 8.5278, 'lng' => 124.5711],
            ['name' => 'Malanang',     'lat' => 8.4743, 'lng' => 124.5556],
            ['name' => 'Nangcaon',     'lat' => 8.3696, 'lng' => 124.4495],
            ['name' => 'Patag',        'lat' => 8.4924, 'lng' => 124.5540],
            ['name' => 'Poblacion',    'lat' => 8.5202, 'lng' => 124.5735],
            ['name' => 'Taboc',        'lat' => 8.5141, 'lng' => 124.5800],
            ['name' => 'Tingalan',     'lat' => 8.3685, 'lng' => 124.4710],
        ];

        foreach ($barangays as $b) {
            Barangay::create([
                'barangay_name' => $b['name'],
                'municipality' => 'Opol',
                'latitude' => $b['lat'],
                'longitude' => $b['lng'],
            ]);
        }
    }
}
