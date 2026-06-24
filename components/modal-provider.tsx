"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { AlertCircle, HelpCircle, X } from "lucide-react";

type ModalType = "alert" | "confirm" | null;

interface ModalState {
  type: ModalType;
  message: string;
  resolvePromise: ((value: boolean | void) => void) | null;
}

interface ModalContextType {
  showAlert: (message: string) => Promise<void>;
  showConfirm: (message: string) => Promise<boolean>;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal debe ser usado dentro de un ModalProvider");
  }
  return context;
}

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modal, setModal] = useState<ModalState>({
    type: null,
    message: "",
    resolvePromise: null,
  });

  const showAlert = (message: string): Promise<void> => {
    return new Promise((resolve) => {
      setModal({ type: "alert", message, resolvePromise: resolve as any });
    });
  };

  const showConfirm = (message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setModal({ type: "confirm", message, resolvePromise: resolve as any });
    });
  };

  const handleClose = (result: boolean = false) => {
    if (modal.resolvePromise) {
      if (modal.type === "alert") {
        (modal.resolvePromise as (value: void) => void)();
      } else {
        (modal.resolvePromise as (value: boolean) => void)(result);
      }
    }
    setModal({ type: null, message: "", resolvePromise: null });
  };

  return (
    <ModalContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      {modal.type && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => handleClose(false)}
          />
          <div className="relative z-10 w-full max-w-md bg-[#111827] border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex justify-center mb-4">
                {modal.type === "alert" ? (
                  <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 mb-2">
                    <AlertCircle size={32} />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500 mb-2">
                    <HelpCircle size={32} />
                  </div>
                )}
              </div>

              <h3 className="text-xl font-bold text-center text-white mb-2">
                {modal.type === "alert" ? "Atención" : "Confirmar Acción"}
              </h3>
              <p className="text-zinc-400 text-center">{modal.message}</p>
            </div>

            <div className="bg-[#0F172A] border-t border-zinc-800 p-4 flex gap-3">
              {modal.type === "confirm" && (
                <button
                  onClick={() => handleClose(false)}
                  className="flex-1 px-4 py-3 bg-[#1E293B] hover:bg-zinc-800 text-white font-semibold rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
              )}
              <button
                onClick={() => handleClose(true)}
                className={`flex-1 px-4 py-3 font-semibold rounded-xl transition cursor-pointer text-white ${
                  modal.type === "alert"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {modal.type === "alert" ? "Entendido" : "Confirmar"}
              </button>
            </div>
            
            {/* Botón de cierre superior derecho */}
            <button
              onClick={() => handleClose(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white transition cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
}
