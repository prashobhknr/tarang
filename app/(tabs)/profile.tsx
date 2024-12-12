import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, Switch } from 'react-native';
import { useAuth0 } from 'react-native-auth0';
import { Text, useTheme } from 'react-native-paper';
import { db } from '@/firebase';
import { doc, getDoc, setDoc, collection, getDocs, query, where } from 'firebase/firestore';
import CircleButton from '@/components/CircleButton';
import ItemPicker from '@/components/Model';
import { Picker } from '@react-native-picker/picker';
import { useUser } from '@/context/UserContext';
import uuid from 'react-native-uuid';
import Button from '@/components/Button';
import { useThemeSwitcher } from '@/context/ThemeContext';

export default function ProfileScreen() {
  const { authorize, clearSession, user, error, isLoading } = useAuth0();
  const [selectRole, setSelectRole] = useState(true);
  const [students, setStudents] = useState<{ label: string; value: string }[]>([]);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  const { setUserData, setUserRole, setStudentEmail } = useUser();
  const { userData, userRole, studentEmail } = useUser();
  const { colors, fonts } = useTheme();
  const { theme, toggleTheme } = useThemeSwitcher();

  const fetchStudents = async () => {
    try {
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

  const fetchUserRole = async () => {
    try {
      if (user?.email) {
        const userDocRef = doc(db, 'users', user.email);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserRole(userData.role || '');
          setStudentEmail(userData.student || '');
          setUserData(userData);
        } else {
          saveUserToFirestore(user);
        }
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  const updateUserRole = async () => {
    try {
      if (user?.email) {
        const userDocRef = doc(db, 'users', user.email);
        const updatedData = {
          role: userRole,
          student: userRole === 'parent' ? studentEmail : '',
        };
        await setDoc(userDocRef, updatedData, { merge: true });
      }
    } catch (error) {
      console.error('Error updating user role or student:', error);
    }
  };

  const saveUserToFirestore = async (user: any) => {
    try {
      const userDocRef = doc(db, 'users', user.email);
      const callbackId = uuid.v4().replace(/-/g, '').toUpperCase();
      const userData = {
        name: user.name,
        email: user.email,
        picture: user.picture,
        callbackId,
        balance: 100,
        transactions: [],
      };
      await setDoc(userDocRef, userData, { merge: true });
      setUserData(userData);
    } catch (error) {
      console.error('Error saving/updating user in Firestore:', error);
    }
  };

  const onModalOpen = () => {
    setIsModalVisible(true);
    setSelectRole(true);
  };

  const onModalClose = () => {
    setIsModalVisible(false);
    updateUserRole();
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

  useEffect(() => {
    if (user && !userRole) fetchUserRole();
  }, [user]);

  useEffect(() => {
    if (!selectRole && userRole === 'parent' && students.length === 0) {
      fetchStudents();
    }
  }, [selectRole]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={[styles.loadingText, { color: colors.primary }]}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {user ? (
        <View style={[styles.profileCard, { backgroundColor: colors.surface }]}>
          {user.picture && (
            <Image
              source={{ uri: user.picture }}
              style={styles.profilePicture}
            />
          )}
          <Text style={[styles.name, fonts.headlineMedium]}>{user.name}</Text>
          <Text style={[styles.email, fonts.bodyMedium]}>{user.email}</Text>
          {userRole && (
            <Text style={[styles.studentEmailText, fonts.bodyLarge]}>Role: {userRole}</Text>
          )}
          {studentEmail && (
            <Text style={[styles.studentEmailText, fonts.bodyLarge]}>Student: {studentEmail}</Text>
          )}
          <CircleButton onPress={onModalOpen} />
          <Button label="Log Out" theme="secondary" onPress={onLogout} iconName="logout" />

          {/* Theme Switcher */}
          <View style={styles.themeSwitcher}>
            <Text style={[styles.themeText, { color: colors.onSurface }]}>Dark Mode</Text>
            <Switch
              value={theme.name === 'dark'}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.surfaceVariant, true: colors.primary }}
              thumbColor={theme.name === 'dark' ? colors.primary : colors.onSurfaceVariant}
            />
          </View>

        </View>
      ) : (
        <>
          <Text style={[styles.message, { color: colors.error }]}>You are not logged in. Please log in to view your profile.</Text>
          <Button label="Log In" theme="primary" onPress={onLogin} iconName="login" />
        </>
      )}

      <ItemPicker
        title={selectRole ? 'Choose a role' : 'Select connected student'}
        isVisible={isModalVisible}
        onClose={onModalClose}
      >
        <Picker
          selectedValue={selectRole ? userRole : studentEmail}
          onValueChange={(itemValue) => {
            if (selectRole) {
              setUserRole(itemValue);
              if (itemValue === 'parent') setSelectRole(false);
              if (itemValue === 'student') setStudentEmail('');
            } else {
              setStudentEmail(itemValue);
            }
          }}
        >
          {selectRole && (
            <>
              <Picker.Item label="None" value="" />
              <Picker.Item label="Student" value="student" />
              <Picker.Item label="Parent" value="parent" />
            </>
          )}
          {!selectRole &&
            students.map((student) => (
              <Picker.Item
                key={student.value}
                label={student.label}
                value={student.value}
              />
            ))}
        </Picker>
      </ItemPicker>

      {error && <Text style={[styles.error, { color: colors.error }]}>{error.message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  profileCard: {
    borderRadius: 10,
    padding: 20,
    width: '80%',
    alignItems: 'center',
    elevation: 5,
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
  },
  name: {
    marginBottom: 10,
  },
  email: {
    marginBottom: 20,
  },
  message: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  studentEmailText: {
    marginTop: 10,
  },
  error: {
    marginTop: 10,
    fontSize: 14,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  themeSwitcher: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  themeText: {
    marginRight: 10,
    fontSize: 16,
  },
});