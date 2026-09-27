import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.voicerooms.app',
  appName: 'Voice Rooms',
  webDir: '.next',
  server: {
    url: process.env.NEXT_PUBLIC_APP_URL,
    cleartext: process.env.NEXT_PUBLIC_APP_URL?.startsWith('http://') ?? false,
  },
  android: { allowMixedContent: false },
}

export default config
