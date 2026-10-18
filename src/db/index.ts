import { Dexie, type EntityTable } from 'dexie';
import { schemaV1 } from './schema';
import { seedUsers } from './seed';
import type { Customer } from './types/customer';
import type { Category, Product, ProductVariant } from './types/product';
import type { SalesTransaction, SalesTransactionItem } from './types/sales';
import type { StockAdjustment, StockBalance, StockEntry, StockHistory } from './types/stock';
import type { User } from './types/user';

export class StockPOSDatabase extends Dexie {
    users!: EntityTable<User, 'id'>;
    categories!: EntityTable<Category, 'id'>;
    products!: EntityTable<Product, 'id'>;
    productVariants!: EntityTable<ProductVariant, 'id'>;
    customers!: EntityTable<Customer, 'id'>;
    stockBalances!: EntityTable<StockBalance, 'id'>;
    stockEntries!: EntityTable<StockEntry, 'id'>;
    stockAdjustments!: EntityTable<StockAdjustment, 'id'>;
    stockHistories!: EntityTable<StockHistory, 'id'>;
    salesTransactions!: EntityTable<SalesTransaction, 'id'>;
    salesTransactionItems!: EntityTable<SalesTransactionItem, 'id'>;
    sales: any;

    constructor() {
        super('StockPOSDatabase');

        this.version(1).stores(schemaV1);

        this.on('populate', () => seedUsers(this));
    }
}

export const db = new StockPOSDatabase();
