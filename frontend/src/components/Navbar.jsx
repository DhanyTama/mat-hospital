"use client";
import { useRouter } from "next/navigation";

export default function Navbar() {
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem("token");
        router.push("/auth/login");
    };

    return (
        <nav className="w-full bg-gray-800 text-white px-6 py-4 flex justify-between items-center">
            <h1 className="text-lg font-bold">Patient App</h1>
            <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md text-sm"
            >
                Logout
            </button>
        </nav>
    );
}
