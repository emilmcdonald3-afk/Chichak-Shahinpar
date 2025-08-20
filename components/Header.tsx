import React from 'react';

interface HeaderProps {
  selectedCompany: string;
  onCompanyChange: (company: string) => void;
}

const Header: React.FC<HeaderProps> = ({ selectedCompany, onCompanyChange }) => {
  const companyOptions = [
    'خدمات حفاری کنور اروند',
    'کروسانس',
    'کنور اسیا'
  ];

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md print:hidden">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex-grow">
          <div className="relative">
             <select
                value={selectedCompany}
                onChange={(e) => onCompanyChange(e.target.value)}
                className="appearance-none w-full bg-transparent text-xl font-bold text-slate-800 dark:text-slate-200 pr-8 py-1 focus:outline-none cursor-pointer"
                aria-label="انتخاب شرکت"
              >
                {companyOptions.map(company => (
                  <option key={company} value={company}>
                    {company}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                 <svg className="w-4 h-4 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
          </div>
         
          <p className="text-lg text-blue-600 dark:text-blue-400 font-medium">
            فرم تنخواه گردان داخلی
          </p>
        </div>
      </div>
    </header>
  );
};

export default Header;