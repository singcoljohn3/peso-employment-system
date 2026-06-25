<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $table = config('database.connections.mysql.prefix') . 'resumes';

        DB::statement("ALTER TABLE {$table} MODIFY COLUMN status ENUM('draft','pending','generated','ready_for_download','downloaded','updated') NOT NULL DEFAULT 'draft'");
    }

    public function down(): void
    {
        $table = config('database.connections.mysql.prefix') . 'resumes';

        DB::statement("ALTER TABLE {$table} MODIFY COLUMN status ENUM('pending','generated','ready_for_download') NOT NULL DEFAULT 'pending'");
    }
};
