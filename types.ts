export interface Payee {
  id: string;
  name: string;
}

export type ExpenseType = 'cost' | 'refund';

export interface ExpenseItem {
  id:string;
  date: string;
  description: string;
  amount: number;
  type: ExpenseType;
  attachment?: File | null;
}
