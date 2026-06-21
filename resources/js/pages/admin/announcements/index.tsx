import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Plus, Pencil, Trash2, Megaphone, Link as LinkIcon, Smartphone } from 'lucide-react';
import { useState } from 'react';
import type { BreadcrumbItem } from '@/types';

interface Announcement {
    id: number;
    message: string;
    url: string | null;
    is_active: boolean;
    min_version_code: number;
    created_at: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Announcements', href: '/admin/announcements' },
];

export default function Index({ announcements }: { announcements: Announcement[] }) {
    const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);

    const { data, setData, post, put, reset, processing, errors } = useForm({
        message: '',
        url: '',
        is_active: true,
        min_version_code: 0,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingAnnouncement) {
            put(`/admin/announcements/${editingAnnouncement.id}`, {
                onSuccess: () => {
                    setEditingAnnouncement(null);
                    reset();
                },
            });
        } else {
            post('/admin/announcements', {
                onSuccess: () => reset(),
            });
        }
    };

    const handleEdit = (ann: Announcement) => {
        setEditingAnnouncement(ann);
        setData({
            message: ann.message,
            url: ann.url || '',
            is_active: ann.is_active,
            min_version_code: ann.min_version_code,
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this announcement?')) {
            router.delete(`/admin/announcements/${id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Announcements" />
            <div className="flex flex-col gap-6 p-4 md:p-8">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">App Announcements</h1>
                        <p className="text-muted-foreground">Broadcast messages and news to mobile app users.</p>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Form */}
                    <Card className="lg:col-span-1 h-fit">
                        <CardHeader>
                            <CardTitle>{editingAnnouncement ? 'Edit Announcement' : 'New Announcement'}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="message">Broadcast Message</Label>
                                    <textarea
                                        id="message"
                                        rows={4}
                                        className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                                        value={data.message}
                                        onChange={(e) => setData('message', e.target.value)}
                                        placeholder="What do you want to tell your users?"
                                        required
                                    />
                                    {errors.message && <p className="text-sm text-destructive">{errors.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="url">Link URL (Optional)</Label>
                                    <Input
                                        id="url"
                                        value={data.url}
                                        onChange={(e) => setData('url', e.target.value)}
                                        placeholder="https://..."
                                    />
                                    <p className="text-[10px] text-muted-foreground italic">If provided, dialog shows as an "Update" prompt.</p>
                                    {errors.url && <p className="text-sm text-destructive">{errors.url}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="min_version_code" className="flex items-center gap-1">
                                        <Smartphone className="h-3.5 w-3.5" />
                                        Min Version Code
                                    </Label>
                                    <Input
                                        id="min_version_code"
                                        type="number"
                                        min={0}
                                        value={data.min_version_code}
                                        onChange={(e) => setData('min_version_code', parseInt(e.target.value) || 0)}
                                        placeholder="0"
                                    />
                                    <p className="text-[10px] text-muted-foreground italic">
                                        App shows dialog only if its version code is <strong>less than</strong> this value. Set to <strong>0</strong> to show to all users.
                                    </p>
                                    {errors.min_version_code && <p className="text-sm text-destructive">{errors.min_version_code}</p>}
                                </div>

                                <div className="flex items-center space-x-2 pt-2">
                                    <Checkbox
                                        id="is_active"
                                        checked={data.is_active}
                                        onCheckedChange={(checked) => setData('is_active', !!checked)}
                                    />
                                    <Label htmlFor="is_active" className="text-sm font-medium">Activate Now</Label>
                                </div>
                                <p className="text-[10px] text-muted-foreground italic">* Only one active announcement is shown at a time.</p>

                                <div className="flex gap-2 pt-4">
                                    <Button type="submit" className="flex-1" disabled={processing}>
                                        {editingAnnouncement ? 'Update Message' : 'Broadcast Message'}
                                    </Button>
                                    {editingAnnouncement && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                setEditingAnnouncement(null);
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

                    {/* Timeline */}
                    <div className="lg:col-span-2 space-y-4">
                        {announcements.map((ann) => (
                            <Card key={ann.id} className={`${ann.is_active ? 'border-primary ring-1 ring-primary/20' : 'opacity-80'}`}>
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-4">
                                        <div className={`p-2 rounded-full ${ann.is_active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                            <Megaphone className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant={ann.is_active ? "default" : "secondary"}>
                                                        {ann.is_active ? "ACTIVE" : "EXPIRED"}
                                                    </Badge>
                                                    {ann.min_version_code > 0 && (
                                                        <Badge variant="outline" className="text-[10px] gap-1">
                                                            <Smartphone className="h-3 w-3" />
                                                            v&lt;{ann.min_version_code}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <span className="text-[10px] text-muted-foreground">
                                                    {new Date(ann.created_at).toLocaleString()}
                                                </span>
                                            </div>
                                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{ann.message}</p>
                                            {ann.url && (
                                                <div className="flex items-center text-xs text-primary font-medium">
                                                    <LinkIcon className="h-3 w-3 mr-1" />
                                                    <a href={ann.url} target="_blank" className="hover:underline">{ann.url}</a>
                                                </div>
                                            )}
                                            <div className="flex justify-end gap-1 pt-2">
                                                <Button size="icon" variant="ghost" onClick={() => handleEdit(ann)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button size="icon" variant="ghost" onClick={() => handleDelete(ann.id)} className="text-destructive hover:bg-destructive/10">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                        {announcements.length === 0 && (
                            <div className="p-12 text-center text-muted-foreground border border-dashed rounded-xl">
                                No announcements found. Create your first broadcast.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
