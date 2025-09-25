"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditPatientPage() {
    const { id } = useParams();
    const router = useRouter();
    const [form, setForm] = useState(null);
    const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const profile =
        typeof window !== "undefined"
            ? JSON.parse(localStorage.getItem("profile") || "{}")
            : {};

    useEffect(() => {
        if (!token) {
            router.push("/auth/login");
        } else if (profile.role !== "dokter") {
            alert("Access denied. Only 'dokter' role can edit patients.");
            router.push("/patient");
        }
    }, [token, profile.role, router]);

    useEffect(() => {
        const fetchPatient = async () => {
            try {
                const res = await fetch(`http://localhost:8000/api/patient/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (res.status === 401) {
                    localStorage.removeItem("token");
                    alert("Your session has expired, please log in again.");
                    router.push("/auth/login");
                    return;
                }

                const json = await res.json();
                setForm(json.data);
            } catch (err) {
                console.error("Error fetch patient:", err);
            }
        };

        if (token) fetchPatient();
    }, [id, token, router]);

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = { ...form };
        delete payload.id;

        try {
            const res = await fetch(`http://localhost:8000/api/patient/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const data = await res.json();
                alert(data.detail || "Gagal update pasien");
                return;
            }

            router.push("/patient");
        } catch (err) {
            console.error("Error update patient:", err);
        }
    };

    if (!form) {
        return (
            <div className="min-h-screen flex items-center justify-center text-white">
                Loading...
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
            <div className="w-full max-w-lg bg-gray-800 p-8 rounded-2xl shadow-lg">
                <h1 className="text-2xl font-bold mb-6 text-center text-green-400">
                    Edit Pasien
                </h1>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {Object.keys(form)
                        .filter((key) => key !== "id")
                        .map((key) => (
                            <div key={key} className="flex flex-col">
                                <label
                                    htmlFor={key}
                                    className="mb-1 capitalize text-sm font-medium text-gray-300"
                                >
                                    {key.replace("_", " ")}
                                </label>
                                <input
                                    id={key}
                                    name={key}
                                    type={key.includes("tanggal") ? "date" : "text"}
                                    value={form[key] || ""}
                                    onChange={handleChange}
                                    className="border border-gray-600 rounded-lg px-3 py-2 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                                    required
                                    disabled={key === "dokter"}
                                />
                            </div>
                        ))}

                    <div className="flex space-x-4 pt-2">
                        <button
                            type="button"
                            onClick={() => router.push("/patient")}
                            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer"
                        >
                            Kembali
                        </button>
                        <button
                            type="submit"
                            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg transition-colors cursor-pointer"
                        >
                            Simpan Perubahan
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
