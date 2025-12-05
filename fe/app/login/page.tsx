"use client"
import { useState } from 'react';
import { 
  UserCircle, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff,
  Shield,
  Star,
  LogIn,
  CheckCircle2,
  Globe,
  Award,
  TrendingUp
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Navigation from "../../components/Navigation";
import Footer from "../../components/Footer";
import { login } from '../../services/loginService';
import BranchesCombobox from '@/components/login/BranchesCombobox';

interface FormData {
  email: string;
  password: string;
  branchId: string;
}

const trustIndicators = [
  { icon: Shield, text: "Secure Data", desc: "Enterprise inventory security" },
  { icon: Globe, text: "Multi-Location", desc: "Manage all branches" },
  { icon: Award, text: "AI-Powered", desc: "Smart forecasting & purchasing" },
  { icon: TrendingUp, text: "Proven Results", desc: "30% cost reduction" }
];

const benefits = [
  "Access AI-powered inventory forecasting",
  "Automate purchasing decisions",
  "Track stock levels across branches",
  "Optimize supplier relationships",
  "Reduce waste and overstock"
];

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    branchId: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    // Basic validation
    const newErrors: Partial<FormData> = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    }

    if (!formData.branchId.trim()) {
      newErrors.branchId = 'Branch is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      // Call login service
      const result = await login(formData.email, formData.password, formData.branchId);

      if (result.success) {
        // Show success toast
        toast.success('Welcome back! Login successful.', {
          duration: 3000,
          style: {
            fontWeight: '600',
          },
        });

        // Redirect to dashboard
        setTimeout(() => {
          router.push('/dashboard/items');
        }, 1000);
      } else {
        // Show error toast
        toast.error(result.error || "Something went wrong. Please try again later.", {
          duration: 4000,
          style: {
            fontWeight: '600',
          },
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Something went wrong. Please try again later.', {
        duration: 4000,
        style: {
          fontWeight: '600',
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-br from-sarana-primary-50 via-white to-blue-50">
      <Navigation />
      <div className="w-full pt-16"></div>

      {/* Login Section */}
      <section className="flex-1 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid items-center">
            

            {/* Right Column - Login Form */}
            <div className="flex justify-center items-center">
              <div className="w-full max-w-md">
                <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 lg:p-10">
                  {/* Form Header */}
                  <div className="text-center mb-8">
                    <div className="mx-auto w-16 h-16 bg-sarana-primary rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                      <LogIn className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Inventory Management</h2>
                    <p className="text-gray-600">Smart Purchasing & Stock Forecasting</p>
                  </div>

                  {/* Login Form */}
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Email Field */}
                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          id="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className={`block w-full pl-10 pr-4 py-3.5 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
                            errors.email 
                              ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                              : 'border-gray-300 focus:border-sarana-primary focus:ring-sarana-primary/20 hover:border-sarana-primary/50'
                          }`}
                          placeholder="Enter your email"
                        />
                      </div>
                      {errors.email && <p className="mt-2 text-sm text-red-600">
                        {errors.email}
                      </p>}
                    </div>

                    {/* Password Field */}
                    <div>
                      <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type={showPassword ? "text" : "password"}
                          id="password"
                          value={formData.password}
                          onChange={(e) => handleInputChange('password', e.target.value)}
                          className={`block w-full pl-10 pr-12 py-3.5 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
                            errors.password 
                              ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                              : 'border-gray-300 focus:border-sarana-primary focus:ring-sarana-primary/20 hover:border-sarana-primary/50'
                          }`}
                          placeholder="Enter your password"
                        />
                        <button
                          type="button"
                          className="cursor-pointer absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600 transition-colors"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5 text-gray-400" />
                          ) : (
                            <Eye className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                      {errors.password && <p className="mt-2 text-sm text-red-600">
                        {errors.password}
                      </p>}
                    </div>

                    {/* Branches combobox */}
                    <BranchesCombobox
                      value={formData.branchId}
                      onChange={(value) => handleInputChange('branchId', value)}
                      onBranchSelect={(branch) => handleInputChange('branchId', branch?.id || '')}
                    />

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-lg shadow-lg text-base font-semibold text-white transition-all duration-300 transform ${
                        isLoading 
                          ? 'bg-gray-400 cursor-not-allowed scale-95' 
                          : 'cursor-pointer bg-sarana-primary hover:bg-sarana-primary-dark focus:outline-none focus:ring-4 focus:ring-sarana-primary/20 hover:scale-105 hover:shadow-xl'
                      }`}
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Signing in...
                        </>
                      ) : (
                        <>
                          <LogIn className="w-5 h-5 mr-2" />
                          Sign In
                        </>
                      )}
                    </button>
                  </form>


                  {/* Security Badge */}
                  <div className="mt-6 flex items-center justify-center space-x-2 text-xs text-gray-500">
                    <Shield className="w-4 h-4" />
                    <span>Your login is protected.</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
} 