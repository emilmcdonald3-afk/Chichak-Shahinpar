import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-md print:hidden">
      <div className="container mx-auto px-4 py-4">
        <h1 className="text-2xl font-bold text-center text-blue-600 dark:text-blue-400">
          فرم تنخواه گردان داخلی
        </h1>
        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-1">
          جهت ثبت و مدیریت گردش حساب داخلی دفتر
        </p>
      </div>
    </header>
  );
};

export default Header;
