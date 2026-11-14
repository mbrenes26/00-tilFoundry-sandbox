import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests/browser',
  use: { ...devices['Desktop Chrome'], baseURL: 'http://127.0.0.1:5173', viewport: { width: 1600, height: 1000 } },
  webServer: { command: 'npm run dev -- --port 5173 --strictPort', url: 'http://127.0.0.1:5173/@vite/client', reuseExistingServer: false },
});
