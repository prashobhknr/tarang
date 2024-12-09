import { StyleSheet, View, Pressable, Text, Image, ActivityIndicator } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

type Props = {
  label: string;
  theme?: 'primary' | 'secondary' | 'swish'; // Added 'swish' theme
  icon?: keyof typeof FontAwesome.glyphMap; // Restrict icon to FontAwesome valid icon names
  onPress?: () => void;
  disabled?: boolean; // Prop to disable the button
  isLoading?: boolean; // Prop to show loading spinner
};

export default function Button({ label, theme, icon, onPress, disabled, isLoading }: Props) {
  // Determine styles based on theme
  const buttonStyle =
    theme === 'primary'
      ? styles.primaryButton
      : theme === 'secondary'
      ? styles.secondaryButton
      : theme === 'swish'
      ? styles.swishButton
      : styles.defaultButton;

  const textStyle =
    theme === 'primary'
      ? styles.primaryButtonLabel
      : theme === 'secondary'
      ? styles.secondaryButtonLabel
      : theme === 'swish'
      ? styles.swishButtonLabel
      : styles.defaultButtonLabel;

  const iconColor = theme === 'primary' || theme === 'swish' ? '#25292e' : '#fff';

  return (
    <View style={styles.buttonContainer}>
      <Pressable
        style={[styles.button, buttonStyle, disabled || isLoading ? styles.disabledButton : null]} // Disable styles
        onPress={onPress}
        disabled={disabled || isLoading} // Disable button when loading or manually disabled
      >
        {/* For Swish theme, include the Swish logo */}
        {isLoading ? (
          <ActivityIndicator size="small" color="#5AC9FA" />
        ) : theme === 'swish' ? (
          <Image source={require('@/assets/images/swish.png')} style={styles.imageIcon} resizeMode="contain" />
        ) : (
          icon && <FontAwesome name={icon} size={20} color={iconColor} style={styles.buttonIcon} />
        )}
        <Text style={[styles.buttonLabel, textStyle]}>{isLoading ? 'Processing Payment...' : label}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    width: '80%', // Make the button responsive with percentage width
    marginVertical: 10,
    alignItems: 'center',
  },
  button: {
    borderRadius: 18,
    width: '100%',
    height: 60, // Set height to make it more compact
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingHorizontal: 15, // Add some padding to the sides
    elevation: 5, // Add subtle shadow for a more professional look
  },
  buttonIcon: {
    marginRight: 12, // More space between the icon and the label
  },
  imageIcon: {
    width: 30, // Set image icon size
    height: 30,
    marginRight: 12,
  },
  buttonLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: '#ffd33d', // Yellow for primary button
  },
  secondaryButton: {
    backgroundColor: '#25292e', // Dark background for secondary button
  },
  swishButton: {
    backgroundColor: '#ffffff', // White background for Swish
    borderWidth: 1, // Optional: Add a subtle border
    borderColor: '#5AC9FA', // Match Swish branding colors
  },
  defaultButton: {
    backgroundColor: '#ddd', // Light gray for default button
  },
  primaryButtonLabel: {
    color: '#25292e', // Dark color for text on primary button
  },
  secondaryButtonLabel: {
    color: '#fff', // White color for text on secondary button
  },
  swishButtonLabel: {
    color: '#5AC9FA', // Match Swish branding colors for text
  },
  defaultButtonLabel: {
    color: '#25292e', // Dark text color for the default button
  },
  disabledButton: {
    backgroundColor: '#ccc', // Disabled button has a light gray background
  },
});
