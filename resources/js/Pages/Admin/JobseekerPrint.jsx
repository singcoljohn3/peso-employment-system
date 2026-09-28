import { Head } from '@inertiajs/react';
import { useEffect } from 'react';

export default function JobseekerPrint({ jobSeekers }) {
    useEffect(() => {
        window.print();
    }, []);

    return (
        <div className="p-8">
            <Head title="Print Job Seekers" />
            <div className="mb-6 text-center">
                <h1 className="text-2xl font-bold text-slate-900">Job Seekers List</h1>
                <p className="text-sm text-slate-500">PESO Employment System</p>
            </div>
            <table className="w-full border-collapse">
                <thead>
                    <tr className="bg-slate-100">
                        <th className="border p-2 text-left text-sm font-semibold">#</th>
                        <th className="border p-2 text-left text-sm font-semibold">Name</th>
                        <th className="border p-2 text-left text-sm font-semibold">Barangay</th>
                        <th className="border p-2 text-left text-sm font-semibold">Contact</th>
                        <th className="border p-2 text-left text-sm font-semibold">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {jobSeekers?.map((seeker, i) => (
                        <tr key={seeker.id} className="even:bg-slate-50">
                            <td className="border p-2 text-sm">{i + 1}</td>
                            <td className="border p-2 text-sm font-medium">{seeker.first_name} {seeker.last_name}</td>
                            <td className="border p-2 text-sm">{seeker.barangay?.barangay_name || 'N/A'}</td>
                            <td className="border p-2 text-sm">{seeker.contact_number || 'N/A'}</td>
                            <td className="border p-2 text-sm">{seeker.is_fully_registered ? 'Registered' : 'Incomplete'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
