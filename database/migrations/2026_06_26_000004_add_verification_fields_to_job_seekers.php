<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('job_seekers') && !Schema::hasColumn('job_seekers', 'verification_status')) {
            Schema::table('job_seekers', function (Blueprint $table) {
                $table->string('verification_status')->default('pending')->after('is_fully_registered');
                $table->foreignId('verified_by')->nullable()->constrained('users')->onDelete('set null')->after('verification_status');
                $table->timestamp('verified_at')->nullable()->after('verified_by');
                $table->text('verification_notes')->nullable()->after('verified_at');
            });
        }
    }

    public function down(): void
    {
        Schema::table('job_seekers', function (Blueprint $table) {
            $table->dropColumn(['verification_status', 'verified_by', 'verified_at', 'verification_notes']);
        });
    }
};
