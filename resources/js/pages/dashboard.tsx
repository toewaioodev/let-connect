import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Users,
    Crown,
    UserCheck,
    Server,
    CreditCard,
    Clock,
    CheckCircle,
    XCircle,
    Key,
    Megaphone,
    TrendingUp,
    UserPlus,
    Monitor,
    Shield,
    ExternalLink,
    Activity,
} from 'lucide-react';
import type { BreadcrumbItem } from '@/types';

interface Stats {
    totalUsers: number;
    premiumUsers: number;
    freeUsers: number;
    newUsersToday: number;
    newUsersThisWeek: number;
    dailyActiveUsers: number;
    pendingPayments: number;
    approvedPayments: number;
    rejectedPayments: number;
    activeServers: number;
    totalServers: number;
    premiumServers: number;
    activeAds: number;
    unusedKeys: number;
}

interface RecentPayment {
    id: number;
    device_id: string;
    plan_name: string;
    plan_price: string;
    sender_name: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
}

interface RecentUser {
    id: number;
    device_id: string;
    device_model: string | null;
    is_premium: boolean;
    created_at: string;
    last_login: string | null;
}

interface ChartPoint {
    date: string;
    count: number;
}

interface ActiveAnnouncement {
    id: number;
    message: string;
    url: string | null;
    is_active: boolean;
    min_version_code: number;
}

interface Props {
    stats: Stats;
    recentPayments: RecentPayment[];
    recentUsers: RecentUser[];
    registrationChart: ChartPoint[];
    activeAnnouncement: ActiveAnnouncement | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
];

function StatCard({
    title,
    value,
    sub,
    icon: Icon,
    iconClass = 'text-primary',
    bgClass = 'bg-primary/10',
    badge,
    badgeVariant = 'default',
    href,
}: {
    title: string;
    value: number | string;
    sub?: string;
    icon: React.ElementType;
    iconClass?: string;
    bgClass?: string;
    badge?: string;
    badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
    href?: string;
}) {
    const inner = (
        <Card className="hover:shadow-md transition-shadow cursor-pointer group">
            <CardContent className="p-5">
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">{title}</p>
                        <p className="text-3xl font-bold">{value}</p>
                        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
                    </div>
                    <div className={`p-2.5 rounded-xl ${bgClass}`}>
                        <Icon className={`h-5 w-5 ${iconClass}`} />
                    </div>
                </div>
                {badge && (
                    <div className="mt-3">
                        <Badge variant={badgeVariant} className="text-[10px]">{badge}</Badge>
                    </div>
                )}
            </CardContent>
        </Card>
    );

    return href ? <Link href={href} prefetch>{inner}</Link> : inner;
}

function statusBadge(status: RecentPayment['status']) {
    if (status === 'approved') return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-800 text-[10px]">Approved</Badge>;
    if (status === 'rejected') return <Badge variant="destructive" className="text-[10px] bg-red-500/10 text-red-600 border-red-200 dark:border-red-800">Rejected</Badge>;
    return <Badge variant="secondary" className="text-[10px]">Pending</Badge>;
}

