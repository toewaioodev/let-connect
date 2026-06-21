import { Link, usePage } from '@inertiajs/react';
import { BookOpen, FolderGit2, LayoutGrid, Server, Image, CreditCard, Key, Megaphone, Users } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import * as routes from '@/routes';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: routes.dashboard().url,
        icon: LayoutGrid,
    },
];

const adminNavItems: NavItem[] = [
    {
        title: 'Servers',
        href: '/admin/servers',
        icon: Server,
    },
    {
        title: 'Ads',
        href: '/admin/ads',
        icon: Image,
    },
    {
        title: 'Payments',
        href: '/admin/payments',
        icon: CreditCard,
    },
    {
        title: 'Redeem Keys',
        href: '/admin/keys',
        icon: Key,
    },
    {
        title: 'Custom Keys',
        href: '/admin/custom-keys',
        icon: Key,
    },
    {
        title: 'Announcements',
        href: '/admin/announcements',
        icon: Megaphone,
    },
    {
        title: 'Mobile Users',
        href: '/admin/users',
        icon: Users,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Application Panel',
        href: '/admin/servers',
        icon: Server,
    },
];

export function AppSidebar() {
    const { pendingPaymentsCount } = usePage<{ pendingPaymentsCount: number }>().props;

    const navItemsWithBadges = adminNavItems.map(item => {
        if (item.title === 'Payments' && pendingPaymentsCount > 0) {
            return {
                ...item,
                badge: pendingPaymentsCount > 99 ? '99+' : pendingPaymentsCount.toString()
            };
        }
        return item;
    });

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={routes.dashboard().url} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
                <NavMain items={navItemsWithBadges} title="Administration" />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
