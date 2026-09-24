"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Footer } from "@/components/layout/Footer";

export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const isLogin = pathname === "/admin/login";

  if (isAdmin) {
    return (
      <div className="min-h-full">
        {!isLogin && <AdminHeader />}
        <div className={isLogin ? "min-h-screen" : "min-h-[calc(100vh-4.25rem)]"}>{children}</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col">
      <PublicHeader />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}
