<?php

use Illuminate\Support\Facades\Route;
use Web\Controllers\HomeController;
use Web\Controllers\InstallController;

Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/install', [InstallController::class, 'index'])->name('install.index');
Route::post('/install', [InstallController::class, 'store'])->name('install.store');
