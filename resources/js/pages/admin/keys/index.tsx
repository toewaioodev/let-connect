import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Plus, Trash2, Key, Calendar } from 'lucide-react';
import type { BreadcrumbItem } from '@/types';

interface RedeemKey {
    id: number;
    key_code: string;
    duration_days: number;
    is_used: boolean;
    used_by_device: string | null;
    used_at: string | null;
    created_at: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Redeem Keys', href: '/admin/keys' },
];

export default function Index({ keys }: { keys: RedeemKey[] }) {
    const { data, setData, post, reset, processing, errors } = useForm({
        duration_days: 30,
        count: 1,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/keys', {
            onSuccess: () => reset(),
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this key?')) {
            router.delete(`/admin/keys/${id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Redeem Keys" />
            <div className="flex flex-col gap-6 p-4 md:p-8">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Redeem Keys</h1>
                        <p className="text-muted-foreground">Bulk generate keys for premium status activation.</p>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-4">
                    {/* Form */}
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle>Generate Keys</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="duration_days">Duration (Days)</Label>
                                    <Input
                                        id="duration_days"
                                        type="number"
                                        value={data.duration_days}
                                        onChange={(e) => setData('duration_days', parseInt(e.target.value))}
                                        min={1}
                                        required
                                    />
                                    {errors.duration_days && <p className="text-sm text-destructive">{errors.duration_days}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="count">Number of Keys</Label>
                                    <Input
                                        id="count"
                                        type="number"
                                        value={data.count}
                                        onChange={(e) => setData('count', parseInt(e.target.value))}
                                        min={1}
                                        max={100}
                                        required
                                    />
                                    {errors.count && <p className="text-sm text-destructive">{errors.count}</p>}
                                </div>

                                <Button type="submit" className="w-full" disabled={processing}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Generate Keys
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Table */}
                    <Card className="lg:col-span-3 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-muted text-muted-foreground uppercase text-xs font-medium">
                                    <tr>
                                        <th className="px-4 py-3">Key Code</th>
                                        <th className="px-4 py-3">Duration</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3">Used By</th>
                                        <th className="px-4 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {keys.map((key) => (
                                        <tr key={key.id} className="hover:bg-muted/50 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <Key className="h-3 w-3 text-muted-foreground" />
                                                    <span className="font-mono font-bold tracking-wider">{key.key_code}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3 text-muted-foreground" />
                                                    <span>{key.duration_days} days</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge variant={key.is_used ? "secondary" : "default"} className={key.is_used ? "" : "bg-green-500 text-white"}>
                                                    {key.is_used ? "USED" : "AVAILABLE"}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3">
                                                {key.is_used ? (
                                                    <div className="flex flex-col">
                                                        <span className="text-xs">{key.used_by_device}</span>
                                                        <span className="text-[10px] text-muted-foreground">{new Date(key.used_at!).toLocaleString()}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground text-xs italic">-</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <Button size="icon" variant="ghost" onClick={() => handleDelete(key.id)} className="text-destructive hover:bg-destructive/10">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {keys.length === 0 && (
                                <div className="p-8 text-center text-muted-foreground">
                                    No keys found. Generate your first batch using the form.
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
