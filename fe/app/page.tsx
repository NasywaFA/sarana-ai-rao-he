"use client"
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { Clock, MessageSquare, Users, Code, BarChart, Brain, Shield, Rocket, Smile } from 'lucide-react';
import { ReactNode, useEffect } from 'react';
import { TypeAnimation } from 'react-type-animation';
import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    // Redirect to login if not authenticated
    router.push('/login');
  }, []);
  return (
    <main className="min-h-screen flex flex-col items-center bg-white">
      <Navigation />
      <div className="w-full pt-12"></div>
      {/* Hero Section */}
      <section className="w-full pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-sarana-primary-50">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-sarana-primary mb-6">
            Revolutionize Your Customer Support with AI-Powered Omnichannel
          </h1>
          <div className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto min-h-[4rem]">
            <TypeAnimation
              sequence={[
                'Deliver faster, smarter, and seamless customer service across channels using our intelligent natural language agent.',
                1000,
                'Get better insights from customer interactions with our advanced analytics.',
                1000,
                'Integrate with Meta CAPI for enhanced marketing capabilities.',
                1000,
              ]}
              wrapper="p"
              speed={50}
              cursor={true}
              repeat={1}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="mailto:tech@sarana.ai" className="border border-sarana-primary text-sarana-primary px-8 py-3 rounded-lg font-semibold hover:bg-sarana-primary/5 transition-colors">
              Request a Demo
            </a>
            <a href="#contact" className="bg-sarana-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-sarana-primary/90 transition-colors">
              Get Started
            </a>
          </div>
          <div className="mt-20 flex items-center justify-center gap-2">
            <div className="text-gray-500">Trusted by </div>
            <div className="flex gap-2">
              <Image src="/images/clients/bumame.png" alt="Bumame" width={32} height={32} className="h-8 opacity-50" />
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="w-full py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-sarana-primary-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-sarana-primary mb-6">Key Features & Benefits</h2>
            <p className="text-lg text-gray-600">
              Discover how our AI-powered platform transforms customer support with intelligent automation and seamless integration.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Clock className="w-10 h-10 text-sarana-primary" />}
              title="24/7 Instant Support"
              description="Always-on AI agent handling common customer questions instantly."
            />
            <FeatureCard
              icon={<MessageSquare className="w-10 h-10 text-sarana-primary" />}
              title="Seamless Multichannel Integration"
              description="Connect WhatsApp, live chat, email, and more in one unified platform."
            />
            <FeatureCard
              icon={<Users className="w-10 h-10 text-sarana-primary" />}
              title="Human Handoff"
              description="When needed, smoothly transfer conversations to human agents."
            />
            <FeatureCard
              icon={<Code className="w-10 h-10 text-sarana-primary" />}
              title="Easy Setup & API Access"
              description="Integrate and deploy quickly using our robust WhatsApp API."
            />
            <FeatureCard
              icon={<BarChart className="w-10 h-10 text-sarana-primary" />}
              title="Analytics & Insights"
              description="Track customer interactions and team performance to optimize service."
            />
            <FeatureCard
              icon={<Smile className="w-10 h-10 text-sarana-primary" />}
              title="Increased Customer Satisfaction"
              description="Improve customer satisfaction by providing instant and accurate support."
            />

          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="w-full py-16 px-4 sm:px-6 lg:px-8 bg-sarana-primary-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-sarana-primary text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">
              <StepCard
                number="1"
                title="Customer Messages"
                description="Customer messages your business on WhatsApp."
              />
              <StepCard
                number="2"
                title="AI Understanding"
                description="Our natural language agent understands and responds instantly."
              />
              <StepCard
                number="3"
                title="Unified Conversations"
                description="Conversations are unified across channels for consistent service."
              />
              <StepCard
                number="4"
                title="Smart Escalation"
                description="Complex queries escalate to live agents when necessary."
              />
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="w-full py-16 px-4 sm:px-6 lg:px-8 bg-sarana-primary-100">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-sarana-primary text-center mb-12">Services We Offer</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <ServiceCard
              icon={<Brain className="w-8 h-8 text-sarana-primary" />}
              title="AI Customer Support"
              description="Intelligent AI-powered customer support system that handles customer inquiries 24/7"
              benefits={[
                "24/7 instant response to customer queries",
                "Reduced response time and improved customer satisfaction",
                "Handles multiple conversations simultaneously",
                "Consistent and accurate responses"
              ]}
            />
            <ServiceCard
              icon={<Shield className="w-8 h-8 text-sarana-primary" />}
              title="Natural Language Data Extraction"
              description="Advanced AI technology to extract and process information from customer conversations"
              benefits={[
                "Automated data extraction from conversations",
                "Improved data accuracy and consistency",
                "Time-saving manual data entry",
                "Better insights from customer interactions"
              ]}
            />
            <ServiceCard
              icon={<Rocket className="w-8 h-8 text-sarana-primary" />}
              title="Meta CAPI Integration"
              description="Seamless integration with Meta's Conversion API for enhanced marketing capabilities"
              benefits={[
                "Improved ad targeting and optimization",
                "Better tracking of customer interactions",
                "Enhanced marketing campaign performance",
                "Seamless data synchronization"
              ]}
            />
            <ServiceCard
              icon={<MessageSquare className="w-8 h-8 text-sarana-primary" />}
              title="WhatsApp Business API"
              description="Official WhatsApp Business API integration for enterprise-level communication"
              benefits={[
                "Official WhatsApp Business API access",
                "Bulk messaging capabilities",
                "Advanced analytics and reporting",
                "Secure and reliable communication"
              ]}
            />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="w-full py-16 px-4 sm:px-6 lg:px-8 bg-sarana-primary-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-sarana-primary text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <FAQItem
              question="How does Sarana Omni's AI customer support work?"
              answer="Our AI-powered system uses advanced natural language processing to understand customer queries and provide accurate responses instantly. It can handle multiple conversations simultaneously and seamlessly transfer to human agents when needed."
            />
            <FAQItem
              question="What channels does Sarana Omni support?"
              answer="We support multiple channels including WhatsApp, live chat, email, and more. All conversations are unified in a single dashboard for consistent service across platforms."
            />
            <FAQItem
              question="How long does it take to set up?"
              answer="Setup typically takes 1-2 weeks, including integration with your existing systems and training the AI on your specific use cases. Our team provides full support throughout the process."
            />
            <FAQItem
              question="Is it suitable for small businesses?"
              answer="Yes! Sarana Omni is scalable and suitable for businesses of all sizes. We offer flexible pricing plans that grow with your business needs."
            />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="w-full py-16 px-4 sm:px-6 lg:px-8 bg-sarana-primary-100">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-sarana-primary mb-6">About Us</h2>
          <p className="text-lg text-gray-600">
            Sarana Omni is a platform that uses AI to help businesses improve their customer support and sales. 
            We are a team of experienced developers and AI experts who are passionate about using technology 
            to help businesses grow.
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}

