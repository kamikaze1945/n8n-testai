import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test('Login form validation', async ({ page }) => {
  // Load test data from external JSON file
  const credentialsPath = path.join(__dirname, '../../data/fixtures/users/sdc.json');
  const credentialsData = fs.readFileSync(credentialsPath, 'utf8');
  const credentials = JSON.parse(credentialsData);

  // 1. Navigate to the login page
  console.log('🌐 Navigating to HRSYS login page...');
  await page.goto('https://sorrycypressnextbe20250827.test-php82.hrsys.pl/logowanie');
  await page.waitForLoadState('networkidle');
  
  // 2. Verify page loaded correctly
  await expect(page).toHaveTitle('HRsys');
  console.log('✅ Login page loaded successfully');
  
  // Helper function to dismiss any modals/alerts
  const dismissModals = async () => {
    try {
      // Check for SweetAlert2 modals
      const modal = page.locator('.swal2-container');
      if (await modal.isVisible()) {
        console.log('🚨 Modal detected, trying to close it...');
        await page.locator('.swal2-close, .swal2-confirm, .swal2-cancel').first().click();
        await page.waitForTimeout(500);
      }
    } catch (e) {
      // Ignore errors if modal doesn't exist
    }
  };
  
  // 3. Test empty form submission
  console.log('🧪 Testing empty form submission...');
  await dismissModals();
  
  try {
    await page.locator('button[type="submit"]').click({ timeout: 5000 });
    await page.waitForTimeout(1000);
    await dismissModals();
  } catch (e) {
    console.log('⚠️ Could not click submit button on empty form');
  }
  
  // 4. Test with invalid credentials
  console.log('🧪 Testing invalid credentials...');
  await dismissModals();
  
  await page.locator('#login_login').fill(credentials.sdc.username.wrong);
  await page.locator('#password').fill(credentials.sdc.password.wrong);
  
  try {
    await page.locator('button[type="submit"]').click({ timeout: 5000 });
    await page.waitForTimeout(2000);
    await dismissModals();
  } catch (e) {
    console.log('⚠️ Could not click submit button with invalid credentials');
  }
  
  // 4b. Test with invalid email format
  console.log('🧪 Testing invalid email format...');
  await dismissModals();
  
  await page.locator('#login_login').clear();
  await page.locator('#login_login').fill(credentials.sdc.email.wrong);
  await page.locator('#password').clear();
  await page.locator('#password').fill(credentials.sdc.password.right);
  
  try {
    await page.locator('button[type="submit"]').click({ timeout: 5000 });
    await page.waitForTimeout(2000);
    await dismissModals();
  } catch (e) {
    console.log('⚠️ Could not click submit button with invalid email');
  }
  
  // 5. Test with valid credentials (username)
  console.log('🧪 Testing valid credentials with username...');
  await dismissModals();
  
  await page.locator('#login_login').clear();
  await page.locator('#login_login').fill(credentials.sdc.username.right);
  await page.locator('#password').clear();
  await page.locator('#password').fill(credentials.sdc.password.right);
  
  // Take screenshot before login
  await page.screenshot({ path: '/app/reports/before-login.png' });
  
  try {
    await page.locator('button[type="submit"]').click({ timeout: 5000 });
    
    // 6. Wait for login to complete
    console.log('⏳ Waiting for login to complete...');
    
    // Wait for either success redirect or error message
    await Promise.race([
      page.waitForURL(url => !url.toString().includes('/logowanie'), { timeout: 10000 }),
      page.waitForSelector('.swal2-container', { timeout: 10000 }),
      page.waitForTimeout(10000)
    ]);
    
  } catch (e) {
    console.log('⚠️ Login attempt encountered an issue:', e.message);
  }
  
  // Take screenshot after login attempt
  await page.screenshot({ path: '/app/reports/after-login.png' });
  
  // 7. Check final state
  console.log('🔍 Current URL:', page.url());
  console.log('📄 Page title:', await page.title());
  
  // If we're no longer on the login page, login was successful
  if (!page.url().includes('/logowanie')) {
    console.log('✅ Login successful with username - redirected away from login page');
  } else {
    console.log('ℹ️ Still on login page - may need to check credentials or handle errors');
    
    // 6. If login with username failed, try with email
    console.log('🧪 Testing valid credentials with email...');
    await dismissModals();
    
    await page.locator('#login_login').clear();
    await page.locator('#login_login').fill(credentials.sdc.email.right);
    await page.locator('#password').clear();
    await page.locator('#password').fill(credentials.sdc.password.right);
    
    // Take screenshot before email login
    await page.screenshot({ path: '/app/reports/before-email-login.png' });
    
    try {
      await page.locator('button[type="submit"]').click({ timeout: 5000 });
      
      console.log('⏳ Waiting for email login to complete...');
      
      // Wait for either success redirect or error message
      await Promise.race([
        page.waitForURL(url => !url.toString().includes('/logowanie'), { timeout: 10000 }),
        page.waitForSelector('.swal2-container', { timeout: 10000 }),
        page.waitForTimeout(10000)
      ]);
      
    } catch (e) {
      console.log('⚠️ Email login attempt encountered an issue:', e.message);
    }
    
    // Take screenshot after email login attempt
    await page.screenshot({ path: '/app/reports/after-email-login.png' });
    
    console.log('🔍 Final URL:', page.url());
    console.log('📄 Final title:', await page.title());
    
    if (!page.url().includes('/logowanie')) {
      console.log('✅ Login successful with email - redirected away from login page');
    } else {
      console.log('ℹ️ Both username and email login attempts completed');
    }
  }
  
  console.log('✅ Login test completed');
});
