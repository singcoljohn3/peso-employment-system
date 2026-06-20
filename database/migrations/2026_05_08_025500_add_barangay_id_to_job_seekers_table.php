<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('job_seekers', function (Blueprint $table) {
            if (!Schema::hasColumn('job_seekers', 'barangay_id')) {
                $table->foreignId('barangay_id')->nullable()->after('email')->constrained('barangays')->nullOnDelete();
            }
        });

        if (Schema::hasColumn('job_seekers', 'barangay_name') && Schema::hasColumn('barangays', 'barangay_name')) {
            DB::table('job_seekers as js')
                ->join('barangays as b', 'b.barangay_name', '=', 'js.barangay_name')
                ->whereNull('js.barangay_id')
                ->update(['js.barangay_id' => DB::raw('b.id')]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('job_seekers', function (Blueprint $table) {
            if (Schema::hasColumn('job_seekers', 'barangay_id')) {
                $table->dropConstrainedForeignId('barangay_id');
            }
        });
    }
};
