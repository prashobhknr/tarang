import { StyleSheet, View, Pressable, Text } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

type Props = {
  label: string;
  theme?: 'primary' | 'secondary'; // Added secondary theme for more options
  icon?: keyof typeof FontAwesome.glyphMap; // Restrict icon to FontAwesome valid icon names
  onPress?: () => void;
};

export default function Button({ label, theme, icon, onPress }: Props) {
  const buttonStyle = theme === 'primary' ? styles.primaryButton : theme === 'secondary' ? styles.secondaryButton : styles.defaultButton;
  const textStyle = theme === 'primary' ? styles.primaryButtonLabel : theme === 'secondary' ? styles.secondaryButtonLabel : styles.defaultButtonLabel;
  const iconColor = theme === 'primary' ? '#25292e' : '#fff';

  return (
    <View style={styles.buttonContainer}>
      <Pressable style={[styles.button, buttonStyle]} onPress={onPress}>
        {icon && <FontAwesome name={icon} size={20} color={iconColor} style={styles.buttonIcon} />}
        <Text style={[styles.buttonLabel, textStyle]}>{label}</Text>
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
  defaultButton: {
    backgroundColor: '#ddd', // Light gray for default button
  },
  primaryButtonLabel: {
    color: '#25292e', // Dark color for text on primary button
  },
  secondaryButtonLabel: {
    color: '#fff', // White color for text on secondary button
  },
  defaultButtonLabel: {
    color: '#25292e', // Dark text color for the default button
  },
});
