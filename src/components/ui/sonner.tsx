"use client"

import {
  CheckIcon,
  InfoIcon,
  Loader2Icon,
  XIcon,
  AlertTriangleIcon,
} from "lucide-react"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      position="top-right"
      richColors={false}
      icons={{
        success: <CheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <AlertTriangleIcon className="size-4" />,
        error: <XIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      toastOptions={{
        style: {
          background: "#ffffff",
          border: "1px solid #e5e5e5",
          color: "#000000",
          borderRadius: "8px",
          fontSize: "14px",
          fontWeight: "500",
        },
        className: "border border-gray-200 bg-white text-black shadow-lg",
        descriptionClassName: "text-gray-600",
        actionButtonStyle: {
          background: "#000000",
          color: "#ffffff",
          border: "none",
          borderRadius: "6px",
          padding: "6px 12px",
          fontSize: "12px",
          fontWeight: "600",
        },
        cancelButtonStyle: {
          background: "#f5f5f5",
          color: "#000000",
          border: "1px solid #e5e5e5",
          borderRadius: "6px",
          padding: "6px 12px",
          fontSize: "12px",
          fontWeight: "500",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
