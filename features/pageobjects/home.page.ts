import Page from './page'

/**
 * Page Object Model for the home page (AI Animal Art store).
 * 
 * Ported from e2e-playwright/utils/ui_helpers.py and e2e-playwright/tests/ui/test_homepage.py.
 * Encapsulates all UI interactions and element locators for the home page.
 */
class HomePage extends Page {
    // ========================================================================
    // LOCATORS
    // ========================================================================

    /**
     * Cart count badge in header: #cart-link span
     * Displays the numeric cart count.
     */
    private get cartCountBadge() {
        return $('#cart-link span')
    }

    /**
     * Cart link in header: a#cart-link
     * Used for navigating to the cart page.
     */
    private get cartLink() {
        return $('#cart-link')
    }

    /**
     * Product list: ul > li
     * Each <li> contains an image, name, price, and form with "Add to Cart" button.
     */
    private get productList() {
        return $$('ul > li')
    }

    /**
     * Success notification: div.notification
     * Appears when an item is successfully added to cart.
     */
    private get successNotification() {
        return $('.notification')
    }

    /**
     * Get a form for a specific item by itemId.
     * Equivalent to Playwright: form:has(input[name="itemId"][value="<itemId>"])
     * 
     * XPath approach: find form containing input with name="itemId" and the specified value.
     * 
     * @param itemId The product item ID.
     * @returns The form element selector.
     */
    private getAddToCartForm(itemId: number) {
        return $(`//form[.//input[@name='itemId' and @value='${itemId}']]`)
    }

    /**
     * Get the "Add to Cart" button within a form.
     * Selenium workaround: find the form, then get its button child.
     * 
     * @param itemId The product item ID.
     * @returns The button element selector.
     */
    private getAddToCartButton(itemId: number) {
        return $(`//form[.//input[@name='itemId' and @value='${itemId}']]//button[contains(@type, 'submit')]`)
    }

    /**
     * Get the product name heading within a <li>.
     * Each product card has: <li> > h2 (product name)
     * 
     * @param itemId The product item ID.
     * @returns The h2 heading element selector.
     */
    private getProductNameHeading(itemId: number) {
        return $(`//form[.//input[@name='itemId' and @value='${itemId}']]/ancestor::li//h2`)
    }

    // ========================================================================
    // NAVIGATION
    // ========================================================================

    /**
     * Navigate to the home page.
     * 
     * Equivalent to Python's go_home(page, base_url).
     */
    public async open(): Promise<void> {
        await super.open()
        // Wait for the product list to load
        await this.waitForElement('ul > li', 10000)
        console.log('✅ Homepage opened and loaded')
    }

    /**
     * Navigate to the cart page by clicking the cart link.
     * 
     * @returns Promise that resolves after navigation.
     */
    public async goToCart(): Promise<void> {
        const link = await this.cartLink
        await link.waitForClickable({ timeout: 5000 })
        await link.click()
        await browser.waitUntil(
            async () => {
                const url = await browser.getUrl()
                return url.includes('/cart')
            },
            { timeout: 5000 }
        )
        console.log('✅ Navigated to cart page')
    }

    // ========================================================================
    // CART INTERACTIONS
    // ========================================================================

    /**
     * Get the numeric cart count displayed in the header.
     * 
     * Equivalent to Python's get_cart_count(page).
     * Reads the text from #cart-link span (e.g., "0", "1", "2").
     * 
     * @returns The integer cart count, or 0 if not found.
     */
    public async getCartCount(): Promise<number> {
        try {
            const badge = await this.cartCountBadge
            const text = await badge.getText()
            const count = parseInt(text.trim(), 10)
            console.log(`🛒 Cart count: ${count}`)
            return count
        } catch (error) {
            console.error(`⚠️ Failed to get cart count: ${error}`)
            return 0
        }
    }

    /**
     * Assert that the cart count matches the expected value.
     * 
     * Equivalent to Python's expect_cart_count(page, expected).
     * 
     * @param expected The expected cart count.
     * @throws Error if the actual count does not match expected.
     */
    public async assertCartCount(expected: number): Promise<void> {
        const actual = await this.getCartCount()
        if (actual !== expected) {
            throw new Error(
                `Cart count mismatch. Expected: ${expected}, Actual: ${actual}`
            )
        }
        console.log(`✅ Cart count assertion passed: ${expected}`)
    }

