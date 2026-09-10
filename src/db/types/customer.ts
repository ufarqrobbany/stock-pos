export interface Customer {
    id: string;
    name: string;
    phone: string;
    notes?: string | null;
    createdAt: string;
    updatedAt?: string;
}
