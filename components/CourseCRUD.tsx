import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  ListRenderItemInfo,
  Text
} from 'react-native';
import {
  TextInput,
  Button,
  Card,
  IconButton,
  Paragraph,
  useTheme,
  FAB,
} from 'react-native-paper';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import { Course } from '@/components/types';
import { useUser } from '@/context/UserContext';

type Props = {
  isVisible: boolean;
  onClose: () => void;
};

export default function CourseCRUD({ isVisible, onClose }: Props) {
  const { colors, fonts } = useTheme();
  const { courses, setCourses } = useUser();
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [newCourse, setNewCourse] = useState<Omit<Course, 'courseId'>>({
    name: '',
    price: 0,
    info: '',
    dueDate: new Date().toISOString().split('T')[0], // Default today's date in YYYY-MM-DD format
  });
  const [showForm, setShowForm] = useState(false);

  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["50%", "90%"], []);
  const docRef = doc(db, 'users', 'catalogue'); // Reference Firestore document

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

  const handleClose = useCallback(() => {
    setShowForm(false)
    onClose();
  }, []);

  const resetForm = () => {
    setSelectedCourse(null);
    setNewCourse({ name: '', price: 0, info: '', dueDate: new Date().toISOString().split('T')[0] });
    setShowForm(true);
  };

  const addCourse = async () => {
    try {
      const course: Course = {
        courseId: Date.now().toString(),
        ...newCourse,
        price: Number(newCourse.price)
      };

      await updateDoc(docRef, {
        courses: arrayUnion(course),
      });
      setCourses((prev) => [...prev, { ...course }]);
      setShowForm(false);
      // closeBottomSheet();
    } catch (error) {
      console.error('Error adding course:', error);
    }
  };

  const updateCourse = async () => {
    try {
      const updatedCourses = courses.map((course) =>
        course.courseId === selectedCourse?.courseId
          ? {
            ...selectedCourse,
            ...newCourse,
            price: Number(newCourse.price),
          }
          : course
      );

      await updateDoc(docRef, { courses: updatedCourses });
      setCourses(
        updatedCourses.map((course) => ({
          ...course
        }))
      );
      setShowForm(false);
      // closeBottomSheet();
    } catch (error) {
      console.error('Error updating course:', error);
    }
  };

  const deleteCourse = async (course: Course) => {
    try {
      await updateDoc(docRef, {
        courses: arrayRemove(course),
      });
      setCourses((prev) => prev.filter((c) => c.courseId !== course.courseId));
    } catch (error) {
      console.error('Error deleting course:', error);
    }
  };

  const renderCourse = ({ item }: ListRenderItemInfo<Course>) => (
    <Card style={styles.card}>
      <Card.Title
        title={item.name}
        subtitle={`$${item.price}`}
        titleStyle={[{ color: colors.text }, fonts.titleMedium]}
      />
      <Card.Content>
        <Paragraph style={{ color: colors.muted }}>Info: {String(item.info || '')}</Paragraph>
        <Paragraph style={{ color: colors.muted }}>Due Date: {String(item.dueDate || '')}</Paragraph>
      </Card.Content>
      <Card.Actions>
        <IconButton
          icon="pencil"
          iconColor={colors.primary}
          onPress={() => {
            setSelectedCourse(item);
            setNewCourse({
              name: item.name,
              price: item.price,
              info: item.info,
              dueDate: item.dueDate,
            });
            setShowForm(true);
            openBottomSheet();
          }}
        />
        <IconButton
          icon="delete"
          iconColor={colors.error}
          onPress={() => deleteCourse(item)}
        />
      </Card.Actions>
    </Card>
  );

  return (
    <>

      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        enablePanDownToClose
        onClose={handleClose}
        keyboardBehavior="fillParent"
        backdropComponent={(props) => <BottomSheetBackdrop {...props} />}
      >
        <BottomSheetView style={styles.bottomSheetContent}>
          {!showForm ? (<><FlatList
            data={courses}
            keyExtractor={(item) => item.courseId}
            renderItem={renderCourse}
          />
            <FAB
              icon="plus"
              onPress={() => {
                resetForm();
              }}
              style={[styles.fab, { backgroundColor: colors.primary }]}
            /> </>) :
            (<>
              <TextInput
                label="Course Name"
                value={newCourse.name}
                onChangeText={(text) => setNewCourse({ ...newCourse, name: text })}
                style={styles.input}
              />
              <TextInput
                label="Price"
                keyboardType="numeric"
                value={newCourse.price.toString()}
                onChangeText={(text) => setNewCourse({ ...newCourse, price: Number(text) })}
                style={styles.input}
              />
              <TextInput
                label="Info"
                value={newCourse.info}
                onChangeText={(text) => setNewCourse({ ...newCourse, info: text })}
                style={styles.input}
              />
              <TextInput
                label="Due Date"
                placeholder="YYYY-MM-DD"
                value={newCourse.dueDate}
                onChangeText={(text) => setNewCourse({ ...newCourse, dueDate: text })}
                style={styles.input}
              />
              <Button
                mode="contained"
                onPress={selectedCourse ? updateCourse : addCourse}
                style={[styles.saveButton, { backgroundColor: colors.success }]}
              >
                {String(selectedCourse ? 'Update Course' : 'Add Course')}
              </Button>
            </>)}
        </BottomSheetView>
      </BottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'grey',
  },
  contentContainer: {
    flex: 1,
    padding: 36,
    alignItems: 'center',
  },
  openButton: {
    margin: 16,
    borderRadius: 8,
  },
  card: {
    marginBottom: 8,
  },
  bottomSheetContent: {
    flex: 1,
    padding: 16,
  },
  input: {
    marginBottom: 16,
  },
  saveButton: {
    marginTop: 16,
    borderRadius: 8,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
});
