import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'tests/e2e',timeout:90000,workers:1,use:{browserName:'chromium',headless:true,viewport:{width:1600,height:900},screenshot:'only-on-failure'},webServer:{command:process.env.PREVIEW?'npm run preview -- --port 4173':'npm run dev -- --port 4173',url:'http://127.0.0.1:4173',reuseExistingServer:false},reporter:'list'});
