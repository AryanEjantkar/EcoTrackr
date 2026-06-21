"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { api } from "@/utils/api";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  
  const isAuthPage = pathname === "/login" || pathname === "/register";

  useEffect(() => {
    setMounted(true);
    
    // Quick route check
    const checkAuth = async () => {
      const authStatus = api.isAuthenticated();
      if (!authStatus && !isAuthPage) {
        router.push("/login");
      }
    };
    checkAuth();
  }, [pathname, isAuthPage, router]);

  // Avoid hydrations mismatch on first server-render
  if (!mounted) {
    return (
      <main className="flex-1 min-h-screen w-full flex flex-col">
        {children}
      </main>
    );
  }

  if (isAuthPage) {
    return (
      <main className="flex-1 min-h-screen w-full flex flex-col">
        {children}
      </main>
    );
  }

  return (
    <>
      <Sidebar />
      <main className="flex-1 md:pl-64 pb-20 md:pb-0 min-h-screen w-full flex flex-col">
        {children}
      </main>
    </>
  );
}
