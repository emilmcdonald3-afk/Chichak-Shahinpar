import React, { useRef } from 'react';
import { ExpenseItem, ExpenseType } from '../types';

interface ExpenseRowProps {
  item: ExpenseItem;
  index: number;
  onItemChange: (id: string, field: keyof Omit<ExpenseItem, 'id'>, value: string | number | ExpenseType | File | null) => void;
  onRemoveItem: (id:string) => void;
  isOnlyItem: boolean;
}

const ExpenseRow: React.FC<ExpenseRowProps> = ({ item, index, onItemChange, onRemoveItem, isOnlyItem }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const isAmount = name === 'amount';
    const numValue = isAmount ? Number(value.replace(/,/g, '')) || 0 : value;
    onItemChange(item.id, name as keyof Omit<ExpenseItem, 'id'>, numValue);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    onItemChange(item.id, 'amount', numValue);
  }

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    onItemChange(item.id, 'attachment', file || null);
  };

  const handleRemoveAttachment = () => {
    onItemChange(item.id, 'attachment', null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };


  const isRefund = item.type === 'refund';
  const inputBaseClasses = "w-full bg-slate-50 dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 print:border-none print:p-0 print:shadow-none print:bg-transparent";

  return (
    <div className="grid grid-cols-12 gap-x-4 gap-y-2 items-center border-b border-slate-100 dark:border-gray-700/50 pb-4 sm:border-none sm:pb-0">
      {/* Row Index */}
      <div className="col-span-1 text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
        {index + 1}
      </div>

      {/* Date */}
      <div className="col-span-6 sm:col-span-2">
        <label className="sm:hidden text-xs text-slate-500 mb-1 block">تاریخ</label>
        <input
          type="date"
          name="date"
          value={item.date}
          onChange={handleFieldChange}
          className={inputBaseClasses}
          required
        />
      </div>

      {/* Description */}
      <div className="col-span-12 sm:col-span-3">
         <label className="sm:hidden text-xs text-slate-500 mb-1 block">شرح هزینه</label>
        <input
          type="text"
          name="description"
          placeholder={isRefund ? "مثال: کنسلی بلیط پرواز" : "مثال: خرید لوازم اداری"}
          value={item.description}
          onChange={handleFieldChange}
          className={inputBaseClasses}
          required
        />
      </div>

      {/* Type */}
      <div className="col-span-6 sm:col-span-2">
         <label className="sm:hidden text-xs text-slate-500 mb-1 block">نوع تراکنش</label>
        <select
          name="type"
          value={item.type}
          onChange={handleFieldChange}
          className={`${inputBaseClasses} ${isRefund ? 'text-green-600 dark:text-green-400 font-medium' : ''}`}
        >
          <option value="cost">هزینه</option>
          <option value="refund">برگشت وجه</option>
        </select>
      </div>

      {/* Amount */}
      <div className="col-span-8 sm:col-span-2">
         <label className="sm:hidden text-xs text-slate-500 mb-1 block">مبلغ (ریال)</label>
        <div className="relative">
          <input
            type="text"
            name="amount"
            placeholder="0"
            value={item.amount === 0 ? '' : item.amount.toLocaleString('fa-IR')}
            onChange={handleAmountChange}
            className={`${inputBaseClasses} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${isRefund ? 'text-green-600 dark:text-green-400 font-medium' : ''}`}
            required
            min="0"
          />
          {isRefund && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600 dark:text-green-400 font-medium pointer-events-none">+</span>}
        </div>
      </div>
      
      {/* Attachment */}
      <div className="col-span-12 sm:col-span-1">
        <label className="sm:hidden text-xs text-slate-500 mb-1 block">سند</label>
        <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            aria-hidden="true"
        />
        <div className="print:hidden">
            {!item.attachment ? (
                <button type="button" onClick={handleAttachmentClick} className="w-full h-10 flex items-center justify-center bg-slate-50 hover:bg-slate-100 dark:bg-gray-700 dark:hover:bg-gray-600 border border-slate-300 dark:border-gray-600 rounded-md transition-colors" aria-label="افزودن سند">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                </button>
            ) : (
                <div className="flex items-center justify-center h-10 px-2 bg-slate-100 dark:bg-gray-700/50 border border-slate-300 dark:border-gray-600 rounded-md">
                    <span className="truncate text-xs text-slate-600 dark:text-slate-300" title={item.attachment.name}>{item.attachment.name}</span>
                    <button type="button" onClick={handleRemoveAttachment} className="p-1 -mr-1 text-slate-400 rounded-full hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900/50" aria-label="حذف سند">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
            )}
        </div>
        <div className="hidden print:block text-sm">
            {item.attachment ? item.attachment.name : 'ندارد'}
        </div>
      </div>


      {/* Remove Button */}
      <div className="col-span-4 sm:col-span-1 flex justify-end self-center">
        <button
          type="button"
          onClick={() => onRemoveItem(item.id)}
          disabled={isOnlyItem}
          className="p-2 text-slate-400 dark:text-gray-500 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 hover:text-red-600 dark:hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-colors print:hidden"
          aria-label="حذف ردیف"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ExpenseRow;