import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from 'react-native-paper'; // Import useTheme for dynamic theming
import Button from '@/components/Button'; // Import your Button component
import { useUser } from '@/context/UserContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';

export default function PaymentScreen() {
  const router = useRouter();
  const { userData } = useUser();
  const { setUserData, } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const { colors } = useTheme(); // Access theme colors dynamically

  const fetchUserRole = async () => {
    try {
      if (userData?.email) {
        const userDocRef = doc(db, 'users', userData.email);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserData(userData);
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
        Alert.alert('Payment Successful', `Your payment was successfully initiated.`);

        setTimeout(async () => {
          await fetchUserRole();
          setIsLoading(false);
        }, 5000);
      } else {
        const errorData = await response.json();
        Alert.alert('Payment Failed', `There was an error processing your payment. Please try again.`);
        setIsLoading(false);
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred while processing your payment. Please try again later.');
      setIsLoading(false);
    }
  };

  // if (userRole !== 'parent' || !studentEmail) {
  //   return (
  //     <View style={[styles.container, { backgroundColor: colors.background }]}>
  //       <Text style={[styles.errorText, { color: colors.error }]}>
  //         You must be a parent and connected to a student to proceed.
  //       </Text>
  //       <Button
  //         label="Go to Profile Setup"
  //         theme="primary"
  //         onPress={() => router.push('/(tabs)/profile')}
  //         iconName="account"
  //       />
  //     </View>
  //   );
  // }

  const balance = userData?.balance ? parseFloat(userData.balance) : 0;
  const formattedBalance = balance.toFixed(2);

  const transactions = userData?.transactions || [];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.balanceContainer,
          { backgroundColor: colors.surface, shadowColor: colors.primary },
        ]}
      >
        <Text style={[styles.balanceText, { color: colors.onBackground }]}>Balance</Text>
        <Text style={[styles.balanceAmount, { color: colors.onBackground }]}>
          ${formattedBalance}
        </Text>
      </View>
      <Button label="Pay with Swish" theme="swish" onPress={handlePayment} isLoading={isLoading} />

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    marginTop: '15%',
  },
  errorText: {
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
});
