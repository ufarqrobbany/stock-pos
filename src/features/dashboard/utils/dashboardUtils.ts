export type DashboardPeriod = 'Minggu Ini' | 'Bulan Ini' | 'Tahun Ini';

export const DASHBOARD_PERIODS: DashboardPeriod[] = ['Minggu Ini', 'Bulan Ini', 'Tahun Ini'];

const MONTH_NAMES = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
];

export function getPeriodLabel(period: DashboardPeriod, referenceDate: Date = new Date()): string {
    const now = referenceDate;

    if (period === 'Minggu Ini') {
        const day = now.getDay();
        const mon = new Date(now);
        mon.setDate(now.getDate() - ((day + 6) % 7));
        const sun = new Date(mon);
        sun.setDate(mon.getDate() + 6);

        const monYear = mon.getFullYear();
        const sunYear = sun.getFullYear();
        const monMonth = mon.getMonth();
        const sunMonth = sun.getMonth();
        const monDate = mon.getDate();
        const sunDate = sun.getDate();

        if (monYear !== sunYear) {
            return `${monDate} ${MONTH_NAMES[monMonth]} ${monYear} - ${sunDate} ${MONTH_NAMES[sunMonth]} ${sunYear}`;
        }

        if (monMonth !== sunMonth) {
            return `${monDate} ${MONTH_NAMES[monMonth]} - ${sunDate} ${MONTH_NAMES[sunMonth]} ${sunYear}`;
        }

        return `${monDate} - ${sunDate} ${MONTH_NAMES[sunMonth]} ${sunYear}`;
    }

    if (period === 'Bulan Ini') {
        return `${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`;
    }

    return `${now.getFullYear()}`;
}