export default function Dashboard({ stats, recentPayments, recentUsers, registrationChart, activeAnnouncement }: Props) {
    const maxChartCount = Math.max(...registrationChart.map((p) => p.count), 1);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex flex-col gap-6 p-4 md:p-8">

                {/* Page heading */}
                <div>
                    <h1 className="text-2xl font-bold">Dashboard</h1>
                    <p className="text-muted-foreground text-sm">Overview of your LetConnect app.</p>
                </div>

                {/* Active Announcement Banner */}
                {activeAnnouncement && (
                    <div className="flex items-start gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3">
                        <Megaphone className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">Active Announcement</p>
                            <p className="text-xs text-muted-foreground truncate">{activeAnnouncement.message}</p>
                        </div>
                        {activeAnnouncement.min_version_code > 0 && (
                            <Badge variant="outline" className="text-[10px] shrink-0">v&lt;{activeAnnouncement.min_version_code}</Badge>
                        )}
                        <Link href="/admin/announcements">
                            <Button size="sm" variant="ghost" className="text-xs h-7 shrink-0">Manage</Button>
                        </Link>
                    </div>
                )}

                {/* ── Row 1: User Stats ───────────────────────────────────────── */}
                <div>
                    <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Users</h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                        <StatCard
                            title="Total Users"
                            value={stats.totalUsers}
                            sub={`+${stats.newUsersThisWeek} this week`}
                            icon={Users}
                            href="/admin/users"
                        />
                        <StatCard
                            title="Premium Users"
                            value={stats.premiumUsers}
                            sub={`${stats.totalUsers > 0 ? Math.round((stats.premiumUsers / stats.totalUsers) * 100) : 0}% of total`}
                            icon={Crown}
                            iconClass="text-amber-500"
                            bgClass="bg-amber-500/10"
                            badge="Active subscribers"
                            badgeVariant="outline"
                            href="/admin/users"
                        />
                        <StatCard
                            title="Free Users"
                            value={stats.freeUsers}
                            icon={UserCheck}
                            iconClass="text-sky-500"
                            bgClass="bg-sky-500/10"
                        />
                        <StatCard
                            title="New Today"
                            value={stats.newUsersToday}
                            icon={UserPlus}
                            iconClass="text-emerald-500"
                            bgClass="bg-emerald-500/10"
                            badge="Registrations"
                            badgeVariant="secondary"
                        />
                        <StatCard
                            title="Daily Active"
                            value={stats.dailyActiveUsers}
                            icon={Activity}
                            iconClass="text-blue-500"
                            bgClass="bg-blue-500/10"
                            badge="Logged in today"
                            badgeVariant="outline"
                        />
                    </div>
                </div>

                {/* ── Row 2: Payments & Servers ──────────────────────────────── */}
                <div className="grid gap-6 lg:grid-cols-2">
                    <div>
                        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Payments</h2>
                        <div className="grid gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3">
                            <StatCard
                                title="Pending"
                                value={stats.pendingPayments}
                                icon={Clock}
                                iconClass="text-amber-500"
                                bgClass="bg-amber-500/10"
                                badge={stats.pendingPayments > 0 ? 'Needs review' : undefined}
                                badgeVariant="default"
                                href="/admin/payments?status=pending"
                            />
                            <StatCard
                                title="Approved"
                                value={stats.approvedPayments}
                                icon={CheckCircle}
                                iconClass="text-emerald-500"
                                bgClass="bg-emerald-500/10"
                                href="/admin/payments?status=approved"
                            />
                            <StatCard
                                title="Rejected"
                                value={stats.rejectedPayments}
                                icon={XCircle}
                                iconClass="text-red-500"
                                bgClass="bg-red-500/10"
                                href="/admin/payments?status=rejected"
                            />
                        </div>
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Infrastructure</h2>
                        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                            <StatCard
                                title="Active Servers"
                                value={stats.activeServers}
                                sub={`of ${stats.totalServers} total`}
                                icon={Server}
                                iconClass="text-violet-500"
                                bgClass="bg-violet-500/10"
                                href="/admin/servers"
                            />
                            <StatCard
                                title="Premium Servers"
                                value={stats.premiumServers}
                                icon={Shield}
                                iconClass="text-indigo-500"
                                bgClass="bg-indigo-500/10"
                                href="/admin/servers"
                            />
                            <StatCard
                                title="Free Keys"
                                value={stats.unusedKeys}
                                icon={Key}
                                iconClass="text-teal-500"
                                bgClass="bg-teal-500/10"
                                href="/admin/keys"
                            />
                        </div>
                    </div>
                </div>

                {/* ── Row 3: Chart + Recent Payments ────────────────────────── */}
                <div className="grid gap-6 lg:grid-cols-5">
                    {/* 7-day bar chart */}
                    <Card className="lg:col-span-2">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-primary" />
                                New Registrations (7 days)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-end gap-2 h-28">
                                {registrationChart.map((point) => (
                                    <div key={point.date} className="flex flex-col items-center gap-1 flex-1">
                                        <span className="text-[9px] text-muted-foreground font-medium">{point.count || ''}</span>
                                        <div
                                            className="w-full rounded-t-sm bg-primary/70 min-h-[3px] transition-all"
                                            style={{ height: `${Math.max((point.count / maxChartCount) * 88, 3)}px` }}
                                        />
                                        <span className="text-[9px] text-muted-foreground">{point.date.split(' ')[1]}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Payments */}
                    <Card className="lg:col-span-3">
                        <CardHeader className="pb-2 flex flex-row items-center justify-between">
                            <CardTitle className="text-base flex items-center gap-2">
                                <CreditCard className="h-4 w-4 text-primary" />
                                Recent Payments
                            </CardTitle>
                            <Link href="/admin/payments" prefetch>
                                <Button variant="ghost" size="sm" className="text-xs h-7 gap-1">
                                    View all <ExternalLink className="h-3 w-3" />
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent className="p-0">
                            {recentPayments.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-8">No payment requests yet.</p>
                            ) : (
                                <div className="divide-y">
                                    {recentPayments.map((p) => (
                                        <div key={p.id} className="flex items-center gap-3 px-6 py-3">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{p.sender_name}</p>
                                                <p className="text-xs text-muted-foreground">{p.plan_name} · {p.plan_price}</p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                {statusBadge(p.status)}
                                                <p className="text-[10px] text-muted-foreground mt-1">
                                                    {new Date(p.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* ── Row 4: Recent Users ────────────────────────────────────── */}
                <Card>
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Monitor className="h-4 w-4 text-primary" />
                            Recent Registrations
                        </CardTitle>
                        <Link href="/admin/users" prefetch>
                            <Button variant="ghost" size="sm" className="text-xs h-7 gap-1">
                                View all <ExternalLink className="h-3 w-3" />
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent className="p-0">
                        {recentUsers.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-8">No users yet.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground">Device</th>
                                            <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Model</th>
                                            <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Status</th>
                                            <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Registered</th>
                                            <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground hidden md:table-cell">Last Login</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {recentUsers.map((u) => (
                                            <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                                                <td className="px-6 py-3 font-mono text-xs text-muted-foreground truncate max-w-[140px]">
                                                    {u.device_id.slice(0, 12)}…
                                                </td>
                                                <td className="px-4 py-3 text-xs">{u.device_model ?? '—'}</td>
                                                <td className="px-4 py-3">
                                                    {u.is_premium
                                                        ? <Badge className="text-[10px] bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-800">Premium</Badge>
                                                        : <Badge variant="secondary" className="text-[10px]">Free</Badge>
                                                    }
                                                </td>
                                                <td className="px-4 py-3 text-xs text-muted-foreground">
                                                    {new Date(u.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell">
                                                    {u.last_login ? new Date(u.last_login).toLocaleDateString() : '—'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>

            </div>
        </AppLayout>
    );
}
