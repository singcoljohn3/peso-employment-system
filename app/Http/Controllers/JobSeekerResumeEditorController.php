<?php

namespace App\Http\Controllers;

use App\Models\JobSeeker;
use App\Services\ResumeEditorService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class JobSeekerResumeEditorController extends Controller
{
    public function edit(ResumeEditorService $editor)
    {
        $jobSeeker = JobSeeker::where('user_id', Auth::id())->first();

        if (! $jobSeeker) {
            return redirect()->route('jobseeker.dashboard')->with('error', 'Please complete your profile first.');
        }

        return Inertia::render('ResumeEditor/Edit', $editor->pageProps(
            $jobSeeker,
            route('jobseeker.resume.editor.save', [], false),
            route('jobseeker.resume', [], false),
            'My Resume',
        ));
    }

    public function update(Request $request, ResumeEditorService $editor): JsonResponse
    {
        $jobSeeker = JobSeeker::where('user_id', Auth::id())->firstOrFail();

        $record = $editor->save($request, $jobSeeker);

        return response()->json([
            'message' => 'Resume saved.',
            'saved_at' => $record->updated_at->format('M d, Y g:i A'),
        ]);
    }
}
