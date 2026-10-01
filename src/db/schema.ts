export const schemaV1 = {
    users: 'id, &username, name, role, createdAt, [role+username], [role+name], [role+createdAt]',
    categories: 'id, parentId',
    products: 'id, categoryId, sku, createdAt',
    productVariants: 'id, productId, &sku',
    customers: 'id, &phone, createdAt',
    stockBalances: 'id, productId, variantId',
    stockEntries: 'id, productId, variantId, receivedAt',
    stockAdjustments: 'id, productId, variantId, createdAt',
    stockHistories: 'id, productId, variantId, referenceId, createdAt',
    salesTransactions: 'id, &transactionNumber, cashierId, customerId, status, createdAt',
    salesTransactionItems: 'id, transactionId, productId, variantId',
};
