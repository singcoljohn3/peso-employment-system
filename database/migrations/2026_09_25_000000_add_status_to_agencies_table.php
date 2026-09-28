<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('agencies', function (Blueprint $table) {
            if (! Schema::hasColumn('agencies', 'status')) {
                $table->enum('status', ['pending', 'active', 'rejected'])
                    ->default('active')
                    ->after('license_number')
                    ->index();
            }
        });
    }

    public function down(): void
    {
        Schema::table('agencies', function (Blueprint $table) {
            if (Schema::hasColumn('agencies', 'status')) {
                $table->dropColumn('status');
            }
        });
    }
};
