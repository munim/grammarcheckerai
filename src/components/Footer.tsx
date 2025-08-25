'use client';

import Link from 'next/link';
import ThemeSwitcher from '@/components/ThemeSwitcher';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex justify-center md:justify-start">
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              &copy; {new Date().getFullYear()} Abdul Munim. All rights reserved.
            </p>
          </div>
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:space-x-6 md:mt-0 md:justify-end">
            <div className="flex justify-center mb-2 sm:mb-0">
              <ThemeSwitcher />
            </div>
            <div className="flex justify-center md:justify-end">
              <Link 
                href="/about" 
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                About OpenRouter & LLM
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-4 text-center md:text-right">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            This tool uses OpenRouter API and Large Language Models for grammar correction.
          </p>
        </div>
      </div>
    </footer>
  );
}