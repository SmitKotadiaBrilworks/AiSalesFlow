"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/providers/AuthProvider";
import { Copy, Check, Mail } from "lucide-react";

interface EmailSyncConfig {
  enabled: boolean;
  inbox_email?: string;
  webhook_secret?: string;
  provider?: "sendgrid" | "mailgun" | "custom";
  last_sync?: string;
}

export function EmailSyncSettings() {
  const { user } = useAuth();
  const [config, setConfig] = useState<EmailSyncConfig | null>(null);
  const [webhookUrl, setWebhookUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (user?.tenantId) {
      fetchConfig();
    }
  }, [user?.tenantId]);

  const fetchConfig = async () => {
    try {
      const res = await fetch("/api/email-sync/config", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setConfig(data.config);
        setWebhookUrl(data.webhookUrl);
      }
    } catch (error) {
      console.error("Error fetching email sync config:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user?.tenantId) return;

    setSaving(true);
    try {
      const res = await fetch("/api/email-sync/config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({
          enabled: config?.enabled ?? false,
          inbox_email: config?.inbox_email,
          provider: config?.provider || "custom",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setConfig(data.config);
        setWebhookUrl(data.webhookUrl);
        alert("Email sync configuration saved!");
      } else {
        alert("Failed to save configuration");
      }
    } catch (error) {
      console.error("Error saving email sync config:", error);
      alert("Failed to save configuration");
    } finally {
      setSaving(false);
    }
  };

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return <div>Loading email sync settings...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email Sync Configuration
        </CardTitle>
        <CardDescription>
          Automatically create leads from incoming emails to your inbox
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enable/Disable Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="enabled" className="text-base font-medium">
              Enable Email Sync
            </Label>
            <p className="text-sm text-slate-500 mt-1">
              When enabled, incoming emails will automatically create leads
            </p>
          </div>
          <input
            type="checkbox"
            id="enabled"
            checked={config?.enabled ?? false}
            onChange={(e) =>
              setConfig({
                ...config,
                enabled: e.target.checked,
              } as EmailSyncConfig)
            }
            className="w-5 h-5 rounded border-slate-300"
          />
        </div>

        {config?.enabled && (
          <>
            {/* Inbox Email */}
            <div className="space-y-2">
              <Label htmlFor="inbox_email">Inbox Email Address</Label>
              <Input
                id="inbox_email"
                type="email"
                placeholder="inbox@yourcompany.com"
                value={config?.inbox_email || ""}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    inbox_email: e.target.value,
                  } as EmailSyncConfig)
                }
              />
              <p className="text-xs text-slate-500">
                The email address where leads will send inquiries
              </p>
            </div>

            {/* Provider Selection */}
            <div className="space-y-2">
              <Label htmlFor="provider">Email Service Provider</Label>
              <select
                id="provider"
                value={config?.provider || "custom"}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    provider: e.target.value as
                      | "sendgrid"
                      | "mailgun"
                      | "custom",
                  } as EmailSyncConfig)
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-md"
              >
                <option value="custom">Custom (IMAP/Webhook)</option>
                <option value="sendgrid">SendGrid</option>
                <option value="mailgun">Mailgun</option>
              </select>
            </div>

            {/* Webhook URL */}
            {webhookUrl && (
              <div className="space-y-2">
                <Label>Webhook URL</Label>
                <div className="flex gap-2">
                  <Input
                    value={webhookUrl}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyWebhookUrl}
                    title="Copy webhook URL"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-slate-500">
                  Configure your email service to send incoming emails to this
                  webhook URL
                </p>
              </div>
            )}

            {/* Status */}
            {config?.last_sync && (
              <div className="flex items-center gap-2">
                <Badge variant="outline">Last Sync</Badge>
                <span className="text-sm text-slate-600">
                  {new Date(config.last_sync).toLocaleString()}
                </span>
              </div>
            )}
          </>
        )}

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
        >
          {saving ? "Saving..." : "Save Configuration"}
        </Button>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-slate-50 rounded-lg space-y-2">
          <h4 className="font-semibold text-sm">Setup Instructions:</h4>
          <ol className="text-sm text-slate-600 space-y-1 list-decimal list-inside">
            <li>Enable email sync above</li>
            <li>Copy the webhook URL</li>
            <li>
              Configure your email service (SendGrid, Mailgun, or custom IMAP)
              to forward incoming emails to the webhook URL
            </li>
            <li>
              Incoming emails will automatically create leads in your dashboard
            </li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}
