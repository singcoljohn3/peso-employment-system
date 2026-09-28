<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('member_resumes')) {
            return;
        }

        Schema::create('member_resumes', function (Blueprint $table) {
            $table->id();

            $table->foreignId('job_seeker_id')
                ->constrained('job_seekers')
                ->cascadeOnDelete();

            $table->foreignId('agency_id')
                ->constrained('agencies')
                ->cascadeOnDelete();

            // Template key from ResumeService::TEMPLATES
            $table->string('template')->default('modern-professional');

            // Full editable resume payload (professional_title, summary,
            // education[], experience[], skills[], projects[], references[] ...)
            $table->json('content')->nullable();

            // Design customisation: accent_color, font_family, font_size,
            // line_spacing, section_order[], hidden_sections[]
            $table->json('design_options')->nullable();

            $table->foreignId('saved_by')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();

            $table->unique('job_seeker_id', 'member_resumes_job_seeker_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('member_resumes');
    }
};
