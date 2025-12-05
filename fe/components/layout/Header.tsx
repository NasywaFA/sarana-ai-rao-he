import { getUserInfo } from "@/helpers/auth";
import { UserType } from "@/types/UserType";
import { CircleUserRoundIcon } from "lucide-react";
import { useEffect, useState } from "react";

interface HeaderProps {
  onMobileMenuOpen: () => void;
}

export default function Header({ onMobileMenuOpen }: HeaderProps) {
  const [user, setUser] = useState<UserType | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await getUserInfo();
      setUser(userData);
    };
    fetchUser();
  }, []);

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="flex items-center h-[65px] px-4">
        {/* Mobile Menu Button - Only visible on mobile */}
        <div className="lg:hidden">
          <button
            className="rounded-md p-2 hover:bg-gray-100"
            onClick={onMobileMenuOpen}
          >
            <svg
              className="h-6 w-6 text-gray-600"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Spacer to push user info to the right */}
        <div className="flex-1"></div>

        {/* User Info - Always on the right */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:block text-right">
            <p className="font-medium text-gray-900 truncate max-w-[120px]">
              {user?.name || "User"}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              {user?.role?.toLowerCase() || "Role"}
            </p>
          </div>
          <div className="relative">
            <CircleUserRoundIcon className="h-8 w-8 text-gray-600" />
            {user && (
              <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
