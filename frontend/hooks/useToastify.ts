"use client";

import { toast, ToastOptions } from "react-toastify";

type ToastPayload = string | { message: string; options?: ToastOptions };

export function useToastify() {
  const success = (payload: ToastPayload) => {
    if (typeof payload === "string") return toast.success(payload);
    return toast.success(payload.message, payload.options);
  };

  const error = (payload: ToastPayload) => {
    if (typeof payload === "string") return toast.error(payload);
    return toast.error(payload.message, payload.options);
  };

  const info = (payload: ToastPayload) => {
    if (typeof payload === "string") return toast.info(payload);
    return toast.info(payload.message, payload.options);
  };

  const warn = (payload: ToastPayload) => {
    if (typeof payload === "string") return toast.warn(payload);
    return toast.warn(payload.message, payload.options);
  };

  return { success, error, info, warn };
}
