import { View, Pressable, StyleSheet } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

type Props = {
  onPress: () => void;
};

export default function CircleButton({ onPress }: Props) {
  return (
    <View style={styles.circleButtonContainer}>
      <Pressable style={styles.circleButton} onPress={onPress}>
      <FontAwesome name="edit" size={24} color="black" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  circleButtonContainer: {
    marginTop:5,
    width: 50,
    height: 50,
    borderWidth: 3,
    borderColor: '#ffd33d', // Golden border
    borderRadius: 25,
    padding: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
    backgroundColor: '#f0f0f0', // Light gray shaded background
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // Adds shadow for Android
  },
});
