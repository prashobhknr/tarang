export interface Course {
  courseId: string;
  name: string;
  price: number; 
  time: string;
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
  dueDate: string;
  users: string[];
  paymentAllowed: string;  // default 'new', other status like 'locked', 'pending' approval etc.
}

export interface CustomNotification {
  id: number;
  title: string;
  subtitle: string;   //keyword  'validate'
  description: string;
  timestamp: string;
  avatar: string;
}