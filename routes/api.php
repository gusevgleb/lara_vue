<?php

use App\Models\Gift;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::post('get_gifts_list', function (Request $request) {

    $requestData = $request->get('data_1');
    $response = Gift::first();

    return response()->json([
        'front' => $requestData,
        'result' => $response
    ], 200);
});
