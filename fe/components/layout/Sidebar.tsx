"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LogOutIcon,
  TicketPercentIcon,
  PanelLeftOpenIcon,
  PanelLeftCloseIcon,
  ImageIcon,
  HelpCircleIcon,
  ALargeSmallIcon,
  MailQuestionIcon,
  XIcon,
  Bot,
  Package,
  ShoppingBasket,
  TrendingUp,
  ChartBar,
  Users,
  Building
} from "lucide-react";
import { logout } from '../../services/loginService';
import { getBranchData } from "@/helpers/misc";
import BranchesCombobox from "@/components/login/BranchesCombobox";
import { changeBranch } from "@/services/branchesService";

const sidebarStateEvent = new Event("sidebarStateChange");

interface SidebarProps {
  onClose?: () => void;
  isMobileMenuOpen?: boolean;
}

interface SidebarMenuItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface SidebarConfig {
  role: string;
  menus: SidebarMenuItem[];
}

export default function Sidebar({ onClose, isMobileMenuOpen }: SidebarProps) {
  const [branchName, setBranchName] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [config, setConfig] = useState<SidebarConfig | null>(null);
  const [branchId, setBranchId] = useState<string | null>(null);

  useEffect(() => {
    const fetchBranchName = async () => {
      const branch = await getBranchData();
      if (branch) {
        setBranchName(branch.name);
        setBranchId(branch.id);
      }
    };
    fetchBranchName();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      // DUMMY DATA
      const data = {
        role: "admin",
      };

      if (data) {
        const menus: SidebarMenuItem[] = [
          {
            name: "Branches",
            href: "/dashboard/branches",
            icon: Building,
          },
          {
            name: "Inventory",
            href: "/dashboard/items",
            icon: Package,
          },
          {
            name: "Recipes",
            href: "/dashboard/recipes",
            icon: ShoppingBasket,
          },
          {
            name: "Sales",
            href: "/dashboard/sales",
            icon: TrendingUp,
          },
          {
            name: "Suppliers",
            href: "/dashboard/suppliers",
            icon: Users,
          },
          // Forecast
          {
            name: "Menu Forecast",
            href: "/dashboard/forecast",
            icon: ChartBar,
          },
        ];

        const roleConfig: SidebarConfig = {
          role: data.role,
          menus: menus,
        };

        setConfig(roleConfig);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      setExpanded(true);
    }
  }, [isMobileMenuOpen]);

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-sidebar-expanded",
      expanded.toString()
    );
    document.dispatchEvent(sidebarStateEvent);
  }, [expanded]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!config) return null;

  return (
    <div
      className={`${expanded ? "w-64" : "w-20"
        } min-h-screen bg-white border-r border-gray-200 transition-all duration-300 ease-in-out flex flex-col justify-between px-4 relative`}
    >
      {/* Close button for mobile */}
      {isMobileMenuOpen && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-md hover:bg-gray-100 lg:hidden"
        >
          <XIcon className="h-5 w-5 text-gray-500" />
        </button>
      )}

      <div>
        <div className={`p-4 flex items-center ${expanded ? "justify-end" : "justify-center"}`}>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 rounded-lg hover:bg-gray-100 hidden lg:block flex-shrink-0"
          >
            {expanded ? (
              <PanelLeftCloseIcon className="h-5 w-5 text-gray-500" />
            ) : (
              <PanelLeftOpenIcon className="h-5 w-5 text-gray-500" />
            )}
          </button>
        </div>

        <div className="flex items-center justify-center mt-10 md:mt-4">
          <div className={`${expanded ? "w-[90%]" : "w-8"} relative h-12`}>
            <Image
              src={expanded ? "/images/logo-text-2.png" : "/images/logo.png"}
              alt="Bumame Logo"
              fill
              className="object-contain mx-auto "
              priority
            />
          </div>
        </div>

        <nav className="mt-4 md:mt-6">
          <div className={`flex items-center px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 ${expanded ? "w-full " : "hidden"}`}>
            <BranchesCombobox
              value={branchId || ""}
              onChange={(newBranchId) => {
                if (!newBranchId || newBranchId === branchId) return;
                changeBranch(newBranchId).then(_ => {
                  window.location.reload();
                });
              }}
              onBranchSelect={() => {}}
              placeholder="Switch branch..."
              className="w-full"
            />
          </div>

          {config.menus.map((item: SidebarMenuItem) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center ${expanded ? "px-4" : "px-3"} py-3 rounded-lg ${expanded || isMobileMenuOpen ? "gap-3" : "justify-center"
                  } ${isActive
                    ? "bg-[#0833AB]/10 text-[#0833AB]"
                    : "text-gray-700 hover:bg-gray-50"
                  }`}
              >
                <item.icon
                  className={`h-5 w-5 ${isActive ? "text-[#0833AB]" : ""
                    }`}
                />
                {(expanded || isMobileMenuOpen) && (
                  <span
                    className={`${isActive ? "text-[#0833AB]" : "text-gray-500"
                      } text-sm`}
                  >
                    {item.name}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mb-8">
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className={`w-full flex items-center px-4 py-3 rounded-lg ${expanded || isMobileMenuOpen ? "gap-3" : "justify-center"
            } text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <LogOutIcon className="h-6 w-6" />
          {(expanded || isMobileMenuOpen) && (
            <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
          )}
        </button>
      </div>
    </div>
  );
}
