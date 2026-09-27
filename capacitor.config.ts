import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.voicerooms.app',
  appName: 'Voice Rooms',
  webDir: 'capacitor-web',
  server: process.env.NEXT_PUBLIC_APP_URL
    ? {
        url: process.env.NEXT_PUBLIC_APP_URL,
        cleartext: process.env.NEXT_PUBLIC_APP_URL.startsWith('http://'),
      }
    : undefined,
  android: {
    allowMixedContent: false,
  },
}

export default config
