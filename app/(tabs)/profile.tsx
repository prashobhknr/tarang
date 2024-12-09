import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useAuth0, User } from 'react-native-auth0'; // Import the User type
import Button from '@/components/Button'; 
import { db } from '@/firebase'; 
import { doc, getDoc, setDoc, collection, getDocs, query, where } from 'firebase/firestore';
import CircleButton from '@/components/CircleButton';
import ItemPicker from '@/components/Model';
import { Picker } from '@react-native-picker/picker';
import { useUser } from '@/context/UserContext'; 
import uuid from 'react-native-uuid';

export default function ProfileScreen() {
  const { authorize, clearSession, user, error, isLoading } = useAuth0();
  const [selectRole, setSelectRole] = useState(true);
  const [students, setStudents] = useState<{ label: string; value: string }[]>([]);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  const { setUserData, setUserRole, setStudentEmail } = useUser();
  const { userData, userRole, studentEmail } = useUser();

  // Fetch all students with the role 'student'
  const fetchStudents = async () => {
    try {
      console.log('fetching students ', user?.email)
      const q = query(collection(db, 'users'), where('role', '==', 'student'));
      const studentsSnapshot = await getDocs(q);
      const studentList = studentsSnapshot.docs.map((doc) => ({
        label: doc.data().email,
        value: doc.data().email,
      }));
      setStudents(studentList);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  // Fetch the current user's role and connected student, if not already fetched
  const fetchUserRole = async () => {
    try {
      if (user?.email) {
        console.log('fetching user ', user?.email)
        const userDocRef = doc(db, 'users', user.email);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserRole(userData.role || '');
          setStudentEmail(userData.student || '');
          setUserData(userData)
          console.log('Got user with profile', userData)
        } else {
          saveUserToFirestore(user);
        }
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  // Update the user role and associated student in Firestore
  const updateUserRole = async () => {
    try {
      if (user?.email) {
        console.log('update user role', user?.email)
        const userDocRef = doc(db, 'users', user.email);
        const updatedData = {
          role: userRole,
          student: userRole === 'parent' ? studentEmail : '',
        };
        await setDoc(userDocRef, updatedData, { merge: true });
        console.log('User role and student updated successfully!');
      }
    } catch (error) {
      console.error('Error updating user role or student: ', error);
    }
  };

  //save user when initial saving
  const saveUserToFirestore = async (user: any) => {
    try {
      console.log('creaing a new user doc',user)
      const userDocRef = doc(db, 'users', user.email);
      const callbackId = uuid.v4().replace(/-/g, '').toUpperCase();

      const userData = {
        name: user.name,
        email: user.email,
        picture: user.picture,
        callbackId: callbackId,
        balance: 100,
        transactions: []
      };
      console.log('save user ', user?.email)
      await setDoc(userDocRef, userData, { merge: true });
      setUserData(userData);
      console.log('User saved/updated in Firestore successfully!');
    } catch (error) {
      console.error('Error saving/updating user in Firestore: ', error);
    }
  };

  const onModalOpen = () => {
    setIsModalVisible(true);
    setSelectRole(true);
  };

  const onModalClose = () => {
    setIsModalVisible(false);
    updateUserRole()
  };

  const onLogin = async () => {
    try {
      await authorize();
    } catch (e) {
      console.log(e);
    }
  };

  const onLogout = async () => {
    try {
      setStudentEmail('');
      setUserRole('');
      setUserData('');
      await clearSession();
    } catch (e) {
      console.log('Log out cancelled');
    }
  };

  // Fetch or Save user data to Firestore when user logs in
  useEffect(() => {
    if (user) {
      //  console.log('new user logged in', user)
      if (!userRole)
        fetchUserRole()
    }
  }, [user]);

  // Fetch available students when role update to parent
  useEffect(() => {
    if (!selectRole && userRole === 'parent' && students.length === 0) {
      fetchStudents()
    }
  }, [selectRole]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {user ? (
        <View style={styles.profileCard}>
          {user.picture && (
            <Image
              source={{ uri: user.picture }}
              style={styles.profilePicture}
            />
          )}
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.email}>{user.email}</Text>
          {userRole && (
            <View>
              <Text style={styles.studentEmailText}>Role: {userRole}</Text>
            </View>
          )}
          {studentEmail && (
            <View>
              <Text style={styles.studentEmailText}>Student: {studentEmail}</Text>
            </View>
          )}
          <CircleButton onPress={onModalOpen} />
          <Button label="Log Out" theme="secondary" onPress={onLogout} icon="sign-out" />

        </View>
      ) : (
        <>
          <Text style={styles.message}>You are not logged in. Please log in to view your profile.</Text>
          <Button label="Log In" theme="primary" onPress={onLogin} icon="sign-in" />
        </>
      )}

      <ItemPicker title={selectRole ? 'Choose a role' : 'Select connected student'} isVisible={isModalVisible} onClose={onModalClose}>
        <View>
          <Picker
            key={'rolePicker'}
            style={styles.picker}
            itemStyle={styles.pickerItem}
            selectedValue={selectRole ? userRole : studentEmail}
            onValueChange={(itemValue, itemIndex) => {
              if (selectRole) {
                
                if (itemValue === 'parent'){
                  setUserRole(itemValue)
                  setSelectRole(false);
                }
                else if (itemValue === 'student'){
                  setUserRole(itemValue)
                  setStudentEmail('');
                }
                  
              }
              else {
                setStudentEmail(itemValue)
              }
            }}>
            {selectRole && (<Picker.Item label="None" value="" />)}
            {selectRole && (<Picker.Item label="Student" value="student" />)}
            {selectRole && (<Picker.Item label="Parent" value="parent" />)}
            {/* Student List Items */}
            {!selectRole &&
              students.map((student) => (
                <Picker.Item
                  key={student.value}
                  label={student.label}
                  value={student.value}
                />
              ))}
           
          </Picker>
        </View>
      </ItemPicker>
      {/* Show errors */}
      {error && <Text style={styles.error}>{error.message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f1f1f1',
    padding: 20,
  },
  loadingText: {
    fontSize: 18,
    color: '#555',
    fontWeight: 'bold',
    marginTop: 10, // Add margin to separate from the loading indicator
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
    marginBottom: 30,
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
  },
  name: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
  },
  email: {
    fontSize: 16,
    color: '#777',
    marginVertical: 10,
  },
  message: {
    fontSize: 18,
    color: '#ff6347',
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: '500',
  },
  error: {
    color: 'red',
    marginTop: 10,
    fontSize: 14,
    fontWeight: '500',
  },
  roleText: {
    fontSize: 18,
    color: '#333',
    marginTop: 10,
  },
  studentEmailText: {
    fontSize: 16,
    color: '#333',
    marginTop: 10,
  },
  picker: {
    borderRadius: 8,
    overflow: "hidden",
  },
  pickerItem: {
    color: "white",
    fontSize: 16,
  },
});
