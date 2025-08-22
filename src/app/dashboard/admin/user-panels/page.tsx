
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { defaultPanelConfig, PanelConfig } from "@/app/dashboard/user/page";
import { Eye, EyeOff } from "lucide-react";


export default function ManageUserPanelsPage() {
  const { toast } = useToast();
  const [panelConfig, setPanelConfig] = useState<PanelConfig[]>(defaultPanelConfig);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const storedConfig = localStorage.getItem("user_panel_config");
    if (storedConfig) {
      // Merge stored config with default config to add new panels from code
      const parsedConfig = JSON.parse(storedConfig);
      const newConfig = defaultPanelConfig.map(defaultPanel => {
        const savedPanel = parsedConfig.find((p: PanelConfig) => p.id === defaultPanel.id);
        return savedPanel ? savedPanel : defaultPanel;
      });
      setPanelConfig(newConfig);
    }
  }, []);

  const handleToggle = (id: string) => {
    setPanelConfig(prev =>
      prev.map(panel =>
        panel.id === id ? { ...panel, enabled: !panel.enabled } : panel
      )
    );
  };
  
  const handleSaveChanges = () => {
    localStorage.setItem("user_panel_config", JSON.stringify(panelConfig));
    toast({
      title: "Settings Saved",
      description: "User dashboard panel settings have been updated.",
    });
  };
  
  if (!isClient) {
    return null;
  }

  return (
    <div className="grid gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manage User Panels</h1>
        <p className="text-muted-foreground">
          Control which panels are visible on the user dashboard.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dashboard Panels</CardTitle>
          <CardDescription>
            Enable or disable panels to customize the user experience.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {panelConfig.map(panel => (
            <div key={panel.id} className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor={`panel-${panel.id}`} className="text-base font-semibold">
                  {panel.name}
                </Label>
                <p className="text-sm text-muted-foreground">
                    {panel.enabled ? "Visible to users" : "Hidden from users"}
                </p>
              </div>
              <div className="flex items-center gap-4">
                {panel.enabled ? <Eye className="h-5 w-5 text-primary" /> : <EyeOff className="h-5 w-5 text-muted-foreground" />}
                <Switch
                  id={`panel-${panel.id}`}
                  checked={panel.enabled}
                  onCheckedChange={() => handleToggle(panel.id)}
                />
              </div>
            </div>
          ))}
        </CardContent>
        <CardFooter>
            <Button onClick={handleSaveChanges}>Save All Changes</Button>
        </CardFooter>
      </Card>
    </div>
  );
}

    