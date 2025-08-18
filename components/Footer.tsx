import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="text-center py-4 mt-8 print:hidden">
      <p className="text-sm text-slate-500 dark:text-slate-400">
        © {currentYear} تمامی حقوق محفوظ است.
      </p>
    </footer>
  );
};

export default Footer;
