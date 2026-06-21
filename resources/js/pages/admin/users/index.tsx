import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ShieldCheck, ShieldX, Smartphone, Clock, User, Check, X } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import type { BreadcrumbItem } from '@/types';

interface MobileUser {
    id: number;
    device_id: string;
    api_token: string;
    is_premium: boolean;
    premium_expires_at: string | null;
    device_model: string | null;
    os_version: string | null;
    last_login: string | null;
    created_at: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface UserResponse {
    data: MobileUser[];
    links: PaginationLink[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Mobile Users', href: '/admin/users' },
];

export default function Index({ users }: { users: UserResponse }) {
    const [selectedUser, setSelectedUser] = useState<MobileUser | null>(null);
    const { data, setData, post, processing } = useForm({
        duration_days: 30,
    });

    const handleTogglePremium = (id: number) => {
        router.post(`/admin/users/${id}/toggle-premium`, {
            duration_days: data.duration_days,
        }, {
            onSuccess: () => setSelectedUser(null),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Mobile Users" />
            <div className="flex flex-col gap-6 p-4 md:p-8">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Mobile Users</h1>
                        <p className="text-muted-foreground">View app clients and manage their premium status.</p>
                    </div>
                </div>

                <Card className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted text-muted-foreground uppercase text-xs font-medium">
                                <tr>
                                    <th className="px-4 py-3">Device / ID</th>
                                    <th className="px-4 py-3">Premium Status</th>
                                    <th className="px-4 py-3">Last Login</th>
                                    <th className="px-4 py-3">Registered</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {users.data.map((user) => (
                                    <tr key={user.id} className="hover:bg-muted/50 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-1 font-medium">
                                                    <Smartphone className="h-3 w-3 text-muted-foreground" />
                                                    <span>{user.device_model || 'Unknown Device'}</span>
                                                </div>
                                                <span className="text-[10px] font-mono text-muted-foreground truncate max-w-[150px]" title={user.device_id}>
                                                    {user.device_id}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            {user.is_premium ? (
                                                <div className="flex flex-col gap-1">
                                                    <Badge className="bg-green-500 text-white w-fit">PREMIUM</Badge>
                                                    <span className="text-[10px] text-muted-foreground flex items-center">
                                                        <Clock className="h-2 w-2 mr-1" />
                                                        Exp: {new Date(user.premium_expires_at!).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            ) : (
                                                <Badge variant="secondary" className="w-fit">FREE</Badge>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-xs">
                                                {user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-xs">
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex justify-end gap-1">
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button size="sm" variant="outline" onClick={() => setSelectedUser(user)}>
                                                            <User className="h-4 w-4 mr-1" />
                                                            Manage
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>Manage User: {user.device_model || 'Device'}</DialogTitle>
                                                        </DialogHeader>
                                                        <div className="space-y-6 mt-4">
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-muted p-4 rounded-lg">
                                                                <div>
                                                                    <Label className="text-xs text-muted-foreground font-bold">Device ID</Label>
                                                                    <p className="font-mono text-xs truncate" title={user.device_id}>{user.device_id}</p>
                                                                </div>
                                                                <div>
                                                                    <Label className="text-xs text-muted-foreground font-bold">OS Version</Label>
                                                                    <p className="font-medium">{user.os_version || 'N/A'}</p>
                                                                </div>
                                                                <div>
                                                                    <Label className="text-xs text-muted-foreground font-bold">Registered</Label>
                                                                    <p className="font-medium">{new Date(user.created_at).toLocaleString()}</p>
                                                                </div>
                                                                <div>
                                                                    <Label className="text-xs text-muted-foreground font-bold">Current Status</Label>
                                                                    <p className="font-medium">{user.is_premium ? 'Premium' : 'Free'}</p>
                                                                </div>
                                                            </div>

                                                            <div className="space-y-4 pt-4 border-t">
                                                                <h4 className="font-bold text-sm">Premium Management</h4>
                                                                {!user.is_premium ? (
                                                                    <div className="space-y-4">
                                                                        <div className="space-y-2">
                                                                            <Label htmlFor="duration">Grant Premium for (Days)</Label>
                                                                            <Input
                                                                                id="duration"
                                                                                type="number"
                                                                                value={data.duration_days}
                                                                                onChange={(e) => setData('duration_days', parseInt(e.target.value))}
                                                                                min={1}
                                                                            />
                                                                        </div>
                                                                        <Button className="w-full bg-green-500 hover:bg-green-600 text-white" onClick={() => handleTogglePremium(user.id)}>
                                                                            <ShieldCheck className="h-4 w-4 mr-2" />
                                                                            Grant Premium
                                                                        </Button>
                                                                    </div>
                                                                ) : (
                                                                    <div className="space-y-4">
                                                                        <div className="p-3 bg-green-50 text-green-700 rounded-md text-xs border border-green-200">
                                                                            User currently has premium until <span className="font-bold">{new Date(user.premium_expires_at!).toLocaleString()}</span>
                                                                        </div>
                                                                        <Button variant="destructive" className="w-full" onClick={() => handleTogglePremium(user.id)}>
                                                                            <ShieldX className="h-4 w-4 mr-2" />
                                                                            Revoke Premium
                                                                        </Button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {users.data.length === 0 && (
                            <div className="p-8 text-center text-muted-foreground">
                                No mobile users found.
                            </div>
                        )}
                    </div>
                </Card>

                {/* Pagination */}
                <div className="flex justify-center gap-1 mt-4">
                    {users.links.map((link, i) => (
                        <Button
                            key={i}
                            variant={link.active ? "default" : "outline"}
                            size="sm"
                            disabled={!link.url}
                            onClick={() => link.url && router.get(link.url)}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
