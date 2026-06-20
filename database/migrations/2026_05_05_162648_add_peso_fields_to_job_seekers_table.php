<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('job_seekers', function (Blueprint $table) {
            $table->string('middle_name')->nullable()->after('first_name');
            $table->integer('age')->nullable()->after('birthdate');
            $table->enum('sex', ['Male', 'Female', 'Other'])->nullable()->after('age');
            $table->enum('civil_status', ['Single', 'Married', 'Widowed', 'Separated', 'Divorced'])->nullable()->after('sex');
            $table->text('address')->nullable()->after('civil_status');
            $table->string('email')->nullable()->after('contact_number');
            $table->string('barangay_name')->nullable()->after('barangay_id');
            $table->enum('educational_attainment', ['Elementary', 'High School', 'Vocational', 'College', 'Post Graduate'])->nullable();
            $table->enum('employment_status', ['Employed', 'Unemployed', 'Self-Employed'])->nullable();
            $table->string('occupation')->nullable();
            $table->string('employer_company')->nullable();
            $table->integer('work_experience_years')->nullable();
            $table->string('preferred_job')->nullable();
            $table->json('skills')->nullable();
            $table->text('tesda_nc_certificates')->nullable();
            $table->text('other_trainings')->nullable();
            $table->text('professional_licenses')->nullable();
            $table->boolean('willing_outside_municipality')->default(false);
            $table->boolean('willing_abroad')->default(false);
            $table->text('remarks')->nullable();
            $table->boolean('is_fully_registered')->default(false);
        });
    }

    public function down(): void
    {
        Schema::table('job_seekers', function (Blueprint $table) {
            $table->dropColumn([
                'middle_name', 'age', 'sex', 'civil_status', 'address', 'email',
                'barangay_name', 'educational_attainment', 'employment_status',
                'occupation', 'employer_company', 'work_experience_years',
                'preferred_job', 'skills', 'tesda_nc_certificates',
                'other_trainings', 'professional_licenses',
                'willing_outside_municipality', 'willing_abroad',
                'remarks', 'is_fully_registered',
            ]);
        });
    }
};
