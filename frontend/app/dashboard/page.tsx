'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, ClipboardList, Map, GraduationCap, Route, ArrowRight } from 'lucide-react';

export default function Dashboard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const userId = searchParams.get('userId');

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please complete onboarding first</p>
          <Link href="/onboarding" className="text-primary-600 hover:underline">
            Start here
          </Link>
        </div>
      </div>
    );
  }

  const menuItems = [
    {
      icon: <ClipboardList className="w-8 h-8" />,
      title: 'Assessment',
      description: 'Take behavioral assessment',
      href: `/assessment?userId=${userId}`,
      color: 'bg-blue-500'
    },
    {
      icon: <User className="w-8 h-8" />,
      title: 'Analysis',
      description: 'View your personality analysis',
      href: `/analysis?userId=${userId}`,
      color: 'bg-purple-500'
    },
    {
      icon: <Route className="w-8 h-8" />,
      title: 'Roadmap',
      description: 'Career roadmap',
      href: `/roadmap?userId=${userId}`,
      color: 'bg-green-500'
    },
    {
      icon: <GraduationCap className="w-8 h-8" />,
      title: 'Colleges',
      description: 'Find colleges',
      href: `/colleges?userId=${userId}`,
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Welcome to Your Dashboard
        </h1>

        <div className="grid md:grid-cols-2 gap-6">
          {menuItems.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition group"
            >
              <div className={`${item.color} w-14 h-14 rounded-lg flex items-center justify-center text-white mb-4`}>
                {item.icon}
              </div>
              <h3 className="text-xl font-semibold mb-1 flex items-center">
                {item.title}
                <ArrowRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition" />
              </h3>
              <p className="text-gray-600">{item.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