// Component for Feature Cards
interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="group p-8 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-sarana-primary/20 hover:-translate-y-1">
      <div className="mb-6 p-3 bg-sarana-primary/5 rounded-xl w-fit group-hover:bg-sarana-primary/10 transition-colors">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-sarana-primary mb-3 group-hover:text-sarana-primary/90 transition-colors">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}

// Component for Step Cards
interface StepCardProps {
  number: string;
  title: string;
  description: string;
}

function StepCard({ number, title, description }: StepCardProps) {
  return (
    <div className="flex gap-6 items-start bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 group">
      <div className="flex-shrink-0 w-10 h-10 bg-sarana-primary text-white rounded-full flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform duration-300">
        {number}
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-sarana-primary group-hover:text-sarana-primary/80 transition-colors">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

// Component for Service Cards
interface ServiceCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  benefits: string[];
}

function ServiceCard({ icon, title, description, benefits }: ServiceCardProps) {
  return (
    <div className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow text-center border border-gray-100">
      <div className="mb-4 flex justify-center">{icon}</div>
      <h3 className="text-xl font-semibold text-sarana-primary mb-3">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <ul className="text-left space-y-2">
        {benefits.map((benefit, index) => (
          <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
            <span className="text-sarana-primary">•</span>
            {benefit}
          </li>
        ))}
      </ul>
    </div>
  );
}

// Add TestimonialCard component at the bottom of the file
interface TestimonialCardProps {
  quote: string;
  author: string;
  role: string;
  company: string;
}

function TestimonialCard({ quote, author, role, company }: TestimonialCardProps) {
  return (
    <div className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
      <div className="mb-4">
        <svg className="w-8 h-8 text-sarana-primary" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
        </svg>
      </div>
      <p className="text-gray-600 mb-4">{quote}</p>
      <div>
        <p className="font-semibold text-sarana-primary">{author}</p>
        <p className="text-sm text-gray-500">{role}, {company}</p>
      </div>
    </div>
  );
}

// Add FAQItem component at the bottom of the file
interface FAQItemProps {
  question: string;
  answer: string;
}

function FAQItem({ question, answer }: FAQItemProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="border border-gray-200 rounded-lg">
      <button
        className="w-full px-6 py-4 text-left flex justify-between items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-semibold text-sarana-primary">{question}</span>
        <svg
          className={`w-5 h-5 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="px-6 pb-4">
          <p className="text-gray-600">{answer}</p>
        </div>
      )}
    </div>
  );
}
