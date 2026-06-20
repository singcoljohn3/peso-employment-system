import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function PESOLogin({ status }) {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('peso.login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="min-h-screen bg-slate-100">
            <Head title="PESO Admin Login" />

            <div className="mx-auto flex min-h-screen max-w-6xl items-center px-4 py-10 sm:px-6 lg:px-8">
                <div className="grid w-full overflow-hidden rounded-2xl bg-white shadow-xl lg:grid-cols-2">
                    <div className="relative bg-gradient-to-b from-blue-600 to-blue-700 px-10 py-12 text-white">
                        <div className="flex h-full flex-col items-center justify-center text-center">
                            <div className="flex h-28 w-28 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/20">
                                <img
                                    src="/logo-peso.png"
                                    alt="PESO Logo"
                                    className="h-24 w-24 rounded-full bg-white object-contain p-1"
                                />
                            </div>

                            <h1 className="mt-7 text-2xl font-extrabold leading-snug sm:text-3xl">
                                Public Employment Service
                                <br />
                                Office
                            </h1>

                            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/90">
                                Welcome back, Admin! Login to access the dashboard and manage PESO services.
                            </p>

                            <div className="mt-10 w-full max-w-md rounded-xl bg-white/10 p-4 ring-1 ring-white/15">
                                <p className="text-xs font-semibold">Security Notice</p>
                                <p className="mt-1 text-xs leading-relaxed text-white/85">
                                    Authorized personnel only. All activities may be monitored and recorded.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="px-8 py-10 sm:px-10 sm:py-12">
                        <div className="mx-auto w-full max-w-md">
                            <div className="text-center">
                                <h3 className="text-2xl font-bold text-slate-900">Admin Login</h3>
                                <p className="mt-2 text-sm text-slate-600">Sign in to continue</p>
                            </div>

                            {status && (
                                <div className="mt-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                                    {status}
                                </div>
                            )}

                            <form onSubmit={submit} className="mt-8 space-y-5">
                                <div>
                                    <InputLabel htmlFor="email" value="Username" />
                                    <div className="relative mt-1">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                            <svg
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                className="h-5 w-5 text-slate-400"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                                <path
                                                    d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        </div>
                                        <TextInput
                                            id="email"
                                            type="email"
                                            name="email"
                                            value={data.email}
                                            className="block w-full pl-10"
                                            autoComplete="username"
                                            isFocused={true}
                                            placeholder="Enter your username"
                                            onChange={(e) => setData('email', e.target.value)}
                                        />
                                    </div>
                                    <InputError message={errors.email} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="password" value="Password" />
                                    <div className="relative mt-1">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                            <svg
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                className="h-5 w-5 text-slate-400"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    d="M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2Z"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                                <path
                                                    d="M7 11V7a5 5 0 0 1 10 0v4"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        </div>
                                        <TextInput
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            value={data.password}
                                            className="block w-full pl-10 pr-14"
                                            autoComplete="current-password"
                                            placeholder="Enter your password"
                                            onChange={(e) => setData('password', e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword((v) => !v)}
                                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm font-medium text-blue-700 hover:text-blue-900"
                                        >
                                            {showPassword ? 'Hide' : 'Show'}
                                        </button>
                                    </div>
                                    <InputError message={errors.password} className="mt-2" />
                                    <InputError message={errors.role} className="mt-2" />
                                </div>

                                <div className="flex items-center justify-between">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            name="remember"
                                            checked={data.remember}
                                            onChange={(e) => setData('remember', e.target.checked)}
                                            className="rounded border-gray-300 text-blue-700 shadow-sm focus:ring-blue-700"
                                        />
                                        <span className="ms-2 text-sm text-slate-600">Remember me</span>
                                    </label>

                                    <Link
                                        href={route('peso.register')}
                                        className="text-sm font-medium text-blue-700 underline hover:text-blue-900"
                                    >
                                        Create Account
                                    </Link>
                                </div>

                                <PrimaryButton
                                    className="w-full justify-center rounded-lg bg-blue-700 py-3 uppercase tracking-wider hover:bg-blue-800 focus:bg-blue-800 active:bg-blue-900"
                                    disabled={processing}
                                >
                                    Login
                                </PrimaryButton>
                            </form>

                            <div className="mt-8 text-center text-xs text-slate-500">
                                <p>© {new Date().getFullYear()} PESO. All rights reserved.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
