import { db } from '@/db';
import type { SalesTransaction, SalesTransactionItem } from '@/db/types/sales';
import type { StockHistory } from '@/db/types/stock';
import type { CreateSaleInput } from '@/features/pos/types';
import type { Result } from '@/types/common';

function generateTransactionNumber(): string {
    const d = new Date();
    const dateStr = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
    const rand = Math.floor(Math.random() * 9000 + 1000);
    return `TRX-${dateStr}-${rand}`;
}

export const salesRepository = {
    async createSale(input: CreateSaleInput): Promise<Result<SalesTransaction>> {
        try {
            const now = new Date().toISOString();
            const transaction: SalesTransaction = {
                id: crypto.randomUUID(),
                transactionNumber: generateTransactionNumber(),
                cashierId: input.cashierId,
                customerId: input.customerId ?? null,
                customerName: input.customerName?.trim() || null,
                total: input.items.reduce((acc, item) => acc + item.price * item.quantity, 0),
                paymentMethod: input.paymentMethod,
                paymentStatus: 'PAID',
                status: 'COMPLETED',
                createdAt: now,
            };

            await db.transaction(
                'rw',
                [db.salesTransactions, db.salesTransactionItems, db.stockBalances, db.stockHistories],
                async () => {
                    const saleItems: SalesTransactionItem[] = [];
                    const histories: StockHistory[] = [];

                    for (const item of input.items) {
                        const variantId = item.variantId ?? null;
                        const balance = await db.stockBalances
                            .where('productId')
                            .equals(item.productId)
                            .and((b) => b.variantId === variantId)
                            .first();

                        const before = balance?.quantity ?? 0;
                        if (before < item.quantity) {
                            const name = item.variantName
                                ? `${item.productName} (${item.variantName})`
                                : item.productName;
                            throw new Error(
                                `Stok tidak mencukupi untuk "${name}". Sisa: ${before}, diminta: ${item.quantity}.`
                            );
                        }

                        const after = before - item.quantity;
                        if (balance) {
                            await db.stockBalances.update(balance.id, { quantity: after, updatedAt: now });
                        } else {
                            await db.stockBalances.add({
                                id: crypto.randomUUID(),
                                productId: item.productId,
                                variantId,
                                quantity: after,
                                updatedAt: now,
                            });
                        }

                        histories.push({
                            id: crypto.randomUUID(),
                            productId: item.productId,
                            variantId,
                            before,
                            balance: after,
                            referenceType: 'SALE',
                            referenceId: transaction.id,
                            createdAt: now,
                        });

                        saleItems.push({
                            id: crypto.randomUUID(),
                            transactionId: transaction.id,
                            productId: item.productId,
                            variantId,
                            productNameSnapshot: item.productName,
                            variantNameSnapshot: item.variantName ?? null,
                            skuSnapshot: item.sku ?? '',
                            unitPrice: item.price,
                            quantity: item.quantity,
                            subtotal: item.price * item.quantity,
                        });
                    }

                    await Promise.all([
                        db.salesTransactions.add(transaction),
                        db.salesTransactionItems.bulkAdd(saleItems),
                        db.stockHistories.bulkAdd(histories),
                    ]);
                }
            );

            return {
                success: true,
                data: transaction,
                message: 'Transaksi penjualan berhasil disimpan.',
            };
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Terjadi kesalahan saat memproses transaksi.',
            };
        }
    },
};
