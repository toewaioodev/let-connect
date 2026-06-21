import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { BreadcrumbItem } from '@/types';

interface Ad {
    id: number;
    title: string;
    image_url: string;
    target_url: string;
    is_active: boolean;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Ads', href: '/admin/ads' },
];

export default function Index({ ads }: { ads: Ad[] }) {
    const [editingAd, setEditingAd] = useState<Ad | null>(null);

    const { data, setData, post, put, reset, processing, errors } = useForm({
        title: '',
        image_url: '',
        target_url: '',
        is_active: true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingAd) {
            put(`/admin/ads/${editingAd.id}`, {
                onSuccess: () => {
                    setEditingAd(null);
                    reset();
                },
            });
        } else {
            post('/admin/ads', {
                onSuccess: () => reset(),
            });
        }
    };

    const handleEdit = (ad: Ad) => {
        setEditingAd(ad);
        setData({
            title: ad.title,
            image_url: ad.image_url,
            target_url: ad.target_url,
            is_active: ad.is_active,
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this ad?')) {
            router.delete(`/admin/ads/${id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Ads" />
            <div className="flex flex-col gap-6 p-4 md:p-8">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">App Ads</h1>
                        <p className="text-muted-foreground">Manage banner ads shown in the mobile app.</p>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Form */}
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle>{editingAd ? 'Edit Ad' : 'Add New Ad'}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Ad Title</Label>
                                    <Input
                                        id="title"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        placeholder="e.g. 50% Off Premium"
                                        required
                                    />
                                    {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="image_url">Image URL</Label>
                                    <Input
                                        id="image_url"
                                        value={data.image_url}
                                        onChange={(e) => setData('image_url', e.target.value)}
                                        placeholder="https://..."
                                        required
                                    />
                                    {errors.image_url && <p className="text-sm text-destructive">{errors.image_url}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="target_url">Target URL</Label>
                                    <Input
                                        id="target_url"
                                        value={data.target_url}
                                        onChange={(e) => setData('target_url', e.target.value)}
                                        placeholder="https://..."
                                        required
                                    />
                                    {errors.target_url && <p className="text-sm text-destructive">{errors.target_url}</p>}
                                </div>

                                <div className="flex items-center space-x-2 pt-2">
                                    <Checkbox
                                        id="is_active"
                                        checked={data.is_active}
                                        onCheckedChange={(checked) => setData('is_active', !!checked)}
                                    />
                                    <Label htmlFor="is_active" className="text-sm font-medium">Active</Label>
                                </div>

                                <div className="flex gap-2 pt-4">
                                    <Button type="submit" className="flex-1" disabled={processing}>
                                        {editingAd ? 'Update Ad' : 'Add Ad'}
                                    </Button>
                                    {editingAd && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                setEditingAd(null);
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

                    {/* Grid */}
                    <div className="lg:col-span-2 grid gap-4 md:grid-cols-2">
                        {ads.map((ad) => (
                            <Card key={ad.id} className="overflow-hidden flex flex-col">
                                <div className="aspect-[2/1] bg-muted relative overflow-hidden">
                                    <img src={ad.image_url} alt={ad.title} className="object-cover w-full h-full" />
                                    {!ad.is_active && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold">
                                            INACTIVE
                                        </div>
                                    )}
                                </div>
                                <CardContent className="p-4 flex-1 flex flex-col">
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold">{ad.title}</h3>
                                            <Badge variant={ad.is_active ? "default" : "secondary"}>
                                                {ad.is_active ? "Active" : "Inactive"}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground truncate mb-4" title={ad.target_url}>
                                            {ad.target_url}
                                        </p>
                                    </div>
                                    <div className="flex justify-end gap-2 pt-2 border-t mt-auto">
                                        <Button size="sm" variant="ghost" onClick={() => handleEdit(ad)}>
                                            <Pencil className="h-4 w-4 mr-2" />
                                            Edit
                                        </Button>
                                        <Button size="sm" variant="ghost" onClick={() => handleDelete(ad.id)} className="text-destructive hover:bg-destructive/10">
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                        {ads.length === 0 && (
                            <div className="col-span-full p-8 text-center text-muted-foreground border border-dashed rounded-xl">
                                No ads found. Add your first ad using the form.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
