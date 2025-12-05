import React from 'react';
import { Instagram, Mail, Linkedin, Shield, FileText } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-sarana-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Company Info */}
            <div className="text-center md:text-left">
              <h3 className="text-lg font-semibold text-white mb-4">Sarana</h3>
              <p className="text-sm text-white/80">
                Empowering businesses with AI-driven solutions
              </p>
            </div>


            {/* Social Media Section */}
            <div className="text-center md:text-right">
              <h3 className="text-lg font-semibold text-white mb-4">Connect With Us</h3>
              <div className="flex flex-col sm:flex-row justify-center md:justify-end space-y-2 sm:space-y-0 sm:space-x-6">
                <a 
                  href="https://instagram.com/sarana.labs" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-white hover:text-sarana-primary-100 transition-colors duration-200 flex items-center justify-center gap-1"
                >
                  <Instagram className="w-5 h-5" />
                  Instagram
                </a>
                <a 
                  href="https://www.linkedin.com/company/sarana-ai" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-white hover:text-sarana-primary-100 transition-colors duration-200 flex items-center justify-center gap-1"
                >
                  <Linkedin className="w-5 h-5" />
                  LinkedIn
                </a>
                <a 
                  href="mailto:tech@sarana.ai" 
                  className="text-white hover:text-sarana-primary-100 transition-colors duration-200 flex items-center justify-center gap-1"
                >
                  <Mail className="w-5 h-5" />
                  Contact
                </a>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-12 pt-8 border-t border-white/10">
            <p className="text-sm text-white/80 text-center">
              © {new Date().getFullYear()} Sarana Omni by PT Sarana Digital Bangsa. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
} 