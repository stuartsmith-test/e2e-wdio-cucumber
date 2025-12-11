import Page from './page'

/**
 * Page Object Model for the checkout page.
 * 
 * Encapsulates interactions with the /checkout confirmation page.
 */
class CheckoutPage extends Page {
    // ========================================================================
    // LOCATORS
    // ========================================================================

    /**
     * Total price display: div.total-price
     */
    private get totalPriceDisplay() {
        return $('.total-price')
    }

    /**
     * Thank you message: div.thank-you-message
     */
    private get thankYouMessage() {
        return $('.thank-you-message, [class*="thank"]')
    }

    /**
     * Checkout container div
     */
    private get checkoutContainer() {
        return $('.checkout-container')
    }

    // ========================================================================
    // PAGE LOAD & INITIALIZATION
    // ========================================================================

    /**
     * Open the checkout page.
     */
    public async open(): Promise<void> {
        await super.open('checkout')
        await this.waitForCheckoutPageLoad()
        console.log('✅ Checkout page opened')
    }

    /**
     * Wait for the checkout page to fully load.
     */
    private async waitForCheckoutPageLoad(): Promise<void> {
        try {
            const container = await this.checkoutContainer
            await container.waitForDisplayed({ timeout: 10000 })
            console.log('✅ Checkout page loaded')
        } catch (error) {
            console.error(`⚠️ Checkout page load timed out: ${error}`)
        }
    }

    // ========================================================================
    // ASSERTIONS
    // ========================================================================

    /**
     * Get the total price displayed on the checkout page.
     * 
     * @returns The total price as a string (e.g., "Total price: $45.99").
     */
    public async getTotalPriceText(): Promise<string> {
        try {
            const display = await this.totalPriceDisplay
            await display.waitForDisplayed({ timeout: 5000 })
            const text = await display.getText()
            console.log(`💰 Checkout total: ${text}`)
            return text
        } catch (error) {
            console.error(`⚠️ Failed to get total price: ${error}`)
            return ''
        }
    }

    /**
     * Assert that the thank-you message is visible.
     * Expected text: "Thanks for your order!"
     */
    public async assertThankYouMessageVisible(): Promise<void> {
        try {
            const message = await this.thankYouMessage
            await message.waitForDisplayed({ timeout: 5000 })
            const text = await message.getText()
            console.log(`✅ Thank you message visible: ${text}`)
        } catch (error) {
            throw new Error(`Thank you message not visible: ${error}`)
        }
    }

    /**
     * Assert that the page title is "Checkout".
     */
    public async assertPageTitle(): Promise<void> {
        const title = await this.getPageTitle()
        if (title !== 'Checkout') {
            throw new Error(
                `Expected page title 'Checkout', got '${title}'`
            )
        }
        console.log(`✅ Page title is 'Checkout'`)
    }
}

export default new CheckoutPage()