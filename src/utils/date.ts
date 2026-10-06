export function formatDate(
    date: string | Date | number | null | undefined,
    options?: Intl.DateTimeFormatOptions
): string {
    if (!date) return '-';

    const dateObj = typeof date === 'object' && date instanceof Date ? date : new Date(date);

    if (Number.isNaN(dateObj.getTime())) return '-';

    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        ...options,
    }).format(dateObj);
}
