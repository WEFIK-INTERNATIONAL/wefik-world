"use client";

import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-[var(--surface)] group-[.toaster]:text-ink group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:rounded-[14px]",
          description: "group-[.toast]:text-slate",
          actionButton:
            "group-[.toast]:bg-ink group-[.toast]:text-white group-[.toast]:rounded-[10px]",
          cancelButton:
            "group-[.toast]:bg-surface group-[.toast]:text-slate group-[.toast]:rounded-[10px]",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
