import { Head } from '@inertiajs/react';
import AgencyLayouts from '@/Layouts/AgencyLayouts';
import AgencyProfileForm from '@/Components/Agency/AgencyProfileForm';

export default function Profile({ agency, barangays }) {
    return (
        <AgencyLayouts>
            <Head title="Agency Profile" />
            <AgencyProfileForm agency={agency} barangays={barangays} />
        </AgencyLayouts>
    );
}