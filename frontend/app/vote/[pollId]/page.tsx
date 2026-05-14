"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { BarChart3, CheckCircle2, Home, Send, Lock, Users } from "lucide-react";

export default function PublicVotingPage() {
    const params = useParams();
    const router = useRouter();
    const pollId = params.pollId;

    const [poll, setPoll] = useState<any>(null);
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string | string[]>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isVoted, setIsVoted] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchPoll = async () => {
            try {
                const response = await axios.get(`http://localhost:4000/api/polls/${pollId}`);
                setPoll(response.data);
            } catch (err) {
                setError("NOT_FOUND");
            }
        };
        if (pollId) fetchPoll();
    }, [pollId]);

    const isFormValid = () => {
        if (!poll) return false;
        return poll.questions.every((q: any) => {
            if (!q.isMandatory) return true;
            const answer = selectedOptions[q.id];
            // Must check if answer exists and isn't an empty array/string
            return answer !== undefined && answer.length > 0;
        });
    };

    // FIXED: Properly handles multiple checkboxes and text fields
    const handleOptionChange = (questionId: string, value: string, type: string) => {
        if (type === "single" || type === "text") {
            setSelectedOptions({ ...selectedOptions, [questionId]: value });
        } else if (type === "multiple") {
            const current = (selectedOptions[questionId] as string[]) || [];
            const updated = current.includes(value)
                ? current.filter(id => id !== value)
                : [...current, value];
            setSelectedOptions({ ...selectedOptions, [questionId]: updated });
        }
    };

    const submitVote = async () => {
        if (!isFormValid()) {
            const missing = poll.questions
                .filter((q: any) => q.isMandatory && (!selectedOptions[q.id] || selectedOptions[q.id].length === 0))
                .map((q: any) => q.question);
            alert(`Answers Required for following questions:\n${missing.join('\n')}`);
            return;
        }

        setIsSubmitting(true);
        try {
            const token = localStorage.getItem("poll_token");

            // Format answers flatly for the backend
            const answers: any[] = [];
            Object.entries(selectedOptions).forEach(([qId, value]) => {
                const q = poll.questions.find((x: any) => x.id === qId);

                if (q.type === "multiple") {
                    (value as string[]).forEach(optId => answers.push({ questionId: qId, optionId: optId }));
                } else if (q.type === "text") {
                    // Send textAnswer for backend to process
                    answers.push({ questionId: qId, textAnswer: value, type: "text" });
                } else {
                    answers.push({ questionId: qId, optionId: value });
                }
            });

            await axios.post(`http://localhost:4000/api/polls/${pollId}/vote`,
                { answers, userId: token ? null : undefined },
                { headers: token ? { Authorization: `Bearer ${token}` } : {} }
            );

            setIsVoted(true);
        } catch (err: any) {
            setError(err.response?.status === 401 ? "SIGN_IN_REQUIRED" : "SUBMIT_FAILED");
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- GUARD CLAUSES REMAIN UNCHANGED ---
    if (isVoted) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-2xl border border-green-100 text-center animate-in fade-in zoom-in duration-300">
                <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-3xl font-black text-gray-900 mb-2">Vote Recorded!</h2>
                <p className="text-gray-500 font-bold mb-8">Thank you for your feedback. Your response has been synced to the live dashboard.</p>
                <button onClick={() => router.push("/")} className="w-full py-4 bg-gray-900 text-white rounded-xl font-black hover:bg-black transition-all shadow-lg active:scale-95 flex items-center justify-center">
                    <Home className="w-4 h-4 mr-2" /> Return to Home
                </button>
            </div>
        </div>
    );

    if (poll?.isPublish) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
            <div className="max-w-2xl w-full bg-white p-8 md:p-12 rounded-3xl shadow-xl text-center">
                <BarChart3 className="w-16 h-16 text-blue-600 mx-auto mb-6" />
                <h2 className="text-3xl font-black text-gray-900">Results are In.</h2>
                <p className="text-gray-500 font-bold mt-2 mb-8 italic">"{poll.title}" is now closed.</p>
                <button onClick={() => router.push(`/poll/${pollId}`)} className="w-full py-4 bg-gray-900 text-white rounded-xl font-black">View Final Outcome</button>
            </div>
        </div>
    );

    const isExpired = poll?.expireTime && new Date() > new Date(poll.expireTime);
    if (poll?.isClosed || isExpired) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
            <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-xl border border-red-100 text-center">
                <Lock className="w-16 h-16 text-red-500 mx-auto mb-6" />
                <h2 className="text-3xl font-black text-gray-900 mb-2">Voting Closed</h2>
                <p className="text-gray-500 font-bold mb-8">"{poll.title}" is no longer accepting responses.</p>
                <button onClick={() => router.push("/")} className="w-full py-4 bg-gray-900 text-white rounded-xl font-black hover:bg-black transition-all">
                    Return to Home
                </button>
            </div>
        </div>
    );

    if (error === "SIGN_IN_REQUIRED") return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 text-center">
            <div className="max-w-md bg-white p-10 rounded-3xl shadow-xl">
                <Users className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h2 className="text-2xl font-black mb-2">Login Required</h2>
                <p className="text-gray-500 font-bold mb-6">This poll requires a verified account to participate.</p>
                <button onClick={() => router.push("/login")} className="w-full py-4 bg-gray-900 text-white rounded-xl font-black">Sign In to Vote</button>
            </div>
        </div>
    );

    if (!poll) return <div className="p-10 text-center font-black text-gray-400 animate-pulse">Loading Workspace...</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="flex justify-center mb-10">
                    <button onClick={() => router.push("/")} className="flex items-center gap-2 group">
                        <div className="bg-gray-900 p-1.5 rounded-lg group-hover:bg-blue-600 transition-colors">
                            <BarChart3 className="text-white w-5 h-5" />
                        </div>
                        <span className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Poll.io</span>
                    </button>
                </div>

                <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
                    <div className="bg-gray-900 p-8 text-white">
                        <h1 className="text-2xl md:text-3xl font-black mb-2 leading-tight">{poll.title}</h1>
                        <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">
                            {poll.isAnonymous ? "🔒 Anonymous Collection" : "👤 Verified Identity Required"}
                        </p>
                    </div>

                    <div className="p-6 md:p-10 space-y-12">
                        {poll.questions.map((q: any, i: number) => (
                            <div key={q.id} className="space-y-5">
                                <div className="flex items-start justify-between gap-4">
                                    <h3 className="text-lg md:text-xl font-black text-gray-900 leading-snug">
                                        <span className="text-blue-600 mr-2">{i + 1}.</span>
                                        {q.question}
                                        {q.isMandatory && <span className="text-red-500 ml-1">*</span>}
                                    </h3>
                                    {q.isMandatory && (
                                        <span className="text-[9px] font-black bg-red-50 text-red-600 px-2 py-1 rounded-full uppercase border border-red-100">Required</span>
                                    )}
                                </div>

                                {/* CONDITIONAL RENDERING based on question type */}
                                {q.type === "text" ? (
                                    <textarea
                                        className="w-full px-4 py-4 text-black font-bold placeholder-gray-400 border-2 border-gray-100 rounded-2xl focus:border-blue-600 focus:ring-0 transition-colors outline-none resize-none bg-gray-50 focus:bg-white"
                                        rows={3}
                                        placeholder="Type your answer here..."
                                        value={selectedOptions[q.id] as string || ""}
                                        onChange={(e) => handleOptionChange(q.id, e.target.value, "text")}
                                    />
                                ) : (
                                    <div className="grid gap-3">
                                        {q.options.map((opt: any) => {
                                            const isSelected = q.type === "multiple"
                                                ? (selectedOptions[q.id] as string[] || []).includes(opt.id)
                                                : selectedOptions[q.id] === opt.id;

                                            return (
                                                <label key={opt.id} className={`flex items-center p-4 border-2 cursor-pointer transition-all ${q.type === 'multiple' ? 'rounded-xl' : 'rounded-2xl'} ${isSelected ? "border-blue-600 bg-blue-50/50" : "border-gray-100 bg-gray-50 hover:border-gray-300"}`}>
                                                    <input
                                                        type={q.type === "multiple" ? "checkbox" : "radio"}
                                                        name={q.id}
                                                        className={`w-5 h-5 text-blue-600 border-gray-300 mr-4 cursor-pointer ${q.type === 'multiple' ? 'rounded' : 'rounded-full'}`}
                                                        onChange={() => handleOptionChange(q.id, opt.id, q.type)}
                                                        checked={isSelected}
                                                    />
                                                    <span className={`font-bold ${isSelected ? "text-blue-900" : "text-gray-700"}`}>{opt.option}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        ))}

                        <div className="pt-6 border-t border-gray-100">
                            <button
                                onClick={submitVote}
                                disabled={isSubmitting}
                                className={`w-full py-5 rounded-2xl font-black text-lg transition-all active:scale-95 flex items-center justify-center ${!isFormValid() ? "bg-gray-100 text-gray-400" : "bg-gray-900 text-white hover:bg-black shadow-xl"}`}
                            >
                                <Send className="w-5 h-5 mr-2" />
                                {isSubmitting ? "Casting..." : "Submit My Vote"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}