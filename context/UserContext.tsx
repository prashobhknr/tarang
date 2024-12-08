import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the type for the context state
interface UserContextType {
  userData: any;
  userRole: string | null;
  studentEmail: string | null;
  error: string | null;
  setUserData: React.Dispatch<React.SetStateAction<any>>;
  setUserRole: React.Dispatch<React.SetStateAction<string | null>>;
  setStudentEmail: React.Dispatch<React.SetStateAction<string | null>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
}

// Create the context with default values
const UserContext = createContext<UserContextType | undefined>(undefined);

// Create a provider component
export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [userData, setUserData] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [studentEmail, setStudentEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <UserContext.Provider
      value={{
        userData,
        userRole,
        studentEmail,
        error,
        setUserData,
        setUserRole,
        setStudentEmail,
        setError,
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
