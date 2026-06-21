import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Plus, Pencil, Trash2, Power, Key } from 'lucide-react';
import { useState } from 'react';
import type { BreadcrumbItem } from '@/types';

interface Server {
    id: number;
    name: string;
    flag_code: string;
    protocol: string;
    config_uri: string;
    is_premium: boolean;
    is_custom: boolean;
    is_active: boolean;
    order_index: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Servers', href: '/admin/servers' },
];

export default function Index({ servers }: { servers: Server[] }) {
    const [editingServer, setEditingServer] = useState<Server | null>(null);

    const { data, setData, post, put, reset, processing, errors } = useForm({
        name: '',
        flag_code: '',
        protocol: 'vless',
        config_uri: '',
        is_premium: false,
        is_custom: false,
        is_active: true,
        order_index: 0,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingServer) {
            put(`/admin/servers/${editingServer.id}`, {
                onSuccess: () => {
                    setEditingServer(null);
                    reset();
                },
            });
        } else {
            post('/admin/servers', {
                onSuccess: () => reset(),
            });
        }
    };

    const handleEdit = (server: Server) => {
        setEditingServer(server);
        setData({
            name: server.name,
            flag_code: server.flag_code,
            protocol: server.protocol,
            config_uri: server.config_uri,
            is_premium: server.is_premium,
            is_custom: server.is_custom,
            is_active: server.is_active,
            order_index: server.order_index,
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this server?')) {
            router.delete(`/admin/servers/${id}`);
        }
    };

    const handleToggle = (id: number) => {
        router.post(`/admin/servers/${id}/toggle`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Servers" />
            <div className="flex flex-col gap-6 p-4 md:p-8">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">VPN Servers</h1>
                        <p className="text-muted-foreground">Add and manage your VPN server configurations.</p>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Form */}
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle>{editingServer ? 'Edit Server' : 'Add New Server'}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Server Name</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="e.g. Singapore 1"
                                        required
                                    />
                                    {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="flag_code">Flag Code</Label>
                                        <Input
                                            id="flag_code"
                                            value={data.flag_code}
                                            onChange={(e) => setData('flag_code', e.target.value)}
                                            placeholder="sg"
                                            required
                                        />
                                        {errors.flag_code && <p className="text-sm text-destructive">{errors.flag_code}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="order_index">Order Index</Label>
                                        <Input
                                            id="order_index"
                                            type="number"
                                            value={data.order_index}
                                            onChange={(e) => setData('order_index', parseInt(e.target.value))}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="protocol">Protocol</Label>
                                    <select
                                        id="protocol"
                                        className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                                        value={data.protocol}
                                        onChange={(e) => setData('protocol', e.target.value)}
                                        required
                                    >
                                        <option value="vless">VLESS</option>
                                        <option value="vmess">VMESS</option>
                                        <option value="trojan">Trojan</option>
                                        <option value="shadowsocks">Shadowsocks</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="config_uri">Config URI</Label>
                                    <textarea
                                        id="config_uri"
                                        rows={5}
                                        className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm font-mono"
                                        value={data.config_uri}
                                        onChange={(e) => setData('config_uri', e.target.value)}
                                        required
                                    />
                                    {errors.config_uri && <p className="text-sm text-destructive">{errors.config_uri}</p>}
                                </div>

                                <div className="flex items-center space-x-4 pt-2">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="is_premium"
                                            checked={data.is_premium}
                                            onCheckedChange={(checked) => setData('is_premium', !!checked)}
                                        />
                                        <Label htmlFor="is_premium" className="text-sm font-medium">Premium</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="is_custom"
                                            checked={data.is_custom}
                                            onCheckedChange={(checked) => setData('is_custom', !!checked)}
                                        />
                                        <Label htmlFor="is_custom" className="text-sm font-medium">Custom</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="is_active"
                                            checked={data.is_active}
                                            onCheckedChange={(checked) => setData('is_active', !!checked)}
                                        />
                                        <Label htmlFor="is_active" className="text-sm font-medium">Active</Label>
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-4">
                                    <Button type="submit" className="flex-1" disabled={processing}>
                                        {editingServer ? 'Update Server' : 'Add Server'}
                                    </Button>
                                    {editingServer && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                setEditingServer(null);
                                                reset();
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                    )}
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Table */}
                    <Card className="lg:col-span-2 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-muted text-muted-foreground uppercase text-xs font-medium">
                                    <tr>
                                        <th className="px-4 py-3">Server</th>
                                        <th className="px-4 py-3">Protocol</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {servers.map((server) => (
                                        <tr key={server.id} className="hover:bg-muted/50 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-lg">{server.flag_code.toUpperCase()}</span>
                                                    <div>
                                                        <div className="font-medium">{server.name}</div>
                                                        <div className="text-xs text-muted-foreground">Order: {server.order_index}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 uppercase">
                                                <Badge variant="outline">{server.protocol}</Badge>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex gap-1">
                                                    {server.is_premium && <Badge variant="default" className="bg-amber-500 text-white">VIP</Badge>}
                                                    {server.is_custom && <Badge variant="default" className="bg-purple-500 text-white">Custom</Badge>}
                                                    {server.is_active ? (
                                                        <Badge variant="default" className="bg-green-500 text-white">Active</Badge>
                                                    ) : (
                                                        <Badge variant="secondary">Inactive</Badge>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Button size="icon" variant="ghost" onClick={() => handleToggle(server.id)} title="Toggle Active">
                                                        <Power className={`h-4 w-4 ${server.is_active ? 'text-green-500' : 'text-muted-foreground'}`} />
                                                    </Button>
                                                    <Button size="icon" variant="ghost" onClick={() => handleEdit(server)} title="Edit">
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button size="icon" variant="ghost" onClick={() => handleDelete(server.id)} title="Delete" className="text-destructive">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {servers.length === 0 && (
                                <div className="p-8 text-center text-muted-foreground">
                                    No servers found. Add your first server using the form.
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
