<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Barangay;
use App\Models\JobSeeker;
use App\Services\ResumeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class JobSeekerController extends Controller
{
    public function __construct(
        protected ResumeService $resumeService
    ) {}

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'birthdate' => 'required|date',
            'age' => 'required|integer|min:0',
            'sex' => 'required|in:Male,Female,Other',
            'civil_status' => 'required|in:Single,Married,Widowed,Separated,Divorced',
            'address' => 'required|string',
            'contact_number' => 'required|string|max:20',
            'email' => 'nullable|email|max:255',
            'barangay_id' => 'required|integer|exists:barangays,id',
            'educational_attainment' => 'required|in:Elementary,High School,Vocational,College,Post Graduate',
            'employment_status' => 'required|in:Employed,Unemployed,Self-Employed',
            'occupation' => 'nullable|string|max:255',
            'employer_company' => 'nullable|string|max:255',
            'work_experience_years' => 'nullable|integer|min:0',
            'preferred_job' => 'required|string|max:255',
            'skills' => 'nullable|array',
            'tesda_nc_certificates' => 'nullable|string',
            'other_trainings' => 'nullable|string',
            'professional_licenses' => 'nullable|string',
            'willing_outside_municipality' => 'required|boolean',
            'willing_abroad' => 'required|boolean',
            'remarks' => 'nullable|string',
            'preferred_template' => 'nullable|string|in:' . implode(',', array_keys(ResumeService::TEMPLATES)),
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();

        $payload = $request->except(['barangay_name']);

        $jobSeeker = JobSeeker::updateOrCreate(
            ['user_id' => $user->id],
            array_merge($payload, [
                'user_id' => $user->id,
                'is_fully_registered' => true,
            ])
        );

        $this->resumeService->autoGenerateResume($jobSeeker);

        $jobSeeker->load(['barangay']);

        return response()->json([
            'message' => 'Registration submitted successfully!',
            'job_seeker' => $jobSeeker,
        ], 201);
    }

    public function show(Request $request)
    {
        $user = $request->user();
        $jobSeeker = JobSeeker::with(['barangay'])->where('user_id', $user->id)->first();

        if (!$jobSeeker) {
            return response()->json([
                'message' => 'No registration found',
                'job_seeker' => null,
            ]);
        }

        return response()->json([
            'job_seeker' => $jobSeeker,
        ]);
    }

    public function getBarangays()
    {
        $barangays = Barangay::all();
        return response()->json([
            'barangays' => $barangays,
        ]);
    }

    public function getPersistentData(Request $request)
    {
        $user = $request->user();
        $jobSeeker = JobSeeker::with(['barangay'])->where('user_id', $user->id)->first();

        if (!$jobSeeker) {
            return response()->json([
                'message' => 'No registration found',
                'data' => null,
            ]);
        }

        return response()->json([
            'data' => [
                'barangay_id' => $jobSeeker->barangay_id,
                'barangay_name' => $jobSeeker->barangay?->barangay_name,
                'preferred_template' => $jobSeeker->preferred_template ?? 'modern-professional',
                'is_fully_registered' => $jobSeeker->is_fully_registered,
            ],
        ]);
    }

   
}
