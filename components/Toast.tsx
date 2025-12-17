"use client"

import { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, XCircle, AlertCircle, X } from "lucide-react"

export type ToastType = "success" | "error" | "info"

export interface ToastMessage {
    id: string
    message: string
    type: ToastType
}

interface ToastProps {
    toasts: ToastMessage[]
    removeToast: (id: string) => void
}

export const ToastContainer = ({ toasts, removeToast }: ToastProps) => {
    return (
        <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
            <AnimatePresence>
                {toasts.map((toast) => (
                    <ToastItem key={toast.id} toast={toast} removeToast={removeToast} />
                ))}
            </AnimatePresence>
        </div>
    )
}

const ToastItem = ({ toast, removeToast }: { toast: ToastMessage; removeToast: (id: string) => void }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            removeToast(toast.id)
        }, 1000)

        return () => clearTimeout(timer)
    }, [toast.id, removeToast])

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className="pointer-events-auto min-w-[300px] max-w-sm bg-white dark:bg-[#1a1425] border border-slate-200 dark:border-white/10 shadow-xl rounded-xl p-4 flex items-start gap-3 backdrop-blur-md"
        >
            <div className="flex-shrink-0 mt-0.5">
                {toast.type === "success" && <CheckCircle className="text-green-500 w-5 h-5" />}
                {toast.type === "error" && <XCircle className="text-red-500 w-5 h-5" />}
                {toast.type === "info" && <AlertCircle className="text-blue-500 w-5 h-5" />}
            </div>

            <div className="flex-1 mr-2">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                    {toast.type === "success" ? "Success" : toast.type === "error" ? "Error" : "Info"}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium leading-relaxed">
                    {toast.message}
                </p>
            </div>

            <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
                <X size={16} />
            </button>
        </motion.div>
    )
}
