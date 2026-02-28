"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Search,
    Save,
    LogOut,
    Upload,
    RefreshCw,
    FileSpreadsheet,
    Package,
} from "lucide-react";
import { LiquipediaImage } from "@/components/LiquipediaImage";
import { ToastContainer, ToastMessage, ToastType } from "@/components/Toast";

type PriceItem = {
    name: string;
    hero: string;
    qty: number;
    price: number;
};

export default function AdminDashboard() {
    const [items, setItems] = useState<PriceItem[]>([]);
    const [filteredItems, setFilteredItems] = useState<PriceItem[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const router = useRouter();

    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const addToast = (message: string, type: ToastType = "success") => {
        const id = Math.random().toString(36).substring(7);
        setToasts((prev) => [...prev, { id, message, type }]);
    };

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    const fetchItems = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/prices");
            if (res.ok) {
                const data = await res.json();
                setItems(data);
                setFilteredItems(data);
            }
        } catch (error) {
            console.error("Failed to fetch prices:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    useEffect(() => {
        if (!search) {
            setFilteredItems(items);
            return;
        }
        const lower = search.toLowerCase();
        setFilteredItems(
            items.filter(
                (item) =>
                    item.name.toLowerCase().includes(lower) ||
                    item.hero.toLowerCase().includes(lower)
            )
        );
    }, [search, items]);

    const handleLogout = async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/admin/login");
        router.refresh();
    };

    const handleUpdateItem = (index: number, field: keyof PriceItem, value: any) => {
        const originalItem = filteredItems[index];
        const realIndex = items.findIndex((i) => i.name === originalItem.name);

        if (realIndex === -1) return;

        const newItems = [...items];
        newItems[realIndex] = { ...newItems[realIndex], [field]: value };
        setItems(newItems);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch("/api/admin/prices", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(items),
            });
            if (res.ok) {
                addToast("Prices saved successfully!", "success");
            } else {
                addToast("Failed to save prices.", "error");
            }
        } catch (error) {
            addToast("Error saving prices.", "error");
        } finally {
            setSaving(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/admin/upload-prices", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();
            if (res.ok && data.success) {
                addToast(`Successfully uploaded ${data.updated} items.`, "success");
                fetchItems(); // Refresh the list
            } else {
                addToast(data.error || "Failed to upload file.", "error");
            }
        } catch (error) {
            addToast("Error uploading file.", "error");
        } finally {
            setUploading(false);
            e.target.value = "";
        }
    };

    const formatRupiah = (value: number) =>
        new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(value);

    return (
        <div className="space-y-6 pb-10">
            {/* Header Actions - Now Sticky! */}
            <div className="sticky top-[80px] z-40 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white/90 dark:bg-[#151e32]/90 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)]">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-500" />
                        <input
                            type="text"
                            placeholder="Search items or heroes..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all placeholder:text-slate-400 text-slate-900 dark:text-white font-medium"
                        />
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    <label className="flex items-center gap-2 px-4 py-2.5 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-green-500/20 cursor-pointer">
                        {uploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
                        <span>Upload <span className="hidden sm:inline">Excel</span></span>
                        <input
                            type="file"
                            accept=".xlsx"
                            className="hidden"
                            onChange={handleFileUpload}
                            disabled={uploading}
                        />
                    </label>

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-700 rounded-xl text-sm font-bold transition-all shadow-md shadow-orange-500/20 disabled:opacity-50"
                    >
                        {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        <span>Save <span className="hidden sm:inline">Changes</span></span>
                    </button>

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2.5 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-500 hover:bg-red-100 dark:hover:bg-red-500/20 active:bg-red-200 dark:active:bg-red-500/30 rounded-xl text-sm font-bold transition-colors ml-auto sm:ml-0"
                    >
                        <LogOut className="w-4 h-4" />
                        <span className="hidden sm:inline">Logout</span>
                    </button>
                </div>
            </div>

            {/* Grid view replacing plain table to match main UI */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-[#151e32] border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm h-64">
                    <RefreshCw className="w-8 h-8 animate-spin text-orange-500 mb-4 opacity-80" />
                    <span className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-sm">Loading Database...</span>
                </div>
            ) : filteredItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-[#151e32] border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm h-64">
                    <Package className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-4" />
                    <span className="text-slate-500 dark:text-slate-400 font-bold text-sm">No items found matching your search.</span>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredItems.map((item, idx) => (
                        <div key={`${item.name}-${idx}`} className="bg-white dark:bg-[#151e32] p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm flex flex-col gap-4 relative overflow-hidden group">
                            <div className="flex items-start gap-4">
                                {/* Image Preview matching main UI style */}
                                <div className="w-20 h-20 shrink-0 bg-slate-100 dark:bg-[#0B1120] rounded-xl overflow-hidden shadow-inner flex items-center justify-center p-2 border border-slate-200 dark:border-white/5 relative">
                                    <LiquipediaImage itemName={item.name} className="w-full h-full drop-shadow-lg" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-black text-slate-900 dark:text-white truncate" title={item.name}>{item.name}</h3>
                                    <div className="text-[10px] uppercase font-bold text-orange-500 mt-1 mb-2 tracking-wider truncate">{item.hero || "Unknown Hero"}</div>
                                </div>
                            </div>

                            {/* EDIT CONTROLS */}
                            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-white/5">
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">Stock Qty</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min="0"
                                            value={item.qty}
                                            onChange={(e) => handleUpdateItem(idx, "qty", parseInt(e.target.value) || 0)}
                                            className="w-full bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-slate-900 dark:text-white font-black text-sm transition-all text-center"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">Price (IDR)</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min="0"
                                            value={item.price}
                                            onChange={(e) => handleUpdateItem(idx, "price", parseInt(e.target.value) || 0)}
                                            className="w-full bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-lg pl-8 pr-3 py-2 text-right focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-slate-900 dark:text-white font-black text-sm transition-all"
                                        />
                                        <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 dark:text-slate-500 pointer-events-none">Rp</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {/* No more floating bottom bar! */}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </div>
    );
}
