<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('applications') && !Schema::hasColumn('applications', 'expected_salary')) {
            Schema::table('applications', function (Blueprint $table) {
                $table->string('expected_salary')->nullable()->after('application_details');
                $table->date('start_date')->nullable()->after('expected_salary');
            });
        }
    }

    public function down(): void
    {
        Schema::table('applications', function (Blueprint $table) {
            $table->dropColumn(['expected_salary', 'start_date']);
        });
    }
};
