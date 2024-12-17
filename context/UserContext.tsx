import { Course, Student, CustomNotification } from '@/components/types';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// Define the type for the context state
interface UserContextType {
  userData: any;
  error: string | null;
  courses: Course[];
  students: Student[];
  notifications: CustomNotification[];
  setUserData: React.Dispatch<React.SetStateAction<any>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  setNotifications: React.Dispatch<React.SetStateAction<CustomNotification[]>>;
}

// Create the context with default values
const UserContext = createContext<UserContextType | undefined>(undefined);

// Create a provider component
export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [userData, setUserData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [notifications, setNotifications] = useState<CustomNotification[]>([]);

  useEffect(() => {
    const fetchCourses = async () => {
      const docRef = doc(db, 'users', 'catalogue');
      try {
        const docSnapshot = await getDoc(docRef);
        if (docSnapshot.exists()) {
          const data = docSnapshot.data() as { courses?: Course[] };
          setCourses(data.courses || []);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };

    fetchCourses();
  }, []); // Fetch courses on mount

  return (
    <UserContext.Provider
      value={{
        userData,
        courses,
        students,
        error,
        setUserData,
        setCourses,
        setStudents,
        setError,
        notifications,
        setNotifications
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to use the context
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
