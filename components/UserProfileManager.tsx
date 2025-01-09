import React, { useState, useEffect, useMemo, useRef } from 'react';
import { FlatList, StyleSheet, View, TouchableOpacity } from 'react-native';
import {
  TextInput,
  Button,
  Card,
  Paragraph,
  IconButton,
  useTheme,
  Snackbar,
  Dialog,
  Portal,
  Text
} from 'react-native-paper';
import BottomSheet, { BottomSheetView, BottomSheetScrollView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { useUser } from '@/context/UserContext';
import { doc, collection, updateDoc, getDoc, setDoc, query, where, getDocs, deleteDoc, arrayUnion } from 'firebase/firestore';
import { db } from '@/firebase';
import { ListRenderItemInfo } from 'react-native';
import { Course, Student, CustomNotification } from '@/components/types';
import { useNotification } from "@/context/NotificationContext";



type Props = {
  isVisible: boolean;
  onClose: () => void;
};

const UserProfileManager = ({ isVisible, onClose }: Props) => {
  const { userData, courses, students, setCourses, setUserData, setStudents } = useUser();
  const { colors } = useTheme();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [newStudent, setNewStudent] = useState({ name: '', ssn: '', courses: [] as Course[], price: 0, advance: 0, dueDate: '', users: [] as string[], paymentAllowed: 'new', transactions: [] as [], expoPushTokens: [] as string[] });
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [confirmDialogVisible, setConfirmDialogVisible] = useState(false);
  const [studentToLoad, setStudentToLoad] = useState<Student | null>(null);

  const [editMode, setEditMode] = useState(false);
  const { expoPushToken } = useNotification();

  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['50%', '90%', '100%'], []);

  React.useEffect(() => {
    if (isVisible) {
      openBottomSheet();
    } else {
      closeBottomSheet();
    }
  }, [isVisible]);

  const openBottomSheet = () => {
    if (bottomSheetRef.current) {
      bottomSheetRef.current?.snapToIndex(1);
    }
  };

  const closeBottomSheet = () => {
    if (bottomSheetRef.current) {
      bottomSheetRef.current.close();
      onClose();
    }
  };

  useEffect(() => {
    if (!userData?.email) {
      console.error('User email or SSN is missing. Cannot fetch students.');
      setSnackbarVisible(true);
      return;
    }

    setPhoneNumber(userData.phoneNumber || '');

    const fetchStudents = async () => {
      if (!userData.students || userData.students.length === 0) {
        console.log('No students in user data.');
        setStudents([]);
        return;
      }

      const ssns = userData.students; // Get SSNs from user data

      try {
        const studentsRef = collection(db, 'students'); // Reference to 'students' collection
        const q = query(studentsRef, where('ssn', 'in', ssns));

        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const fetchedStudents: Student[] = querySnapshot.docs.map((doc) => doc.data() as Student);
          setStudents(fetchedStudents);
        } else {
          console.log('No students found for these SSNs.');
          setStudents([]);
        }
      } catch (error) {
        console.error('Error fetching students:', error);
      }
    };

    if (courses.length === 0) {
      fetchCourses();
    }

    fetchStudents();
  }, [userData]);

  const fetchCourses = async () => {
    const coursesDocRef = doc(db, 'users', 'catalogue');
    try {
      const courseSnapshot = await getDoc(coursesDocRef);
      if (courseSnapshot.exists()) {
        const data = courseSnapshot.data();
        setCourses(data?.courses || []);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  // Function to create and add a notification
  const addNotification = async (notification: CustomNotification) => {
    try {
      const notificationsDocRef = doc(db, 'notifications', 'admin');
      const notificationsDoc = await getDoc(notificationsDocRef);

      if (notificationsDoc.exists()) {
        // Add the notification to the existing document
        await updateDoc(notificationsDocRef, {
          notifications: arrayUnion(notification),
        });
      } else {
        // Create a new document if it doesn't exist
        await setDoc(notificationsDocRef, {
          notifications: [notification],
        });
      }
    } catch (error) {
      console.error('Error adding notification:', error);
    }
  };

  const saveFormData = async (updatedStudents: Student[]) => {
    if (!userData?.email) return;

    const userDocRef = doc(db, 'users', userData.email);

    try {
      const updatedStudentSSNs = Array.from(new Set(updatedStudents.map((student) => student.ssn)));

      const updatedUserData = {
        ...userData,
        phoneNumber,
        students: updatedStudentSSNs
      };
      await updateDoc(userDocRef, { phoneNumber, students: updatedStudentSSNs });
      setUserData(updatedUserData);
      console.log('User data updated successfully!');
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  };

  const toggleCourseSelection = (course: Course) => {
    const isSelected = newStudent.courses.some((c) => c.courseId === course.courseId);
    const updatedCourses = isSelected
      ? newStudent.courses.filter((c) => c.courseId !== course.courseId)
      : [...newStudent.courses, course];

    const { totalPrice, maxDueDate } = calculateCourseSummary(updatedCourses);
    setNewStudent({ ...newStudent, courses: updatedCourses, price: totalPrice, dueDate: maxDueDate });
  };

  const calculateCourseSummary = (courses: Course[]) => {
    const totalPrice = courses.reduce((acc, course) => acc + course.price, 0);
    const maxDueDate = courses.reduce((latest, course) => {
      return new Date(course.dueDate) > new Date(latest) ? course.dueDate : latest;
    }, '1970-01-01');

    return { totalPrice, maxDueDate };
  };

  const validateSSN = (ssn: string): boolean => {
    // Check basic SSN format YYMMDD-XXXX
    const ssnPattern = /^\d{6}-\d{4}$/;
    if (!ssnPattern.test(ssn)) {
      return false;
    }

    // Extract digits, remove the dash
    const ssnDigits = ssn.replace('-', '');

    // Luhn algorithm to verify the last digit
    const luhnSum = ssnDigits.split('').slice(0, 9).reduce((sum, char, index) => {
      let digit = parseInt(char, 10);
      if (index % 2 === 0) digit *= 2; // Double every other digit
      if (digit > 9) digit -= 9; // Subtract 9 if the digit is greater than 9
      return sum + digit;
    }, 0);

    const checkDigit = parseInt(ssnDigits[9], 10);
    if ((luhnSum + checkDigit) % 10 !== 0) {
      return false;
    }

    // Validate age (less than 18 years old)
    const birthDate = extractBirthDate(ssnDigits);
    // if (!birthDate || !isUnder18(birthDate)) {
    //   return false;
    // }

    if (!birthDate) {
      return false;
    }

    return true;
  };

  // Function to extract birthdate from SSN
  const extractBirthDate = (ssnDigits: string): Date | null => {
    const year = parseInt(ssnDigits.substring(0, 2), 10);
    const month = parseInt(ssnDigits.substring(2, 4), 10);
    const day = parseInt(ssnDigits.substring(4, 6), 10);

    // Handle YY -> full year (1900s or 2000s)
    const currentYear = new Date().getFullYear();
    const fullYear = year + (year >= currentYear % 100 ? 1900 : 2000); // Assumes birthdates are in the 1900s or 2000s

    if (month < 1 || month > 12 || day < 1 || day > 31) {
      return null; // Invalid date
    }

    return new Date(fullYear, month - 1, day); // Month is 0-indexed
  };

  // Function to check if the person is under 18
  const isUnder18 = (birthDate: Date): boolean => {
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();

    // Check if the birthday has passed this year
    const hasBirthdayPassed =
      today.getMonth() > birthDate.getMonth() ||
      (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());

    return age < 18 || (age === 18 && !hasBirthdayPassed);
  };


  const addOrUpdateStudent = async () => {
    console.log('selected', selectedStudent?.ssn)
    // Validation for SSN, phone number, and courses
    if (!validateSSN(newStudent.ssn)) {
      setSnackbarMessage('Invalid student SSN. Expected format: YYMMDD-XXXX.');
      setSnackbarVisible(true);
      return;
    }

    if (!phoneNumber.trim()) {
      setSnackbarMessage('Phone number is required!');
      setSnackbarVisible(true);
      return;
    }

    if (newStudent.courses.length === 0) {
      setSnackbarMessage('At least one course is required!');
      setSnackbarVisible(true);
      return;
    }


    newStudent.expoPushTokens = newStudent.expoPushTokens ? newStudent.expoPushTokens : []
    // Ensure the user email is in the 'users' array
    const updatedStudent: Student = {
      ...newStudent,
      expoPushTokens: (expoPushToken && !newStudent.expoPushTokens.includes(expoPushToken))
        ? [...newStudent.expoPushTokens, expoPushToken]
        : newStudent.expoPushTokens,
      users: newStudent.users.includes(userData.email)
        ? newStudent.users
        : [...newStudent.users, userData.email] // Add the current user's email to users list
    };


    let updatedStudents: Student[];
    if (selectedStudent) {

      // Handle logic for updating a student with a new SSN
      if (selectedStudent.ssn !== newStudent.ssn) {
        setSnackbarMessage('You cannot change the SSN of an existing student.');
        setSnackbarVisible(true);
        updatedStudents = students;
      } else {
        console.log('updating student');
        // If SSN is the same, simply update the student
        updatedStudents = students.map((student) =>
          student.ssn === selectedStudent.ssn ? updatedStudent : student
        );
        try {
          await setDoc(doc(db, 'students', selectedStudent.ssn), updatedStudent, { merge: true });
        } catch (error) {
          console.error('Error updating student with existing SSN:', error);
        }
      }
    } else {
      console.log('adding new student');
      // New student with a new SSN

      //check if it is already added
      const ssnExists = students.some((student) => student.ssn === newStudent.ssn);
      if (!selectedStudent && ssnExists) {
        setSnackbarMessage('A student with this SSN already exists.');
        setSnackbarVisible(true);
        return;
      }

      // Check for an existing student with the same SSN in Firestore
      const existingStudentSnapshot = await getDoc(doc(db, 'students', newStudent.ssn));
      if (existingStudentSnapshot.exists()) {
        const existingStudent = existingStudentSnapshot.data() as Student;
        existingStudent.expoPushTokens = (expoPushToken && !existingStudent.expoPushTokens.includes(expoPushToken))
          ? [...existingStudent.expoPushTokens, expoPushToken] : existingStudent.expoPushTokens,
          setStudentToLoad(existingStudent);
        setConfirmDialogVisible(true);
        return;
      }

      updatedStudents = [...students, updatedStudent];
      try {
        await setDoc(doc(db, 'students', updatedStudent.ssn), updatedStudent);
      } catch (error) {
        console.error('Error adding new student:', error);
      }
    }

    // Save updated students list to the user's data
    await connectUserAndStudent(updatedStudents);
  };

  async function connectUserAndStudent(updatedStudents: Student[]) {
    console.log('connecting student to profile');
    await saveFormData(updatedStudents);
    setStudents(updatedStudents);
    setViewOnlyMode();

    if (newStudent.paymentAllowed === 'new') {
      // set an admin notification
      const newNotification = {
        id: Date.now(), // Use a unique ID based on timestamp
        title: 'New Student Created',
        subtitle: 'validate',
        description: `New student ${newStudent.ssn} name: ${newStudent.name}  balance: ${newStudent.price} courses: ${newStudent.courses.map(course => course.name).join(", ")} `,
        timestamp: new Date().toISOString(),
        avatar: 'calendar',
      };

      console.log('adding notification', newNotification);

      await addNotification(newNotification);
    }
  }

  function setViewOnlyMode() {
    setEditMode(false);
    setSelectedStudent(null);
    setNewStudent({ name: '', ssn: '', courses: [], price: 0, advance: 0, dueDate: '', users: [], paymentAllowed: 'new', transactions: [], expoPushTokens: [] });
  }



  // const deleteStudent = async (student: Student) => {
  //   const updatedStudents = students.filter((s) => s.ssn !== student.ssn);
  //   setStudents(updatedStudents);
  //   await saveFormData(updatedStudents);

  //   // if (updatedStudents.length === 0) {
  //   //   try {
  //   //     const studentRef = doc(db, 'students', student.ssn);
  //   //     await deleteDoc(studentRef);
  //   //     console.log('Student deleted and user data updated.');
  //   //   } catch (error) {
  //   //     console.error('Error deleting student:', error);
  //   //   }
  //   // }
  // };

  const notifyStatusChange = async (student: Student, newStatus: 'vacation' | 'new') => {
    try {
      const updatedStudents = students.map((s) =>
        s.ssn === student.ssn ? { ...s, paymentAllowed: newStatus } : s
      );
      setStudents(updatedStudents); 
      console.log('updated',updatedStudents)
      //await saveFormData(updatedStudents); 

      // Prepare a notification based on the status
      const notificationMessage =
        newStatus === 'vacation'
          ? `Student ${student.name} (SSN: ${student.ssn}) with a balance of $${student.price} has notified for vacation.`
          : `Student ${student.name} (SSN: ${student.ssn}) with a balance of $${student.price} has resumed regular status.`;

      const newNotification = {
        id: Date.now(),
        title: newStatus === 'vacation' ? 'Vacation Notification' : 'Vacation Over Notification',
        subtitle: newStatus === 'vacation' ? 'Vacation Request' : 'Vacation Ended',
        description: notificationMessage,
        timestamp: new Date().toISOString(),
        avatar: newStatus === 'vacation' ? 'vacation' : 'resume',
      };

      //console.log('Adding notification', newNotification);

      // Add the notification
      await addNotification(newNotification);
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };



  const renderEmptyStudentsMessage = () => {
    if (students.length === 0) {
      return (
        <Text style={{ color: colors.error, marginTop: 20 }}>
          It's mandatory to have a student and course for starting any payments.
        </Text>
      );
    }
    return null;
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      backdropComponent={(props) => <BottomSheetBackdrop {...props} />}
      onClose={closeBottomSheet}
      enableDynamicSizing={true}
      enablePanDownToClose
      keyboardBehavior="interactive"
    >
      <BottomSheetView style={[styles.bottomSheetContent, { backgroundColor: colors.background }]}>
        <BottomSheetScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={[styles.headerContainer, { backgroundColor: colors.surface }]}>
            <Text style={[styles.heading, { color: colors.primary }]}>
              Student Information
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text>Email: {userData.email}</Text>
            <Text>Name: {userData.name}</Text>
            <Text>Role: {userData.role}</Text>
          </View>

          <Button
            onPress={() => editMode ? setViewOnlyMode() : setEditMode(true)}
            mode="contained"
            style={styles.toggleEditButton}
          >
            {editMode ? 'Cancel edit' : 'Add new student'}
          </Button>

          <TextInput
            label="Phone Number"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            editable={editMode}
            style={styles.input}
            keyboardType="phone-pad"
          />

          <Portal>
            <Dialog visible={confirmDialogVisible} onDismiss={() => setConfirmDialogVisible(false)}>
              <Dialog.Title>Student Already Exists</Dialog.Title>
              <Dialog.Content>
                <Text>Student with SSN {studentToLoad?.ssn} name: {studentToLoad?.name} already exists. Would you like to load their details?</Text>
              </Dialog.Content>
              <Dialog.Actions>
                <Button onPress={() => setConfirmDialogVisible(false)}>Cancel</Button>
                <Button
                  onPress={() => {
                    if (studentToLoad) {
                      let updatedStudents: Student[] = students ? [...students, studentToLoad] : [studentToLoad];
                      connectUserAndStudent(updatedStudents)
                    }
                    setConfirmDialogVisible(false);
                  }}
                >
                  Load Details
                </Button>
              </Dialog.Actions>
            </Dialog>
          </Portal>

          {editMode && (
            <View>
              <TextInput
                label="Student Name"
                value={newStudent.name}
                onChangeText={(text) => setNewStudent({ ...newStudent, name: text })}
                editable={editMode}
                style={styles.input}
              />
              <TextInput
                label="SSN"
                value={newStudent.ssn}
                onChangeText={(text) => setNewStudent({ ...newStudent, ssn: text })}
                editable={editMode}
                style={styles.input}
                placeholder='YYMMDD-XXXX'
              />
              <Text>Courses:</Text>
              {courses.map((course) => (
                <View key={course.courseId}>
                  <TouchableOpacity
                    style={[
                      styles.selectableCourse,
                      {
                        backgroundColor: newStudent.courses.some((c) => c.courseId === course.courseId)
                          ? colors.secondary // Theme primary color for selected course
                          : colors.surface, // Theme surface color for unselected course
                      },
                    ]}
                    onPress={() => toggleCourseSelection(course)}
                  >
                    <View style={styles.courseDetails}>
                      <Text>{course.name}</Text>
                      <Text>{course.info}</Text>
                      <Text>{`$${course.price}`}</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              ))}
              <Button
                onPress={addOrUpdateStudent}
                mode="contained"
                style={styles.saveButton}
              >
                {selectedStudent ? 'Update Student' : 'Add'}
              </Button>
            </View>
          )}

          {!editMode && renderEmptyStudentsMessage()}

          {!editMode && (
            <FlatList
              data={students}
              keyExtractor={(item) => item.ssn}
              renderItem={({ item }: ListRenderItemInfo<Student>) => (
                <Card style={[styles.card, { backgroundColor: colors.surface }]}>
                  <Card.Title title={item.name} subtitle={`SSN: ${item.ssn}`} />
                  <Card.Content>
                    <Paragraph>
                      Courses: {item.courses.map((course) => course.name).join(', ')}
                      {'\n'}Price: ${item.price}
                      {'\n'}Due Date: {item.dueDate}
                    </Paragraph>
                  </Card.Content>
                  {item.paymentAllowed === 'new' && (
                    <Card.Actions style={styles.cardActions}>
                      <IconButton
                        icon="pencil"
                        onPress={() => {
                          setEditMode(true);
                          setSelectedStudent(item);
                          setNewStudent({ name: item.name, ssn: item.ssn, courses: item.courses, price: item.price, advance: item.advance, dueDate: item.dueDate, users: item.users, paymentAllowed: item.paymentAllowed, transactions: item.transactions, expoPushTokens: item.expoPushTokens });
                        }}
                        style={[styles.iconButton]}
                        iconColor={colors.primary}
                      />
                      {/* <IconButton
                        icon="delete"
                        onPress={() => deleteStudent(item)}
                        style={styles.iconButton}
                      /> */}
                      <IconButton
                        icon={item.paymentAllowed === 'new' ? 'bell' : 'bell-cancel'} 
                        onPress={() =>
                          notifyStatusChange(
                            item,
                            item.paymentAllowed === 'vacation' ? 'new' : 'vacation'
                          )
                        }
                        style={[styles.iconButton]}
                        iconColor={colors.primary} // Customize to your theme
                      />
                    </Card.Actions>
                  )}
                </Card>
              )}
            />
          )}

          <Snackbar
            visible={snackbarVisible}
            onDismiss={() => setSnackbarVisible(false)}
            action={{
              label: 'Close',
              onPress: () => setSnackbarVisible(false),
            }}
            style={[{ backgroundColor: colors.tertiary }, { marginBottom: 160 }]}
          >
            {snackbarMessage}
          </Snackbar>
        </BottomSheetScrollView>
      </BottomSheetView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  bottomSheetContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    flex: 1,
  },
  input: {
    marginVertical: 8,
  },
  selectableCourse: {
    borderWidth: 2,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginVertical: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    elevation: 5,
  },
  courseDetails: {
    flex: 1,
  },
  saveButton: {
    marginTop: 16,
  },
  toggleEditButton: {
    marginTop: 16,
  },
  userInfo: {
    marginVertical: 20,
  },
  card: {
    marginVertical: 8,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  iconButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
  },
  headerContainer: {
    paddingBottom: 16,
    alignItems: 'center',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  scrollContainer: {
    padding: 8,
    paddingBottom: 100,
  },
});

export default UserProfileManager;
