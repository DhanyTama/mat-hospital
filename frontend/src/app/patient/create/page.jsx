"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CreatePatientPage() {
    const router = useRouter();
    const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const profile =
        typeof window !== "undefined"
            ? JSON.parse(localStorage.getItem("profile") || "{}")
            : {};

    const [form, setForm] = useState({
        nama: "",
        tanggal_lahir: "",
        tanggal_kunjungan: "",
        diagnosis: "",
        tindakan: "",
        dokter: "",
    });

    useEffect(() => {
        if (!token) {
            router.push("/auth/login");
        } else if (profile.role !== "dokter") {
            alert("Access denied. Only 'dokter' role can create patients.");
            router.push("/patient");
        }
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch("http://localhost:8000/api/patient", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(form),
            });

            if (res.status === 401) {
                localStorage.removeItem("token");
                alert("Your session has expired, please log in again.");
                router.push("/auth/login");
                return;
            }

            if (!res.ok) {
                const data = await res.json();
                alert(data.detail || "Gagal membuat pasien");
                return;
            }

            router.push("/patient");
        } catch (err) {
            console.error("Error create patient:", err);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-lg bg-gray-800 p-8 rounded-2xl shadow-lg space-y-4"
            >
                <h1 className="text-2xl font-bold text-center text-green-400 mb-6">
                    Tambah Pasien
                </h1>

                {Object.keys(form).map((key) => (
                    <input
                        key={key}
                        type={key.includes("tanggal") ? "date" : "text"}
                        name={key}
                        placeholder={key}
                        value={form[key]}
                        onChange={handleChange}
                        className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600"
                        required
                    />
                ))}

                <button
                    type="submit"
                    className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    Simpan
                </button>
            </form>
        </div>
    );
}
