<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE applications MODIFY COLUMN status ENUM('pending','reviewed','shortlisted','interview_scheduled','approved','hired','rejected') NOT NULL DEFAULT 'pending'");
    }

    public function down(): void
    {
        DB::statement("UPDATE applications SET status = 'reviewed' WHERE status = 'approved'");
        DB::statement("ALTER TABLE applications MODIFY COLUMN status ENUM('pending','reviewed','shortlisted','interview_scheduled','hired','rejected') NOT NULL DEFAULT 'pending'");
    }
};
