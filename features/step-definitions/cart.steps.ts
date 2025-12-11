import { Given, When, Then, Before, After } from '@wdio/cucumber-framework'
import { expect } from '@wdio/globals'

import { ApiUtils } from '../support/api.utils'
import { DbUtils } from '../support/db.utils'
import HomePage from '../pageobjects/home.page'
import CartPage from '../pageobjects/cart.page'

/**
 * Step Definitions for Add to Cart Feature.
 * 
 * Implements the Gherkin scenarios using Page Objects and Utilities.
 * Ported from e2e-playwright and e2e-selenium test patterns.
 */

// ============================================================================
// SETUP & TEARDOWN
// ============================================================================

/**
 * Before each scenario: Initialize utilities and set up test environment.
 */
Before(async function () {
    // Initialize API utils with base URL
    const baseUrl = browser.options.baseUrl;
    
    if (!baseUrl) {
        throw new Error('Base URL not defined in wdio.conf.ts');
    }
    ApiUtils.initialize(baseUrl)
    console.log(`✅ Test setup complete. Base URL: ${baseUrl}`)
})

/**
 * After each scenario: Clean up (optional).
 */
After(async function () {
    console.log('✅ Test teardown complete')
})

// ============================================================================
// GIVEN STEPS
// ============================================================================

/**
 * Given: the cart is empty
 * 
 * Resets the cart via API to ensure a clean starting state.
 * Equivalent to Python's reset_cart(api_request_context).
 */
Given('the cart is empty', async function () {
    try {
        await ApiUtils.resetCart()
        console.log('✅ Cart reset via API')
    } catch (error) {
        throw new Error(`Failed to reset cart: ${error}`)
    }
})

/**
 * Given: I am on the home page
 * 
 * Navigates to the homepage and waits for the page to fully load.
 * Equivalent to Python's go_home(page, base_url).
 */
Given('I am on the home page', async function () {
    try {
        await HomePage.open()
        console.log('✅ Homepage opened and loaded')
    } catch (error) {
        throw new Error(`Failed to open homepage: ${error}`)
    }
})

// ============================================================================
// WHEN STEPS
// ============================================================================

/**
 * When: I add an item to the cart
 * 
 * Clicks the "Add to Cart" button for the first product (item_id = 1).
 * Waits for success notification to appear, then disappear.
 * 
 * Critical: The notification auto-hides after 3 seconds. Waiting for it to 
 * disappear ensures the DOM is stable before the next interaction.
 */
When('I add an item to the cart', async function () {
    try {
        // Add the first item
        await HomePage.addFirstProductToCart()
        console.log('✅ Clicked Add to Cart button for item 1')

        // Wait for success notification to appear
        await HomePage.assertSuccessNotificationVisible()
        console.log('✅ Success notification appeared')

        // Wait for notification to disappear (auto-hides after ~3 seconds)
        // This prevents stale element errors caused by DOM shifts
        await HomePage.assertSuccessNotificationHidden()
        console.log('✅ Success notification disappeared (DOM stable)')
    } catch (error) {
        throw new Error(`Failed to add item to cart: ${error}`)
    }
})

/**
 * When: I navigate to the cart
 * 
 * Clicks the cart link in the header to navigate to the /cart page.
 * Waits for the URL to change and page to load.
 */
When('I navigate to the cart', async function () {
    try {
        await HomePage.goToCart()
        console.log('✅ Navigated to cart page')
    } catch (error) {
        throw new Error(`Failed to navigate to cart: ${error}`)
    }
})

// ============================================================================
// THEN STEPS
// ============================================================================

/**
 * Then: I should see 1 item in the cart list
 * 
 * Verifies that the cart page displays exactly 1 item in the table.
 * Uses CartPage.getCartItems() to count rows.
 */
Then('I should see {int} item in the cart list', async function (expectedCount: number) {
    try {
        const items = await CartPage.getCartItems()
        const actualCount = items.length

        expect(actualCount).toBe(expectedCount)
        console.log(`✅ Cart displays ${expectedCount} item(s)`)
    } catch (error) {
        throw new Error(`Cart item count assertion failed: ${error}`)
    }
})

/**
 * Then: the database should show 1 item in the cart
 * 
 * Queries the SQLite database directly to verify that the cart table 
 * has the correct quantity for item_id = 1.
 * 
 * This validates that the backend correctly persisted the add-to-cart action.
 */
Then('the database should show {int} item in the cart', async function (expectedQuantity: number) {
    try {
        const dbPath = (browser.options as any).dbPath || process.env.DB_PATH;
        const itemId = 1

        // Query the database
        const actualQuantity = await DbUtils.getCartQuantity(dbPath, itemId)
        console.log(`📊 Database quantity for item ${itemId}: ${actualQuantity}`)

        expect(actualQuantity).toBe(expectedQuantity)
        console.log(`✅ Database assertion passed: item ${itemId} quantity = ${expectedQuantity}`)
    } catch (error) {
        throw new Error(`Database assertion failed: ${error}`)
    }
})

// ============================================================================
// ADDITIONAL UTILITY STEPS (Optional for other scenarios)
// ============================================================================

/**
 * Optional: Add multiple items to cart
 * 
 * Usage: When I add 5 items to the cart
 */
When('I add {int} items to the cart', async function (count: number) {
    try {
        for (let i = 0; i < count; i++) {
            await HomePage.addFirstProductToCart()
            await HomePage.assertSuccessNotificationVisible()
            await HomePage.assertSuccessNotificationHidden()
            console.log(`✅ Added item ${i + 1}/${count}`)
        }
        console.log(`✅ Successfully added ${count} items to cart`)
    } catch (error) {
        throw new Error(`Failed to add multiple items: ${error}`)
    }
})

/**
 * Optional: Verify cart count in header
 * 
 * Usage: Then the cart count should be 3
 */
Then('the cart count should be {int}', async function (expectedCount: number) {
    try {
        const actualCount = await HomePage.getCartCount()

        expect(actualCount).toBe(expectedCount)
        console.log(`✅ Cart count verified: ${expectedCount}`)
    } catch (error) {
        throw new Error(`Cart count assertion failed: ${error}`)
    }
})

/**
 * Optional: Verify product name in cart
 * 
 * Usage: Then I should see "Koala" in the cart
 */
Then('I should see {string} in the cart', async function (productName: string) {
    try {
        await CartPage.assertProductInCart(productName)
        console.log(`✅ Product '${productName}' found in cart`)
    } catch (error) {
        throw new Error(`Product assertion failed: ${error}`)
    }
})