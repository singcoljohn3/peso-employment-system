<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Pre-built PESO admin accounts.
     */
    public function run(): void
    {
        // Main PESO Administrator
        User::factory()->create([
            'name' => 'PESO Administrator',
            'email' => 'peso.admin@example.com',
            'password' => Hash::make('peso123456'),
            'role' => 'admin',
        ]);

        // Additional Admin Account
        User::updateOrCreate(
            ['email' => 'admin123@gmail.com'],
            [
                'name' => 'Admin',
                'email' => 'admin123@gmail.com',
                'password' => Hash::make('papay12345'),
                'role' => 'admin'
            ]
        );
    }
}
