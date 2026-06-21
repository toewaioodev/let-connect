import { Head, useForm, router, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Check, X, Eye, User } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import type { BreadcrumbItem } from '@/types';

interface PaymentRequest {
    id: number;
    device_id: string;
    plan_id: string;
    plan_name: string;
    plan_price: string;
    transaction_id: string;
    sender_name: string;
    email: string | null;
    screenshot_data: string;
    status: 'pending' | 'approved' | 'rejected';
    admin_note: string | null;
    created_at: string;
    mobile_user?: {
        id: number;
        device_id: string;
    } | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Payments', href: '/admin/payments' },
];

export default function Index({ payments, filters }: { payments: PaymentRequest[], filters?: { status?: string } }) {
    const [selectedPayment, setSelectedPayment] = useState<PaymentRequest | null>(null);
    const { data, setData, post, processing } = useForm({
        admin_note: '',
    });

    const handleApprove = (id: number) => {
        if (confirm('Approve this payment and grant premium status?')) {
            router.post(`/admin/payments/${id}/approve`, {
                admin_note: data.admin_note,
            }, {
                onSuccess: () => {
                    setSelectedPayment(null);
                    setData('admin_note', '');
                }
            });
        }
    };

    const handleReject = (id: number) => {
        if (confirm('Reject this payment request?')) {
            router.post(`/admin/payments/${id}/reject`, {
                admin_note: data.admin_note,
            }, {
                onSuccess: () => {
                    setSelectedPayment(null);
                    setData('admin_note', '');
                }
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Payments" />
            <div className="flex flex-col gap-6 p-4 md:p-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">Payment Requests</h1>
                        <p className="text-muted-foreground">Review and approve manual premium upgrades.</p>
                    </div>

                    <div className="flex bg-muted p-1 rounded-lg shrink-0 overflow-x-auto w-full sm:w-auto overflow-y-hidden">
                        <Link href="/admin/payments" preserveScroll className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${!filters?.status ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-background/50'}`}>All</Link>
                        <Link href="/admin/payments?status=pending" preserveScroll className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${filters?.status === 'pending' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-background/50'}`}>Pending</Link>
                        <Link href="/admin/payments?status=approved" preserveScroll className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${filters?.status === 'approved' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-background/50'}`}>Approved</Link>
                        <Link href="/admin/payments?status=rejected" preserveScroll className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${filters?.status === 'rejected' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-background/50'}`}>Rejected</Link>
                    </div>
                </div>

                <Card className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted text-muted-foreground uppercase text-xs font-medium">
                                <tr>
                                    <th className="px-4 py-3">User / Date</th>
                                    <th className="px-4 py-3">Plan</th>
                                    <th className="px-4 py-3">Transaction</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {payments.map((payment) => (
                                    <tr key={payment.id} className="hover:bg-muted/50 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex flex-col">
                                                <span className="font-medium">{payment.sender_name}</span>
                                                <span className="text-xs text-muted-foreground">{payment.device_id}</span>
                                                <span className="text-xs text-muted-foreground mt-1">
                                                    {new Date(payment.created_at).toLocaleString()}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-col">
                                                <span className="font-medium">{payment.plan_name}</span>
                                                <span className="text-xs font-bold text-amber-600">{payment.plan_price}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-mono">{payment.transaction_id}</span>
                                                {payment.email && <span className="text-xs">{payment.email}</span>}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge
                                                variant={
                                                    payment.status === 'approved' ? 'default' :
                                                        payment.status === 'rejected' ? 'destructive' :
                                                            'secondary'
                                                }
                                                className={payment.status === 'approved' ? 'bg-green-500 text-white' : ''}
                                            >
                                                {payment.status.toUpperCase()}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex justify-end gap-1">
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button size="sm" variant="outline" onClick={() => setSelectedPayment(payment)}>
                                                            <Eye className="h-4 w-4 mr-1" />
                                                            Review
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="max-w-2xl max-h-[90dvh] overflow-y-auto">
                                                        <DialogHeader>
                                                            <DialogTitle>Review Payment Request #{payment.id}</DialogTitle>
                                                        </DialogHeader>
                                                        <div className="grid gap-6 md:grid-cols-2 mt-4">
                                                            <div className="space-y-4">
                                                                <div className="h-[300px] md:h-auto md:aspect-[3/4] bg-muted border rounded-lg overflow-hidden relative">
                                                                    <img src={payment.screenshot_data} alt="Screenshot" className="object-contain w-full h-full cursor-zoom-in" onClick={() => window.open(payment.screenshot_data, '_blank')} />
                                                                </div>
                                                                <p className="text-xs text-center text-muted-foreground">Click image to open in new tab</p>
                                                            </div>
                                                            <div className="space-y-6">
                                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                                                    <div>
                                                                        <Label className="text-xs text-muted-foreground">Sender</Label>
                                                                        <p className="font-medium">{payment.sender_name}</p>
                                                                    </div>
                                                                    <div>
                                                                        <Label className="text-xs text-muted-foreground">Plan</Label>
                                                                        <p className="font-medium">{payment.plan_name}</p>
                                                                    </div>
                                                                    <div>
                                                                        <Label className="text-xs text-muted-foreground">Price</Label>
                                                                        <p className="font-medium">{payment.plan_price}</p>
                                                                    </div>
                                                                    <div>
                                                                        <Label className="text-xs text-muted-foreground">Transaction ID</Label>
                                                                        <p className="font-mono text-xs">{payment.transaction_id}</p>
                                                                    </div>
                                                                </div>

                                                                {payment.status === 'pending' && (
                                                                    <div className="space-y-4 border-t pt-4">
                                                                        <div className="space-y-2">
                                                                            <Label htmlFor="admin_note">Admin Note (optional)</Label>
                                                                            <textarea
                                                                                id="admin_note"
                                                                                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                                                                                rows={3}
                                                                                placeholder="Add a reason for rejection or approval note..."
                                                                                value={data.admin_note}
                                                                                onChange={(e) => setData('admin_note', e.target.value)}
                                                                            />
                                                                        </div>
                                                                        <div className="flex gap-2">
                                                                            <Button className="flex-1 bg-green-500 hover:bg-green-600 text-white" onClick={() => handleApprove(payment.id)}>
                                                                                <Check className="h-4 w-4 mr-2" />
                                                                                Approve
                                                                            </Button>
                                                                            <Button variant="destructive" className="flex-1" onClick={() => handleReject(payment.id)}>
                                                                                <X className="h-4 w-4 mr-2" />
                                                                                Reject
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {payment.status !== 'pending' && (
                                                                    <div className="p-4 rounded-lg bg-muted text-sm space-y-2">
                                                                        <div className="font-bold">Result</div>
                                                                        <div>Status: <span className="font-medium capitalize">{payment.status}</span></div>
                                                                        {payment.admin_note && <div>Note: <span className="italic">{payment.admin_note}</span></div>}
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
                        {payments.length === 0 && (
                            <div className="p-8 text-center text-muted-foreground">
                                No payment requests found.
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </AppLayout>
    );
}
