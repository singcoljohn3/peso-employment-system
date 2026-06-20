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
       Schema::create('job', function (Blueprint $table) {
    $table->id();
    $table->foreignId('establishment_id')->constrained('establishments')->onDelete('cascade');
    $table->string('job_title');
    $table->text('description');
    $table->string('salary_range')->nullable();
    $table->string('employment_type');
    $table->foreignId('barangay_id')->constrained('barangays')->onDelete('cascade');
    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job');
    }
};
