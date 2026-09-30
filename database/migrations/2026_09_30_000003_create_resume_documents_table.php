<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('resume_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_seeker_id')->unique()->constrained('job_seekers')->cascadeOnDelete();
            // Full editor document (layout, theme, rich-text content). longText
            // because an uploaded photo is embedded as a compressed data URL.
            $table->longText('document');
            $table->foreignId('saved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('resume_documents');
    }
};
