"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
    const router = useRouter();
    const [form, setForm] = useState({ username: "", password: "", role: "dokter" });

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await fetch("http://localhost:8000/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });

        if (res.ok) {
            alert("Register berhasil, silakan login");
            router.push("/auth/login");
        } else {
            const data = await res.json();
            alert(`Register gagal: ${data.detail || "Unknown error"}`);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
            <form
                onSubmit={handleSubmit}
                className="bg-gray-800 p-6 rounded-xl space-y-4 shadow-lg"
            >
                <h1 className="text-2xl font-bold text-center text-green-400">
                    Register
                </h1>
                <input
                    name="username"
                    placeholder="Username"
                    value={form.username}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded bg-gray-700 text-white"
                />
                <input
                    name="password"
                    type="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded bg-gray-700 text-white"
                />

                <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded bg-gray-700 text-white"
                >
                    <option value="dokter">Dokter</option>
                    <option value="admin">Admin</option>
                </select>

                <button
                    type="submit"
                    className="w-full bg-green-500 hover:bg-green-600 px-3 py-2 rounded cursor-pointer"
                >
                    Register
                </button>

                <p className="text-center text-sm text-gray-400 pt-2">
                    Sudah punya akun?{" "}
                    <a
                        href="/auth/login"
                        className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                    >
                        Login di sini
                    </a>
                </p>
            </form>
        </div>
    );
}
