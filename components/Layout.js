import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Home, FileText, Database, List, BarChart2, Settings } from 'lucide-react';
import Header from './header';

export default function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const menuItems = [
    { name: 'Contact Enrichment', href: '/', icon: Home },
    { name: 'Bulk Processing', href: '/bulk', icon: FileText },
    { name: 'Processed Data', href: '/processed', icon: Database },
    { name: 'My Lists', href: '/lists', icon: List },
    
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className={`bg-[#ACA2CD] w-64 min-h-screen flex flex-col transition-all duration-300 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 md:static absolute inset-y-0 left-0 z-20`}>
        <div className="p-4 text-white text-2xl font-bold">Data Forge</div>
        <nav className="flex-1 px-2 py-4 space-y-2">
          {menuItems.map((item) => (
            <Link key={item.name} href={item.href}>
              <div className="flex items-center px-4 py-2 text-white hover:bg-[#415285] rounded-lg cursor-pointer">
                <item.icon className="mr-3 h-5 w-5" />
                <span>{item.name}</span>
              </div>
            </Link>
          ))}
        </nav>
        <Link href="/setting">
          <div className="flex items-center px-4 py-2 text-white hover:bg-[#415285] rounded-lg cursor-pointer mt-auto mb-4">
            <Settings 
            className="mr-3 h-5 w-5" />
            <span>Setting</span>
          </div>
        </Link>
        <Link href="/dashboard">
          <div className="flex items-center px-4 py-2 text-white hover:bg-[#415285] rounded-lg cursor-pointer mt-auto mb-4">
            <BarChart2 className="mr-3 h-5 w-5" />
            <span>Dashboard</span>
          </div>
        </Link>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
      <Header/>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="container mx-auto px-6 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}