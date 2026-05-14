"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { io } from "socket.io-client";
import {
    BarChart3,
    Users,
    Clock,
    Share2,
    Home,
    TrendingUp,
    Lock,
    Play,
    Globe,
    ShieldAlert
} from "lucide-react";

const socket = io("http://localhost:4000");

export default function PollDashboard() {
    const params = useParams();
    const router = useRouter();
    const pollId = params.pollId;

    const [pollData, setPollData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isOwner, setIsOwner] = useState(false);

    const fetchPollResults = async () => {
        try {
            // FIX: Fetch BOTH stats and base poll info so we don't lose isClosed/isPublish on refresh
            const [statsRes, basePollRes] = await Promise.all([
                axios.get(`http://localhost:4000/api/polls/${pollId}/stats`),
                axios.get(`http://localhost:4000/api/polls/${pollId}`)
            ]);

            setPollData({
                ...basePollRes.data, // Gives us title, isClosed, isPublish
                totalVotes: statsRes.data.totalVotes,
                questions: statsRes.data.questions // Gives us the stats/percentages
            });

            const token = localStorage.getItem("poll_token");
            if (token) {
                setIsOwner(true);
            }
        } catch (error) {
            console.error("Error fetching stats:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const togglePublish = async () => {
        if (!window.confirm("Once published, results are public and the poll cannot be reopened. Proceed?")) return;
        try {
            const token = localStorage.getItem("poll_token");
            await axios.patch(`http://localhost:4000/api/polls/${pollId}/publish`,
                { isPublished: true },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setPollData({ ...pollData, isPublish: true, isClosed: true });
        } catch (err) {
            alert("Failed to update publish status");
        }
    };

    const toggleClose = async () => {
        try {
            const token = localStorage.getItem("poll_token");
            const nextState = !pollData.isClosed;
            await axios.patch(`http://localhost:4000/api/polls/${pollId}/close`,
                { isClosed: nextState },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setPollData({ ...pollData, isClosed: nextState });
        } catch (err: any) {
            alert(err.response?.data?.error || "Failed to update poll status");
        }
    };

    useEffect(() => {
        if (pollId) {
            fetchPollResults();
            socket.emit("join_poll", pollId);
            socket.on("new_vote", () => fetchPollResults());
        }
        return () => { socket.off("new_vote"); };
    }, [pollId]);

    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
                <p className="text-gray-900 font-bold text-xl">Syncing Analytics...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-20 selection:bg-blue-100 uppercase tracking-tighter">
            {/* NAVIGATION */}
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 px-4 py-3">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4 md:gap-8 text-sm">
                        <button onClick={() => router.push("/")} className="flex items-center text-gray-500 hover:text-black font-black transition-colors group uppercase tracking-widest">
                            <Home className="w-4 h-4 mr-1.5" />
                            Home
                        </button>
                        {isOwner && (
                            <button onClick={() => router.push("/dashboard")} className="flex items-center text-gray-500 hover:text-black font-black transition-colors uppercase tracking-widest">
                                <BarChart3 className="w-4 h-4 mr-1.5" />
                                Dashboard
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Status updates dynamically so "Live Sync" matches poll state */}
                        <span className={`h-2 w-2 rounded-full ${pollData.isClosed ? 'bg-red-500' : 'bg-green-500 animate-pulse'}`}></span>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            {pollData.isClosed ? "Offline" : "Live Sync"}
                        </p>
                    </div>
                </div>
            </nav>

            <div className="max-w-4xl mx-auto px-4 mt-8">
                {/* --- MANAGEMENT CONTROL CENTER --- */}
                {isOwner && !pollData.isPublish && (
                    <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-6 mb-8">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="text-center md:text-left">
                                <h2 className="text-lg font-black text-gray-900 uppercase tracking-tighter">Poll Lifecycle</h2>
                                <p className="text-xs font-bold text-gray-400">Control voting and public visibility</p>
                            </div>
                            <div className="flex gap-3 w-full md:w-auto">
                                <button
                                    onClick={toggleClose}
                                    className={`flex-1 md:flex-none flex items-center justify-center px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 border-2 ${pollData.isClosed
                                        ? "bg-green-50 border-green-200 text-green-700"
                                        : "bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                                        }`}
                                >
                                    {pollData.isClosed ? <><Play className="w-4 h-4 mr-2" /> Reopen</> : <><Lock className="w-4 h-4 mr-2" /> Stop Poll</>}
                                </button>
                                <button
                                    onClick={togglePublish}
                                    className={`flex-1 md:flex-none flex items-center justify-center px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 border-2 ${pollData.isPublish
                                        ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200"
                                        : "bg-gray-50 border-gray-200 text-gray-400 hover:bg-gray-100"
                                        }`}
                                >
                                    <Globe className="w-4 h-4 mr-2" />
                                    {pollData.isPublish ? "Results Public" : "Publish Results"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- PUBLIC PUBLISHED BADGE --- */}
                {pollData.isPublish && (
                    <div className="bg-blue-600 rounded-[2rem] p-6 mb-8 text-white flex items-center shadow-xl">
                        <Globe className="w-8 h-8 mr-4 text-blue-200" />
                        <div>
                            <h2 className="font-black text-lg uppercase leading-none mb-1">Results Archived</h2>
                            <p className="text-blue-200 text-[10px] font-bold uppercase tracking-widest">Public record established • Voting closed</p>
                        </div>
                    </div>
                )}

                {/* MAIN STATS CARD */}
                <div className="bg-white rounded-[2rem] shadow-2xl shadow-gray-200/50 border border-gray-100 p-8 md:p-12 mb-6">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-4">
                                <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest flex items-center border ${pollData.isClosed ? "bg-red-50 text-red-600 border-red-100" : "bg-green-50 text-green-600 border-green-100"
                                    }`}>
                                    {!pollData.isClosed && <span className="h-1.5 w-1.5 bg-green-600 rounded-full animate-ping mr-2"></span>}
                                    {pollData.isClosed ? "Ended" : "Active"}
                                </span>
                                {pollData.isPublish && (
                                    <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-blue-100">
                                        Published
                                    </span>
                                )}
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight tracking-tight">
                                {pollData?.title || "Poll Analytics"}
                            </h1>
                        </div>
                        {isOwner && !pollData.isClosed && (
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(`${window.location.origin}/vote/${pollId}`);
                                    alert("Voting link copied!");
                                }}
                                className="w-full md:w-auto flex items-center justify-center px-10 py-5 bg-gray-900 text-white rounded-2xl font-black hover:bg-black transition-all shadow-2xl active:scale-95"
                            >
                                <Share2 className="w-5 h-5 mr-3" />
                                Invite Voters
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gray-50/50 p-8 rounded-3xl border border-gray-100">
                            <div className="flex items-center text-gray-400 mb-2">
                                <Users className="w-4 h-4 mr-2" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Responses</span>
                            </div>
                            <h3 className="text-5xl font-black text-gray-900 tracking-tighter">{pollData?.totalVotes || 0}</h3>
                        </div>

                        <div className="bg-gray-50/50 p-8 rounded-3xl border border-gray-100">
                            <div className="flex items-center text-gray-400 mb-2">
                                <Clock className="w-4 h-4 mr-2" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Poll State</span>
                            </div>
                            <h3 className={`text-xl font-black uppercase ${pollData.isClosed ? "text-red-500" : "text-green-600"}`}>
                                {pollData.isClosed ? "Closed" : "Live"}
                            </h3>
                        </div>

                        <div className="bg-gray-50/50 p-8 rounded-3xl border border-gray-100">
                            <div className="flex items-center text-gray-400 mb-2">
                                <TrendingUp className="w-4 h-4 mr-2" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Mode</span>
                            </div>
                            <h3 className="text-xl font-black text-gray-900">Real-time</h3>
                        </div>
                    </div>
                </div>

                {/* QUESTION BREAKDOWN */}
                <div className="bg-white rounded-[2rem] shadow-2xl shadow-gray-200/50 border border-gray-100 p-8 md:p-12">
                    <h2 className="text-2xl font-black text-gray-900 flex items-center mb-10 tracking-tight uppercase">
                        <ShieldAlert className="w-6 h-6 mr-3 text-blue-600" />
                        Live Question Breakdown
                    </h2>

                    <div className="space-y-12">
                        {pollData?.questions?.map((q: any, i: number) => (
                            <div key={q.id} className="group">
                                <h4 className="text-xl font-black text-gray-900 mb-8 leading-snug">
                                    <span className="text-blue-600 mr-2">Q{i + 1}.</span>
                                    {q.question}
                                </h4>
                                {/* FIX: Conditional Rendering for Text vs Options */}
                                {q.type === "text" ? (
                                    <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                                        {q.textResponses && q.textResponses.length > 0 ? (
                                            q.textResponses.map((text: string, idx: number) => (
                                                <div key={idx} className="bg-gray-50 p-5 rounded-2xl border border-gray-100 text-sm font-bold text-gray-700 normal-case tracking-normal">
                                                    "{text}"
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-gray-400 text-xs font-black uppercase tracking-widest p-4 text-center border-2 border-dashed border-gray-100 rounded-2xl">
                                                No responses yet
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {q.options?.map((opt: any) => (
                                            <div key={opt.id}>
                                                <div className="flex justify-between items-end mb-3 px-1">
                                                    <span className="text-sm font-bold text-gray-700">{opt.option}</span>
                                                    <span className="text-xs font-black text-gray-900 bg-gray-100 px-2 py-1 rounded-lg">
                                                        {opt.percentage}% <span className="text-gray-400 ml-1">({opt.count})</span>
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-50 rounded-full h-4 border border-gray-100 overflow-hidden p-1">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-1000 ease-in-out shadow-inner ${pollData.isClosed ? "bg-gray-400" : "bg-blue-600"}`}
                                                        style={{ width: `${opt.percentage}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}