<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('job', function (Blueprint $table) {
            if (Schema::hasColumn('job', 'job_category') && !Schema::hasColumn('job', 'educational_background')) {
                $table->renameColumn('job_category', 'educational_background');
            }
        });
    }

    public function down(): void
    {
        Schema::table('job', function (Blueprint $table) {
            if (Schema::hasColumn('job', 'educational_background') && !Schema::hasColumn('job', 'job_category')) {
                $table->renameColumn('educational_background', 'job_category');
            }
        });
    }
};
