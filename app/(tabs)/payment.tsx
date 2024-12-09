import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import Button from '@/components/Button'; // Import your Button component
import { useUser } from '@/context/UserContext';
import { Alert } from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';


export default function PaymentScreen() {
    const router = useRouter();
    const { userData, userRole, studentEmail } = useUser();
    const { setUserData, setUserRole, setStudentEmail } = useUser();
    const [isLoading, setIsLoading] = useState(false);


    // Fetch the current user's role and connected student, if not already fetched
    const fetchUserRole = async () => {
        try {
            if (userData?.email) {
                console.log('fetching user ', userData?.email)
                const userDocRef = doc(db, 'users', userData.email);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    setUserRole(userData.role || '');
                    setStudentEmail(userData.student || '');
                    setUserData(userData)
                    console.log('Got user with profile', userData)
                }
            }
        } catch (error) {
            console.error('Error fetching user role:', error);
        }
    };

    const handlePayment = async () => {
        if (isLoading) return;
        setIsLoading(true);
        const paymentRequestData = {
            amount: userData?.balance || 0,
            message: 'Tarang payment',
            callbackIdentifier: userData?.callbackId || ''
        };

        try {
            console.log('Initiating payment with data:', paymentRequestData);

            const response = await fetch(
                'https://us-central1-tarang-app.cloudfunctions.net/createPaymentRequest',
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
                console.log('Payment successful:', data);
                setIsLoading(false);
                Alert.alert(
                    'Payment Successful',
                    `Your payment was successfully initiated.`
                );


                setTimeout(async () => {
                    console.log('Waiting for 5 seconds before fetching user role...');
                    await fetchUserRole(); // Call your fetchUserRole method after 5 seconds
                    setIsLoading(false);
                }, 5000);
            } else {
                const errorData = await response.json();
                console.error('Payment failed:', errorData);
                Alert.alert(
                    'Payment Failed',
                    `There was an error processing your payment. Please try again.`
                );
                setIsLoading(false);
            }
        } catch (error) {
            console.error('Error initiating payment:', error);
            Alert.alert(
                'Error',
                'An unexpected error occurred while processing your payment. Please try again later.'
            );
        }
    };

    // If user is not a parent or not connected to a student, show an error
    if (userRole !== 'parent' || !studentEmail) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>
                    You must be a parent and connected to a student to proceed.
                </Text>
                <Button
                    label="Go to Profile Setup"
                    theme="primary"
                    onPress={() => router.push("/(tabs)/profile")}
                    icon="user"
                />
            </View>
        );
    }

    // Safely convert balance to a number and ensure it's formatted
    const balance = userData?.balance ? parseFloat(userData.balance) : 0;
    const formattedBalance = balance.toFixed(2); // Formatting the balance with 2 decimal places

    // Extract transactions from userData
    const transactions = userData?.transactions || [];

    return (
        <View style={styles.container}>
            <View style={styles.balanceContainer}>
                <Text style={styles.balanceText}>Balance</Text>
                <Text style={styles.balanceAmount}>${formattedBalance}</Text>
            </View>
            <Button
                label="Pay with Swish"
                theme="swish"
                onPress={handlePayment}
                isLoading={isLoading}
            />

            {transactions?.length > 0 && (
                <Text style={styles.transactionHeader}>Transaction History</Text>
            )}
            {transactions?.length > 0 && (
                <FlatList
                    data={transactions}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.transactionItem}>
                            <Text style={styles.transactionDate}>{new Date(item.datePaid).toLocaleDateString()}</Text>
                            <Text style={styles.transactionAmount}>${item.amount}</Text>
                            <Text
                                style={[
                                    styles.transactionStatus,
                                    item.status === 'success' ? styles.success : styles.failed,
                                ]}
                            >
                                {item.status}
                            </Text>
                        </View>
                    )}
                    ListEmptyComponent={
                        <Text style={styles.noTransactions}>No transactions available</Text>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1, // Ensure the container takes up the full screen
        justifyContent: 'center', // Center content vertically
        alignItems: 'center', // Center content horizontally
        backgroundColor: '#f1f1f1', // Optional: Set a background color
        padding: 10, // Optional: Add padding for spacing
        marginTop: '15%',
    },
    errorText: {
        fontSize: 16,
        color: '#ff6347',
        textAlign: 'center',
        marginBottom: 20,
    },
    balanceContainer: {
        backgroundColor: '#fff',
        borderRadius: 100,
        width: 200,
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
        elevation: 5,
        marginBottom: 40,
        alignSelf: 'center',
    },
    balanceText: {
        fontSize: 20,
        color: '#777',
    },
    balanceAmount: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#333',
    },
    transactionHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 20,
        color: '#333',
    },
    transactionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 8,
        marginVertical: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
        width: '90%',
        alignSelf: 'center',
    },
    transactionDate: {
        padding: 10,
        fontSize: 14,
        color: '#555',
    },
    transactionAmount: {
        padding: 10,
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
    },
    transactionStatus: {
        padding: 10,
        fontSize: 14,
        fontWeight: 'bold',
    },
    success: {
        color: 'green',
    },
    failed: {
        color: 'red',
    },
    noTransactions: {
        textAlign: 'center',
        color: '#777',
        marginTop: 20,
    },
});
