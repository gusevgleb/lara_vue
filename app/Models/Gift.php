<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class Gift extends Model
{
    protected $fillable = [
        'name',
        'price',
        'reserved_by',
        'created_at',
        'updated_at'
    ];

    protected $dates = [
        'created_at',
        'updated_at',
    ];
}
