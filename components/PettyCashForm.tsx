import React, { useState, useMemo, useCallback } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ExpenseItem, Payee, ExpenseType } from '../types';
import ExpenseRow from './ExpenseRow';

const PettyCashForm: React.FC = () => {
  const [payees, setPayees] = useState<Payee[]>([
    { id: crypto.randomUUID(), name: '' },
  ]);
  const [pettyCashNumber, setPettyCashNumber] = useState<string>('');
  const [initialAmount, setInitialAmount] = useState<number>(0);
  const [initialAmountDate, setInitialAmountDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([
    { id: crypto.randomUUID(), date: '', description: '', amount: 0, type: 'cost', attachment: null },
  ]);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleAddPayee = useCallback(() => {
    setPayees(prev => [...prev, { id: crypto.randomUUID(), name: '' }]);
  }, []);

  const handleRemovePayee = useCallback((id: string) => {
    setPayees(prev => prev.filter(item => item.id !== id));
  }, []);

  const handlePayeeChange = useCallback((id: string, name: string) => {
    setPayees(prev =>
      prev.map(item => (item.id === id ? { ...item, name } : item))
    );
  }, []);

  const handleInitialAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    // Convert Persian/Arabic numerals to Western numerals
    const persianToArabicMap: { [key: string]: string } = {
        '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
        '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9'
    };
    value = value.replace(/[۰-۹]/g, (match) => persianToArabicMap[match]);

    // Remove non-digit characters
    const sanitizedValue = value.replace(/[^0-9]/g, '');
    let numValue = Number(sanitizedValue) || 0;

    if (numValue > 999999999) {
      numValue = 999999999;
    }
    setInitialAmount(numValue);
  };


  const handleAddItem = useCallback(() => {
    setExpenses(prev => [...prev, { id: crypto.randomUUID(), date: '', description: '', amount: 0, type: 'cost', attachment: null }]);
  }, []);

  const handleRemoveItem = useCallback((id: string) => {
    setExpenses(prev => prev.filter(item => item.id !== id));
  }, []);

  const handleItemChange = useCallback((id: string, field: keyof Omit<ExpenseItem, 'id'>, value: string | number | ExpenseType | File | null) => {
    setExpenses(prev =>
      prev.map(item => (item.id === id ? { ...item, [field]: value } : item))
    );
  }, []);
  
  const totalAmount = useMemo(() => {
    return expenses.reduce((sum, item) => {
      const amount = Number(item.amount || 0);
      return item.type === 'refund' ? sum - amount : sum + amount;
    }, 0);
  }, [expenses]);

  const remainingBalance = useMemo(() => {
    return initialAmount - totalAmount;
  }, [initialAmount, totalAmount]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    const formElement = document.getElementById('petty-cash-form');
    if (!formElement) return;

    setIsDownloading(true);
    try {
        const canvas = await html2canvas(formElement, {
            scale: 2,
            useCORS: true,
        });
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: 'a4',
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const imgHeight = canvas.height * pdfWidth / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();

        while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
            heightLeft -= pdf.internal.pageSize.getHeight();
        }
        
        pdf.save('petty-cash-form.pdf');
    } catch (error) {
        console.error("Error generating PDF:", error);
        alert("متاسفانه در تولید فایل PDF خطایی رخ داد.");
    } finally {
        setIsDownloading(false);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payeeNames = payees.map(p => p.name).join(', ');
    const expenseData = expenses.map(e => ({...e, attachment: e.attachment?.name}));
    alert(`فرم با موفقیت ثبت شد!\nشماره تنخواه: ${pettyCashNumber}\nپرداخت به: ${payeeNames}\nتاریخ شارژ تنخواه: ${new Date(initialAmountDate).toLocaleDateString('fa-IR')}\nمبلغ اولیه تنخواه: ${initialAmount.toLocaleString('fa-IR')} ریال\nمجموع هزینه: ${totalAmount.toLocaleString('fa-IR')} ریال\nمانده تنخواه: ${remainingBalance.toLocaleString('fa-IR')} ریال`);
    console.log({
        pettyCashNumber,
        payees,
        initialAmountDate,
        initialAmount,
        expenses: expenseData,
        totalAmount,
        remainingBalance
    });
  }

  return (
    <div id="petty-cash-form" className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8 print:shadow-none print:rounded-none">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              در وجه
            </label>
            <div className="space-y-2">
              {payees.map((payee) => (
                <div key={payee.id} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={payee.name}
                    onChange={(e) => handlePayeeChange(payee.id, e.target.value)}
                    className="flex-grow w-full bg-slate-50 dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 print:border-none print:p-0 print:shadow-none print:bg-transparent"
                    placeholder="نام پرداخت شونده"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => handleRemovePayee(payee.id)}
                    disabled={payees.length === 1}
                    className="p-2 text-slate-400 dark:text-gray-500 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 hover:text-red-600 dark:hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-colors print:hidden"
                    aria-label="حذف پرداخت شونده"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={handleAddPayee}
              className="text-sm mt-3 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium print:hidden"
            >
              + افزودن پرداخت شونده
            </button>
          </div>
          <div>
            <div className="space-y-6">
               <div>
                <label htmlFor="pettyCashNumber" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  شماره تنخواه
                </label>
                <input
                  id="pettyCashNumber"
                  type="text"
                  value={pettyCashNumber}
                  onChange={(e) => setPettyCashNumber(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 print:border-none print:p-0 print:shadow-none print:bg-transparent"
                  placeholder="شماره تنخواه را وارد کنید"
                  required
                />
              </div>
              <div>
                <label htmlFor="initialAmountDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  تاریخ شارژ تنخواه
                </label>
                <input
                  id="initialAmountDate"
                  type="date"
                  value={initialAmountDate}
                  onChange={(e) => setInitialAmountDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 print:border-none print:p-0 print:shadow-none print:bg-transparent"
                  required
                />
              </div>
              <div>
                <label htmlFor="initialAmount" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  مبلغ تنخواه اولیه (ریال)
                </label>
                <input
                  id="initialAmount"
                  type="text"
                  value={initialAmount === 0 ? '' : initialAmount.toLocaleString('fa-IR')}
                  onChange={handleInitialAmountChange}
                  className="w-full bg-slate-50 dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 print:border-none print:p-0 print:shadow-none print:bg-transparent"
                  placeholder="مبلغ اولیه را وارد کنید"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Table Header */}
        <div className="hidden sm:grid grid-cols-12 gap-4 mb-2 pb-2 border-b border-slate-200 dark:border-gray-700 font-semibold text-sm text-slate-600 dark:text-slate-300">
          <div className="col-span-1">ردیف</div>
          <div className="col-span-2">تاریخ</div>
          <div className="col-span-3">شرح هزینه</div>
          <div className="col-span-2">نوع تراکنش</div>
          <div className="col-span-2">مبلغ (ریال)</div>
          <div className="col-span-1">سند</div>
          <div className="col-span-1"></div>
        </div>

        {/* Expense Items */}
        <div className="space-y-4">
          {expenses.map((item, index) => (
            <ExpenseRow
              key={item.id}
              item={item}
              index={index}
              onItemChange={handleItemChange}
              onRemoveItem={handleRemoveItem}
              isOnlyItem={expenses.length === 1}
            />
          ))}
        </div>

        {/* Add Item Button */}
        <div className="mt-6 print:hidden">
          <button
            type="button"
            onClick={handleAddItem}
            className="flex items-center justify-center w-full px-4 py-2 border-2 border-dashed border-blue-400 dark:border-blue-600 text-blue-600 dark:text-blue-400 rounded-md hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            <span>افزودن ردیف هزینه</span>
          </button>
        </div>

        {/* Total and Submit */}
        <div className="mt-8 pt-4 border-t border-slate-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="w-full sm:w-auto grid grid-cols-2 gap-x-6 gap-y-2 text-lg">
              <span className="font-semibold text-slate-700 dark:text-slate-200">جمع کل هزینه‌ها:</span>
              <div className="flex items-baseline justify-end">
                  <span className={`font-bold text-xl ${totalAmount < 0 ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}`}>
                      {totalAmount.toLocaleString('fa-IR')}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 mr-1">ریال</span>
              </div>
              
              <span className="font-semibold text-slate-700 dark:text-slate-200">مانده تنخواه:</span>
              <div className="flex items-baseline justify-end">
                   <span className={`font-bold text-xl ${
                      remainingBalance < 0 
                      ? 'text-red-500 dark:text-red-400' 
                      : 'text-green-600 dark:text-green-400'
                  }`}>
                      {remainingBalance.toLocaleString('fa-IR')}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 mr-1">ریال</span>
              </div>
          </div>

          <div className="w-full sm:w-auto flex flex-col sm:flex-row-reverse gap-3 print:hidden">
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform transform hover:scale-105"
            >
              ثبت و ارسال فرم
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={isDownloading}
              className="w-full sm:w-auto px-4 py-2 bg-white dark:bg-gray-700 border border-slate-300 dark:border-gray-600 text-slate-700 dark:text-slate-200 font-medium rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isDownloading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              )}
              <span>{isDownloading ? 'در حال آماده سازی...' : 'دانلود PDF'}</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="w-full sm:w-auto px-4 py-2 bg-white dark:bg-gray-700 border border-slate-300 dark:border-gray-600 text-slate-700 dark:text-slate-200 font-medium rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors flex items-center justify-center gap-2"
            >
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v-2a1 1 0 011-1h8a1 1 0 011 1v2h1a2 2 0 002-2v-3a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
              </svg>
              <span>چاپ</span>
            </button>
          </div>

        </div>
      </form>
    </div>
  );
};

export default PettyCashForm;