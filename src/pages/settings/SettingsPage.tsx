import { InfoIcon } from "lucide-react";
import { SettingsForm } from "@/features/update-global-settings";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { PageHeader } from "@/shared/ui/page-header";

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Update global WireMock behavior for delays and proxy handling." />

      <Alert>
        <InfoIcon />
        <AlertTitle>Write-only endpoint</AlertTitle>
        <AlertDescription>
          <p>
            WireMock exposes settings updates through POST <code>/__admin/settings</code>, but it does not provide a
            matching read endpoint.
          </p>
          <p>Values shown here are local form defaults until you save them, and they may reset after a server restart.</p>
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Global settings</CardTitle>
          <CardDescription>Configure the server-level defaults applied to all matching behavior.</CardDescription>
        </CardHeader>
        <CardContent>
          <SettingsForm />
        </CardContent>
      </Card>
    </div>
  );
}
