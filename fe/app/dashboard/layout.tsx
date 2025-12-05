"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleSidebarChange = () => {
      const isExpanded =
        document.documentElement.getAttribute("data-sidebar-expanded") ===
        "true";
      setSidebarExpanded(isExpanded);
    };

    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("sidebarStateChange", handleSidebarChange);
    window.addEventListener("resize", handleResize);
    handleSidebarChange();

    return () => {
      document.removeEventListener("sidebarStateChange", handleSidebarChange);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="relative flex bg-gradient-to-b from-gray-50 to-gray-100 transition-all duration-200">
      {/* Backdrop for mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-gray-800/60 z-20 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-screen z-30 transform lg:transform-none lg:opacity-100 ${
          isMobileMenuOpen
            ? "translate-x-0 opacity-100"
            : "-translate-x-full opacity-0 lg:translate-x-0"
        } transition-all duration-300 ease-in-out`}
      >
        <Sidebar
          onClose={() => setIsMobileMenuOpen(false)}
          isMobileMenuOpen={isMobileMenuOpen}
        />
      </div>

      {/* Main content */}
      <main
        className={`flex-1 min-h-screen ease-in-out bg-gradient-to-b from-gray-50 to-gray-100 transition-all duration-200 ${
          sidebarExpanded ? "lg:ml-64" : "lg:ml-20"
        } ml-0 w-full max-w-full overflow-x-hidden`}
      >
        <Header onMobileMenuOpen={() => setIsMobileMenuOpen(true)} />
        <div className="p-4 lg:p-6 w-full max-w-full">{children}</div>
      </main>
    </div>
  );
}
