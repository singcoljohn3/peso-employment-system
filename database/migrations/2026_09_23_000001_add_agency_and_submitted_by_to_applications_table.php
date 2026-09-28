<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('applications', function (Blueprint $table) {
            if (!Schema::hasColumn('applications', 'agency_id')) {
                $table->foreignId('agency_id')->nullable()->after('job_seeker_id')->constrained('agencies')->onDelete('set null');
            }
            if (!Schema::hasColumn('applications', 'submitted_by')) {
                $table->unsignedBigInteger('submitted_by')->nullable()->after('agency_id');
                $table->foreign('submitted_by')->references('id')->on('users')->onDelete('set null');
            }
        });
    }

    public function down(): void
    {
        Schema::table('applications', function (Blueprint $table) {
            if (Schema::hasColumn('applications', 'submitted_by')) {
                $table->dropForeign(['submitted_by']);
                $table->dropColumn('submitted_by');
            }
            if (Schema::hasColumn('applications', 'agency_id')) {
                $table->dropForeign(['agency_id']);
                $table->dropColumn('agency_id');
            }
        });
    }
};