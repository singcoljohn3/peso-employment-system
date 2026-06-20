<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Establishment;
use App\Models\Barangay;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class EstablishmentLocationController extends Controller
{
    public function index(Request $request)
    {
        $query = Establishment::with(['barangay', 'jobs' => function ($q) {
            $q->whereIn('hiring_status', ['Open', 'Hiring']);
        }])
            ->withLocation()
            ->withCount(['jobs as available_jobs_count' => function ($q) {
                $q->whereIn('hiring_status', ['Open', 'Hiring']);
            }]);

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('company_name', 'like', "%{$search}%")
                    ->orWhere('address', 'like', "%{$search}%");
            });
        }

        if ($industry = $request->query('industry')) {
            $query->where('industry_category', $industry);
        }

        if ($request->boolean('has_jobs')) {
            $query->has('jobs', '>', 0);
        }

        if ($near = $request->query('near')) {
            [$lat, $lng, $radius] = array_pad(explode(',', $near), 3, 5);
            $radius = (float) $radius;
            $lat = (float) $lat;
            $lng = (float) $lng;

            $haversine = "(6371 * acos(cos(radians($lat)) * cos(radians(latitude)) * cos(radians(longitude) - radians($lng)) + sin(radians($lat)) * sin(radians(latitude))))";

            $query->selectRaw("*, {$haversine} AS distance")
                ->having('distance', '<=', $radius)
                ->orderBy('distance');
        }

        $establishments = $query->paginate($request->query('per_page', 50));

        return response()->json([
            'success' => true,
            'data' => $establishments->items(),
            'meta' => [
                'current_page' => $establishments->currentPage(),
                'last_page' => $establishments->lastPage(),
                'per_page' => $establishments->perPage(),
                'total' => $establishments->total(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'company_name' => ['required', 'string', 'max:255'],
            'address' => ['nullable', 'string'],
            'contact_person' => ['nullable', 'string', 'max:255'],
            'contact_number' => ['nullable', 'string', 'max:20'],
            'email' => ['nullable', 'email', 'max:255'],
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
            'barangay_id' => ['nullable', 'exists:barangays,id'],
            'industry_category' => ['nullable', 'string', 'max:255'],
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $establishment = Establishment::create($validator->validated());

        $establishment->load(['barangay', 'jobs']);

        return response()->json([
            'success' => true,
            'message' => 'Establishment location created successfully.',
            'data' => $establishment,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $establishment = Establishment::find($id);

        if (!$establishment) {
            return response()->json(['success' => false, 'message' => 'Establishment not found.'], 404);
        }

        $validator = Validator::make($request->all(), [
            'company_name' => ['sometimes', 'string', 'max:255'],
            'address' => ['nullable', 'string'],
            'contact_person' => ['nullable', 'string', 'max:255'],
            'contact_number' => ['nullable', 'string', 'max:20'],
            'email' => ['nullable', 'email', 'max:255'],
            'latitude' => ['sometimes', 'numeric', 'between:-90,90'],
            'longitude' => ['sometimes', 'numeric', 'between:-180,180'],
            'barangay_id' => ['nullable', 'exists:barangays,id'],
            'industry_category' => ['nullable', 'string', 'max:255'],
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $establishment->update($validator->validated());

        $establishment->load(['barangay', 'jobs']);

        return response()->json([
            'success' => true,
            'message' => 'Establishment location updated successfully.',
            'data' => $establishment,
        ]);
    }

    public function destroy($id)
    {
        $establishment = Establishment::find($id);

        if (!$establishment) {
            return response()->json(['success' => false, 'message' => 'Establishment not found.'], 404);
        }

        $establishment->update([
            'latitude' => null,
            'longitude' => null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Establishment location removed successfully.',
        ]);
    }

    public function categories()
    {
        $categories = Establishment::withLocation()
            ->whereNotNull('industry_category')
            ->distinct()
            ->pluck('industry_category')
            ->filter()
            ->values();

        return response()->json([
            'success' => true,
            'data' => $categories,
        ]);
    }

    public function nearby(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
            'radius' => ['sometimes', 'numeric', 'min:0.1', 'max:100'],
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $lat = $request->latitude;
        $lng = $request->longitude;
        $radius = $request->radius ?? 5;

        $haversine = "(6371 * acos(cos(radians($lat)) * cos(radians(latitude)) * cos(radians(longitude) - radians($lng)) + sin(radians($lat)) * sin(radians(latitude))))";

        $establishments = Establishment::with(['barangay'])
            ->withLocation()
            ->whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->selectRaw("*, {$haversine} AS distance")
            ->having('distance', '<=', $radius)
            ->orderBy('distance')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $establishments,
        ]);
    }

    //  public function getEstablishment()
    // {

    //     $establishment = Establishment::paginate(5);
    //     // ->latest()
    //     // ->orderBy('contact_person', 'ASC')
    //     // ->first()
    //     // ->get();

    //     // if ($establishment){
    //     //     return response()->json(['message' => 'email already exist']);
    //     // };
    //     // return response()->json(['message' => 'not exist']);

    //     return response()->json([$establishment]);
    // }
}
