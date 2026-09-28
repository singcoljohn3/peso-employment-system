import { Head } from '@inertiajs/react';
import { useEffect } from 'react';

export default function JobVacanciesPrint({ jobs }) {
    useEffect(() => {
        window.print();
    }, []);

    return (
        <div className="p-8">
            <Head title="Print Job Vacancies" />
            <div className="mb-6 text-center">
                <h1 className="text-2xl font-bold text-slate-900">Job Vacancies List</h1>
                <p className="text-sm text-slate-500">PESO Employment System</p>
            </div>
            <table className="w-full border-collapse">
                <thead>
                    <tr className="bg-slate-100">
                        <th className="border p-2 text-left text-sm font-semibold">#</th>
                        <th className="border p-2 text-left text-sm font-semibold">Job Title</th>
                        <th className="border p-2 text-left text-sm font-semibold">Company</th>
                        <th className="border p-2 text-left text-sm font-semibold">Type</th>
                        <th className="border p-2 text-left text-sm font-semibold">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {jobs?.map((job, i) => (
                        <tr key={job.id} className="even:bg-slate-50">
                            <td className="border p-2 text-sm">{i + 1}</td>
                            <td className="border p-2 text-sm font-medium">{job.job_title}</td>
                            <td className="border p-2 text-sm">{job.establishment?.company_name || 'N/A'}</td>
                            <td className="border p-2 text-sm">{job.employment_type}</td>
                            <td className="border p-2 text-sm">{job.hiring_status}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
