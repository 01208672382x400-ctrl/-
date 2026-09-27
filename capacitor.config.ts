import type { CapacitorConfig } from '@capacitor/cli'

const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, '')

const config: CapacitorConfig = {
  appId: 'com.voicerooms.app',
  appName: 'Voice Rooms',
  webDir: 'capacitor-web',
  server: appUrl
    ? {
        url: appUrl,
        cleartext: appUrl.startsWith('http://'),
      }
    : undefined,
  android: {
    allowMixedContent: false,
  },
}

export default config
