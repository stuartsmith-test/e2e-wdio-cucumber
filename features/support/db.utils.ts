import * as sqlite3 from 'sqlite3';
import * as path from 'path';

/**
 * Database utility class for interacting with the SQLite shop.db.
 * 
 * Ported from e2e-playwright/utils/dbHelpers.py.
 * Uses sqlite3 for asynchronous SQLite access.
 */
export class DbUtils {
    /**
     * Establish a new SQLite connection to the given database path.
     * 
     * @param dbPath The absolute or relative path to shop.db (e.g., "app-under-test/shop.db")
     * @returns A Promise resolving to a SQLite Database connection.
     */
    static getConnection(dbPath: string): Promise<sqlite3.Database> {
        return new Promise((resolve, reject) => {
            // Resolve relative paths from the project root
            const resolvedPath = path.isAbsolute(dbPath)
                ? dbPath
                : path.resolve(process.cwd(), dbPath);

            const db = new sqlite3.Database(resolvedPath, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(db);
                }
            });
        });
    }

    /**
     * Execute a SELECT query and return the first row as an object (or null if no rows).
     * 
     * Equivalent to Python's fetch_one(query, params).
     * 
     * @param dbPath The absolute or relative path to shop.db.
     * @param query SQL SELECT statement with optional ? placeholders.
     * @param params Query parameters (in order matching ? placeholders). Optional.
     * @returns A Promise resolving to a single row as an object, or null if no rows match.
     */
    static fetchOne(
        dbPath: string,
        query: string,
        params: any[] = []
    ): Promise<Record<string, any> | null> {
        return new Promise(async (resolve, reject) => {
            try {
                const db = await this.getConnection(dbPath);

                db.get(query, params, (err: Error | null, row: any) => {
                    db.close();

                    if (err) {
                        reject(err);
                    } else {
                        resolve(row || null);
                    }
                });
            } catch (err) {
                reject(err);
            }
        });
    }

    /**
     * Execute a SELECT query and return all rows as an array of objects.
     * 
     * Equivalent to Python's fetch_all(query, params).
     * 
     * @param dbPath The absolute or relative path to shop.db.
     * @param query SQL SELECT statement with optional ? placeholders.
     * @param params Query parameters (in order matching ? placeholders). Optional.
     * @returns A Promise resolving to an array of row objects. Empty array if no rows found.
     */
    static fetchAll(
        dbPath: string,
        query: string,
        params: any[] = []
    ): Promise<Record<string, any>[]> {
        return new Promise(async (resolve, reject) => {
            try {
                const db = await this.getConnection(dbPath);

                db.all(query, params, (err: Error | null, rows: any[]) => {
                    db.close();

                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows || []);
                    }
                });
            } catch (err) {
                reject(err);
            }
        });
    }

    /**
     * Execute a write (INSERT/UPDATE/DELETE) and commit.
     * 
     * Equivalent to Python's execute_query(query, params).
     * 
     * @param dbPath The absolute or relative path to shop.db.
     * @param query SQL INSERT/UPDATE/DELETE statement with optional ? placeholders.
     * @param params Query parameters (in order matching ? placeholders). Optional.
     * @returns A Promise that resolves when the query completes.
     */
    static executeQuery(
        dbPath: string,
        query: string,
        params: any[] = []
    ): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                const db = await this.getConnection(dbPath);

                db.run(query, params, (err: Error | null) => {
                    db.close();

                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            } catch (err) {
                reject(err);
            }
        });
    }

    /**
     * Delete all rows from the given table (simple test cleanup helper).
     * 
     * Equivalent to Python's reset_table(table_name).
     * 
     * @param dbPath The absolute or relative path to shop.db.
     * @param tableName The name of the table to clear (e.g., "cart").
     * @returns A Promise that resolves when the deletion completes.
     */
    static resetTable(dbPath: string, tableName: string): Promise<void> {
        return this.executeQuery(dbPath, `DELETE FROM ${tableName}`);
    }

    /**
     * Return the quantity for an item in the cart (or 0 if not present).
     * 
     * Equivalent to Python's get_cart_quantity(item_id).
     * 
     * @param dbPath The absolute or relative path to shop.db.
     * @param itemId The ID of the item.
     * @returns A Promise resolving to the quantity in the cart, or 0 if the item is not in the cart.
     */
    static async getCartQuantity(dbPath: string, itemId: number): Promise<number> {
        const row = await this.fetchOne(
            dbPath,
            'SELECT quantity FROM cart WHERE item_id = ?',
            [itemId]
        );

        return row && row.quantity ? parseInt(row.quantity, 10) : 0;
    }

    /**
     * Return the display name for an item (or null if not found).
     * 
     * Equivalent to Python's get_item_name(item_id).
     * 
     * @param dbPath The absolute or relative path to shop.db.
     * @param itemId The ID of the item.
     * @returns A Promise resolving to the item's name (e.g., "Koala"), or null if not found.
     */
    static async getItemName(dbPath: string, itemId: number): Promise<string | null> {
        const row = await this.fetchOne(
            dbPath,
            'SELECT name FROM items WHERE id = ?',
            [itemId]
        );

        return row && row.name ? (row.name as string) : null;
    }

    /**
     * Return the total count of items in the cart.
     * 
     * Useful for validating cart state without checking individual items.
     * 
     * @param dbPath The absolute or relative path to shop.db.
     * @returns A Promise resolving to the sum of all quantities in the cart, or 0 if cart is empty.
     */
    static async getCartTotal(dbPath: string): Promise<number> {
        const row = await this.fetchOne(
            dbPath,
            'SELECT SUM(quantity) AS total FROM cart'
        );

        return row && row.total ? parseInt(row.total, 10) : 0;
    }
}