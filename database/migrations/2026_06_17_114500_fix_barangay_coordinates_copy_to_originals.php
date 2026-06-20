<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Copy lat/lng from duplicate barangays (IDs 16-29) to originals (IDs 1-14)
        DB::statement('
            UPDATE barangays AS origin
            JOIN barangays AS dup ON dup.barangay_name = origin.barangay_name
            SET origin.latitude = dup.latitude,
                origin.longitude = dup.longitude
            WHERE origin.id BETWEEN 1 AND 14
              AND dup.id BETWEEN 16 AND 29
              AND origin.latitude IS NULL
        ');

        // Fix the extra Taboc (ID 15) — copy coords from ID 28 (Taboc)
        $tabocCoords = DB::table('barangays')->where('id', 28)->first(['latitude', 'longitude']);
        if ($tabocCoords) {
            DB::table('barangays')->where('id', 15)->update([
                'latitude' => $tabocCoords->latitude,
                'longitude' => $tabocCoords->longitude,
            ]);
        }
    }

    public function down(): void
    {
        // Reset originals back to null
        DB::table('barangays')->whereBetween('id', [1, 14])->update([
            'latitude' => null,
            'longitude' => null,
        ]);
        DB::table('barangays')->where('id', 15)->update([
            'latitude' => null,
            'longitude' => null,
        ]);
    }
};
