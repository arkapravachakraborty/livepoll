"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useRouter } from "next/navigation";
import { KeyRound, ArrowLeft, BarChart3 } from "lucide-react";
import Link from "next/link";

export default function VerifyPage() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [serverError, setServerError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const pendingEmail = localStorage.getItem("pending_email");
        if (!pendingEmail) {
            router.push("/register");
        } else {
            setEmail(pendingEmail);
        }
    }, [router]);

    const onSubmit = async (data: any) => {
        setIsLoading(true);
        setServerError("");
        try {
            const response = await axios.post("http://localhost:4000/api/auth/verify-otp", {
                email: email,
                otp: data.otp
            });

            localStorage.setItem("poll_token", response.data.token);
            localStorage.removeItem("pending_email");
            router.push("/dashboard");
        } catch (error: any) {
            setServerError(error.response?.data?.error || "Invalid code. Please check your inbox.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!email) return null;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-blue-100">

            {/* --- TOP BRANDING --- */}
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center mb-6">
                    <div className="bg-gray-900 p-2.5 rounded-2xl shadow-xl">
                        <BarChart3 className="w-8 h-8 text-white" />
                    </div>
                </div>
                <h2 className="text-center text-4xl font-black tracking-tight text-gray-900">
                    Verify it's you.
                </h2>
                <p className="mt-3 text-center text-sm font-bold text-gray-500 uppercase tracking-widest px-4">
                    Security check for <span className="text-gray-900 break-all">{email}</span>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-10 px-6 shadow-2xl shadow-gray-200/50 rounded-3xl border border-gray-100 sm:px-12 mx-2 sm:mx-0">

                    <div className="flex justify-center mb-8">
                        <div className="bg-blue-50 p-4 rounded-2xl">
                            <KeyRound className="w-8 h-8 text-blue-600" />
                        </div>
                    </div>

                    {serverError && (
                        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-bold rounded-r-lg">
                            {serverError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-gray-700 mb-4 text-center">
                                6-Digit Security Code
                            </label>
                            <input
                                type="text"
                                maxLength={6}
                                {...register("otp", {
                                    required: "Code is required",
                                    minLength: { value: 6, message: "Enter all 6 digits" }
                                })}
                                className="block w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 text-center text-3xl font-mono font-black tracking-[0.3em] placeholder-gray-300 focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all"
                                placeholder="000000"
                            />
                            {errors.otp && (
                                <p className="text-red-500 text-[10px] font-black uppercase mt-2 text-center">
                                    {errors.otp.message as string}
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl shadow-lg text-lg font-black text-white bg-gray-900 hover:bg-black focus:outline-none transition-all active:scale-95 disabled:bg-gray-400 disabled:shadow-none"
                        >
                            {isLoading ? "Verifying..." : "Confirm Code"}
                        </button>
                    </form>

                    <div className="mt-8 text-center border-t border-gray-50 pt-8">
                        <Link
                            href="/register"
                            className="inline-flex items-center text-xs font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Use different email
                        </Link>
                    </div>
                </div>

                <p className="mt-8 text-center text-xs font-bold text-gray-400 px-8 leading-relaxed">
                    Can't find the code? Check your spam folder or wait a few minutes before trying again.
                </p>
            </div>
        </div>
    );
}