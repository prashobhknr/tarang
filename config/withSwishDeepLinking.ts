const { withAndroidManifest, ConfigPlugin } = require('@expo/config-plugins');

const withSwishDeepLinking = (config) => {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;

    // Ensure the 'activity' node exists
    const activity = androidManifest.manifest.application[0].activity[0];
    if (!activity) {
      console.error('Error: Activity node not found in AndroidManifest.xml');
      return config; // Early exit if activity not found
    }

    // Ensure the 'intent-filter' is an array, if not, create one
    const intentFilters = activity['intent-filter'] || [];

    // Add a new intent filter if it doesn't exist
    intentFilters.push({
      action: [
        { $: { 'android:name': 'android.intent.action.VIEW' } }
      ],
      category: [
        { $: { 'android:name': 'android.intent.category.DEFAULT' } },
        { $: { 'android:name': 'android.intent.category.BROWSABLE' } }
      ],
      data: [
        { $: { 'android:scheme': 'swish' } }
      ]
    });

    // If the intent-filters array was modified, we need to assign it back
    activity['intent-filter'] = intentFilters;

    return config;
  });
};

module.exports = withSwishDeepLinking;
