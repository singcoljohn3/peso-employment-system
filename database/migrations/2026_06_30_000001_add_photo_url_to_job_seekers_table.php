<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('job_seekers') && !Schema::hasColumn('job_seekers', 'photo_url')) {
            Schema::table('job_seekers', function (Blueprint $table) {
                $table->string('photo_url')->nullable()->after('verification_notes');
            });
        }
    }

    public function down(): void
    {
        Schema::table('job_seekers', function (Blueprint $table) {
            $table->dropColumn('photo_url');
        });
    }
};
