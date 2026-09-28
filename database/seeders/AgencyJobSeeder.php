<?php

namespace Database\Seeders;

use App\Models\Job;
use App\Models\Agency;
use Illuminate\Database\Seeder;

class AgencyJobSeeder extends Seeder
{
    public function run(): void
    {
        $agencies = Agency::all();

        $commonJobs = [
            ['job_title' => 'Customer Service Representative', 'employment_type' => 'Full-time', 'description' => 'Handle customer inquiries and complaints via phone, email, and chat.', 'salary_range' => '₱15,000 - ₱18,000', 'hiring_status' => 'Open'],
            ['job_title' => 'Administrative Assistant', 'employment_type' => 'Full-time', 'description' => 'Provide administrative support including filing, scheduling, and data entry.', 'salary_range' => '₱13,000 - ₱16,000', 'hiring_status' => 'Open'],
            ['job_title' => 'Warehouse Worker', 'employment_type' => 'Full-time', 'description' => 'Receive, store, and distribute materials in warehouse facilities.', 'salary_range' => '₱12,000 - ₱15,000', 'hiring_status' => 'Open'],
            ['job_title' => 'Sales Associate', 'employment_type' => 'Full-time', 'description' => 'Assist customers and promote products in retail environment.', 'salary_range' => '₱12,000 - ₱15,000', 'hiring_status' => 'Open'],
            ['job_title' => 'Driver', 'employment_type' => 'Full-time', 'description' => 'Transport goods and passengers safely to designated locations.', 'salary_range' => '₱14,000 - ₱18,000', 'hiring_status' => 'Open'],
            ['job_title' => 'Security Guard', 'employment_type' => 'Full-time', 'description' => 'Maintain order and enforce rules at establishment premises.', 'salary_range' => '₱13,000 - ₱16,000', 'hiring_status' => 'Open'],
            ['job_title' => 'Production Worker', 'employment_type' => 'Full-time', 'description' => 'Operate machinery and assemble products in manufacturing setting.', 'salary_range' => '₱12,000 - ₱15,000', 'hiring_status' => 'Open'],
            ['job_title' => 'Cleaner / Janitor', 'employment_type' => 'Full-time', 'description' => 'Maintain cleanliness and sanitation of facilities.', 'salary_range' => '₱11,000 - ₱13,000', 'hiring_status' => 'Open'],
            ['job_title' => 'Cashier', 'employment_type' => 'Full-time', 'description' => 'Process customer payments and maintain accurate financial records.', 'salary_range' => '₱12,000 - ₱15,000', 'hiring_status' => 'Open'],
            ['job_title' => 'Data Encoder', 'employment_type' => 'Full-time', 'description' => 'Input and manage data in computer systems accurately.', 'salary_range' => '₱13,000 - ₱16,000', 'hiring_status' => 'Open'],
            ['job_title' => 'Marketing Assistant', 'employment_type' => 'Part-time', 'description' => 'Support marketing campaigns and social media management.', 'salary_range' => '₱10,000 - ₱14,000', 'hiring_status' => 'Open'],
            ['job_title' => 'Bookkeeper', 'employment_type' => 'Full-time', 'description' => 'Maintain financial records and process transactions.', 'salary_range' => '₱15,000 - ₱20,000', 'hiring_status' => 'Open'],
        ];

        foreach ($agencies as $agency) {
            foreach ($commonJobs as $jobData) {
                Job::updateOrCreate(
                    [
                        'agency_id' => $agency->id,
                        'job_title' => $jobData['job_title'],
                    ],
                    [
                        'establishment_id' => null,
                        'description' => $jobData['description'],
                        'salary_range' => $jobData['salary_range'],
                        'employment_type' => $jobData['employment_type'],
                        'hiring_status' => $jobData['hiring_status'],
                        'barangay_id' => $agency->barangay_id ?? 1,
                    ]
                );
            }
        }
    }
}
