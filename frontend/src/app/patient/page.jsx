"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PatientPage() {
    const router = useRouter();
    const [patients, setPatients] = useState([]);
    const [total, setTotal] = useState(0);
    const [totalToday, setTotalToday] = useState(0);
    const [deleteId, setDeleteId] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const [filterName, setFilterName] = useState("");
    const [filterDate, setFilterDate] = useState("");

    const [clientToken, setClientToken] = useState(null);
    const [clientProfile, setClientProfile] = useState({});

    const [showImportModal, setShowImportModal] = useState(false);
    const [importData, setImportData] = useState('');
    const [importMessage, setImportMessage] = useState('');

    const fetchPatients = (tokenToUse, name = "", date = "") => {
        const queryParams = new URLSearchParams();
        if (name) queryParams.append("nama", name);
        if (date) queryParams.append("tanggal_kunjungan", date);

        const url = `http://localhost:8000/api/patient?${queryParams.toString()}`;

        fetch(url, {
            headers: {
                Authorization: `Bearer ${tokenToUse}`,
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
            .then((json) => {
                if (json?.data) {
                    setPatients(json.data.patients || []);
                    setTotal(json.data.total || 0);
                    setTotalToday(json.data.total_today || 0);
                }
            });
    };

    useEffect(() => {
        const localToken = localStorage.getItem("token");
        const localProfile = JSON.parse(localStorage.getItem("profile") || "{}");

        setClientToken(localToken);
        setClientProfile(localProfile);

        if (!localToken) {
            router.push("/auth/login");
        } else {
            fetchPatients(localToken, "", "");
        }
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();

        if (clientToken) {
            fetchPatients(clientToken, filterName, filterDate);
        }
    };

    const handleDelete = async () => {
        if (!deleteId || !clientToken) return;

        await fetch(`http://localhost:8000/api/patient/${deleteId}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${clientToken}`,
            },
        });

        setShowModal(false);
        setDeleteId(null);
        fetchPatients(clientToken, filterName, filterDate);
    };

    const handleImport = async () => {
        if (!clientToken || !importData) {
            setImportMessage("Token tidak ada atau data kosong.");
            return;
        }

        try {
            const dataToImport = JSON.parse(importData);

            const res = await fetch(`http://localhost:8000/api/patient/import`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${clientToken}`,
                },
                body: JSON.stringify({ patients: dataToImport }),
            });

            const json = await res.json();

            if (res.ok) {
                setImportMessage(`✅ ${json.message}`);
                fetchPatients(clientToken, filterName, filterDate);
                setTimeout(() => {
                    setShowImportModal(false);
                    setImportData('');
                    setImportMessage('');
                }, 1500);
            } else {
                setImportMessage(`❌ Failed: ${json.detail || json.message || "Terjadi kesalahan pada server."}`);
            }

        } catch (error) {
            setImportMessage(`❌ Error parsing JSON: Format data not valid!`);
            console.error("Import error:", error);
        }
    };

    const handleExport = async () => {
        if (!clientToken) {
            alert("Sesi tidak valid. Silakan login ulang.");
            return;
        }

        try {
            const queryParams = new URLSearchParams();
            if (filterName) queryParams.append("nama", filterName);
            if (filterDate) queryParams.append("tanggal_kunjungan", filterDate);

            const url = `http://localhost:8000/api/patient/export?${queryParams.toString()}`;

            const res = await fetch(url, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${clientToken}`,
                },
            });

            if (res.status === 401) {
                alert("Otentikasi gagal. Silakan login ulang.");
                router.push("/auth/login");
                return;
            }
            if (!res.ok) {
                const errorText = await res.text();
                alert(`Gagal mengunduh laporan: Status ${res.status}. Detail: ${errorText.substring(0, 100)}...`);
                return;
            }

            const blob = await res.blob();

            let filename = `laporan_pasien_${new Date().toISOString().slice(0, 10)}.csv`;
            const disposition = res.headers.get('Content-Disposition');
            if (disposition && disposition.indexOf('attachment') !== -1) {
                const matches = /filename="?([^"]*)"?/.exec(disposition);
                if (matches != null && matches[1]) {
                    filename = matches[1];
                }
            }

            const urlBlob = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = urlBlob;
            a.download = filename;
            document.body.appendChild(a);
            a.click();

            a.remove();
            window.URL.revokeObjectURL(urlBlob);

        } catch (error) {
            console.error("Download Error:", error);
            alert("Terjadi kesalahan saat mencoba mengunduh file.");
        } finally {
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
            <div className="w-full max-w-5xl bg-gray-800 p-8 rounded-2xl shadow-lg">
                <h1 className="text-2xl font-bold mb-2 text-center text-green-400">
                    Daftar Pasien
                </h1>
                <div className="text-center text-gray-300 mb-4">
                    Total Pasien: {total} | Hari Ini: {totalToday}
                </div>

                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 mb-6 p-4 border border-gray-700 rounded-lg">
                    <input
                        type="text"
                        placeholder="Cari berdasarkan Nama"
                        value={filterName}
                        onChange={(e) => setFilterName(e.target.value)}
                        className="flex-1 p-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-green-500 focus:border-green-500"
                    />
                    <input
                        type="date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="p-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-green-500 focus:border-green-500"
                    />
                    <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        Cari
                    </button>
                </form>

                <div className="flex justify-end mb-4 space-x-3">
                    <button
                        onClick={handleExport}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-colors cursor-pointer"
                        disabled={patients.length === 0}
                    >
                        Export CSV
                    </button>
                    <button
                        onClick={() => {
                            setImportData('');
                            setImportMessage('');
                            setShowImportModal(true);
                        }}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors cursor-pointer"
                    >
                        Import Pasien
                    </button>

                    <Link
                        href="/patient/create"
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        Tambah Pasien
                    </Link>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full bg-gray-700 rounded-lg">
                        <thead>
                            <tr className="bg-gray-600 text-left text-sm uppercase">
                                <th className="py-3 px-4">Nama</th>
                                <th className="py-3 px-4">Kunjungan</th>
                                <th className="py-3 px-4">Diagnosis</th>
                                <th className="py-3 px-4">Tindakan</th>
                                <th className="py-3 px-4">Dokter</th>
                                <th className="py-3 px-4 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {patients.length > 0 ? (
                                patients.map((p) => (
                                    <tr key={p.id} className="border-b border-gray-600 hover:bg-gray-600 transition-colors">
                                        <td className="py-3 px-4 align-middle">{p.nama}</td>
                                        <td className="py-3 px-4 align-middle">{p.tanggal_kunjungan}</td>
                                        <td className="py-3 px-4 align-middle">{p.diagnosis}</td>
                                        <td className="py-3 px-4 align-middle">{p.tindakan}</td>
                                        <td className="py-3 px-4 align-middle">{p.dokter}</td>

                                        <td className="py-3 px-4">
                                            <div className="flex justify-center items-center space-x-3 h-full">
                                                <Link
                                                    href={`/patient/${p.id}/edit`}
                                                    className="text-yellow-400 hover:text-yellow-300 text-sm"
                                                >
                                                    Edit
                                                </Link>
                                                {clientProfile.role === "dokter" && (
                                                    <button
                                                        onClick={() => {
                                                            setDeleteId(p.id);
                                                            setShowModal(true);
                                                        }}
                                                        className="text-red-400 hover:text-red-300 text-sm cursor-pointer"
                                                    >
                                                        Hapus
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="py-5 text-center text-gray-400">
                                        Tidak ada data pasien ditemukan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
                    <div className="bg-gray-800 p-6 rounded-xl shadow-2xl w-96">
                        <h2 className="text-xl font-bold text-red-400 mb-4">
                            Konfirmasi Hapus
                        </h2>
                        <p className="mb-6 text-gray-300">
                            Apakah Anda yakin ingin menghapus pasien ini secara permanen?
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 transition-colors cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 transition-colors cursor-pointer"
                            >
                                Ya, Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showImportModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
                    <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-lg">
                        <h2 className="text-xl font-bold text-orange-400 mb-4">
                            Import Data Pasien (JSON)
                        </h2>
                        <p className="mb-4 text-gray-300">
                            Tempelkan data pasien dalam format **Array JSON** berikut:
                        </p>

                        <div className="bg-gray-700 p-3 rounded-lg text-sm mb-4 font-mono overflow-x-auto">
                            <pre>
                                {`[
  {
    "nama": "Citra Dewi",
    "tanggal_kunjungan": "YYYY-MM-DD"
  },
  {
    "nama": "Dani Firmansyah",
    "tanggal_kunjungan": "YYYY-MM-DD"
  }
]`}
                            </pre>
                        </div>

                        <textarea
                            value={importData}
                            onChange={(e) => setImportData(e.target.value)}
                            rows="10"
                            placeholder="Tempelkan Array JSON data pasien di sini..."
                            className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-orange-500 focus:border-orange-500 resize-none mb-4"
                        ></textarea>

                        {importMessage && (
                            <p className={`mb-4 text-center p-2 rounded ${importMessage.startsWith('❌') ? 'bg-red-900 text-red-300' : 'bg-green-900 text-green-300'}`}>
                                {importMessage}
                            </p>
                        )}

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowImportModal(false)}
                                className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 transition-colors cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleImport}
                                className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 transition-colors cursor-pointer"
                                disabled={!importData}
                            >
                                Proses Import
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}