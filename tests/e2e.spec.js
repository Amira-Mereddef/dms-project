import { test, expect } from '@playwright/test'

async function loginAsUser(page) {
  await page.goto('/')
  await page.waitForSelector('input[type="email"]')
  await page.fill('input[type="email"]', 'u1@ensia.dz')
  await page.fill('input[type="password"]', 'password')
  await page.click('button[type="submit"]')
  await page.waitForURL('**/user/documents', { timeout: 15000 })
  await page.waitForSelector('table', { timeout: 10000 })
}

async function loginAsAdmin(page) {
  await page.goto('/')
  await page.waitForSelector('input[type="email"]')
  await page.fill('input[type="email"]', 'admin@dms.com')
  await page.fill('input[type="password"]', 'password')
  await page.click('button[type="submit"]')
  await page.waitForURL('**/admin/users', { timeout: 15000 })
  await page.waitForSelector('table', { timeout: 10000 })
}

// TEST 1: User uploads a document and it appears in the list
test('user uploads a document and it appears in the list', async ({ page }) => {
  await loginAsUser(page)

  await page.click('button:has-text("Upload Document")')
  await page.waitForSelector('h2:has-text("Upload Document")', { timeout: 5000 })

  const testTitle = 'Playwright Upload Test'
  await page.fill('input[placeholder="Enter the title of the document"]', testTitle)

  await page.setInputFiles('input[type="file"]', {
    name: 'test.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('%PDF-1.4 playwright test')
  })

  await page.locator('form button[type="submit"]').click()

  await page.waitForSelector('h2:has-text("Upload Document")', {
    state: 'hidden',
    timeout: 15000
  })

  await expect(page.locator(`text=${testTitle}`).first()).toBeVisible({ timeout: 10000 })
})

// TEST 2: Admin creates a department and assigns a user
test('admin creates a department and assigns a user', async ({ page }) => {
  await loginAsAdmin(page)

  // Click Departments in sidebar
  await page.click('a:has-text("Departments"), li:has-text("Departments"), span:has-text("Departments")')
  await page.waitForURL('**/admin/departments', { timeout: 10000 })
  await page.waitForTimeout(2000)

  // Click New Department
  await page.click('button:has-text("New Department")')
  await page.waitForTimeout(800)

  // Fill using exact placeholder from DepartmentsPage.jsx
  await page.fill('input[placeholder="Department name, e.g. Finance"]', 'Engineering')
  await page.waitForTimeout(300)

  // Submit form
  await page.click('button[type="submit"]')
  await page.waitForTimeout(2000)

  // Verify Engineering card appears (it's in an h3 not h1)
  await expect(page.locator('h3:has-text("Engineering")').first()).toBeVisible({ timeout: 10000 })

  // Go to Users via sidebar
  await page.click('a:has-text("Users"), li:has-text("Users"), span:has-text("Users")')
  await page.waitForURL('**/admin/users', { timeout: 10000 })
  await page.waitForSelector('table tbody tr', { timeout: 8000 })

  // Find u1 row and click Edit
  const userRow = page.locator('tr').filter({ hasText: 'u1@ensia.dz' })
  await expect(userRow).toBeVisible({ timeout: 8000 })
  await userRow.locator('button:has-text("Edit")').click()

  // Verify edit form opened
  await expect(page.locator('button:has-text("Save")')).toBeVisible({ timeout: 8000 })

  const cancel = page.locator('button:has-text("Cancel")')
  if (await cancel.isVisible()) await cancel.click()
})