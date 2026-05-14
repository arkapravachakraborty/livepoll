"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogIn, ArrowLeft, BarChart3 } from "lucide-react";
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID as string;

export default function LoginPage() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [serverError, setServerError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const onSubmit = async (data: any) => {
        setIsLoading(true);
        setServerError("");
        try {
            const response = await axios.post("http://localhost:4000/api/auth/login", data);
            localStorage.setItem("poll_token", response.data.token);
            router.push("/dashboard");
        } catch (error: any) {
            setServerError(error.response?.data?.error || "Invalid credentials. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse: any) => {
        try {
            setServerError("");
            const response = await axios.post("http://localhost:4000/api/auth/google", {
                token: credentialResponse.credential
            });
            localStorage.setItem("poll_token", response.data.token);
            router.push("/dashboard");
        } catch (error) {
            setServerError("Google login failed on our server.");
        }
    };

    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-blue-100">

                {/* --- BACK TO HOME --- */}
                <div className="absolute top-8 left-8 hidden md:block">
                    <button
                        onClick={() => router.push("/")}
                        className="flex items-center text-gray-500 hover:text-black font-bold transition-colors group"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back to Home
                    </button>
                </div>

                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    {/* LOGO AREA */}
                    <div className="flex justify-center mb-6">
                        <div className="bg-gray-900 p-2.5 rounded-2xl shadow-xl">
                            <BarChart3 className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <h2 className="text-center text-4xl font-black tracking-tight text-gray-900">
                        Welcome back.
                    </h2>
                    <p className="mt-2 text-center text-sm font-bold text-gray-500 uppercase tracking-widest">
                        Sign in to your workspace
                    </p>
                </div>

                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-10 px-6 shadow-2xl shadow-gray-200/50 rounded-3xl border border-gray-100 sm:px-12">

                        {serverError && (
                            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-bold rounded-r-lg animate-shake">
                                {serverError}
                            </div>
                        )}

                        {/* GOOGLE LOGIN */}
                        <div className="mb-8">
                            <div className="flex justify-center w-full">
                                <GoogleLogin
                                    onSuccess={handleGoogleSuccess}
                                    onError={() => setServerError("Google Login failed")}
                                    theme="outline"
                                    shape="pill"
                                    width="100%"
                                />
                            </div>
                        </div>

                        <div className="relative mb-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase tracking-widest font-black">
                                <span className="px-4 bg-white text-gray-400">Or use email</span>
                            </div>
                        </div>

                        {/* EMAIL FORM */}
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-gray-700 mb-2">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    {...register("email", { required: "Email is required" })}
                                    className="block w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-bold placeholder-gray-400 focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all sm:text-sm"
                                    placeholder="name@company.com"
                                />
                                {errors.email && <p className="text-red-500 text-[10px] font-black uppercase mt-1.5 ml-1">{errors.email.message as string}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-gray-700 mb-2">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    {...register("password", { required: "Password is required" })}
                                    className="block w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-bold placeholder-gray-400 focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all sm:text-sm"
                                    placeholder="••••••••"
                                />
                                {errors.password && <p className="text-red-500 text-[10px] font-black uppercase mt-1.5 ml-1">{errors.password.message as string}</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl shadow-lg text-lg font-black text-white bg-gray-900 hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-all active:scale-95 disabled:bg-gray-400 disabled:shadow-none"
                            >
                                {isLoading ? "Processing..." : "Sign In"}
                            </button>
                        </form>

                        <div className="mt-8 text-center">
                            <p className="text-sm font-bold text-gray-500">
                                New to Poll.io?{" "}
                                <Link href="/register" className="text-blue-600 hover:text-blue-700 font-black decoration-2 hover:underline">
                                    Create account
                                </Link>
                            </p>
                        </div>
                    </div>

                    {/* MOBILE BACK HOME */}
                    <div className="mt-8 text-center md:hidden">
                        <Link href="/" className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-gray-900">
                            Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        </GoogleOAuthProvider>
    );
}