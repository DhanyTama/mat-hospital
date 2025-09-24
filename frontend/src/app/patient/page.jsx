"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PatientPage() {
    const router = useRouter();
    const [patients, setPatients] = useState([]);
    const [deleteId, setDeleteId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const profile = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("profile") || "{}") : {};


    const fetchPatients = () => {
        fetch("http://localhost:8000/api/patient", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then((res) => {
                if (res.status === 401) {
                    localStorage.removeItem("token");
                    alert("Your session has expired, please log in again.");
                    router.push("/auth/login");
                    return;
                }
                return res.json();
            })
            .then((json) => setPatients(json.data ?? []));
    };

    useEffect(() => {
        if (!token) {
            router.push("/auth/login");
        } else {
            if (profile.role !== "dokter") {
                alert("Access denied. Only 'dokter' role can access this page.");
            } else {
                fetchPatients();
            }
        }
    }, []);

    const handleDelete = async () => {
        if (!deleteId) return;
        await fetch(`http://localhost:8000/api/patient/${deleteId}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        setShowModal(false);
        setDeleteId(null);
        fetchPatients();
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
            <div className="w-full max-w-3xl bg-gray-800 p-8 rounded-2xl shadow-lg">
                {profile.role === "dokter" && (
                    <>
                        <h1 className="text-2xl font-bold mb-6 text-center text-green-400">
                            Daftar Pasien
                        </h1>

                        <div className="flex justify-end mb-4">
                            <Link
                                href="/patient/create"
                                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                Tambah Pasien
                            </Link>
                        </div>

                        <ul className="space-y-3">
                            {patients.map((p) => (
                                <li
                                    key={p.id}
                                    className="border border-gray-600 p-4 rounded-lg flex justify-between items-center bg-gray-700"
                                >
                                    <span>
                                        {p.nama} - {p.diagnosis}
                                    </span>
                                    <div className="space-x-3">
                                        <Link
                                            href={`/patient/${p.id}`}
                                            className="text-blue-400 hover:underline"
                                        >
                                            Detail
                                        </Link>
                                        <Link
                                            href={`/patient/${p.id}/edit`}
                                            className="text-yellow-400 hover:underline"
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => {
                                                setDeleteId(p.id);
                                                setShowModal(true);
                                            }}
                                            className="text-red-400 hover:underline"
                                        >
                                            Hapus
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-gray-800 p-6 rounded-xl shadow-lg w-96">
                        <h2 className="text-lg font-bold text-red-400 mb-4">
                            Konfirmasi Hapus
                        </h2>
                        <p className="mb-6">
                            Apakah Anda yakin ingin menghapus pasien ini?
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 transition-colors"
                            >
                                Ya, Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
