<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('agencies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->string('agency_name');
            $table->string('contact_person');
            $table->string('contact_number')->nullable();
            $table->string('email');
            $table->string('address')->nullable();
            $table->foreignId('barangay_id')->nullable()->constrained()->onDelete('set null');
            $table->string('industry_category')->nullable();
            $table->text('description')->nullable();
            $table->string('logo')->nullable();
            $table->string('agency_type')->nullable()->comment('e.g. Recruitment, Staffing, Manpower');
            $table->string('license_number')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('agencies');
    }
};
