import { test, expect } from '@playwright/test'

test.describe('Admin user management', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.fill('input[type="email"]', 'admin@dms.com')
    await page.fill('input[type="password"]', 'admin123')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/admin/users')
  })

  test('admin can see users table', async ({ page }) => {
    await expect(page.locator('table')).toBeVisible()
    // Use a more specific selector — target the table cell, not any element on the page
    await expect(page.locator('td').filter({ hasText: 'Amira Admin' }).first()).toBeVisible()
  })

  test('admin can open create user modal', async ({ page }) => {
    await page.click('button:has-text("+ New User")')
    // Target the modal heading specifically using the h2 tag
    await expect(page.locator('h2').filter({ hasText: 'New User' })).toBeVisible()
    await expect(page.locator('input[placeholder="Jane Smith"]')).toBeVisible()
  })

  test('admin can create a new user', async ({ page }) => {
    await page.click('button:has-text("+ New User")')
    await page.fill('input[placeholder="Jane Smith"]', 'Test User')
    await page.fill('input[type="email"]', 'testuser@dms.com')
    await page.fill('input[placeholder="••••••••"]', 'test123')
    await page.fill('input[placeholder="e.g. HR"]', 'Marketing')
    await page.click('text=Create user')
    await expect(page.locator('td').filter({ hasText: 'Test User' }).first()).toBeVisible()
  })

  test('admin can navigate to departments', async ({ page }) => {
    await page.click('text=Departments')
    await page.waitForURL('**/admin/departments')
    await expect(page.locator('h1')).toContainText('Departments')
  })

  test('admin can navigate to categories', async ({ page }) => {
    await page.click('text=Categories')
    await page.waitForURL('**/admin/categories')
    await expect(page.locator('h1')).toContainText('Categories')
  })

})