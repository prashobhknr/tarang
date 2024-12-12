import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { IconButton, Banner, useTheme } from 'react-native-paper';

type HelpButtonWithBannerProps = {
  message: string; // The message to display in the banner
  buttonSize?: number; // Optional size of the button, default is 24
  accessibilityLabel?: string; // Accessibility label for the button
};

const HelpButtonWithBanner: React.FC<HelpButtonWithBannerProps> = ({
  message,
  buttonSize = 24,
  accessibilityLabel = 'Help',
}) => {
  const [visible, setVisible] = useState(false);
  const theme = useTheme();

  const toggleBanner = () => setVisible(!visible);

  return (
    <View>
      {/* Help Button */}
      <IconButton
        icon="help-circle-outline" // Material Design icon
        size={buttonSize}
        onPress={toggleBanner}
        style={[styles.button, { backgroundColor: theme.colors.primaryContainer }]}
        iconColor={theme.colors.onPrimaryContainer}
        accessibilityLabel={accessibilityLabel}
      />

      {/* Banner */}
      <Banner
        visible={visible}
        actions={[
          {
            label: 'Dismiss',
            onPress: () => setVisible(false),
          },
        ]}
        icon="information-outline"
        style={[styles.banner, { backgroundColor: theme.colors.surface }]}
      >
        {message}
      </Banner>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 50, // Circular button
    elevation: 2, // Adds shadow for Android
  },
  banner: {
    marginVertical: 10, // Spacing between the button and banner
  },
});

export default HelpButtonWithBanner;
