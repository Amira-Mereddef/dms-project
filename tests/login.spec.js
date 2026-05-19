import { test, expect } from '@playwright/test'

test.describe('Login flow', () => {

  test('user can login and see document list', async ({ page }) => {
    await page.goto('/')

    // Fill login form
    await page.fill('input[type="email"]', 'user@dms.com')
    await page.fill('input[type="password"]', 'user123')
    await page.click('button[type="submit"]')

    // Should land on /user/documents
    await page.waitForURL('**/user/documents')
    await expect(page.locator('h1')).toContainText('My Documents')
  })

  test('admin can login and see users page', async ({ page }) => {
    await page.goto('/')

    await page.fill('input[type="email"]', 'admin@dms.com')
    await page.fill('input[type="password"]', 'admin123')
    await page.click('button[type="submit"]')

    await page.waitForURL('**/admin/users')
    await expect(page.locator('h1')).toContainText('Users')
  })

  test('shows error with wrong credentials', async ({ page }) => {
    await page.goto('/')

    await page.fill('input[type="email"]', 'wrong@dms.com')
    await page.fill('input[type="password"]', 'wrongpass')
    await page.click('button[type="submit"]')

    await expect(page.locator('text=Invalid email or password')).toBeVisible()
  })

  test('redirects to login if accessing protected route directly', async ({ page }) => {
    await page.goto('/admin/users')
    await page.waitForURL('**/')
    await expect(page.locator('h1')).toContainText('Welcome back')
  })

})