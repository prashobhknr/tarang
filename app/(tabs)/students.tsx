import React, { useState, useEffect } from 'react';
import { FlatList, StyleSheet, View, TouchableOpacity, StatusBar, Platform } from 'react-native';
import {
    TextInput,
    Button,
    Card,
    Paragraph,
    IconButton,
    useTheme,
    Snackbar,
    Text,
    Searchbar, // Import the Searchbar
} from 'react-native-paper';
import { collection, getDocs, setDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { Student, Course } from '@/components/types';
import { useUser } from '@/context/UserContext';

const StudentsPage = () => {
    const { colors } = useTheme();
    const { courses, students, setStudents } = useUser();
    const [newStudent, setNewStudent] = useState<Student>({
        name: '',
        ssn: '',
        courses: [],
        price: 0,
        advance: 0,
        dueDate: '',
        users: [],
        paymentAllowed: 'new',
        transactions: [],
        expoPushTokens: [],
    });
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState(''); // State for search query

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const studentsRef = collection(db, 'students');
                const querySnapshot = await getDocs(studentsRef);
                const fetchedStudents: Student[] = querySnapshot.docs.map((doc) => doc.data() as Student);
                setStudents(fetchedStudents);
            } catch (error) {
                console.error('Error fetching students:', error);
                setSnackbarMessage('Error fetching students.');
                setSnackbarVisible(true);
            }
        };

        fetchStudents();
    }, []);

    const toggleCourseSelection = (course: Course) => {
        const isSelected = newStudent.courses.some((c) => c.courseId === course.courseId);
        const updatedCourses = isSelected
            ? newStudent.courses.filter((c) => c.courseId !== course.courseId)
            : [...newStudent.courses, course];

        const { totalPrice, maxDueDate } = calculateCourseSummary(updatedCourses);
        setNewStudent({
            ...newStudent,
            courses: updatedCourses,
            price: totalPrice,
            dueDate: maxDueDate,
        });
    };

    const calculateCourseSummary = (courses: Course[]) => {
        const totalPrice = courses.reduce((acc, course) => acc + course.price, 0);
        const maxDueDate = courses.reduce(
            (latest, course) => (new Date(course.dueDate) > new Date(latest) ? course.dueDate : latest),
            '1970-01-01'
        );
        return { totalPrice, maxDueDate };
    };

    const addOrUpdateStudent = async () => {
        if (!newStudent.ssn || !newStudent.name || !newStudent.courses.length) {
            setSnackbarMessage('Name, SSN, and at least one course are required.');
            setSnackbarVisible(true);
            return;
        }

        let updatedStudents: Student[] = [];
        const studentExists = students.some((student) => student.ssn === newStudent.ssn);

        try {
            if (selectedStudent && studentExists) {
                updatedStudents = students.map((student) =>
                    student.ssn === selectedStudent.ssn ? newStudent : student
                );
                await setDoc(doc(db, 'students', selectedStudent.ssn), newStudent, { merge: true });
            } else if (!studentExists) {
                updatedStudents = [...students, newStudent];
                await setDoc(doc(db, 'students', newStudent.ssn), newStudent);
            }

            setStudents(updatedStudents);
            setViewOnlyMode();
        } catch (error) {
            console.error('Error adding/updating student:', error);
            setSnackbarMessage('Error saving student.');
            setSnackbarVisible(true);
        }
    };

    function setViewOnlyMode() {
        setEditMode(false);
        setSelectedStudent(null);
        setNewStudent({ name: '', ssn: '', courses: [], price: 0, advance: 0, dueDate: '', users: [], paymentAllowed: 'new', transactions: [], expoPushTokens: [] });
    }

    const deleteStudent = async (student: Student) => {
        const updatedStudents = students.filter((s) => s.ssn !== student.ssn);
        try {
            await setDoc(doc(db, 'students', student.ssn), { deleted: true }, { merge: true });
            setStudents(updatedStudents);
        } catch (error) {
            console.error('Error deleting student:', error);
        }
    };

    const renderCourseItem = (course: Course) => (
        <TouchableOpacity
            key={course.courseId}
            onPress={() => toggleCourseSelection(course)}
            style={styles.courseItem}
        >
            <Text
                style={[
                    styles.courseName,
                    newStudent.courses.some((c) => c.courseId === course.courseId) && styles.selectedCourse,
                ]}
            >
                {course.name}
            </Text>
            {newStudent.courses.some((c) => c.courseId === course.courseId) && (
                <View style={styles.courseDetails}>
                    <Text>Price: ${course.price}</Text>
                    <Text>Due Date: {course.dueDate}</Text>
                    <Text>Info: {course.info}</Text>
                </View>
            )}
        </TouchableOpacity>
    );

    const renderStudentItem = (item: Student) => (
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
                        setNewStudent({ ...item });
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
    );

    const filteredStudents = students.filter((student) =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.ssn.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <View style={[styles.container, {
              paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : '15%',
              backgroundColor: colors.background
            }]}>
            <Text style={styles.heading}>Manage Students</Text>

            {!editMode && (
            <Searchbar
                placeholder="Search for student"
                onChangeText={setSearchQuery}
                value={searchQuery}
                style={styles.searchbar}
            />
            )}

            <Button
                onPress={() => editMode ? setViewOnlyMode() : setEditMode(true)}
                mode="contained"
                style={styles.toggleEditButton}
            >
                {editMode ? 'Cancel edit' : 'Add new student'}
            </Button>

            {editMode && (
                <View>
                    <TextInput
                        label="Student Name"
                        value={newStudent.name}
                        onChangeText={(text) => setNewStudent({ ...newStudent, name: text })}
                        style={styles.input}
                    />
                    <TextInput
                        label="SSN"
                        value={newStudent.ssn}
                        onChangeText={(text) => setNewStudent({ ...newStudent, ssn: text })}
                        style={styles.input}
                    />

                    <Text style={styles.courseSelectionHeading}>Select Courses:</Text>
                    <FlatList
                        data={courses}
                        keyExtractor={(item) => item.courseId}
                        renderItem={({ item }) => renderCourseItem(item)}
                        extraData={newStudent.courses}
                    />

                    <Button
                        onPress={addOrUpdateStudent}
                        mode="contained"
                        style={styles.saveButton}
                    >
                        {selectedStudent ? 'Update Student' : 'Add Student'}
                    </Button>
                </View>
            )}

            {!editMode && (
                <FlatList
                    data={filteredStudents} // Use filtered students list
                    keyExtractor={(item) => item.ssn}
                    renderItem={({ item }) => renderStudentItem(item)}
                />
            )}

            <Snackbar
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                action={{
                    label: 'Close',
                    onPress: () => setSnackbarVisible(false),
                }}
            >
                {snackbarMessage}
            </Snackbar>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
    heading: { fontSize: 24, fontWeight: 'bold' },
    toggleEditButton: { marginTop: 20 },
    input: { marginVertical: 8 },
    saveButton: { marginTop: 20 },
    card: { marginVertical: 10 },
    cardActions: { justifyContent: 'flex-end' },
    iconButton: { marginHorizontal: 5 },
    courseSelectionHeading: { fontSize: 18, fontWeight: 'bold', marginVertical: 8 },
    courseItem: { padding: 8, backgroundColor: '#f0f0f0', marginBottom: 4 },
    courseName: { fontSize: 16 },
    selectedCourse: { color: 'green', fontWeight: 'bold' },
    courseDetails: {
        paddingLeft: 10,
        marginTop: 5,
        borderTopWidth: 1,
        borderColor: '#ccc',
    },
    searchbar: { marginBottom: 16 }, // Add some style to search bar
});

export default StudentsPage;
