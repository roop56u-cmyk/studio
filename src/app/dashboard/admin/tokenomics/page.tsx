
"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Edit, Trash2, DollarSign, Settings, Save, Power, Gauge, Clock, Gem } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

export type MiningPackage = {
  id: string;
  name: string;
  price: number;
  miningRate: number; // Tokens per hour
  duration: number; // in hours
};

export type TokenomicsSettings = {
  tokenName: string;
  tokenSymbol: string;
  conversionRate: number; // How many tokens for 1 USDT
  miningEnabled: boolean;
};

// Helper to convert total hours into days, hours, minutes object
constgetHoursParts = (totalHours: number) => {
    const totalMinutes = Math.round(totalHours * 60);
    const days = Math.floor(totalMinutes / (24 * 60));
    const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
    const minutes = totalMinutes % 60;
    return { days, hours, minutes };
};

// Helper to format duration for display
const formatDuration = (totalHours: number) => {
    if (totalHours <= 0) return 'Invalid duration';
    const { days, hours, minutes } = getHoursParts(totalHours);
    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    return parts.join(' ') || '0m';
};


const PackageForm = ({
  pkg,
  onSave,
  onCancel,
}: {
  pkg: Partial<MiningPackage> | null;
  onSave: (pkg: Omit<MiningPackage, 'id'>) => void;
  onCancel: () => void;
}) => {
  const [name, setName] = useState(pkg?.name || "");
  const [price, setPrice] = useState(pkg?.price || 50);
  const [miningRate, setMiningRate] = useState(pkg?.miningRate || 0.5);

  const initialDuration = pkg?.duration ? getHoursParts(pkg.duration) : { days: 1, hours: 0, minutes: 0 };
  const [days, setDays] = useState(initialDuration.days);
  const [hours, setHours] = useState(initialDuration.hours);
  const [minutes, setMinutes] = useState(initialDuration.minutes);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const totalDurationInHours = (days * 24) + hours + (minutes / 60);

    if (!name || price <= 0 || miningRate <= 0 || totalDurationInHours <= 0) {
      alert("Please fill all fields with valid positive values, including a duration.");
      return;
    }
    onSave({ name, price, miningRate, duration: totalDurationInHours });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Package Name</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g., Starter Miner" />
      </div>
       <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
            <Label htmlFor="price">Price (USDT)</Label>
            <Input id="price" type="number" value={price} onChange={e => setPrice(Number(e.target.value))} required />
        </div>
        <div className="space-y-2">
            <Label htmlFor="miningRate">Mining Rate (Tokens/hour)</Label>
            <Input id="miningRate" type="number" step="0.01" value={miningRate} onChange={e => setMiningRate(Number(e.target.value))} required />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Duration</Label>
        <div className="grid grid-cols-3 gap-2">
            <div>
                 <Label htmlFor="duration-days" className="text-xs text-muted-foreground">Days</Label>
                <Input id="duration-days" type="number" value={days} onChange={e => setDays(Number(e.target.value))} min="0" />
            </div>
             <div>
                 <Label htmlFor="duration-hours" className="text-xs text-muted-foreground">Hours</Label>
                <Input id="duration-hours" type="number" value={hours} onChange={e => setHours(Number(e.target.value))} min="0" />
            </div>
             <div>
                 <Label htmlFor="duration-minutes" className="text-xs text-muted-foreground">Minutes</Label>
                <Input id="duration-minutes" type="number" value={minutes} onChange={e => setMinutes(Number(e.target.value))} min="0" />
            </div>
        </div>
      </div>
      
      <DialogFooter>
        <DialogClose asChild><Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button></DialogClose>
        <Button type="submit">Save Package</Button>
      </DialogFooter>
    </form>
  );
};


