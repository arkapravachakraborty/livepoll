"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import axios from "axios";
import { useRouter } from "next/navigation";
import {
    PlusCircle,
    Trash2,
    Save,
    Home,
    ChevronLeft
} from "lucide-react";

type FormValues = {
    title: string;
    isAnonymous: boolean;
    expireTime: string;
    questions: {
        question: string;
        type: "single" | "multiple" | "text"; // Added "text"
        isMandatory: boolean;
        options: { value: string }[];
    }[];
};

export default function CreatePollPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    // 1. Kick out unauthenticated users
    useEffect(() => {
        const token = localStorage.getItem("poll_token");
        if (!token) router.push("/login");
    }, [router]);

    // 2. Setup React Hook Form with default values (Added watch)
    const { register, control, handleSubmit, watch, formState: { errors } } = useForm<FormValues>({
        defaultValues: {
            title: "",
            isAnonymous: true,
            expireTime: "",
            questions: [
                {
                    question: "",
                    type: "single",
                    isMandatory: true,
                    options: [{ value: "" }, { value: "" }] // Start with 2 empty options
                }
            ]
        }
    });

    // Watch the questions array so we can conditionally hide options for "text" type
    const watchedQuestions = watch("questions") || [];

    // 3. The Magic Hook for dynamic questions
    const { fields: questionFields, append: appendQuestion, remove: removeQuestion } = useFieldArray({
        control,
        name: "questions"
    });

    // 4. Handle Form Submission
    const onSubmit = async (data: FormValues) => {
        setIsSubmitting(true);
        setError("");

        try {
            // Format the options back into simple arrays of strings for the backend
            const formattedData = {
                ...data,
                questions: data.questions.map(q => ({
                    ...q,
                    // FIX: If it's a text question, send empty options
                    options: q.type === "text" ? [] : q.options.map(opt => opt.value)
                }))
            };

            const token = localStorage.getItem("poll_token");

            const response = await axios.post("http://localhost:4000/api/polls", formattedData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Redirect to the Creator's Dashboard for this specific poll
            router.push(`/poll/${response.data.pollId}`);

        } catch (err: any) {
            console.error(err);
            setError("Failed to create poll. Please check your inputs.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4">
            <div className="max-w-3xl mx-auto">

                <div className="flex items-center justify-between mb-8">
                    <div className="flex gap-4">
                        <button
                            onClick={() => router.push("/")}
                            className="p-2 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors"
                        >
                            <Home className="w-5 h-5" />
                        </button>
                        <h1 className="text-3xl font-black text-gray-900">Create New Poll</h1>
                    </div>

                    <button
                        onClick={() => router.push("/dashboard")}
                        className="text-sm font-bold text-gray-500 hover:text-black flex items-center"
                    >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        My Workspace
                    </button>

                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

                    {/* --- POLL SETTINGS CARD --- */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-semibold mb-4 border-b pb-2 text-gray-900">Poll Settings</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-1">Poll Title</label>
                                <input
                                    {...register("title", { required: "Title is required" })}
                                    className="w-full px-4 py-2 text-black font-medium placeholder-gray-500 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    placeholder="E.g., Company Offsite Destination"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-1">Expiration Date & Time</label>
                                    <input
                                        type="datetime-local"
                                        {...register("expireTime", { required: "Expiration time is required" })}
                                        className="w-full px-4 py-2 text-black font-medium border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    />
                                </div>

                                <div className="flex items-center pt-6">
                                    <input
                                        type="checkbox"
                                        {...register("isAnonymous")}
                                        className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                                    />
                                    <label className="ml-2 block text-sm font-semibold text-gray-900 cursor-pointer">
                                        Make votes anonymous
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- QUESTIONS SECTION --- */}
                    <div className="space-y-6">
                        {questionFields.map((field, qIndex) => (
                            <div key={field.id} className="bg-white p-6 rounded-xl shadow-sm border border-blue-100 relative">

                                {questionFields.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeQuestion(qIndex)}
                                        className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                )}

                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                    <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">
                                        {qIndex + 1}
                                    </span>
                                    Question
                                </h3>

                                <div className="space-y-4">
                                    <input
                                        {...register(`questions.${qIndex}.question`, { required: true })}
                                        className="w-full px-4 py-2 text-black font-medium placeholder-gray-500 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        placeholder="Type your question here..."
                                    />

                                    <div className="flex gap-4">
                                        <select
                                            {...register(`questions.${qIndex}.type`)}
                                            className="px-4 py-2 text-black font-medium border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                                        >
                                            <option value="single">Single Choice (Radio)</option>
                                            <option value="multiple">Multiple Choice (Checkbox)</option>
                                            {/* FIX: Added Text Option */}
                                            <option value="text">Text Input (Short Answer)</option>
                                        </select>

                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                {...register(`questions.${qIndex}.isMandatory`)}
                                                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                            />
                                            <label className="ml-2 text-sm font-semibold text-gray-900">Required</label>
                                        </div>
                                    </div>

                                    {/* --- FIX: CONDITIONAL OPTIONS LIST --- */}
                                    {watchedQuestions[qIndex]?.type !== "text" && (
                                        <OptionsList control={control} register={register} qIndex={qIndex} />
                                    )}

                                </div>
                            </div>
                        ))}
                    </div>

                    {/* --- ACTION BUTTONS --- */}
                    <div className="flex justify-between items-center pt-4">
                        <button
                            type="button"
                            onClick={() => appendQuestion({ question: "", type: "single", isMandatory: true, options: [{ value: "" }, { value: "" }] })}
                            className="flex items-center px-4 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg font-semibold transition-colors"
                        >
                            <PlusCircle className="w-5 h-5 mr-2" />
                            Add Another Question
                        </button>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex items-center px-8 py-3 bg-gray-900 hover:bg-black text-white rounded-lg font-semibold transition-colors shadow-lg disabled:bg-gray-400"
                        >
                            <Save className="w-5 h-5 mr-2" />
                            {isSubmitting ? "Saving..." : "Create Poll"}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}

// --- SUBCONENT FOR NESTED OPTIONS ---
function OptionsList({ control, register, qIndex }: { control: any, register: any, qIndex: number }) {
    const { fields: optionFields, append: appendOption, remove: removeOption } = useFieldArray({
        control,
        name: `questions.${qIndex}.options`
    });

    return (
        <div className="mt-4 pl-4 border-l-2 border-gray-200 space-y-3">
            <label className="block text-sm font-semibold text-gray-900">Options</label>

            {optionFields.map((optField, oIndex) => (
                <div key={optField.id} className="flex items-center gap-2">
                    <input
                        {...register(`questions.${qIndex}.options.${oIndex}.value`, { required: true })}
                        className="flex-1 px-4 py-2 text-black font-medium placeholder-gray-500 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                        placeholder={`Option ${oIndex + 1}`}
                    />

                    {optionFields.length > 2 && (
                        <button
                            type="button"
                            onClick={() => removeOption(oIndex)}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
            ))}

            <button
                type="button"
                onClick={() => appendOption({ value: "" })}
                className="text-sm text-blue-600 hover:text-blue-800 font-bold mt-2 inline-block"
            >
                + Add Option
            </button>
        </div>
    );
}