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
