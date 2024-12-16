import React from 'react';
import { StyleSheet, Image, ActivityIndicator, View } from 'react-native';
import { Button as PaperButton, useTheme } from 'react-native-paper';

type Props = {
  label: string;
  theme?: 'primary' | 'secondary' | 'swish'; // Added 'swish' theme
  iconName?: string | null; // Accept FontAwesome icon name or null
  onPress?: () => void;
  disabled?: boolean; // Prop to disable the button
  isLoading?: boolean; // Prop to show loading spinner
};

export default function Button({ label, theme, iconName, onPress, disabled, isLoading }: Props) {
  const { colors } = useTheme();

  const isSwish = theme === 'swish';
  const textColor = isSwish ? '#5AC9FA' : theme === 'primary' ? colors.onPrimaryContainer : colors.onPrimaryContainer;
  const backgroundColor = isSwish ? 'transparent' : theme === 'primary' ? colors.primaryContainer : colors.primary;
  const borderColor = isSwish ? '#5AC9FA' : 'transparent';

  return (
    !disabled && (
      <View style={{ marginTop: 5 }}>
        <PaperButton
          key={`button-${theme}`} // Ensures re-render on theme change
          mode={isSwish ? 'outlined' : 'contained'} // Mode for Swish is outlined
          onPress={onPress}
          disabled={disabled || isLoading}
          contentStyle={[
            styles.content,
            {
              backgroundColor, // Dynamic background color
              borderWidth: isSwish ? 1 : 0,
              borderColor: isSwish ? borderColor : undefined, // Apply border for Swish
            },
          ]}
          labelStyle={[
            styles.label,
            { color: textColor }, // Dynamic text color
          ]}
          style={[
            isSwish && {
              borderRadius: 18, // Ensure consistent border radius
            },
          ]}
          icon={
            isLoading
              ? () => <ActivityIndicator size="small" color={textColor} />
              : isSwish
                ? () => (
                  <Image
                    source={require('@/assets/images/swish.png')}
                    style={[styles.imageIcon, { marginRight: 8 }]} // Add spacing between icon and text
                    resizeMode="contain"
                  />
                )
                : iconName!
          }
        >
          {!isLoading && label}
        </PaperButton>
      </View>)
  );
}

const styles = StyleSheet.create({
  content: {
    height: 50,
    borderRadius: 18, // Consistent rounded corners
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row', // Align icon and text horizontally
    paddingHorizontal: 15, // Padding around the button
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    textAlignVertical: 'center', // Ensure vertical alignment of text
  },
  imageIcon: {
    width: 30, // Size of Swish logo
    height: 30,
    marginRight: 8, // Space between the icon and text
  },
});
