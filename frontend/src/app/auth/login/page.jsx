"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();
    const [form, setForm] = useState({ username: "", password: "" });

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();

        const body = new URLSearchParams();
        body.append("username", form.username);
        body.append("password", form.password);

        const res = await fetch("http://localhost:8000/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body,
        });

        if (!res.ok) {
            const data = await res.json();
            alert(data.detail || "Login gagal");
            return;
        }

        const data = await res.json();
        const token = data.access_token;

        const profileRes = await fetch("http://localhost:8000/api/profile", {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!profileRes.ok) {
            alert("Gagal mengambil profile");
            return;
        }

        const profile = await profileRes.json();

        localStorage.setItem("token", token);
        localStorage.setItem("profile", JSON.stringify(profile));

        router.push("/patient");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
            <form
                onSubmit={handleSubmit}
                className="bg-gray-800 p-6 rounded-xl space-y-4 shadow-lg"
            >
                <h1 className="text-2xl font-bold text-center text-green-400">
                    Login
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
                <button
                    type="submit"
                    className="w-full bg-green-500 hover:bg-green-600 px-3 py-2 rounded cursor-pointer"
                >
                    Login
                </button>

                <p className="text-center text-sm text-gray-400 pt-2">
                    Belum punya akun?{" "}
                    <a
                        href="/auth/register"
                        className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                    >
                        Daftar di sini
                    </a>
                </p>
            </form>
        </div>
    );
}
