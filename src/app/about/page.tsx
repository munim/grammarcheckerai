'use client';

import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
            About This Tool
          </h1>
          <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">
            Learn about how this grammar correction tool works
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-8">
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Powered by OpenRouter and LLM Technology
            </h2>
            
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              This grammar correction tool leverages the power of Large Language Models (LLMs) 
              through the OpenRouter API to provide intelligent grammar checking and corrections.
            </p>
            
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
              How It Works
            </h3>
            
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              When you submit text for grammar checking, the tool sends your text to OpenRouter's API, 
              which routes it to an appropriate LLM. The LLM analyzes your text for grammatical errors, 
              provides corrections, and explains each error in a structured format.
            </p>
            
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
              What is OpenRouter?
            </h3>
            
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              <a 
                href="https://openrouter.ai" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
              >
                OpenRouter
              </a> is a service that provides unified access to various Large Language Models 
              from different providers. It acts as a gateway that allows developers to access 
              multiple AI models through a single API, making it easier to integrate advanced 
              language processing capabilities into applications.
            </p>
            
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
              Benefits of Using LLMs for Grammar Checking
            </h3>
            
            <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300 mb-4 space-y-2">
              <li>Context-aware corrections that understand the meaning of your text</li>
              <li>Multi-language support for grammar checking in various languages</li>
              <li>Explanations of grammar rules to help you learn</li>
              <li>Identification of subtle errors that traditional tools might miss</li>
              <li>Adaptive learning that improves with usage patterns</li>
            </ul>
            
            <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <h4 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
                Privacy Notice
              </h4>
              <p className="text-blue-700 dark:text-blue-300">
                Your text is sent to OpenRouter's API for processing. We do not store your text on our servers. 
                All data is processed in real-time and discarded after the response is generated.
              </p>
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <Link 
            href="/" 
            className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Back to Grammar Checker
          </Link>
        </div>
      </div>
    </div>
  );
}