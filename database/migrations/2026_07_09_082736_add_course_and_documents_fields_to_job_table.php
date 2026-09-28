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
        Schema::table('job', function (Blueprint $table) {
            $table->string('course')->nullable()->after('required_education');
            $table->text('required_documents')->nullable()->after('qualifications');
            $table->text('application_instructions')->nullable()->after('required_documents');
        });
    }

    public function down(): void
    {
        Schema::table('job', function (Blueprint $table) {
            $table->dropColumn(['course', 'required_documents', 'application_instructions']);
        });
    }
};
