<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('job_seekers', function (Blueprint $table) {
            if (!Schema::hasColumn('job_seekers', 'barangay_id')) {
                $table->unsignedBigInteger('barangay_id')->nullable()->after('email');
            }
        });

        if (Schema::hasColumn('job_seekers', 'barangay_name')) {
            DB::statement('UPDATE job_seekers js JOIN barangays b ON js.barangay_name = b.barangay_name SET js.barangay_id = b.id WHERE js.barangay_id IS NULL AND js.barangay_name IS NOT NULL');
        }

        Schema::table('job_seekers', function (Blueprint $table) {
            if (Schema::hasColumn('job_seekers', 'barangay_name')) {
                $table->dropColumn('barangay_name');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('job_seekers', function (Blueprint $table) {
            if (Schema::hasColumn('job_seekers', 'barangay_id')) {
                $table->dropColumn('barangay_id');
            }

            if (!Schema::hasColumn('job_seekers', 'barangay_name')) {
                $table->string('barangay_name')->nullable()->after('email');
            }
        });
    }
};
