<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE job_seekers MODIFY COLUMN sex ENUM('Male','Female','Other','Prefer not to say') NULL DEFAULT NULL");
        DB::statement("ALTER TABLE job_seekers MODIFY COLUMN employment_status ENUM('Employed','Unemployed','Self-Employed','Underemployed') NULL DEFAULT NULL");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE job_seekers MODIFY COLUMN employment_status ENUM('Employed','Unemployed','Self-Employed') NULL DEFAULT NULL");
        DB::statement("ALTER TABLE job_seekers MODIFY COLUMN sex ENUM('Male','Female','Other') NULL DEFAULT NULL");
    }
};