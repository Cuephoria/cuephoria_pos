
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.1a46da40620c4f559f80b0b990917809',
  appName: 'cuephoria-pos',
  webDir: 'dist',
  server: {
    url: "https://1a46da40-620c-4f55-9f80-b0b990917809.lovableproject.com?forceHideBadge=true",
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#1A1F2C",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP"
    }
  },
  ios: {
    contentInset: 'always'
  },
  android: {
    backgroundColor: "#1A1F2C"
  }
};

export default config;
