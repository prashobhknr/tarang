import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import { PropsWithChildren } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from 'react-native-paper';

type Props = PropsWithChildren<{
  title: string;
  isVisible: boolean;
  onClose: () => void;
}>;

export default function ItemPicker({ title, isVisible, children, onClose }: Props) {
  const theme = useTheme();

  return (
    <Modal animationType="slide" transparent={true} visible={isVisible}>
      <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
        <View style={[styles.titleContainer, { backgroundColor: theme.colors.primary }]}>
          <Text style={[styles.title, { color: theme.colors.onPrimary }]}>{title}</Text>
          <Pressable onPress={onClose}>
            <Ionicons name="close-circle-outline" size={24} color={theme.colors.onPrimary} />
          </Pressable>
        </View>
        <View style={styles.childrenContainer}>{children}</View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContent: {
    height: '30%',
    width: '100%',
    borderTopRightRadius: 18,
    borderTopLeftRadius: 18,
    position: 'absolute',
    bottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5, // Adds shadow for Android
  },
  titleContainer: {
    height: 60,
    borderTopRightRadius: 18,
    borderTopLeftRadius: 18,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  childrenContainer: {
    flex: 1,
    padding: 20,
  },
});
