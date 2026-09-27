import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Voice Rooms',
    short_name: 'Voice Rooms',
    description: 'غرف صوتية مباشرة',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#0b1020',
    theme_color: '#0b1020',
    dir: 'rtl',
    lang: 'ar',
  }
}
