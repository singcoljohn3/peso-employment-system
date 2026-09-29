import { Head, useForm, Link } from '@inertiajs/react';
import { useState } from 'react';
import { Eye, EyeOff, LogIn, Shield, Building2 } from 'lucide-react';

export default function AgencyLogin({ status }) {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('agency.login.store'));
    };

    return (
        <>
            <Head title="Agency Login" />
            <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12 relative">
                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl"></div>
                </div>

                <div className="relative w-full max-w-md">
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
                        {/* Logo */}
                        <div className="text-center mb-8">
                            <div className="flex justify-center mb-4">
                                <div className="relative">
                                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-100 ring-2 ring-blue-200">
                                        <Building2 className="h-10 w-10 text-blue-600" />
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-blue-500 border-2 border-white"></div>
                                </div>
                            </div>
                            <h1 className="text-2xl font-bold text-slate-900">Agency Portal</h1>
                            <p className="text-slate-500 text-sm mt-1">Sign in to your agency account</p>
                        </div>

                        {status && (
                            <div className="mb-4 p-3 rounded-lg bg-green-100 border border-green-200 text-green-700 text-sm">
                                {status}
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                    placeholder="agency@example.com"
                                    required
                                />
                                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className="w-full px-4 py-3 pr-12 bg-white border border-slate-300 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                        placeholder="Enter your password"
                                        required
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="remember"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="h-4 w-4 rounded border-slate-300 bg-white text-blue-600 focus:ring-blue-500"
                                />
                                <label htmlFor="remember" className="ml-2 text-sm text-slate-600">Remember me</label>
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-all shadow-sm"
                            >
                                {processing ? (
                                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <LogIn className="h-5 w-5" />
                                        Sign In
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-6 flex flex-col items-center justify-center gap-3 text-sm sm:flex-row">

                            <Link href={route('peso.login')} className="text-blue-600 transition-colors hover:text-blue-700">
                                Back to main login
                            </Link>
                        </div>
                    </div>

                    <div className="mt-6 text-center">
                        <div className="flex items-center justify-center gap-2 text-slate-500 text-xs">
                            <Shield className="h-4 w-4" />
                            <span>Secured Agency Portal</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}