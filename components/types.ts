export interface Course {
  courseId: string;
  name: string;
  price: number; // Stored as a number in Firestore
  time: string;
  dueDate: string; // Represented as a string (formatted) or a Date object locally
}

export interface Catalogue {
  courses: Course[];
}
