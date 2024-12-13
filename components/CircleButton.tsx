import React from 'react';
import { StyleSheet, Platform } from 'react-native';
import { TouchableRipple, useTheme } from 'react-native-paper';
import FontAwesome from '@expo/vector-icons/FontAwesome';

type Props = {
  isActive: boolean; // New prop to control the button state
  onPress: () => void;
};

export default function CircleButton({ isActive, onPress }: Props) {
  const theme = useTheme();

  return (
    <TouchableRipple
      style={[
        styles.circleButton,
        {
          backgroundColor: isActive ? theme.colors.secondary : theme.colors.surface,
          borderColor: theme.colors.primary,
          shadowColor: theme.colors.shadow,
        },
      ]}
      rippleColor={theme.colors.primary}
      onPress={onPress}
      borderless={false}
    >
      <FontAwesome
        name="edit"
        size={24}
        color={isActive ? theme.colors.onSecondary : theme.colors.primary}
      />
    </TouchableRipple>
  );
}

const styles = StyleSheet.create({
  circleButton: {
    marginTop: 5,
    width: 56, // Material Design size for FABs
    height: 56,
    borderRadius: 28, // Circular shape
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2, // Border width for visibility in light themes
    elevation: 4, // Android elevation
    shadowOffset: { width: 0, height: 2 }, // iOS shadow offset
    shadowOpacity: 0.2, // iOS shadow opacity
    shadowRadius: 4, // iOS shadow radius
    ...Platform.select({
      android: {
        elevation: 4, // Visible shadow for Android
      },
      ios: {
        shadowColor: '#000', // Default shadow color for iOS
      },
    }),
  },
});
