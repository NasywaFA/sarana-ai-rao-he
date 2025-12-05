'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function Navigation() {
  return (
    <header className="w-full py-4 px-4 sm:px-6 lg:px-8 fixed top-0 bg-white backdrop-blur-sm z-10 shadow-sm">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2">
          <Image
            src="/images/logo-text.png"
            alt="Sarana Omni Logo"
            width={150}
            height={50}
          />
        </Link>
        <div className="flex items-center space-x-6">
          <nav className="hidden md:flex space-x-6">
          </nav>
        </div>
      </div>
    </header>
  );
} 