export default function TokenomicsPage() {
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [packages, setPackages] = useState<MiningPackage[]>([]);
  const [settings, setSettings] = useState<TokenomicsSettings>({
    tokenName: 'Taskify Coin',
    tokenSymbol: 'TFT',
    conversionRate: 10,
    miningEnabled: true
  });
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<MiningPackage | null>(null);

  useEffect(() => {
    setIsClient(true);
    const storedPackages = localStorage.getItem("mining_packages");
    if (storedPackages) setPackages(JSON.parse(storedPackages));

    const storedSettings = localStorage.getItem("tokenomics_settings");
    if (storedSettings) setSettings(JSON.parse(storedSettings));
  }, []);

  const handleSave = () => {
    localStorage.setItem("mining_packages", JSON.stringify(packages));
    localStorage.setItem("tokenomics_settings", JSON.stringify(settings));
    toast({ title: "Tokenomics Settings Saved", description: "All token and mining settings have been updated." });
  };
  
  const handleSavePackage = (pkgData: Omit<MiningPackage, 'id'>) => {
    let newPackages: MiningPackage[];
    if (editingPackage) {
      newPackages = packages.map(p => (p.id === editingPackage.id ? { ...editingPackage, ...pkgData } : p));
      toast({ title: "Package Updated" });
    } else {
      newPackages = [...packages, { ...pkgData, id: `PKG-${Date.now()}` }];
      toast({ title: "Package Added" });
    }
    setPackages(newPackages);
    closeForm();
  };
  
  const handleEdit = (pkg: MiningPackage) => {
    setEditingPackage(pkg);
    setIsFormOpen(true);
  };
  
  const handleDelete = (id: string) => {
    setPackages(packages.filter(p => p.id !== id));
    toast({ title: "Package Deleted", variant: "destructive" });
  };

  const closeForm = () => {
    setEditingPackage(null);
    setIsFormOpen(false);
  };

  if (!isClient) return null;

  return (
    <>
      <div className="grid gap-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tokenomics</h1>
            <p className="text-muted-foreground">Manage the platform's custom token and mining economy.</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Global Mining Settings</CardTitle>
                <CardDescription>Control the entire token mining feature from here.</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="mining-enabled" className="text-sm">Mining Enabled</Label>
                <Switch id="mining-enabled" checked={settings.miningEnabled} onCheckedChange={(checked) => setSettings(s => ({ ...s, miningEnabled: checked }))} />
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="tokenName">Token Name</Label>
              <Input id="tokenName" value={settings.tokenName} onChange={e => setSettings(s => ({...s, tokenName: e.target.value}))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tokenSymbol">Token Symbol</Label>
              <Input id="tokenSymbol" value={settings.tokenSymbol} onChange={e => setSettings(s => ({...s, tokenSymbol: e.target.value}))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="conversionRate">Conversion Rate to 1 USDT</Label>
              <div className="relative">
                <Input id="conversionRate" type="number" value={settings.conversionRate} onChange={e => setSettings(s => ({...s, conversionRate: Number(e.target.value)}))} className="pl-8" />
                <Gem className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Mining Packages ({packages.length})</CardTitle>
              <Button variant="default" onClick={() => { setEditingPackage(null); setIsFormOpen(true); }}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Package
              </Button>
            </div>
            <CardDescription>Define the mining contracts users can purchase.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {packages.map(pkg => (
              <div key={pkg.id} className="border p-4 rounded-lg flex justify-between items-start gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold">{pkg.name}</h3>
                  <div className="text-xs text-muted-foreground grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1 mt-2">
                    <span className="flex items-center gap-1.5"><DollarSign className="h-3 w-3" /> Price: ${pkg.price.toLocaleString()}</span>
                    <span className="flex items-center gap-1.5"><Gauge className="h-3 w-3" /> Rate: {pkg.miningRate} {settings.tokenSymbol}/hr</span>
                    <span className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> Duration: {formatDuration(pkg.duration)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(pkg)}><Edit className="h-4 w-4" /></Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild><Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button></AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Package?</AlertDialogTitle>
                        <AlertDialogDescription>This will remove the package from the user store. This cannot be undone.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(pkg.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
            {packages.length === 0 && <p className="text-muted-foreground text-center py-12">No mining packages configured.</p>}
          </CardContent>
        </Card>
        
        <div className="flex justify-end">
            <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save All Tokenomics Settings
            </Button>
        </div>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{editingPackage ? 'Edit' : 'Add New'} Mining Package</DialogTitle></DialogHeader>
          <PackageForm pkg={editingPackage} onSave={handleSavePackage} onCancel={closeForm} />
        </DialogContent>
      </Dialog>
    </>
  );
}
