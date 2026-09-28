import { Head } from '@inertiajs/react';
import { useEffect } from 'react';

export default function EstablishmentPrint({ establishments }) {
    useEffect(() => {
        window.print();
    }, []);

    return (
        <div className="p-8">
            <Head title="Print Establishments" />
            <div className="mb-6 text-center">
                <h1 className="text-2xl font-bold text-slate-900">Establishments List</h1>
                <p className="text-sm text-slate-500">PESO Employment System</p>
            </div>
            <table className="w-full border-collapse">
                <thead>
                    <tr className="bg-slate-100">
                        <th className="border p-2 text-left text-sm font-semibold">#</th>
                        <th className="border p-2 text-left text-sm font-semibold">Company Name</th>
                        <th className="border p-2 text-left text-sm font-semibold">Contact Person</th>
                        <th className="border p-2 text-left text-sm font-semibold">Barangay</th>
                        <th className="border p-2 text-left text-sm font-semibold">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {establishments?.map((est, i) => (
                        <tr key={est.id} className="even:bg-slate-50">
                            <td className="border p-2 text-sm">{i + 1}</td>
                            <td className="border p-2 text-sm">{est.company_name}</td>
                            <td className="border p-2 text-sm">{est.contact_person}</td>
                            <td className="border p-2 text-sm">{est.barangay?.barangay_name || 'N/A'}</td>
                            <td className="border p-2 text-sm">{est.user_id ? 'Active' : 'Pending'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
