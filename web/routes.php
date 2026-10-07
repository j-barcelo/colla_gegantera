<?php

use Illuminate\Support\Facades\Route;
use Web\Controllers\HomeController;

Route::get('/', [HomeController::class, 'index'])->name('home');
