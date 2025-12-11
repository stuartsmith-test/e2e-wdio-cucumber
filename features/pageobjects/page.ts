import { browser } from '@wdio/globals'

/**
 * Base page object containing all methods and functionality
 * that is shared across all page objects.
 */
export default class Page {
    /**
     * Opens a sub page of the page.
     * 
     * @param path Path of the sub page (e.g. /path/to/page.html)
     */
    public open(path: string = '') {
        return browser.url(path)
    }

    /**
     * Get the current page title.
     * 
     * @returns The page title.
     */
    public async getPageTitle(): Promise<string> {
        return await browser.getTitle()
    }

    /**
     * Wait for an element to be visible.
     * 
     * @param selector The element selector.
     * @param timeout Optional timeout in milliseconds (default 5000).
     */
    public async waitForElement(selector: string, timeout: number = 5000): Promise<void> {
        const element = await $(selector)
        await element.waitForDisplayed({ timeout })
    }

    /**
     * Check if text is visible anywhere on the page.
     * 
     * @param text The text to search for.
     * @returns true if visible; false otherwise.
     */
    public async isTextVisible(text: string): Promise<boolean> {
        try {
            const element = await $(`//*[contains(text(), '${text}')]`)
            return await element.isDisplayed()
        } catch {
            return false
        }
    }

    /**
     * Assert that text is visible on the page.
     * Equivalent to Python's expect_text_visible(page, text).
     * 
     * @param text The text to assert.
     * @throws Error if text is not visible.
     */
    public async assertTextVisible(text: string): Promise<void> {
        const isVisible = await this.isTextVisible(text)
        if (!isVisible) {
            throw new Error(`Expected text '${text}' not found or not visible on page`)
        }
        console.log(`✅ Text found on page: '${text}'`)
    }
}