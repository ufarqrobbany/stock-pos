export function generateSku(name?: string): string {
    const clean = (name ?? '')
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .slice(0, 4);
    const prefix = clean.length >= 2 ? clean : 'PRD';
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${rand}`;
}
