import React from 'react';
import PettyCashForm from './components/PettyCashForm';
import Header from './components/Header';
import Footer from './components/Footer';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-gray-900 text-slate-800 dark:text-slate-200 transition-colors duration-500 print:bg-white">
      <Header />
      <main className="container mx-auto px-4 py-8 print:p-0 print:shadow-none">
        <PettyCashForm />
      </main>
      <Footer />
    </div>
  );
};

export default App;
