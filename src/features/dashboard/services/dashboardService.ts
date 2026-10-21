import { dashboardRepository } from '@/db/repositories/dashboardRepository';
import type { DashboardPeriod } from '@/features/dashboard/utils/dashboardUtils';

export function getPeriodRange(period: DashboardPeriod): { start: string; end: string } {
    const now = new Date();

    if (period === 'Minggu Ini') {
        const dayOfWeek = now.getDay();
        const monday = new Date(now);
        monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
        monday.setHours(0, 0, 0, 0);
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        sunday.setHours(23, 59, 59, 999);
        return { start: monday.toISOString(), end: sunday.toISOString() };
    }

    if (period === 'Bulan Ini') {
        const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        return { start: start.toISOString(), end: end.toISOString() };
    }

    const start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
    const end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
    return { start: start.toISOString(), end: end.toISOString() };
}

export const dashboardService = {
    getMetrics: dashboardRepository.getMetrics.bind(dashboardRepository),
    getSalesWeekly: dashboardRepository.getSalesWeekly.bind(dashboardRepository),
    getSalesThisMonth: dashboardRepository.getSalesThisMonth.bind(dashboardRepository),
    getSalesThisYear: dashboardRepository.getSalesThisYear.bind(dashboardRepository),
    getTxWeekly: dashboardRepository.getTxWeekly.bind(dashboardRepository),
    getTxThisMonth: dashboardRepository.getTxThisMonth.bind(dashboardRepository),
    getTxThisYear: dashboardRepository.getTxThisYear.bind(dashboardRepository),
    getLowStock: dashboardRepository.getLowStock.bind(dashboardRepository),
    getTopProducts: dashboardRepository.getTopProducts.bind(dashboardRepository),
    getRecentTransactions: dashboardRepository.getRecentTransactions.bind(dashboardRepository),
};
