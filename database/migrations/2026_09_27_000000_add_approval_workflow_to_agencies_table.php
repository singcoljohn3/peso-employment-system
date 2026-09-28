<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // The pre-workflow enum stored the approved state as 'active'. 'active'
        // is kept in the enum for the first ALTER so the existing rows stay
        // valid, then they are renamed and the value is dropped for good.
        DB::statement(
            "ALTER TABLE agencies MODIFY COLUMN status ENUM('pending','active','approved','rejected') NOT NULL DEFAULT 'active'"
        );

        DB::table('agencies')->where('status', 'active')->update(['status' => 'approved']);

        DB::statement(
            "ALTER TABLE agencies MODIFY COLUMN status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending'"
        );

        Schema::table('agencies', function (Blueprint $table) {
            if (! Schema::hasColumn('agencies', 'approved_at')) {
                $table->timestamp('approved_at')->nullable()->after('status');
            }

            if (! Schema::hasColumn('agencies', 'rejected_at')) {
                $table->timestamp('rejected_at')->nullable()->after('approved_at');
            }

            if (! Schema::hasColumn('agencies', 'rejection_reason')) {
                $table->text('rejection_reason')->nullable()->after('rejected_at');
            }

            if (! Schema::hasColumn('agencies', 'reviewed_by')) {
                $table->foreignId('reviewed_by')
                    ->nullable()
                    ->after('rejection_reason')
                    ->constrained('users')
                    ->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::table('agencies', function (Blueprint $table) {
            foreach (['approved_at', 'rejected_at', 'rejection_reason', 'reviewed_by'] as $column) {
                if (Schema::hasColumn('agencies', $column)) {
                    $table->dropColumn($column);
                }
            }
        });

        if (Schema::hasColumn('agencies', 'status')) {
            DB::statement(
                "ALTER TABLE agencies MODIFY COLUMN status ENUM('pending','active','approved','rejected') NOT NULL DEFAULT 'pending'"
            );

            DB::table('agencies')->where('status', 'approved')->update(['status' => 'active']);

            DB::statement(
                "ALTER TABLE agencies MODIFY COLUMN status ENUM('pending','active','rejected') NOT NULL DEFAULT 'active'"
            );
        }
    }
};