    // ========================================================================
    // PRODUCT INTERACTIONS
    // ========================================================================

    /**
     * Click the "Add to Cart" button for a product with the given itemId.
     * 
     * Equivalent to Python:
     *   item_form = page.locator('form:has(input[name="itemId"][value="<itemId>"])')
     *   item_form.get_by_role("button").click()
     * 
     * @param itemId The ID of the item to add to cart.
     * @throws Error if the form or button is not found.
     */
    public async addToCartByItemId(itemId: number): Promise<void> {
        try {
            const button = await this.getAddToCartButton(itemId)
            await button.waitForDisplayed({ timeout: 5000 })
            await button.click()
            console.log(`✅ Clicked 'Add to Cart' for item ${itemId}`)
        } catch (error) {
            throw new Error(`Failed to add item ${itemId} to cart: ${error}`)
        }
    }

    /**
     * Click the "Add to Cart" button for the first product on the page.
     * Convenience method for simple tests.
     */
    public async addFirstProductToCart(): Promise<void> {
        await this.addToCartByItemId(1)
    }

    /**
     * Get the name of a product by its itemId.
     * 
     * Locates the h2 heading within the product card for the given itemId.
     * 
     * @param itemId The ID of the product.
     * @returns The product name (e.g., "Koala", "Dog", "Cat"), or null if not found.
     */
    public async getProductNameByItemId(itemId: number): Promise<string | null> {
        try {
            const heading = await this.getProductNameHeading(itemId)
            const name = await heading.getText()
            console.log(`📦 Product name for item ${itemId}: ${name}`)
            return name.trim()
        } catch (error) {
            console.error(`⚠️ Failed to get product name for item ${itemId}: ${error}`)
            return null
        }
    }

    /**
     * Assert that a specific text appears somewhere on the page.
     * 
     * Equivalent to Python's expect_text_visible(page, text).
     * 
     * @param text The text to search for.
     * @throws Error if the text is not visible.
     */
    public async assertTextVisible(text: string): Promise<void> {
        await super.assertTextVisible(text)
    }

    /**
     * Assert that the success notification is visible.
     * Notification text: "Item successfully added to cart"
     */
    public async assertSuccessNotificationVisible(): Promise<void> {
        try {
            const notification = await this.successNotification
            await notification.waitForDisplayed({ timeout: 5000 })
            const notificationText = await notification.getText()
            console.log(`✅ Success notification visible: ${notificationText}`)
        } catch (error) {
            throw new Error(`Success notification not visible: ${error}`)
        }
    }

    /**
     * Assert that the success notification is hidden/gone.
     * (Useful after the notification auto-hides.)
     */
    public async assertSuccessNotificationHidden(): Promise<void> {
        try {
            const notification = await this.successNotification
            await notification.waitForDisplayed({ timeout: 5000, reverse: true })
            console.log('✅ Success notification has disappeared')
        } catch (error) {
            console.error(`⚠️ Notification visibility check timed out: ${error}`)
        }
    }

    /**
     * Get the total number of products displayed on the home page.
     * 
     * @returns The count of product list items.
     */
    public async getProductCount(): Promise<number> {
        try {
            const products = await this.productList
            const count = products.length
            console.log(`📊 Total products on page: ${count}`)
            return count
        } catch (error) {
            console.error(`⚠️ Failed to count products: ${error}`)
            return 0
        }
    }

    /**
     * Check if the "Add to Cart" button is disabled for a specific item.
     * Useful for testing max-quantity restrictions.
     * 
     * @param itemId The ID of the item.
     * @returns true if the button is disabled; false otherwise.
     */
    public async isAddToCartButtonDisabled(itemId: number): Promise<boolean> {
        try {
            const button = await this.getAddToCartButton(itemId)
            const isEnabled = await button.isEnabled()
            const isDisabled = !isEnabled
            console.log(`🔒 Add to cart button for item ${itemId} disabled: ${isDisabled}`)
            return isDisabled
        } catch (error) {
            console.error(`⚠️ Failed to check button state for item ${itemId}: ${error}`)
            return false
        }
    }
}

export default new HomePage()