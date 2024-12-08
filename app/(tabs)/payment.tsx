import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Button from '@/components/Button'; // Import your Button component
import { useUser } from '@/context/UserContext';

export default function PaymentScreen() {
    const router = useRouter();
    const { userData, userRole, studentEmail } = useUser();

    const handlePayment = () => {
        // Implement Swish payment integration here
        console.log('Proceeding with Swish payment...');
    };

    // If user is not a parent or not connected to a student, show an error
    if (userRole !== 'parent' || !studentEmail) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>
                    You must be a parent and connected to a student to proceed.
                </Text>
                {/* Using the Button component */}
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

    return (
        <View style={styles.container}>
            <View style={styles.balanceContainer}>
                <Text style={styles.balanceText}>Balance</Text>
                <Text style={styles.balanceAmount}>${formattedBalance}</Text>
            </View>
            {/* Using the Button component for Swish payment */}
            <Button
                label="Pay with Swish at Tarang"
                theme="primary"
                onPress={handlePayment}
                icon="credit-card" // Example icon for payment button
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f1f1f1',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
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
});
