import Link from 'next/link';
import { ArrowRight, GraduationCap, Target, MapPin, Users } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary-600">EAMCET Career</h1>
          <nav className="space-x-4">
            <Link href="/onboarding" className="text-gray-600 hover:text-primary-600">
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-5xl font-bold text-gray-900 mb-6">
          Find Your Perfect Career Path
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          AI-powered career counseling platform that helps students discover their potential,
          find the right college, and build a successful career.
        </p>
        <Link
          href="/onboarding"
          className="inline-flex items-center px-8 py-4 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition"
        >
          Start Your Journey <ArrowRight className="ml-2" />
        </Link>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-4 gap-8">
          <FeatureCard
            icon={<GraduationCap className="w-8 h-8" />}
            title="College Finder"
            description="Find best colleges based on your rank and preferences"
          />
          <FeatureCard
            icon={<Target className="w-8 h-8" />}
            title="Career Assessment"
            description="Take our behavioral assessment to discover your strengths"
          />
          <FeatureCard
            icon={<MapPin className="w-8 h-8" />}
            title="Personalized Roadmaps"
            description="Get customized career roadmaps tailored to you"
          />
          <FeatureCard
            icon={<Users className="w-8 h-8" />}
            title="Seat Prediction"
            description="Predict your chances of getting into each college"
          />
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="bg-primary-600 rounded-2xl p-12 text-white">
          <h3 className="text-3xl font-bold mb-4">Ready to Find Your Dream Career?</h3>
          <p className="text-lg mb-8 opacity-90">
            Join thousands of students who have discovered their perfect path
          </p>
          <Link
            href="/onboarding"
            className="inline-flex items-center px-8 py-4 bg-white text-primary-600 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Get Started Now <ArrowRight className="ml-2" />
          </Link>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition">
      <div className="text-primary-600 mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
