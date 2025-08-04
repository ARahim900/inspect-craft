import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.4afaa3172be84d6d9c7cf910056a8f4d',
  appName: 'inspect-craft',
  webDir: 'dist',
  server: {
    url: 'https://4afaa317-2be8-4d6d-9c7c-f910056a8f4d.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    Camera: {
      permissions: ['camera', 'photos']
    },
    Filesystem: {
      permissions: ['write-external-storage']
    }
  }
};

export default config;