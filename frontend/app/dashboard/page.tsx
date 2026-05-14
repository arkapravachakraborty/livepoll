"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import {
    LayoutDashboard,
    Plus,
    ExternalLink,
    BarChart2,
    LogOut,
    UserMinus,
    Settings,
    Trash2
} from "lucide-react";
import Link from "next/link";

export default function UserDashboard() {
    const [polls, setPolls] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchMyPolls = async () => {
            try {
                const token = localStorage.getItem("poll_token");
                if (!token) {
                    router.push("/login");
                    return;
                }
                const res = await axios.get("http://localhost:4000/api/polls/user/my-polls", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setPolls(res.data);
            } catch (err) {
                router.push("/login");
            } finally {
                setIsLoading(false);
            }
        };
        fetchMyPolls();
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem("poll_token");
        router.push("/login");
    };

    const handleDeleteAccount = async () => {
        const confirmDelete = window.confirm(
            "Are you absolutely sure? This will scramble your data and you will lose access to these polls forever."
        );
        if (!confirmDelete) return;

        try {
            const token = localStorage.getItem("poll_token");
            await axios.delete("http://localhost:4000/api/auth/delete-account", {
                headers: { Authorization: `Bearer ${token}` }
            });
            localStorage.removeItem("poll_token");
            router.push("/register");
        } catch (error) {
            alert("Failed to delete account.");
        }
    };

    const handleDeletePoll = async (pollId: string) => {
        if (!window.confirm("Are you sure you want to delete this poll? This cannot be undone.")) return;

        try {
            const token = localStorage.getItem("poll_token");
            await axios.delete(`http://localhost:4000/api/polls/${pollId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Remove the deleted poll from the local state so it disappears instantly
            setPolls(polls.filter(p => p.id !== pollId));
        } catch (err) {
            alert("Failed to delete poll.");
        }
    };

    if (isLoading) return <div className="p-10 font-black text-center">Loading your workspace...</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4">
            <div className="max-w-5xl mx-auto">

                {/* --- HEADER --- */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">

                    <div className="cursor-pointer group"
                        onClick={() => router.push("/")}>
                        <h1 className="text-4xl font-black text-gray-900 flex items-center tracking-tight">
                            <LayoutDashboard className="mr-3 text-blue-600 w-10 h-10" />
                            Workspace
                        </h1>
                        <p className="text-gray-500 font-bold mt-1 uppercase text-xs tracking-widest">
                            {polls.length} Active Polls
                        </p>
                    </div>
                    <button
                        onClick={() => router.push("/create")}
                        className="bg-gray-900 hover:bg-black text-white px-8 py-4 rounded-2xl font-black flex items-center justify-center transition-all shadow-xl active:scale-95"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Create New Poll
                    </button>
                </div>

                {/* --- POLLS GRID --- */}
                {polls.length === 0 ? (
                    <div className="bg-white border-2 border-dashed border-gray-200 rounded-3xl p-20 text-center mb-10">
                        <p className="text-gray-400 font-bold text-xl mb-4">No polls found.</p>
                        <button onClick={() => router.push("/create")} className="text-blue-600 font-black hover:underline">Launch your first poll →</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                        {polls.map((poll) => (
                            <div key={poll.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                                <h3 className="text-xl font-black text-gray-900 mb-2 truncate">{poll.title}</h3>
                                <p className="text-sm text-gray-500 font-bold mb-6">
                                    Created {new Date(poll.createdAt).toLocaleDateString()}
                                </p>
                                <div className="flex items-center gap-3">
                                    <Link
                                        href={`/poll/${poll.id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 bg-gray-900 text-white font-bold py-3 rounded-xl flex items-center justify-center hover:bg-black transition-colors text-center"
                                    >
                                        <BarChart2 className="w-4 h-4 mr-2" />
                                        Stats
                                    </Link>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(`${window.location.origin}/vote/${poll.id}`);
                                            alert("Link Copied!");
                                        }}
                                        className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-colors"
                                    >
                                        <ExternalLink className="w-4 h-4 mr-2" />
                                        Share
                                    </button>
                                    <button
                                        onClick={() => handleDeletePoll(poll.id)}
                                        className="flex-1 bg-red-500 text-white font-bold py-3 rounded-xl flex items-center justify-center hover:bg-red-600 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* --- ACCOUNT SETTINGS (The New Bottom Section) --- */}
                <div className="mt-16 border-t border-gray-200 pt-10">
                    <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center">
                        <Settings className="mr-2 w-6 h-6 text-gray-400" />
                        Account Settings
                    </h2>
                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                        <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="text-center md:text-left">
                                <p className="text-gray-900 font-black text-lg">Session & Security</p>
                                <p className="text-gray-500 font-medium text-sm">Manage your account access and data visibility.</p>
                            </div>
                            <div className="flex gap-4">
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center px-6 py-3 font-bold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Sign Out
                                </button>
                                <button
                                    onClick={handleDeleteAccount}
                                    className="flex items-center px-6 py-3 font-bold text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
                                >
                                    <UserMinus className="w-4 h-4 mr-2" />
                                    Delete Account
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}