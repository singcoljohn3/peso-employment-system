<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('job')) {
            Schema::table('job', function (Blueprint $table) {
                if (!Schema::hasColumn('job', 'work_arrangement')) {
                    $table->string('work_arrangement')->nullable()->after('employment_type');
                }
                if (!Schema::hasColumn('job', 'salary_type')) {
                    $table->string('salary_type')->nullable()->after('salary_range');
                }
                if (!Schema::hasColumn('job', 'min_salary')) {
                    $table->decimal('min_salary', 12, 2)->nullable()->after('salary_type');
                }
                if (!Schema::hasColumn('job', 'max_salary')) {
                    $table->decimal('max_salary', 12, 2)->nullable()->after('min_salary');
                }
                if (!Schema::hasColumn('job', 'salary_negotiable')) {
                    $table->boolean('salary_negotiable')->default(false)->after('max_salary');
                }
                if (!Schema::hasColumn('job', 'preferred_age')) {
                    $table->string('preferred_age')->nullable()->after('required_education');
                }
                if (!Schema::hasColumn('job', 'gender_requirement')) {
                    $table->string('gender_requirement')->nullable()->after('preferred_age');
                }
                if (!Schema::hasColumn('job', 'certifications')) {
                    $table->text('certifications')->nullable()->after('gender_requirement');
                }
                if (!Schema::hasColumn('job', 'languages')) {
                    $table->text('languages')->nullable()->after('certifications');
                }
            });
        }
    }

    public function down(): void
    {
        Schema::table('job', function (Blueprint $table) {
            $columns = [
                'work_arrangement', 'salary_type', 'min_salary', 'max_salary',
                'salary_negotiable', 'preferred_age', 'gender_requirement',
                'certifications', 'languages',
            ];
            $table->dropColumn($columns);
        });
    }
};
