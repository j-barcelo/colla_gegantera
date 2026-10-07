<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/message', function () {
    return response()->json([
        'message' => 'Hola des del backend de la Colla Gegantera!',
        'timestamp' => now()->toIso8601String(),
    ]);
});
