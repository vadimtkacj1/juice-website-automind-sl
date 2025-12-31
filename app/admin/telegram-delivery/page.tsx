'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Pencil, Trash, Settings, Bot, Users, TestTube, Activity } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { AlertDialog } from '@/components/ui/alert-dialog';

interface BotSettings {
  id?: number;
  bot_id: string;
  api_token: string;
  is_enabled: boolean;
  reminder_interval_minutes: number;
}

interface Courier {
  id: number;
  telegram_id: string;
  name: string;
  is_active: boolean;
}

export default function TelegramDeliveryPage() {
  const [settings, setSettings] = useState<BotSettings>({
    bot_id: '',
    api_token: '',
    is_enabled: false,
    reminder_interval_minutes: 3
  });
  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showCourierDialog, setShowCourierDialog] = useState(false);
  const [editingCourier, setEditingCourier] = useState<Courier | null>(null);
  const [courierForm, setCourierForm] = useState({
    telegram_id: '',
    name: '',
    is_active: true
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
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [settingsRes, couriersRes] = await Promise.all([
        fetch('/api/telegram/settings'),
        fetch('/api/telegram/couriers')
      ]);
      
      const settingsData = await settingsRes.json();
      const couriersData = await couriersRes.json();

      setSettings({
        bot_id: settingsData.bot_id || '',
        api_token: settingsData.full_api_token || settingsData.api_token || '',
        is_enabled: settingsData.is_enabled || false,
        reminder_interval_minutes: settingsData.reminder_interval_minutes || 3
      });
      setCouriers(couriersData.couriers || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  }

  async function handleSaveSettings() {
    if (!settings.api_token) {
      setAlertDialog({
        open: true,
        title: 'Validation Error',
        message: 'API Token is required. Get it from @BotFather in Telegram.',
        type: 'error',
      });
      return;
    }

    // Validate token first - this will also get the bot ID
    try {
      const validateResponse = await fetch('/api/telegram/validate-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_token: settings.api_token }),
      });

      const validateData = await validateResponse.json();
      
      if (!validateData.valid) {
        setAlertDialog({
          open: true,
          title: 'Invalid Token',
          message: validateData.message || 'The API token is invalid. Please check your token from @BotFather.\n\nTo get a token:\n1. Open Telegram\n2. Search for @BotFather\n3. Type /newbot\n4. Follow instructions\n5. Copy the token (format: 123456789:ABCdef...)',
          type: 'error',
        });
        return;
      }

      // Auto-fill bot_id from validation response
      const updatedSettings = {
        ...settings,
        bot_id: validateData.bot_id || settings.bot_id
      };
      setSettings(updatedSettings);
      
      // Use updated settings for saving
      const settingsToSave = updatedSettings;

      try {
        const response = await fetch('/api/telegram/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(settingsToSave),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to save settings');
        }

        // Initialize bot if enabled (async, non-blocking)
        if (settingsToSave.is_enabled) {
          fetch('/api/telegram/setup', { method: 'POST' }).catch(() => {
            // Ignore errors - it's non-blocking
          });
        }

        setShowSettingsDialog(false);
        fetchData();
        setAlertDialog({
          open: true,
          title: 'Success',
          message: 'Settings saved successfully! Bot will be initialized in the background.',
          type: 'success',
        });
      } catch (error: any) {
        setAlertDialog({
          open: true,
          title: 'Error',
          message: error.message || 'Failed to save settings',
          type: 'error',
        });
      }
    } catch (error: any) {
      setAlertDialog({
        open: true,
        title: 'Validation Error',
        message: 'Failed to validate token. Please check your API token.',
        type: 'error',
      });
    }
  }


  async function handleTestOrder() {
    try {
      const response = await fetch('/api/telegram/test-order', {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create test order');
      }

      const data = await response.json();
      setAlertDialog({
        open: true,
        title: 'Test Order Created',
        message: `Test order #${data.orderId} created successfully! Check your Telegram bot - all active couriers should receive a notification.`,
        type: 'success',
      });
    } catch (error: any) {
      setAlertDialog({
        open: true,
        title: 'Error',
        message: error.message || 'Failed to create test order',
        type: 'error',
      });
    }
  }

  async function handleDiagnose() {
    try {
      const response = await fetch('/api/telegram/diagnose');
      const data = await response.json();

      let message = 'Diagnostics:\n\n';
      message += `Bot Configured: ${data.bot_configured ? 'Yes' : 'No'}\n`;
      message += `Bot Enabled: ${data.bot_enabled ? 'Yes' : 'No'}\n`;
      message += `Token Valid: ${data.bot_token_valid ? 'Yes' : 'No'}\n`;
      message += `Active Couriers: ${data.active_couriers}\n`;
      message += `Bot Instance Ready: ${data.bot_instance_ready ? 'Yes' : 'No'}\n`;
      
      if (data.errors && data.errors.length > 0) {
        message += `\nErrors:\n${data.errors.join('\n')}`;
      }

      if (data.status === 'ready') {
        setAlertDialog({
          open: true,
          title: 'System Status: Ready',
          message: message,
          type: 'success',
        });
      } else {
        setAlertDialog({
          open: true,
          title: 'System Status: Not Ready',
          message: message,
          type: 'error',
        });
      }
    } catch (error: any) {
      setAlertDialog({
        open: true,
        title: 'Diagnostic Error',
        message: error.message || 'Failed to run diagnostics',
        type: 'error',
      });
    }
  }

  function handleOpenCourierDialog(courier?: Courier) {
    if (courier) {
      setEditingCourier(courier);
      setCourierForm({
        telegram_id: courier.telegram_id,
        name: courier.name,
        is_active: courier.is_active
      });
    } else {
      setEditingCourier(null);
      setCourierForm({
        telegram_id: '',
        name: '',
        is_active: true
      });
    }
    setShowCourierDialog(true);
  }

  async function handleSaveCourier() {
    if (!courierForm.telegram_id || !courierForm.name) {
      setAlertDialog({
        open: true,
        title: 'Validation Error',
        message: 'Telegram ID and name are required.',
        type: 'error',
      });
      return;
    }

    try {
      const url = editingCourier ? '/api/telegram/couriers' : '/api/telegram/couriers';
      const method = editingCourier ? 'PUT' : 'POST';
      const body = editingCourier 
        ? { id: editingCourier.id, ...courierForm }
        : courierForm;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save courier');
      }

      setShowCourierDialog(false);
      setEditingCourier(null);
      fetchData();
      setAlertDialog({
        open: true,
        title: 'Success',
        message: `Courier ${editingCourier ? 'updated' : 'created'} successfully!`,
        type: 'success',
      });
    } catch (error: any) {
      setAlertDialog({
        open: true,
        title: 'Error',
        message: error.message || 'Failed to save courier',
        type: 'error',
      });
    }
  }

  async function handleDeleteCourier(id: number) {
    try {
      const response = await fetch(`/api/telegram/couriers?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete courier');
      }

      fetchData();
      setAlertDialog({
        open: true,
        title: 'Success',
        message: 'Courier deleted successfully!',
        type: 'success',
      });
    } catch (error: any) {
      setAlertDialog({
        open: true,
        title: 'Error',
        message: error.message || 'Failed to delete courier',
        type: 'error',
      });
    }
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Telegram Delivery Management</h1>
          <p className="text-muted-foreground mt-2">
            Configure Telegram bot integration and manage couriers
          </p>
          <p className="text-xs text-yellow-600 mt-1">
            ⚠️ If you're running the standalone service (npm run telegram:service), don't use "Initialize Bot" here to avoid conflicts.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleDiagnose} variant="outline" className="bg-green-50 hover:bg-green-100">
            <Activity className="mr-2 h-4 w-4" />
            Diagnose
          </Button>
          <Button onClick={handleTestOrder} variant="outline" className="bg-blue-50 hover:bg-blue-100">
            <TestTube className="mr-2 h-4 w-4" />
            Test Order
          </Button>
        </div>
      </div>

      {/* Bot Settings Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Bot Settings
              </CardTitle>
              <CardDescription>
                Enter Bot ID and API Token for Telegram integration
              </CardDescription>
            </div>
            <Button onClick={() => setShowSettingsDialog(true)}>
              <Settings className="mr-2 h-4 w-4" />
              Configure
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Bot ID:</span>
              <span className="font-medium">{settings.bot_id ? settings.bot_id : 'Not configured (will be auto-filled)'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">API Token:</span>
              <span className="font-medium">
                {settings.api_token && settings.api_token.length > 4 
                  ? '****' + settings.api_token.slice(-4) 
                  : 'Not configured'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status:</span>
              <span className={`font-medium ${settings.is_enabled ? 'text-green-600' : 'text-gray-500'}`}>
                {settings.is_enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Reminder Interval:</span>
              <span className="font-medium">{settings.reminder_interval_minutes} min.</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Couriers Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Delivery Accounts
              </CardTitle>
              <CardDescription>
                Manage the list of couriers who receive order notifications
              </CardDescription>
            </div>
            <Button onClick={() => handleOpenCourierDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Courier
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Telegram ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {couriers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No couriers. Click "Add Courier" to get started.
                  </TableCell>
                </TableRow>
              ) : (
                couriers.map((courier) => (
                  <TableRow key={courier.id}>
                    <TableCell className="font-medium">{courier.telegram_id}</TableCell>
                    <TableCell>{courier.name}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs ${
                        courier.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {courier.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenCourierDialog(courier)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteCourier(courier.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Telegram Bot Settings</DialogTitle>
            <DialogDescription>
              Enter Bot ID and API Token. You can get them from @BotFather in Telegram.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="api_token">API Token *</Label>
              <Input
                id="api_token"
                type="password"
                value={settings.api_token}
                onChange={(e) => setSettings({ ...settings, api_token: e.target.value })}
                placeholder="e.g., 123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Get this from @BotFather in Telegram. Type /newbot to create a bot, then copy the token.
              </p>
            </div>
            <div>
              <Label htmlFor="bot_id">Bot ID (Auto-filled)</Label>
              <Input
                id="bot_id"
                value={settings.bot_id}
                onChange={(e) => setSettings({ ...settings, bot_id: e.target.value })}
                placeholder="Will be auto-filled from token"
                disabled
                className="bg-gray-50"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Bot ID is automatically extracted from the API token. You don't need to enter it manually.
              </p>
            </div>
            <div>
              <Label htmlFor="reminder_interval">Reminder Interval (minutes)</Label>
              <Input
                id="reminder_interval"
                type="number"
                min="1"
                max="60"
                value={settings.reminder_interval_minutes}
                onChange={(e) => setSettings({ 
                  ...settings, 
                  reminder_interval_minutes: parseInt(e.target.value) || 3 
                })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                How often to send reminders to courier if order is not delivered (1-60 minutes)
              </p>
            </div>
            <div className="flex items-center space-x-2 pt-4">
              <input
                type="checkbox"
                id="is_enabled"
                checked={settings.is_enabled}
                onChange={(e) => setSettings({ ...settings, is_enabled: e.target.checked })}
                className="h-4 w-4"
              />
              <Label htmlFor="is_enabled">Enable Bot</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettingsDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSettings}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Courier Dialog */}
      <Dialog open={showCourierDialog} onOpenChange={setShowCourierDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCourier ? 'Edit Courier' : 'Add Courier'}
            </DialogTitle>
            <DialogDescription>
              {editingCourier
                ? 'Update courier information'
                : 'Add a new courier to the system'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="courier_telegram_id">Telegram ID *</Label>
              <Input
                id="courier_telegram_id"
                value={courierForm.telegram_id}
                onChange={(e) => setCourierForm({ ...courierForm, telegram_id: e.target.value })}
                placeholder="e.g., 123456789"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Find your Telegram ID using @userinfobot
              </p>
            </div>
            <div>
              <Label htmlFor="courier_name">Name *</Label>
              <Input
                id="courier_name"
                value={courierForm.name}
                onChange={(e) => setCourierForm({ ...courierForm, name: e.target.value })}
                placeholder="e.g., John Doe"
              />
            </div>
            <div className="flex items-center space-x-2 pt-4">
              <input
                type="checkbox"
                id="courier_is_active"
                checked={courierForm.is_active}
                onChange={(e) => setCourierForm({ ...courierForm, is_active: e.target.checked })}
                className="h-4 w-4"
              />
              <Label htmlFor="courier_is_active">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCourierDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveCourier}>
              {editingCourier ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

