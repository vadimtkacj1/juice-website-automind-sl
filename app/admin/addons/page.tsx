'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Pencil, Trash, Sparkles } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { AlertDialog } from '@/components/ui/alert-dialog';
import ImageUpload from '@/components/ImageUpload';
import { useAdminLanguage } from '@/lib/admin-language-context';

interface Addon {
  id: number;
  name: string;
  description?: string;
  price: number;
  image?: string;
  is_available: boolean;
  sort_order: number;
}

export default function AdminAddons() {
  const { t, language } = useAdminLanguage();
  const [addons, setAddons] = useState<Addon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingAddon, setEditingAddon] = useState<Addon | null>(null);
  const [addonForm, setAddonForm] = useState({
    name: '',
    description: '',
    price: '0',
    image: '',
    is_available: true,
    sort_order: '0',
  });
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({
    open: false,
    title: '',
    description: '',
    onConfirm: () => {},
  });
  const [alertDialog, setAlertDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    type?: 'info' | 'success' | 'error' | 'warning';
  }>({
    open: false,
    title: '',
    message: '',
    type: 'info',
  });

  useEffect(() => {
    fetchAddons();
  }, []);

  async function fetchAddons() {
    try {
      const response = await fetch('/api/addons?include_inactive=true');
      const data = await response.json();
      setAddons(data.addons || []);
    } catch (error) {
      console.error('Error fetching addons:', error);
    }
    setLoading(false);
  }

  function openDialog(addon?: Addon) {
    if (addon) {
      setEditingAddon(addon);
      setAddonForm({
        name: addon.name,
        description: addon.description || '',
        price: addon.price.toString(),
        image: addon.image || '',
        is_available: addon.is_available,
        sort_order: addon.sort_order.toString(),
      });
    } else {
      setEditingAddon(null);
      setAddonForm({
        name: '',
        description: '',
        price: '0',
        image: '',
        is_available: true,
        sort_order: '0',
      });
    }
    setShowDialog(true);
  }

  async function saveAddon() {
    if (!addonForm.name.trim()) {
      setAlertDialog({
        open: true,
        title: t('Validation Error'),
        message: t('Addon name is required.'),
        type: 'warning',
      });
      return;
    }

    try {
      const url = editingAddon ? `/api/addons/${editingAddon.id}` : '/api/addons';
      const method = editingAddon ? 'PUT' : 'POST';

      const payload = {
        name: addonForm.name.trim(),
        description: addonForm.description.trim() || null,
        price: parseFloat(addonForm.price) || 0,
        image: addonForm.image || null,
        is_available: addonForm.is_available,
        sort_order: parseInt(addonForm.sort_order) || 0,
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        fetchAddons();
        setShowDialog(false);
        setAlertDialog({
          open: true,
          title: t('Success'),
          message: editingAddon ? t('Addon updated successfully.') : t('Addon created successfully.'),
          type: 'success',
        });
      } else {
        const data = await response.json();
        setAlertDialog({
          open: true,
          title: t('Error'),
          message: data.error || t('Error saving addon.'),
          type: 'error',
        });
      }
    } catch (error) {
      console.error('Error saving addon:', error);
      setAlertDialog({
        open: true,
        title: t('Error'),
        message: t('An error occurred while saving the addon.'),
        type: 'error',
      });
    }
  }

  async function deleteAddon(id: number) {
    setConfirmDialog({
      open: true,
      title: t('Delete Addon'),
      description: t('Are you sure you want to delete this addon? This action cannot be undone.'),
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/addons/${id}`, { method: 'DELETE' });
          if (response.ok) {
            fetchAddons();
            setAlertDialog({
              open: true,
              title: t('Success'),
              message: t('Addon deleted successfully.'),
              type: 'success',
            });
          } else {
            const data = await response.json();
            setAlertDialog({
              open: true,
              title: t('Error'),
              message: data.error || t('Failed to delete addon.'),
              type: 'error',
            });
          }
        } catch (error) {
          console.error('Error deleting addon:', error);
          setAlertDialog({
            open: true,
            title: t('Error'),
            message: t('An error occurred while deleting the addon.'),
            type: 'error',
          });
        }
      },
    });
  }

  async function toggleAvailability(addon: Addon) {
    try {
      const response = await fetch(`/api/addons/${addon.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_available: !addon.is_available }),
      });
      if (response.ok) fetchAddons();
    } catch (error) {
      console.error('Error updating addon:', error);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text={t('Loading addons...')} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6" dir={language}>
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('Addons Management')}</h1>
        <p className="text-gray-500 mt-1">{t('Manage product boosts and extras')}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('Total Addons')}</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{addons.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('Available')}</CardTitle>
            <Sparkles className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{addons.filter(a => a.is_available).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('Unavailable')}</CardTitle>
            <Sparkles className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{addons.filter(a => !a.is_available).length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('All Addons')}</CardTitle>
              <CardDescription>{t('Manage product addons and boosts')}</CardDescription>
            </div>
            <Button onClick={() => openDialog()} className="bg-purple-600 hover:bg-purple-700 text-white">
              <Plus className="mr-2 h-4 w-4" />
              {t('Add Addon')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {addons.length === 0 ? (
            <p className="text-center text-gray-500 py-8">{t('No addons yet')}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('Name')}</TableHead>
                  <TableHead>{t('Description')}</TableHead>
                  <TableHead>{t('Price')}</TableHead>
                  <TableHead>{t('Sort Order')}</TableHead>
                  <TableHead>{t('Status')}</TableHead>
                  <TableHead>{t('Actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {addons.map((addon) => (
                  <TableRow key={addon.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {addon.image ? (
                          <img
                            src={addon.image}
                            alt={addon.name}
                            className="w-10 h-10 object-cover rounded-full"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <Sparkles className="h-5 w-5 text-purple-600" />
                          </div>
                        )}
                        <p className="font-medium">{t(addon.name)}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {addon.description ? t(addon.description) : '—'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-bold text-purple-600">+₪{addon.price}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">{addon.sort_order}</span>
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => toggleAvailability(addon)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          addon.is_available
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {addon.is_available ? t('Available') : t('Unavailable')}
                      </button>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openDialog(addon)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteAddon(addon.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Addon Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md" dir={language}>
          <DialogHeader>
            <DialogTitle>
              {editingAddon ? t('Edit Addon') : t('New Addon')}
            </DialogTitle>
            <DialogDescription>
              {editingAddon ? t('Update addon information') : t('Create a new addon')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="addon-name">{t('Name')} *</Label>
              <Input
                id="addon-name"
                value={addonForm.name}
                onChange={(e) => setAddonForm({ ...addonForm, name: e.target.value })}
                placeholder={t('Protein Powder')}
                required
              />
            </div>
            <div>
              <Label htmlFor="addon-desc">{t('Description')}</Label>
              <Textarea
                id="addon-desc"
                value={addonForm.description}
                onChange={(e) => setAddonForm({ ...addonForm, description: e.target.value })}
                placeholder={t('Addon description (optional)')}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="addon-price">{t('Price')} (₪)</Label>
                <Input
                  id="addon-price"
                  type="number"
                  step="0.01"
                  value={addonForm.price}
                  onChange={(e) => setAddonForm({ ...addonForm, price: e.target.value })}
                  placeholder="5.00"
                  min="0"
                />
              </div>
              <div>
                <Label htmlFor="addon-sort">{t('Sort Order')}</Label>
                <Input
                  id="addon-sort"
                  type="number"
                  value={addonForm.sort_order}
                  onChange={(e) => setAddonForm({ ...addonForm, sort_order: e.target.value })}
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>
            <div>
              <Label>{t('Image')}</Label>
              <ImageUpload
                value={addonForm.image}
                onChange={(url) => setAddonForm({ ...addonForm, image: url })}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="addon-available"
                checked={addonForm.is_available}
                onChange={(e) => setAddonForm({ ...addonForm, is_available: e.target.checked })}
                className="w-4 h-4"
              />
              <Label htmlFor="addon-available" className="cursor-pointer">
                {t('Available')}
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              {t('Cancel')}
            </Button>
            <Button onClick={saveAddon} className="bg-purple-600 hover:bg-purple-700 text-white">
              {editingAddon ? t('Update') : t('Create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        title={confirmDialog.title}
        description={confirmDialog.description}
        onConfirm={confirmDialog.onConfirm}
        variant="destructive"
        confirmText={t('Delete')}
        cancelText={t('Cancel')}
      />

      {/* Alert Dialog */}
      <AlertDialog
        open={alertDialog.open}
        onOpenChange={(open) => setAlertDialog({ ...alertDialog, open })}
        title={alertDialog.title}
        message={alertDialog.message}
        type={alertDialog.type}
      />
    </div>
  );
}

