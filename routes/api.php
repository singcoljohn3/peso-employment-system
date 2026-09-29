<?php

use App\Http\Controllers\Api\ApplicationController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\JobController;
use App\Http\Controllers\Api\JobSeekerController;
use App\Http\Controllers\Api\EstablishmentLocationController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\ResumeController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/job-seeker/register', [JobSeekerController::class, 'store']);
    Route::get('/job-seeker/profile', [JobSeekerController::class, 'show']);
    Route::get('/barangays', [JobSeekerController::class, 'getBarangays']);
    Route::get('/job-seeker/persistent-data', [JobSeekerController::class, 'getPersistentData']);
    Route::post('/job-seeker/profile/photo', [JobSeekerController::class, 'uploadPhoto']);

    // Establishment Locations API
    Route::get('/establishments/locations', [EstablishmentLocationController::class, 'index']);
    Route::post('/establishments/locations', [EstablishmentLocationController::class, 'store']);
    Route::put('/establishments/locations/{id}', [EstablishmentLocationController::class, 'update']);
    Route::delete('/establishments/locations/{id}', [EstablishmentLocationController::class, 'destroy']);
    Route::get('/establishments/locations/categories', [EstablishmentLocationController::class, 'categories']);
    Route::post('/establishments/locations/nearby', [EstablishmentLocationController::class, 'nearby']);
    Route::get('/establishments/hiring', [EstablishmentLocationController::class, 'hiring']);
    Route::get('/establishments/{id}', [EstablishmentLocationController::class, 'show']);

    // Jobs API
    Route::get('/jobs', [JobController::class, 'index']);
    Route::get('/jobs/{id}', [JobController::class, 'show']);

    // Applications API
    Route::get('/applications', [ApplicationController::class, 'index']);
    Route::post('/applications', [ApplicationController::class, 'store']);
    Route::get('/applications/my', [ApplicationController::class, 'index']);

    // Notifications API (Commented out because it conflicts with web.php session routes)
    // Route::get('/notifications', [NotificationController::class, 'index']);
    // Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    // Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);

    // Resume API
    Route::get('/resume/templates', [ResumeController::class, 'templates']);
    Route::put('/resume/template', [ResumeController::class, 'updateTemplate']);
    Route::get('/resume/preview', [ResumeController::class, 'preview']);
    Route::get('/resume', [ResumeController::class, 'show']);
    Route::post('/resume/generate', [ResumeController::class, 'generate']);
    Route::get('/resume/download/{resume}', [ResumeController::class, 'download']);
    Route::get('/resume/status', [ResumeController::class, 'status']);


});

//   Route::get('establishment-list', [EstablishmentLocationController::class, 'getEstablishment']);