import { ReactNode } from "react";
import { ShieldCheck } from "lucide-react";
import Image from "next/image";

export default function AdminLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] text-slate-900 dark:text-white flex flex-col font-sans selection:bg-orange-500/30">
            <header className="border-b border-slate-200 dark:border-white/10 bg-white/70 dark:bg-[#151e32]/70 backdrop-blur-md sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-white p-0.5 rounded-full border border-orange-100 ring-2 ring-orange-500/20 shadow-sm">
                            <Image src="/logo-getrest.jpg" alt="Logo" width={36} height={36} className="rounded-full object-cover" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-black text-sm tracking-tight leading-tight">GetRest Admin</span>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-orange-500" /> Secured Area</span>
                        </div>
                    </div>
                </div>
            </header>
            <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                {children}
            </main>
        </div>
    );
}
