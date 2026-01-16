'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Pencil, Trash, Settings, Bot, Users, TestTube, Activity, CheckCircle2, XCircle, Clock } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { AlertDialog } from '@/components/ui/alert-dialog';
import { useAdminLanguage } from '@/lib/admin-language-context';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

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
  role: 'kitchen' | 'delivery' | 'observer';
  is_active: boolean;
}

export default function TelegramDeliveryPage() {
  const { t } = useAdminLanguage();
  const [settings, setSettings] = useState<BotSettings>({
    bot_id: '',
    api_token: '',
    is_enabled: false,
    reminder_interval_minutes: 3
  });
  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSettingsForm, setShowSettingsForm] = useState(false);
  const [showCourierForm, setShowCourierForm] = useState(false);
  const [editingCourier, setEditingCourier] = useState<Courier | null>(null);
  const [courierForm, setCourierForm] = useState({
    telegram_id: '',
    name: '',
    role: 'delivery' as 'kitchen' | 'delivery' | 'observer',
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
        title: t('Validation Error'),
        message: t('API Token is required. Get it from @BotFather in Telegram.'),
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
          title: t('Invalid Token'),
          message: validateData.message || t('The API token is invalid. Please check your token from @BotFather.\n\nTo get a token:\n1. Open Telegram\n2. Search for @BotFather\n3. Type /newbot\n4. Follow instructions\n5. Copy the token (format: 123456789:ABCdef...)'),
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

        setShowSettingsForm(false);
        fetchData();
        setAlertDialog({
          open: true,
          title: t('Success'),
          message: t('Settings saved successfully! Bot will be initialized in the background.'),
          type: 'success',
        });
      } catch (error: any) {
        setAlertDialog({
          open: true,
          title: t('Error'),
          message: error.message || t('Failed to save settings'),
          type: 'error',
        });
      }
    } catch (error: any) {
      setAlertDialog({
        open: true,
        title: t('Validation Error'),
        message: t('Failed to validate token. Please check your API token.'),
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
        title: t('Test Order Created'),
        message: t(`Test order #${data.orderId} created successfully! Check your Telegram bot - all active couriers should receive a notification.`),
        type: 'success',
      });
    } catch (error: any) {
      setAlertDialog({
        open: true,
        title: t('Error'),
        message: error.message || t('Failed to create test order'),
        type: 'error',
      });
    }
  }

  async function handleDiagnose() {
    try {
      const response = await fetch('/api/telegram/diagnose');
      const data = await response.json();

      let message = t('Diagnostics:') + '\n\n';
      message += `${t('Bot Configured')}: ${data.bot_configured ? t('Yes') : t('No')}\n`;
      message += `${t('Bot Enabled')}: ${data.bot_enabled ? t('Yes') : t('No')}\n`;
      message += `${t('Token Valid')}: ${data.bot_token_valid ? t('Yes') : t('No')}\n`;
      message += `${t('Active Couriers')}: ${data.active_couriers}\n`;
      message += `${t('Bot Instance Ready')}: ${data.bot_instance_ready ? t('Yes') : t('No')}\n`;
      
      if (data.errors && data.errors.length > 0) {
        message += `\n${t('Errors')}:\n${data.errors.join('\n')}`;
      }

      if (data.status === 'ready') {
        setAlertDialog({
          open: true,
          title: t('System Status: Ready'),
          message: message,
          type: 'success',
        });
      } else {
        setAlertDialog({
          open: true,
          title: t('System Status: Not Ready'),
          message: message,
          type: 'error',
        });
      }
    } catch (error: any) {
      setAlertDialog({
        open: true,
        title: t('Diagnostic Error'),
        message: error.message || t('Failed to run diagnostics'),
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
        role: courier.role || 'delivery',
        is_active: courier.is_active
      });
    } else {
      setEditingCourier(null);
      setCourierForm({
        telegram_id: '',
        name: '',
        role: 'delivery',
        is_active: true
      });
    }
    setShowCourierForm(true);
  }

  async function handleSaveCourier() {
    if (!courierForm.telegram_id || !courierForm.name) {
      setAlertDialog({
        open: true,
        title: t('Validation Error'),
        message: t('Telegram ID and name are required.'),
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

      setShowCourierForm(false);
      setEditingCourier(null);
      setEditingCourier(null);
      fetchData();
      setAlertDialog({
        open: true,
        title: t('Success'),
        message: editingCourier ? t('Courier updated successfully!') : t('Courier created successfully!'),
        type: 'success',
      });
    } catch (error: any) {
      setAlertDialog({
        open: true,
        title: t('Error'),
        message: error.message || t('Failed to save courier'),
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
        title: t('Success'),
        message: t('Courier deleted successfully!'),
        type: 'success',
      });
    } catch (error: any) {
      setAlertDialog({
        open: true,
        title: t('Error'),
        message: error.message || t('Failed to delete courier'),
        type: 'error',
      });
    }
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  const botConfigured = settings.api_token && settings.api_token.length > 10;
  const activeCouriers = couriers.filter(c => c.is_active).length;
  const systemReady = botConfigured && settings.is_enabled && activeCouriers > 0;

  const stats = [
    {
      title: t('Bot Status'),
      value: settings.is_enabled ? t('Active') : t('Inactive'),
      icon: Bot,
      color: settings.is_enabled ? 'text-emerald-600' : 'text-slate-500',
      bg: settings.is_enabled ? 'bg-emerald-50' : 'bg-slate-100'
    },
    {
      title: t('Active Couriers'),
      value: activeCouriers,
      icon: Users,
      color: activeCouriers > 0 ? 'text-blue-600' : 'text-slate-500',
      bg: activeCouriers > 0 ? 'bg-blue-50' : 'bg-slate-100'
    },
    {
      title: t('System Status'),
      value: systemReady ? t('Ready') : t('Not Ready'),
      icon: systemReady ? CheckCircle2 : XCircle,
      color: systemReady ? 'text-emerald-600' : 'text-amber-600',
      bg: systemReady ? 'bg-emerald-50' : 'bg-amber-50'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">{t('Telegram Delivery Management')}</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          {t('Configure Telegram bot integration and manage couriers')}
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">{stat.title}</p>
                    <p className="text-2xl font-semibold text-slate-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={cn(stat.bg, "p-2.5 rounded-xl")}>
                    <Icon className={cn(stat.color, "h-5 w-5")} strokeWidth={1.75} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 flex-wrap">
        <Button onClick={handleDiagnose} variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50">
          <Activity className="mr-2 h-4 w-4" />
          {t('Diagnose')}
        </Button>
        <Button onClick={handleTestOrder} variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50">
          <TestTube className="mr-2 h-4 w-4" />
          {t('Test Order')}
        </Button>
      </div>

      {/* Bot Settings Card */}
      <Card className="border-slate-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base font-medium">
                <Bot className="h-5 w-5 text-indigo-600" />
                {t('Bot Settings')}
              </CardTitle>
              <CardDescription className="text-sm">
                {t('Configure Telegram bot integration')}
              </CardDescription>
            </div>
            <Button onClick={() => setShowSettingsForm(true)} className="bg-slate-900 hover:bg-slate-800 text-white">
              <Settings className="mr-2 h-4 w-4" />
              {t('Configure')}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500">{t('Bot ID')}</p>
              <p className="font-medium text-sm text-slate-900 mt-1">
                {settings.bot_id || t('Not configured')}
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500">{t('API Token')}</p>
              <p className="font-medium text-sm text-slate-900 mt-1">
                {settings.api_token && settings.api_token.length > 4
                  ? '****' + settings.api_token.slice(-4)
                  : t('Not configured')}
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500">{t('Status')}</p>
              <p className={cn(
                "font-medium text-sm mt-1",
                settings.is_enabled ? 'text-emerald-600' : 'text-slate-500'
              )}>
                {settings.is_enabled ? t('Enabled') : t('Disabled')}
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500">{t('Reminder Interval')}</p>
              <p className="font-medium text-sm text-slate-900 mt-1">
                {settings.reminder_interval_minutes} {t('min.')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Couriers Card */}
      <Card className="border-slate-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base font-medium">
                <Users className="h-5 w-5 text-blue-600" />
                {t('Delivery Accounts')}
              </CardTitle>
              <CardDescription className="text-sm">
                {t('Manage the list of couriers who receive order notifications')}
              </CardDescription>
            </div>
            <Button onClick={() => handleOpenCourierDialog()} className="bg-slate-900 hover:bg-slate-800 text-white">
              <Plus className="mr-2 h-4 w-4" />
              {t('Add Courier')}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {couriers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500">{t('No couriers yet')}</p>
              <p className="text-xs text-slate-400 mt-1">{t('Click "Add Courier" to get started')}</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {couriers.map((courier) => (
                <div key={courier.id} className="border border-slate-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-slate-900 truncate">{courier.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">ID: {courier.telegram_id}</p>
                    </div>
                    <span className={cn(
                      "px-2 py-0.5 rounded-md text-xs font-medium whitespace-nowrap ml-2",
                      courier.is_active
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-100 text-slate-500'
                    )}>
                      {courier.is_active ? t('Active') : t('Inactive')}
                    </span>
                  </div>

                  <div className="mb-3">
                    <span className={cn(
                      "inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium",
                      courier.role === 'kitchen' ? 'bg-orange-50 text-orange-700' :
                      courier.role === 'delivery' ? 'bg-blue-50 text-blue-700' :
                      'bg-purple-50 text-purple-700'
                    )}>
                      {courier.role === 'kitchen' ? t('Kitchen') :
                       courier.role === 'delivery' ? t('Delivery') :
                       t('Observer')}
                    </span>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-slate-100">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenCourierDialog(courier)}
                      className="flex-1 h-8 text-slate-600 hover:text-slate-900"
                    >
                      <Pencil className="h-3.5 w-3.5 mr-1.5" />
                      {t('Edit')}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteCourier(courier.id)}
                      className="flex-1 h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash className="h-3.5 w-3.5 mr-1.5" />
                      {t('Delete')}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Settings Dialog */}
      <Dialog open={showSettingsForm} onOpenChange={setShowSettingsForm}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{t('Telegram Bot Settings')}</DialogTitle>
            <DialogDescription>
              {t('Configure your Telegram bot for order notifications')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="api_token" className="text-sm font-medium">{t('API Token')} *</Label>
              <Input
                id="api_token"
                type="password"
                value={settings.api_token}
                onChange={(e) => setSettings({ ...settings, api_token: e.target.value })}
                placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                className="mt-1.5"
              />
              <p className="text-xs text-slate-500 mt-1.5">
                {t('Get this from @BotFather in Telegram. Type /newbot to create a bot.')}
              </p>
            </div>
            <div>
              <Label htmlFor="bot_id" className="text-sm font-medium">{t('Bot ID')}</Label>
              <Input
                id="bot_id"
                value={settings.bot_id}
                placeholder={t('Auto-filled from token')}
                disabled
                className="mt-1.5 bg-slate-50"
              />
              <p className="text-xs text-slate-500 mt-1.5">
                {t('Automatically extracted from API token')}
              </p>
            </div>
            <div>
              <Label htmlFor="reminder_interval" className="text-sm font-medium">{t('Reminder Interval (minutes)')}</Label>
              <Input
                id="reminder_interval"
                type="number"
                min="1"
                max="60"
                value={settings.reminder_interval_minutes}
                onChange={(e) => setSettings({
                  ...settings,
                  reminder_interval_minutes: parseInt(e.target.value) || 5
                })}
                className="mt-1.5"
              />
              <p className="text-xs text-slate-500 mt-1.5">
                {t('How often to send reminders (default: 5 minutes)')}
              </p>
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <input
                type="checkbox"
                id="is_enabled"
                checked={settings.is_enabled}
                onChange={(e) => setSettings({ ...settings, is_enabled: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300"
              />
              <Label htmlFor="is_enabled" className="text-sm font-medium cursor-pointer">
                {t('Enable Bot')}
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettingsForm(false)} className="border-slate-200">
              {t('Cancel')}
            </Button>
            <Button onClick={handleSaveSettings} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              {t('Save Settings')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Courier Dialog */}
      <Dialog open={showCourierForm} onOpenChange={setShowCourierForm}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>
              {editingCourier ? t('Edit Courier') : t('Add Courier')}
            </DialogTitle>
            <DialogDescription>
              {editingCourier
                ? t('Update courier information')
                : t('Add a new courier to receive order notifications')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="courier_telegram_id" className="text-sm font-medium">{t('Telegram ID')} *</Label>
              <Input
                id="courier_telegram_id"
                value={courierForm.telegram_id}
                onChange={(e) => setCourierForm({ ...courierForm, telegram_id: e.target.value })}
                placeholder="123456789"
                className="mt-1.5"
              />
              <p className="text-xs text-slate-500 mt-1.5">
                {t('Find your Telegram ID using @userinfobot')}
              </p>
            </div>
            <div>
              <Label htmlFor="courier_name" className="text-sm font-medium">{t('Name')} *</Label>
              <Input
                id="courier_name"
                value={courierForm.name}
                onChange={(e) => setCourierForm({ ...courierForm, name: e.target.value })}
                placeholder={t('John Doe')}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="courier_role" className="text-sm font-medium">{t('Role')} *</Label>
              <select
                id="courier_role"
                value={courierForm.role}
                onChange={(e) => setCourierForm({ ...courierForm, role: e.target.value as 'kitchen' | 'delivery' | 'observer' })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 mt-1.5 text-sm"
              >
                <option value="delivery">{t('Delivery (with action buttons)')}</option>
                <option value="kitchen">{t('Kitchen (info only)')}</option>
                <option value="observer">{t('Observer (summary only)')}</option>
              </select>
              <p className="text-xs text-slate-500 mt-1.5">
                {courierForm.role === 'delivery' && t('Receives orders with "Accept" and "Delivered" buttons, gets reminders')}
                {courierForm.role === 'kitchen' && t('Receives order info without action buttons, gets reminders')}
                {courierForm.role === 'observer' && t('Receives order summary only, no reminders')}
              </p>
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <input
                type="checkbox"
                id="courier_is_active"
                checked={courierForm.is_active}
                onChange={(e) => setCourierForm({ ...courierForm, is_active: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300"
              />
              <Label htmlFor="courier_is_active" className="text-sm font-medium cursor-pointer">
                {t('Active')}
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowCourierForm(false);
              setEditingCourier(null);
            }} className="border-slate-200">
              {t('Cancel')}
            </Button>
            <Button onClick={handleSaveCourier} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              {editingCourier ? t('Update') : t('Create')}
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

