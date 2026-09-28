<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('job') && !Schema::hasColumn('job', 'responsibilities')) {
            Schema::table('job', function (Blueprint $table) {
                $table->text('responsibilities')->nullable()->after('description');
                $table->text('qualifications')->nullable()->after('responsibilities');
                $table->text('benefits')->nullable()->after('qualifications');
                $table->string('working_hours')->nullable()->after('benefits');
                $table->string('job_location')->nullable()->after('working_hours');
                $table->integer('vacant_positions')->nullable()->after('job_location');
                $table->string('required_experience')->nullable()->after('vacant_positions');
                $table->string('required_education')->nullable()->after('required_experience');
                $table->date('application_deadline')->nullable()->after('required_education');
                $table->string('job_category')->nullable()->after('application_deadline');
                $table->string('status')->default('active')->after('hiring_status');
            });
        }
    }

    public function down(): void
    {
        Schema::table('job', function (Blueprint $table) {
            $table->dropColumn([
                'responsibilities', 'qualifications', 'benefits', 'working_hours',
                'job_location', 'vacant_positions', 'required_experience',
                'required_education', 'application_deadline', 'job_category', 'status',
            ]);
        });
    }
};
