<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        // Seed pre-built PESO admin accounts
        $this->call(AdminSeeder::class);

        // Seed barangays for Opol, Misamis Oriental
        $this->call(BarangaySeeder::class);

        // Seed default job vacancies for agencies
        $this->call(AgencyJobSeeder::class);
    }
}
