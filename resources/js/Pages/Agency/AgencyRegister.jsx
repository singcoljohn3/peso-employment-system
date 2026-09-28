import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import {
    Building2,
    Check,
    Eye,
    EyeOff,
    Lock,
    Mail,
    MapPin,
    Phone,
    Shield,
    User,
    UserPlus,
} from 'lucide-react';

function FieldError({ message }) {
    if (!message) return null;

    return <p className="mt-1.5 text-sm text-red-600">{message}</p>;
}

const inputClass = (hasError) =>
    `w-full rounded-lg border bg-white px-4 py-3 text-slate-700 placeholder-slate-400 outline-none transition-all focus:ring-2 ${
        hasError
            ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
            : 'border-slate-300 focus:border-blue-500 focus:ring-blue-100'
    }`;

export default function AgencyRegister() {
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
    const { data, setData, post, processing, errors } = useForm({
        agency_name: '',
        license_number: '',
        contact_person: '',
        email: '',
        contact_number: '',
        address: '',
        password: '',
        password_confirmation: '',
        terms: false,
    });

    const passwordChecks = [
        {
            label: 'At least 8 characters',
            valid: data.password.length >= 8,
        },
        {
            label: 'Contains a letter',
            valid: /[A-Za-z]/.test(data.password),
        },
        {
            label: 'Contains a number',
            valid: /\d/.test(data.password),
        },
    ];

    const submit = (event) => {
        event.preventDefault();
        post(route('agency.register.store'), {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Agency Registration" />
            <div className="relative flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
                <div className="pointer-events-none fixed inset-0 overflow-hidden">
                    <div className="absolute left-20 top-20 h-72 w-72 rounded-full bg-blue-500/5 blur-3xl" />
                    <div className="absolute bottom-20 right-20 h-96 w-96 rounded-full bg-indigo-500/5 blur-3xl" />
                </div>

                <div className="relative w-full max-w-3xl">
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
                        <div className="mb-8 text-center">
                            <div className="mb-4 flex justify-center">
                                <div className="relative">
                                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-100 ring-2 ring-blue-200">
                                        <Building2 className="h-10 w-10 text-blue-600" />
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-white bg-blue-500" />
                                </div>
                            </div>
                            <h1 className="text-2xl font-bold text-slate-900">Create an Agency Account</h1>
                            <p className="mt-1 text-sm text-slate-500">Register your agency for portal access</p>
                        </div>

                        <form onSubmit={submit} className="space-y-5">
                            <div className="grid gap-5 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="agency_name" className="mb-2 block text-sm font-medium text-slate-700">
                                        Agency Name
                                    </label>
                                    <div className="relative">
                                        <Building2 className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                                        <input
                                            id="agency_name"
                                            type="text"
                                            value={data.agency_name}
                                            onChange={(event) => setData('agency_name', event.target.value)}
                                            className={`${inputClass(errors.agency_name)} pl-11`}
                                            placeholder="Enter agency name"
                                            autoComplete="organization"
                                            required
                                        />
                                    </div>
                                    <FieldError message={errors.agency_name} />
                                </div>

                                <div>
                                    <label htmlFor="license_number" className="mb-2 block text-sm font-medium text-slate-700">
                                        Registration / Permit Number <span className="text-slate-400">(Optional)</span>
                                    </label>
                                    <div className="relative">
                                        <Shield className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                                        <input
                                            id="license_number"
                                            type="text"
                                            value={data.license_number}
                                            onChange={(event) => setData('license_number', event.target.value)}
                                            className={`${inputClass(errors.license_number)} pl-11`}
                                            placeholder="Enter registration or permit number"
                                            autoComplete="off"
                                        />
                                    </div>
                                    <FieldError message={errors.license_number} />
                                </div>

                                <div>
                                    <label htmlFor="contact_person" className="mb-2 block text-sm font-medium text-slate-700">
                                        Contact Person Name
                                    </label>
                                    <div className="relative">
                                        <User className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                                        <input
                                            id="contact_person"
                                            type="text"
                                            value={data.contact_person}
                                            onChange={(event) => setData('contact_person', event.target.value)}
                                            className={`${inputClass(errors.contact_person)} pl-11`}
                                            placeholder="Enter full name"
                                            autoComplete="name"
                                            required
                                        />
                                    </div>
                                    <FieldError message={errors.contact_person} />
                                </div>

                                <div>
                                    <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                                        <input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(event) => setData('email', event.target.value)}
                                            className={`${inputClass(errors.email)} pl-11`}
                                            placeholder="agency@example.com"
                                            autoComplete="email"
                                            required
                                        />
                                    </div>
                                    <FieldError message={errors.email} />
                                </div>

                                <div>
                                    <label htmlFor="contact_number" className="mb-2 block text-sm font-medium text-slate-700">
                                        Contact Number
                                    </label>
                                    <div className="relative">
                                        <Phone className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                                        <input
                                            id="contact_number"
                                            type="tel"
                                            value={data.contact_number}
                                            onChange={(event) => setData('contact_number', event.target.value)}
                                            className={`${inputClass(errors.contact_number)} pl-11`}
                                            placeholder="Enter contact number"
                                            autoComplete="tel"
                                            required
                                        />
                                    </div>
                                    <FieldError message={errors.contact_number} />
                                </div>

                                <div>
                                    <label htmlFor="address" className="mb-2 block text-sm font-medium text-slate-700">
                                        Address
                                    </label>
                                    <div className="relative">
                                        <MapPin className="pointer-events-none absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                                        <textarea
                                            id="address"
                                            value={data.address}
                                            onChange={(event) => setData('address', event.target.value)}
                                            className={`${inputClass(errors.address)} min-h-[84px] resize-y pl-11`}
                                            placeholder="Enter complete business address"
                                            autoComplete="street-address"
                                            rows="2"
                                            required
                                        />
                                    </div>
                                    <FieldError message={errors.address} />
                                </div>
                            </div>

                            <div className="grid gap-5 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                                        <input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={data.password}
                                            onChange={(event) => setData('password', event.target.value)}
                                            className={`${inputClass(errors.password)} px-11`}
                                            placeholder="Create a password"
                                            autoComplete="new-password"
                                            minLength="8"
                                            maxLength="72"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword((visible) => !visible)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
                                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                                        >
                                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                    <FieldError message={errors.password} />
                                </div>

                                <div>
                                    <label htmlFor="password_confirmation" className="mb-2 block text-sm font-medium text-slate-700">
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                                        <input
                                            id="password_confirmation"
                                            type={showPasswordConfirmation ? 'text' : 'password'}
                                            value={data.password_confirmation}
                                            onChange={(event) => setData('password_confirmation', event.target.value)}
                                            className={`${inputClass(errors.password_confirmation)} px-11`}
                                            placeholder="Confirm your password"
                                            autoComplete="new-password"
                                            minLength="8"
                                            maxLength="72"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPasswordConfirmation((visible) => !visible)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
                                            aria-label={
                                                showPasswordConfirmation
                                                    ? 'Hide password confirmation'
                                                    : 'Show password confirmation'
                                            }
                                        >
                                            {showPasswordConfirmation ? (
                                                <EyeOff className="h-5 w-5" />
                                            ) : (
                                                <Eye className="h-5 w-5" />
                                            )}
                                        </button>
                                    </div>
                                    <FieldError message={errors.password_confirmation} />
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-x-5 gap-y-2 rounded-lg bg-slate-50 px-4 py-3">
                                {passwordChecks.map((check) => (
                                    <div
                                        key={check.label}
                                        className={`flex items-center gap-1.5 text-xs ${
                                            check.valid ? 'text-emerald-600' : 'text-slate-400'
                                        }`}
                                    >
                                        <span
                                            className={`flex h-4 w-4 items-center justify-center rounded-full ${
                                                check.valid ? 'bg-emerald-100' : 'bg-slate-200'
                                            }`}
                                        >
                                            <Check className="h-3 w-3" />
                                        </span>
                                        {check.label}
                                    </div>
                                ))}
                            </div>

                            <div>
                                <label className="flex cursor-pointer items-start gap-3">
                                    <input
                                        id="terms"
                                        type="checkbox"
                                        checked={data.terms}
                                        onChange={(event) => setData('terms', event.target.checked)}
                                        className="mt-0.5 h-4 w-4 rounded border-slate-300 bg-white text-blue-600 focus:ring-blue-500"
                                        required
                                    />
                                    <span className="text-sm text-slate-600">
                                        I agree to the Terms and Conditions and Privacy Policy.
                                    </span>
                                </label>
                                <FieldError message={errors.terms} />
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white shadow-sm transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                            >
                                {processing ? (
                                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                ) : (
                                    <>
                                        <UserPlus className="h-5 w-5" />
                                        Register
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-6 text-center text-sm text-slate-600">
                            Already have an account?{' '}
                            <Link href={route('agency.login')} className="font-semibold text-blue-600 transition-colors hover:text-blue-700">
                                Sign in
                            </Link>
                        </div>
                    </div>

                    <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
                        <Shield className="h-4 w-4" />
                        <span>Secured Agency Registration</span>
                    </div>
                </div>
            </div>
        </>
    );
}
