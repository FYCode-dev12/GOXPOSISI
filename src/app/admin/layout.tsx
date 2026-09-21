"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AdminHeader } from "@/components/layout/AdminHeader";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/admin/login";
  return <div className="min-h-full">{!isLogin && <AdminHeader />}<main className={isLogin ? "min-h-screen" : "min-h-[calc(100vh-4.25rem)]"}>{children}</main></div>;
}
