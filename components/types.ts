export interface Course {
  courseId: string;
  name: string;
  price: number; 
  info: string;
  dueDate: string; 
}

export interface Catalogue {
  courses: Course[];
}

export interface Student {
  ssn: string;
  name: string;
  courses: Course[];
  price: number;
  advance: number;
  transactions: Transaction[];
  dueDate: string;
  users: string[];
  paymentAllowed: string;  // default 'new', other status like 'locked', 'pending' approval etc.
  expoPushTokens: string[]
}

export interface CustomNotification {
  id: number;
  title: string;
  subtitle: string;   //keyword  'validate'
  description: string;
  timestamp: string;
  avatar: string;
  read: boolean;
}

export interface Transaction {
  amount: number;
  datePaid: string;
  status: string; // Example: 'PAID', 'PENDING'
  transactionId: string;
}