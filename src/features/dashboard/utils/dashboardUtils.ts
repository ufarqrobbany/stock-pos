export type DashboardPeriod = 'Minggu Ini' | 'Bulan Ini' | 'Tahun Ini';

export const DASHBOARD_PERIODS: DashboardPeriod[] = ['Minggu Ini', 'Bulan Ini', 'Tahun Ini'];

const pad = (n: number) => String(n).padStart(2, '0');
const fmtDate = (d: Date) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;

export function getPeriodLabel(period: DashboardPeriod): string {
    const now = new Date();

    if (period === 'Minggu Ini') {
        const day = now.getDay();
        const mon = new Date(now);
        mon.setDate(now.getDate() - ((day + 6) % 7));
        const sun = new Date(mon);
        sun.setDate(mon.getDate() + 6);
        return `${fmtDate(mon)} – ${fmtDate(sun)}`;
    }

    if (period === 'Bulan Ini') {
        const first = new Date(now.getFullYear(), now.getMonth(), 1);
        const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return `${fmtDate(first)} – ${fmtDate(last)}`;
    }

    return `01/01/${now.getFullYear()} – 31/12/${now.getFullYear()}`;
}
