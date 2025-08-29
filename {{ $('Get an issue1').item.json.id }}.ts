```typescript
import { test, expect } from '@playwright/test';

test('Login form validation', async ({ page }) => {
  // 1. Navigate to the login page
  await page.goto('https://www.example.com/login');
  
  // 2. Click on the login button without entering credentials
  await page.getByRole('button', { name: 'Login' }).click();
  
  // 3. Verify error messages for empty fields
  await expect(page.getByText('Username is required')).toBeVisible();
  await expect(page.getByText('Password is required')).toBeVisible();
  
  // 4. Enter invalid email format
  await page.getByLabel('Username').fill('invalid-email');
  await page.getByLabel('Password').fill('password123');
  await page.getByRole('button', { name: 'Login' }).click();
  
  // 5. Verify error message for invalid email format
  await expect(page.getByText('Invalid email format')).toBeVisible();
  
  // 6. Enter valid email but wrong password
  await page.getByLabel('Username').clear();
  await page.getByLabel('Username').fill('valid@example.com');
  await page.getByLabel('Password').clear();
  await page.getByLabel('Password').fill('wrongpassword');
  await page.getByRole('button', { name: 'Login' }).click();
  
  // 7. Verify error message for incorrect credentials
  await expect(page.getByText('Invalid username or password')).toBeVisible();
  
  // 8. Enter valid credentials
  await page.getByLabel('Username').clear();
  await page.getByLabel('Username').fill('valid@example.com');
  await page.getByLabel('Password').clear();
  await page.getByLabel('Password').fill('correctpassword');
  await page.getByRole('button', { name: 'Login' }).click();
  
  // 9. Verify successful login
  await expect(page).toHaveURL('https://www.example.com/dashboard');
  await expect(page.getByText('Welcome, User')).toBeVisible();
});
```