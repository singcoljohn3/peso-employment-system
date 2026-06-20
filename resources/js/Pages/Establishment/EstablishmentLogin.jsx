import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Shield, Building2, Users, Briefcase, Handshake } from 'lucide-react';

export default function EstablishmentLogin({ status }) {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('establishment.login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-navy-900 to-slate-900">
            <Head title="Establishment Employment Portal" />

            {/* Animated background elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-navy-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
            </div>

            <div className="relative flex min-h-screen items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
                <div className="w-full max-w-6xl">
                    <div className="grid overflow-hidden rounded-3xl bg-white/10 backdrop-blur-xl shadow-2xl lg:grid-cols-2 border border-white/20">
                        {/* Left Side - Modern Gradient with Glassmorphism */}
                        <div className="relative bg-gradient-to-br from-blue-800 via-navy-800 to-blue-900 px-10 py-12 text-white overflow-hidden">
                            {/* Decorative elements */}
                            <div className="absolute top-0 left-0 w-full h-full">
                                <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                                <div className="absolute bottom-10 right-10 w-48 h-48 bg-indigo-400/10 rounded-full blur-3xl"></div>
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
                            </div>

                            <div className="relative flex h-full flex-col items-center justify-center text-center z-10">
                                {/* Modern Logo Design */}
                                <div className="relative mb-8">
                                    <div className="flex h-32 w-32 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm ring-1 ring-white/30 shadow-2xl shadow-navy-900/50">
                                        <div className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-navy-700">
                                            <Building2 className="h-16 w-16 text-white" />
                                        </div>
                                    </div>
                                    {/* Glow effect */}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="h-36 w-36 rounded-full bg-blue-400/20 blur-2xl animate-pulse"></div>
                                    </div>
                                </div>

                                <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                                    Establishment
                                    <br />
                                    Employment Portal
                                </h1>

                                <p className="mt-6 max-w-sm text-base leading-relaxed text-blue-100/90">
                                    Manage job vacancies, applicants, and hiring processes efficiently through the PESO Employment System.
                                </p>

                                {/* Feature icons */}
                                <div className="mt-10 flex gap-6">
                                    <div className="flex flex-col items-center">
                                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm ring-1 ring-white/20">
                                            <Briefcase className="h-7 w-7 text-cyan-300" />
                                        </div>
                                        <span className="mt-2 text-xs text-blue-200">Jobs</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm ring-1 ring-white/20">
                                            <Users className="h-7 w-7 text-cyan-300" />
                                        </div>
                                        <span className="mt-2 text-xs text-blue-200">Applicants</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm ring-1 ring-white/20">
                                            <Handshake className="h-7 w-7 text-cyan-300" />
                                        </div>
                                        <span className="mt-2 text-xs text-blue-200">Hiring</span>
                                    </div>
                                </div>

                                {/* Security Notice Card */}
                                <div className="mt-12 w-full max-w-md rounded-2xl bg-white/10 backdrop-blur-md p-5 ring-1 ring-white/20 border border-white/10">
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-yellow-500/20">
                                            <Shield className="h-5 w-5 text-yellow-300" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-sm font-semibold text-yellow-200">Security Notice</p>
                                            <p className="mt-1 text-xs leading-relaxed text-blue-100/80">
                                                Authorized Establishment Personnel Only. All activities are monitored and recorded for security purposes.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Side - Clean White Card */}
                        <div className="relative bg-white px-8 py-12 sm:px-12 sm:py-16">
                            <div className="mx-auto w-full max-w-md">
                                <div className="text-center mb-8">
                                    <h3 className="text-3xl font-bold text-slate-900 tracking-tight">Establishment Login</h3>
                                    <p className="mt-3 text-base text-slate-600">Sign in to continue to your dashboard</p>
                                </div>

                                {status && (
                                    <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-medium text-green-700 shadow-sm">
                                        {status}
                                    </div>
                                )}

                                <form onSubmit={submit} className="space-y-6">
                                    <div>
                                        <label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-700">
                                            Email Address
                                        </label>
                                        <div className="relative">
                                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                                <Mail className="h-5 w-5 text-slate-400" />
                                            </div>
                                            <TextInput
                                                id="email"
                                                type="email"
                                                name="email"
                                                value={data.email}
                                                className="block w-full rounded-xl border-slate-300 bg-slate-50 pl-11 pr-4 py-3 text-sm focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                                                autoComplete="username"
                                                isFocused={true}
                                                placeholder="Enter your email"
                                                onChange={(e) => setData('email', e.target.value)}
                                            />
                                        </div>
                                        <InputError message={errors.email} className="mt-2" />
                                    </div>

                                    <div>
                                        <label htmlFor="password" className="mb-2 block text-sm font-semibold text-slate-700">
                                            Password
                                        </label>
                                        <div className="relative">
                                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                                <Lock className="h-5 w-5 text-slate-400" />
                                            </div>
                                            <TextInput
                                                id="password"
                                                type={showPassword ? 'text' : 'password'}
                                                name="password"
                                                value={data.password}
                                                className="block w-full rounded-xl border-slate-300 bg-slate-50 pl-11 pr-12 py-3 text-sm focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                                                autoComplete="current-password"
                                                placeholder="Enter your password"
                                                onChange={(e) => setData('password', e.target.value)}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword((v) => !v)}
                                                className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-600 transition-colors"
                                            >
                                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                            </button>
                                        </div>
                                        <InputError message={errors.password} className="mt-2" />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <label className="flex items-center cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                name="remember"
                                                checked={data.remember}
                                                onChange={(e) => setData('remember', e.target.checked)}
                                                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                                            />
                                            <span className="ml-2 text-sm text-slate-600 group-hover:text-slate-900 transition-colors">Remember me</span>
                                        </label>

                                        <a
                                            href={route('peso.login')}
                                            className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                                        >
                                            Admin Login
                                        </a>
                                    </div>

                                    <PrimaryButton
                                        className="w-full justify-center rounded-xl bg-gradient-to-r from-blue-700 to-navy-800 py-3.5 text-base font-semibold shadow-lg shadow-blue-700/30 hover:shadow-blue-700/40 hover:from-blue-800 hover:to-navy-900 transition-all duration-200"
                                        disabled={processing}
                                    >
                                        {processing ? 'Signing in...' : 'Sign In'}
                                    </PrimaryButton>
                                </form>

                                <div className="mt-8 text-center">
                                    <p className="text-xs text-slate-500">
                                        © {new Date().getFullYear()} PESO Employment System. All rights reserved.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
