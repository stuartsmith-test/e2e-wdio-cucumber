import Page from './page'

/**
 * Page Object Model for the shopping cart page.
 * 
 * Encapsulates all interactions with the /cart page.
 * Ported from e2e-selenium/src/test/java/automation/pages/CartPage.java.
 */
class CartPage extends Page {
    // ========================================================================
    // LOCATORS
    // ========================================================================

    /**
     * Cart table: table element
     */
    private get cartTable() {
        return $('table')
    }

    /**
     * Table rows: tbody > tr
     * Each row represents a cart item.
     */
    private get cartItems() {
        return $$('tbody > tr')
    }

    /**
     * Product name cell: tr > td:nth-child(1)
     */
    private get productNameCell() {
        return $('td:nth-child(1)')
    }

    /**
     * Quantity cell: tr > td:nth-child(2)
     * Contains a <select> dropdown.
     */
    private get quantityCell() {
        return $('td:nth-child(2)')
    }

    /**
     * Total price heading: h2
     * Text format: "Total Price: $XX.XX"
     */
    private get totalPriceHeading() {
        return $('h2')
    }

    /**
     * Checkout button: button#checkout-button
     */
    private get checkoutButton() {
        return $('#checkout-button')
    }

    /**
     * Back to shop link: a#shop-link
     */
    private get shopLink() {
        return $('#shop-link')
    }

    // ========================================================================
    // PAGE LOAD & INITIALIZATION
    // ========================================================================

    /**
     * Open the cart page.
     */
    public async open(): Promise<void> {
        await super.open('cart')
        // Wait for the cart table to load
        await this.waitForElement('table', 10000)
        console.log('✅ Cart page opened and loaded')
    }

    /**
     * Wait for the cart page to fully load.
     */
    private async waitForCartPageLoad(): Promise<void> {
        try {
            const table = await this.cartTable
            await table.waitForDisplayed({ timeout: 10000 })
            console.log('✅ Cart page loaded')
        } catch (error) {
            console.error(`⚠️ Cart page load timed out: ${error}`)
        }
    }

    // ========================================================================
    // CART CONTENT ASSERTIONS & GETTERS
    // ========================================================================

    /**
     * Get all items currently in the cart.
     * 
     * @returns An array of row elements.
     */
    public async getCartItems(): Promise<any> {
        try {
            return await this.cartItems
        } catch (error) {
            console.error(`⚠️ Failed to get cart items: ${error}`)
            return []
        }
    }

    /**
     * Assert that a product with the given name appears in the cart.
     * 
     * @param productName The name of the product (e.g., "Koala", "Dog").
     * @throws Error if the product is not found in the cart.
     */
    public async assertProductInCart(productName: string): Promise<void> {
        try {
            const row = await $(`//tr[contains(., '${productName}')]`)
            await row.waitForDisplayed({ timeout: 5000 })
            console.log(`✅ Product '${productName}' found in cart`)
        } catch (error) {
            throw new Error(
                `Product '${productName}' not found in cart: ${error}`
            )
        }
    }

    /**
     * Get the quantity of a specific product in the cart.
     * 
     * @param productName The name of the product.
     * @returns The quantity as an integer, or -1 if not found.
     */
    public async getProductQuantity(productName: string): Promise<number> {
        try {
            // 1. Find the row for the product
            const row = await $(`//tr[td[1][contains(text(), '${productName}')]]`)
            
            // 2. Find the quantity cell and its select dropdown
            const quantityCell = await row.$('td:nth-child(2)')
            const dropdown = await quantityCell.$('select')
            
            // 3. Read the currently selected option
            const selectedOption = await dropdown.$('option:checked')
            const selectedText = await selectedOption.getText()
            
            const quantity = parseInt(selectedText.trim(), 10)
            console.log(`📦 Quantity for '${productName}': ${quantity}`)
            return quantity
        } catch (error) {
            console.error(`⚠️ Failed to get quantity for '${productName}': ${error}`)
            return -1
        }
    }

