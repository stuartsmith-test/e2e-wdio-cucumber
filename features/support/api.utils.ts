import axios, { AxiosInstance, AxiosResponse } from 'axios';

/**
 * API utility class for interacting with cart-related endpoints.
 * 
 * Ported from e2e-playwright/utils/api_helpers.py.
 * Uses axios for HTTP requests.
 */
export class ApiUtils {
    private static client: AxiosInstance;

    /**
     * Initialize the axios client with a base URL.
     * 
     * @param baseUrl The base URL of the application (e.g., http://localhost:3000)
     */
    static initialize(baseUrl: string): void {
        this.client = axios.create({
            baseURL: baseUrl,
            validateStatus: () => true, // Return response for all status codes (including errors); we handle errors manually in each method
        });
    }

    /**
     * Reset the cart via POST /reset-cart.
     * 
     * Equivalent to Python's reset_cart(api_request_context).
     * 
     * @returns The response from the server.
     * @throws Error if the response status is not OK (2xx).
     */
    static async resetCart(): Promise<AxiosResponse> {
        if (!this.client) {
            throw new Error('ApiUtils not initialized. Call ApiUtils.initialize(baseUrl) first.');
        }

        const response = await this.client.post('/reset-cart');

        // Assert success (equivalent to Python's `assert response.ok`)
        if (response.status < 200 || response.status >= 300) {
            throw new Error(
                `Reset cart failed. Status: ${response.status}. Body: ${JSON.stringify(response.data)}`
            );
        }

        console.log(`✅ Cart reset successfully (status: ${response.status})`);
        return response;
    }

    /**
     * Add a single item to the cart via POST /add-to-cart.
     * 
     * Equivalent to Python's add_to_cart(api_request_context, item_id).
     * 
     * @param itemId The ID of the item to add.
     * @returns The response from the server.
     * @throws Error if the response status is not OK (2xx).
     */
    static async addToCart(itemId: number): Promise<AxiosResponse> {
        if (!this.client) {
            throw new Error('ApiUtils not initialized. Call ApiUtils.initialize(baseUrl) first.');
        }

        const response = await this.client.post('/add-to-cart', {
            itemId: itemId,
        });

        // Assert success
        if (response.status < 200 || response.status >= 300) {
            throw new Error(
                `Add to cart failed for item ${itemId}. Status: ${response.status}. Body: ${JSON.stringify(response.data)}`
            );
        }

        console.log(`✅ Item ${itemId} added to cart (status: ${response.status})`);
        return response;
    }

    /**
     * Helper method: determine if HTTP status code indicates success.
     * Accepts 2xx (success) and 3xx (redirect) as valid for this app.
     * 
     * @param statusCode The HTTP status code to check.
     * @returns true if status is 2xx or 3xx; false otherwise.
     */
    static isSuccessStatus(statusCode: number): boolean {
        return statusCode >= 200 && statusCode < 400;
    }
}