import React, { useEffect, useState, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, StatusBar, Platform, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme, IconButton, Chip, Button as PaperButton, Snackbar } from 'react-native-paper'; // Import useTheme for dynamic theming
import Button from '@/components/Button'; // Import your Button component
import { useUser } from '@/context/UserContext';
import { doc, getDocs, collection, query, where, arrayUnion, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { Student, CustomNotification } from '@/components/types';
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';

export default function PaymentScreen() {
  const router = useRouter();
  const { userData, students } = useUser();
  const { setStudents } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const { colors } = useTheme(); // Access theme colors dynamically
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const snapPoints = useMemo(() => ['50%', '90%'], []);

  useEffect(() => {
    if (!userData?.email) {
      console.error('User email is missing. Cannot fetch students.');
      return;
    }
    fetchStudents();
  }, [userData]);


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
        if (selectedStudent) {

          setSelectedStudent(fetchedStudents.find(s => s.ssn === selectedStudent.ssn) || null);
        }
        else if (fetchedStudents.length > 0) {
          setSelectedStudent(fetchedStudents[0]);
        }
      } else {
        console.log('No students found for these SSNs.');
        setStudents([]);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
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


  const handlePayment = async () => {
    if (isLoading) return;
    setIsLoading(true);
    const paymentRequestData = {
      amount: selectedStudent?.price || 0,
      message: selectedStudent?.ssn,
      callbackIdentifier: userData?.callbackId || '',
    };

    try {
      const response = await fetch(
        'https://createpaymentrequest-znczgaf7da-uc.a.run.app',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(paymentRequestData),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setIsLoading(false);
        setSnackbarMessage('Your payment was successfully initiated.');
        setSnackbarVisible(true);
        setTimeout(async () => {
          fetchStudents();
        }, 10000);

        // set an admin notification
        const newNotification = {
          id: Date.now(), // Use a unique ID based on timestamp
          title: 'New Payment ',
          subtitle: 'payment',
          description: `New payment amount ${paymentRequestData.amount} for student: ${selectedStudent?.name}  from: ${userData.name}`,
          timestamp: new Date().toISOString(),
          avatar: 'cash',
        };

        console.log('adding notification', newNotification)
        await addNotification(newNotification);

      } else {
        const errorData = await response.json();
        setSnackbarMessage('There was an error processing your payment. Please try again.');
        setSnackbarVisible(true);
        setIsLoading(false);
      }
    } catch (error) {
      setSnackbarMessage('An unexpected error occurred while processing your payment. Please try again later.');
      setSnackbarVisible(true);
      setIsLoading(false);
    }
  };

  if (students.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.loginPromptText, { color: colors.onBackground }]}>
          You must connect a student in profile for start payment.
        </Text>
        <PaperButton
          mode="contained"
          onPress={() => router.push('/(tabs)/profile')}
          style={{ borderRadius: 5 }}
          icon="account"
        >
          Go to profile
        </PaperButton>

      </View>
    );
  }

  const handleOpenSelector = () => {
    bottomSheetRef.current?.snapToIndex(0);;
  };

  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student);
    bottomSheetRef.current?.close();
  };

  const formattedBalance = selectedStudent ? (selectedStudent.price - selectedStudent.advance) : '0';
  const formattedDueDate = selectedStudent?.dueDate
    ? new Date(selectedStudent.dueDate).toLocaleDateString()
    : "Not available";
  const transactions = selectedStudent ? selectedStudent.transactions : [];

  return (
    <View style={[styles.container, {
      paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : '15%',
      backgroundColor: colors.background
    }]}>
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={Snackbar.DURATION_SHORT}
        style={[{ backgroundColor: colors.tertiary }, { marginBottom: 160 }]} 
      >
        {snackbarMessage}
      </Snackbar>
      <View
        style={[
          styles.balanceContainer,
          { backgroundColor: colors.surface, shadowColor: colors.primary },
        ]}
      >
        <Text style={[styles.balanceText, { color: colors.onBackground }]}>Balance</Text>
        <Text style={[styles.balanceAmount, { color: colors.onBackground }]}>
          {formattedBalance} SEK
        </Text>
      </View>
      <Button label="Pay with Swish" theme="swish" onPress={handlePayment} isLoading={isLoading}
        disabled={!selectedStudent || selectedStudent.price === 0} />

      {/* Add Selected Student Label */}
      <View style={styles.selectedStudentContainer}>
        <Chip
          icon="account"
          style={[
            styles.studentChip,
            {
              backgroundColor: colors.primaryContainer,
            },
          ]}
          textStyle={{
            color: colors.onPrimaryContainer,
          }}
        >
          paying for - {selectedStudent ? selectedStudent.name : "Select a student"}
        </Chip>

        {students.length > 1 && (
          <IconButton
            icon="pencil"
            size={20}
            onPress={() => handleOpenSelector()}
            style={styles.editButton}
            iconColor={colors.primary}
          />
        )}
      </View>

      {/* Professional Due Date Label */}
      {formattedDueDate !== "Not available" && (
        <View style={styles.selectedStudentContainer}>
          <Chip
            style={[
              styles.studentChip,
              { backgroundColor: colors.primaryContainer },
            ]}
            textStyle={{
              color: colors.onPrimaryContainer,
              fontWeight: "600",
            }}
            icon="calendar-clock"
          >
            Due Date: {formattedDueDate}
          </Chip>
        </View>
      )}



      {transactions?.length > 0 && (
        <Text style={[styles.transactionHeader, { color: colors.onBackground }]}>
          Transaction History
        </Text>
      )}
      {transactions?.length > 0 && (
        <FlatList
          data={transactions}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={[styles.transactionItem, { backgroundColor: colors.surface }]}>
              <Text style={[styles.transactionDate, { color: colors.onSurfaceVariant }]}>
                {new Date(item.datePaid).toLocaleDateString()}
              </Text>
              <Text style={[styles.transactionAmount, { color: colors.onBackground }]}>
                ${item.amount}
              </Text>
              <Text
                style={[
                  styles.transactionStatus,
                  item.status === 'success' ? { color: '#4CAF50' } : { color: colors.error },
                ]}
              >
                {item.status}
              </Text>
            </View>
          )}
          ListEmptyComponent={
            <Text style={[styles.noTransactions, { color: colors.onSurfaceVariant }]}>
              No transactions available
            </Text>
          }
        />
      )}

      <BottomSheet ref={bottomSheetRef}
        snapPoints={snapPoints}
        enableDynamicSizing={true}
        enablePanDownToClose
        index={-1}
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
            pressBehavior="close"
          />
        )}
      >
        <BottomSheetView>
          <FlatList
            data={students}
            keyExtractor={(item) => item.ssn}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.studentItem, { backgroundColor: colors.surface }]}
                onPress={() => handleStudentSelect(item)}
              >
                <Text style={{ color: colors.onBackground }}>{item.name}</Text>
                <Text style={{ color: colors.onSurfaceVariant }}>{item.ssn}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={{ color: colors.onSurfaceVariant, textAlign: 'center', marginTop: 10 }}>
                No students available
              </Text>
            }
          />
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  loginPromptText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  balanceContainer: {
    borderRadius: 100,
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
    marginBottom: 40,
    alignSelf: 'center',
  },
  balanceText: {
    fontSize: 20,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  transactionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 20,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 8,
    marginVertical: 10,
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    width: '90%',
    alignSelf: 'center',
  },
  transactionDate: {
    fontSize: 14,
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  transactionStatus: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  noTransactions: {
    textAlign: 'center',
    marginTop: 20,
  },
  selectedStudentContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 10,
  },
  studentChip: {
    flex: 1,
    borderRadius: 24,
    marginRight: 8,
  },
  editButton: {
    margin: 0,
    padding: 0,
  },
  studentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderRadius: 8,
    marginVertical: 5,
  },
});
