<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Older installs created `notifications` with user_id/title/message columns,
 * while the app reads and writes notifiable_type/notifiable_id with title and
 * message stored inside `data`. Convert those tables in place, keeping rows.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('notifications')
            || !Schema::hasColumn('notifications', 'user_id')
            || Schema::hasColumn('notifications', 'notifiable_id')) {
            return;
        }

        Schema::table('notifications', function (Blueprint $table) {
            $table->string('notifiable_type')->nullable()->after('type');
            $table->unsignedBigInteger('notifiable_id')->nullable()->after('notifiable_type');
        });

        DB::statement("
            UPDATE notifications SET
                notifiable_type = ?,
                notifiable_id = user_id,
                data = JSON_MERGE_PATCH(
                    COALESCE(data, JSON_OBJECT()),
                    JSON_OBJECT('title', title, 'message', message)
                )
        ", [\App\Models\User::class]);

        Schema::table('notifications', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
        });

        Schema::table('notifications', function (Blueprint $table) {
            $table->dropColumn(['user_id', 'title', 'message']);
            $table->index(['notifiable_type', 'notifiable_id']);
        });

        DB::statement('ALTER TABLE notifications MODIFY notifiable_type VARCHAR(255) NOT NULL, MODIFY notifiable_id BIGINT UNSIGNED NOT NULL');
    }

    public function down(): void
    {
        // One-way conversion: the app only supports the notifiable columns.
    }
};
