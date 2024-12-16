import React, { useState, useEffect, useMemo, useRef } from 'react';
import { FlatList, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import {
  TextInput,
  Button,
  Card,
  Paragraph,
  IconButton,
  useTheme,
  Snackbar,
} from 'react-native-paper';
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { useUser } from '@/context/UserContext';
import { doc, collection, updateDoc, getDoc, setDoc, query, where, getDocs, deleteDoc, arrayUnion } from 'firebase/firestore';
import { db } from '@/firebase';
import { ListRenderItemInfo } from 'react-native';
import { Course, Student, CustomNotification } from '@/components/types';



type Props = {
  isVisible: boolean;
  onClose: () => void;
};

const UserProfileManager = ({ isVisible, onClose }: Props) => {
  const { userData, courses, students, setCourses, setUserData, setStudents } = useUser();
  const { colors } = useTheme();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [newStudent, setNewStudent] = useState({ name: '', ssn: '', courses: [] as Course[], price: 0, advance:0, dueDate: '', users: [] as string[], paymentAllowed: 'new', transactions:[] as []});
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const [editMode, setEditMode] = useState(false);

  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['50%', '90%'], []);

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

  const validateSSN = (ssn: string) => {
    const ssnPattern = /^(?:\d{6}-\d{4})$/;  // SSN format should be YYMMDD-XXXX
    return ssnPattern.test(ssn);
  };

  const addOrUpdateStudent = async () => {
    // Validation for SSN, phone number, and courses
    if (!validateSSN(newStudent.ssn)) {
      setSnackbarMessage('Invalid SSN format. Expected format: YYMMDD-XXXX.');
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

    // Ensure the user email is in the 'users' array
    const updatedStudent = {
      ...newStudent,
      users: newStudent.users.includes(userData.email)
        ? newStudent.users
        : [...newStudent.users, userData.email] // Add the current user's email to users list
    };

    let updatedStudents: Student[];
    if (selectedStudent) {
      if (selectedStudent.ssn !== newStudent.ssn) {
        // New SSN - we need to handle deleting the old student if no users are left
        try {
          // // Check if the old student only has the current user left and no other users
          // const oldStudentRef = doc(db, 'students', selectedStudent.ssn);
          // const oldStudentSnap = await getDoc(oldStudentRef);
          // if (oldStudentSnap.exists()) {
          //   const oldStudent = oldStudentSnap.data() as Student;
          //   // If the old student has no users left other than the current user, delete the document
          //   if (oldStudent.users.length === 1 && oldStudent.users.includes(userData.email)) {
          //     await deleteDoc(oldStudentRef); // Delete the old student document
          //     console.log('Old student deleted');
          //   }
          // }

          // Add or update the new student record
          await setDoc(doc(db, 'students', updatedStudent.ssn), updatedStudent);

        } catch (error) {
          console.error('Error adding student with new SSN:', error);
        }
        updatedStudents = students.map((student) =>
          student.ssn === selectedStudent.ssn ? updatedStudent : student
        );
      } else {
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
      // New student with a new SSN
      updatedStudents = [...students, updatedStudent];
      try {
        await setDoc(doc(db, 'students', updatedStudent.ssn), updatedStudent);
      } catch (error) {
        console.error('Error adding new student:', error);
      }
    }

    // Save updated students list to the user's data
    await saveFormData(updatedStudents);
    setStudents(updatedStudents);
    setEditMode(false);
    setSelectedStudent(null);
    setNewStudent({ name: '', ssn: '', courses: [], price: 0, advance:0, dueDate: '', users: [], paymentAllowed: 'new', transactions:[] });


    if (newStudent.paymentAllowed === 'new') {
      // set an admin notification
      const newNotification = {
        id: Date.now(), // Use a unique ID based on timestamp
        title: 'New Student Created',
        subtitle: 'validate',
        description: `New student ${newStudent.ssn} name: ${newStudent.name}  balance: ${newStudent.price} created`,
        timestamp: new Date().toISOString(),
        avatar: 'calendar',
      };

      console.log('adding notification', newNotification)

      await addNotification(newNotification);
    }

  };




  const deleteStudent = async (student: Student) => {
    const updatedStudents = students.filter((s) => s.ssn !== student.ssn);
    setStudents(updatedStudents);
    await saveFormData(updatedStudents);

    // if (updatedStudents.length === 0) {
    //   try {
    //     const studentRef = doc(db, 'students', student.ssn);
    //     await deleteDoc(studentRef);
    //     console.log('Student deleted and user data updated.');
    //   } catch (error) {
    //     console.error('Error deleting student:', error);
    //   }
    // }
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
      enableDynamicSizing={false}
      enablePanDownToClose
      keyboardBehavior="fillParent"
    >
      <BottomSheetView style={styles.bottomSheetContent}>
        <View style={styles.userInfo}>
          <Text>Email: {userData.email}</Text>
          <Text>Name: {userData.name}</Text>
          <Text>Role: {userData.role}</Text>
        </View>

        <Button
          onPress={() => setEditMode(!editMode)}
          mode="contained"
          style={styles.toggleEditButton}
        >
          {editMode ? 'Switch to View Mode' : 'Switch to Edit Mode'}
        </Button>

        <TextInput
          label="Phone Number"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          editable={editMode}
          style={styles.input}
          keyboardType="phone-pad"
        />

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
            />
            <Text>Courses:</Text>
            {courses.map((course) => (
              <View key={course.courseId}>
                <TouchableOpacity
                  style={[
                    styles.selectableCourse,
                    newStudent.courses.some((c) => c.courseId === course.courseId) && styles.selectedCourse,
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
              {selectedStudent ? 'Update Student' : 'Add Student'}
            </Button>
          </View>
        )}

        {renderEmptyStudentsMessage()}

        <FlatList
          data={students}
          keyExtractor={(item) => item.ssn}
          renderItem={({ item }: ListRenderItemInfo<Student>) => (
            <Card style={styles.card}>
              <Card.Title title={item.name} subtitle={`SSN: ${item.ssn}`} />
              <Card.Content>
                <Paragraph>
                  Courses: {item.courses.map((course) => course.name).join(', ')}
                  {'\n'}Price: ${item.price}
                  {'\n'}Due Date: {item.dueDate}
                </Paragraph>
              </Card.Content>
              <Card.Actions style={styles.cardActions}>
                <IconButton
                  icon="pencil"
                  onPress={() => {
                    setEditMode(true);
                    setSelectedStudent(item);
                    setNewStudent({ name: item.name, ssn: item.ssn, courses: item.courses, price: item.price, advance:item.advance, dueDate: item.dueDate, users: item.users, paymentAllowed: item.paymentAllowed , transactions:item.transactions});
                  }}
                  style={styles.iconButton}
                />
                <IconButton
                  icon="delete"
                  onPress={() => deleteStudent(item)}
                  style={styles.iconButton}
                />
              </Card.Actions>
            </Card>
          )}
        />

        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          action={{
            label: 'Close',
            onPress: () => setSnackbarVisible(false),
          }}
          style={{ backgroundColor: colors.error }}
        >
          {snackbarMessage}
        </Snackbar>
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
    backgroundColor: '#f9f9f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    elevation: 5,
  },
  selectedCourse: {
    backgroundColor: '#d3ffd3',
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
});

export default UserProfileManager;
