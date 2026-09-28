<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Job;
use Illuminate\Http\Request;

class JobController extends Controller
{
    public function index(Request $request)
    {
        $query = Job::with(['establishment', 'barangay', 'skills'])
            ->whereIn('hiring_status', ['Open', 'Hiring']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('job_title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->filled('employment_type')) {
            $query->where('employment_type', $request->employment_type);
        }

        if ($request->filled('barangay_id')) {
            $query->where('barangay_id', $request->barangay_id);
        }

        if ($request->filled('educational_background')) {
            $query->where('educational_background', $request->educational_background);
        }

        $jobs = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json($jobs);
    }

    public function show($id)
    {
        $job = Job::with(['establishment', 'barangay', 'skills'])
            ->whereIn('hiring_status', ['Open', 'Hiring'])
            ->findOrFail($id);

        return response()->json($job);
    }
}