    /**
     * Assert that a product appears in the cart with a specific quantity.
     * 
     * @param productName The name of the product.
     * @param expectedQuantity The expected quantity.
     * @throws Error if the quantity does not match.
     */
    public async assertProductQuantity(
        productName: string,
        expectedQuantity: number
    ): Promise<void> {
        const actual = await this.getProductQuantity(productName)
        if (actual !== expectedQuantity) {
            throw new Error(
                `Quantity mismatch for '${productName}'. Expected: ${expectedQuantity}, Actual: ${actual}`
            )
        }
        console.log(`✅ Product quantity assertion passed: '${productName}' = ${expectedQuantity}`)
    }

    /**
     * Get the total price displayed on the cart page.
     * Parses the text "Total Price: $XX.XX"
     * 
     * @returns The total price as a number, or -1 if not found.
     */
    public async getTotalPrice(): Promise<number> {
        try {
            const heading = await this.totalPriceHeading
            await heading.waitForDisplayed({ timeout: 5000 })
            const totalText = await heading.getText()
            
            // Extract numeric value (e.g., "Total Price: $45.99" -> 45.99)
            const priceMatch = totalText.match(/[\d.]+/)
            const price = priceMatch ? parseFloat(priceMatch[0]) : -1
            
            console.log(`💰 Total price: $${price}`)
            return price
        } catch (error) {
            console.error(`⚠️ Failed to get total price: ${error}`)
            return -1
        }
    }

    /**
     * Assert that the cart is empty (no items displayed).
     */
    public async assertCartEmpty(): Promise<void> {
        const items = await this.getCartItems()
        if (items.length > 0) {
            throw new Error(
                `Expected empty cart, but found ${items.length} items`
            )
        }
        console.log('✅ Cart is empty')
    }

    // ========================================================================
    // NAVIGATION & ACTIONS
    // ========================================================================

    /**
     * Click the Checkout button to proceed to checkout.
     */
    public async clickCheckout(): Promise<void> {
        try {
            const button = await this.checkoutButton
            await button.waitForClickable({ timeout: 5000 })
            await button.click()
            console.log('✅ Clicked Checkout button')
            
            // Wait for navigation to checkout page
            await browser.waitUntil(
                async () => {
                    const url = await browser.getUrl()
                    return url.includes('/checkout')
                },
                { timeout: 5000 }
            )
        } catch (error) {
            throw new Error(`Failed to click Checkout button: ${error}`)
        }
    }

    /**
     * Click the "Back to Shop" link to return to the home page.
     */
    public async clickBackToShop(): Promise<void> {
        try {
            const link = await this.shopLink
            await link.waitForClickable({ timeout: 5000 })
            await link.click()
            console.log('✅ Clicked Back to Shop link')
            
            // Wait for navigation back to home
            await browser.waitUntil(
                async () => {
                    const url = await browser.getUrl()
                    return !url.includes('/cart')
                },
                { timeout: 5000 }
            )
        } catch (error) {
            throw new Error(`Failed to click Back to Shop: ${error}`)
        }
    }

    /**
     * Update the quantity for a product.
     * 
     * @param productName The name of the product to update.
     * @param newQuantity The new quantity to select (0-10).
     */
    public async setProductQuantity(productName: string, newQuantity: number): Promise<void> {
        try {
            // 1. Get current price
            const oldPrice = await this.getTotalPrice()
            
            // 2. Find the row and dropdown
            const row = await $(`//tr[td[1][contains(text(), '${productName}')]]`)
            const quantityCell = await row.$('td:nth-child(2)')
            const dropdown = await quantityCell.$('select')
            
            // 3. Select the new quantity
            await dropdown.selectByVisibleText(String(newQuantity))
            
            // 4. Wait for the price to update
            await browser.waitUntil(
                async () => {
                    const newPrice = await this.getTotalPrice()
                    return newPrice !== oldPrice
                },
                { timeout: 5000 }
            )
            
            console.log(`✅ Updated quantity for '${productName}' to ${newQuantity}`)
        } catch (error) {
            throw new Error(
                `Failed to set quantity for '${productName}': ${error}`
            )
        }
    }
}

export default new CartPage()