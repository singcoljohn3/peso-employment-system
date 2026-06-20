<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HiringStatus extends Model
{
    use HasFactory;

    protected $table = 'hiring_statuses';

    protected $fillable = [
        'status_name',
    ];
}
