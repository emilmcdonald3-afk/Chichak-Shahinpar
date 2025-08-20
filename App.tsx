import React, { useState } from 'react';
import PettyCashForm from './components/PettyCashForm.tsx';
import Header from './components/Header.tsx';
import Footer from './components/Footer.tsx';

const App: React.FC = () => {
  const [selectedCompany, setSelectedCompany] = useState<string>('خدمات حفاری کنور اروند');

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-gray-900 text-slate-800 dark:text-slate-200 transition-colors duration-500 print:bg-white">
      <Header selectedCompany={selectedCompany} onCompanyChange={setSelectedCompany} />
      <main className="container mx-auto px-4 py-8 print:p-0 print:shadow-none">
        <PettyCashForm selectedCompany={selectedCompany} />
      </main>
      <Footer />
    </div>
  );
};

export default App;