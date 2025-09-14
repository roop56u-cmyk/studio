
"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Edit, Trash2, Clock, Percent, Gem, Calculator } from "lucide-react";
import { Switch } from "@/components/ui/switch";
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
import { Textarea } from "@/components/ui/textarea";

export type NftStakingPackage = {
  id: string;
  name: string;
  durationHours: number;
  rewardRatePercent: number; // APY as a percentage
  fixedTokenBonus: number;
  enabled: boolean;
};

// Helper to format duration for display
const formatDuration = (totalHours: number) => {
    if (totalHours <= 0) return 'Invalid duration';
    const days = Math.floor(totalHours / 24);
    const hours = Math.floor(totalHours % 24);
    const minutes = Math.round((totalHours * 60) % 60);
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
  pkg: Partial<NftStakingPackage> | null;
  onSave: (pkg: Omit<NftStakingPackage, 'id' | 'enabled'> & {enabled: boolean}) => void;
  onCancel: () => void;
}) => {
  const [name, setName] = useState(pkg?.name || "");
  const [days, setDays] = useState(pkg?.durationHours ? Math.floor(pkg.durationHours / 24) : 7);
  const [hours, setHours] = useState(pkg?.durationHours ? pkg.durationHours % 24 : 0);
  const [rewardRatePercent, setRewardRatePercent] = useState(pkg?.rewardRatePercent || 5);
  const [fixedTokenBonus, setFixedTokenBonus] = useState(pkg?.fixedTokenBonus || 10);
  const [nftValue, setNftValue] = useState(100); // For calculator

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const totalDurationInHours = (days * 24) + hours;
    if (!name || totalDurationInHours <= 0 || rewardRatePercent < 0 || fixedTokenBonus < 0) {
      alert("Please fill all fields with valid, non-negative values.");
      return;
    }
    onSave({
      name,
      durationHours: totalDurationInHours,
      rewardRatePercent,
      fixedTokenBonus,
      enabled: pkg?.enabled ?? true,
    });
  };

  const calculatedReward = (nftValue * (rewardRatePercent / 100)) + fixedTokenBonus;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Package Name</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g., 7-Day Stake" />
      </div>
      <div className="space-y-2">
        <Label>Duration</Label>
        <div className="grid grid-cols-2 gap-2">
            <div>
                 <Label htmlFor="duration-days" className="text-xs text-muted-foreground">Days</Label>
                <Input id="duration-days" type="number" value={days} onChange={e => setDays(Number(e.target.value))} min="0" />
            </div>
             <div>
                 <Label htmlFor="duration-hours" className="text-xs text-muted-foreground">Hours</Label>
                <Input id="duration-hours" type="number" value={hours} onChange={e => setHours(Number(e.target.value))} min="0" />
            </div>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="rewardRatePercent">Reward Rate (%)</Label>
        <Input id="rewardRatePercent" type="number" value={rewardRatePercent} onChange={e => setRewardRatePercent(Number(e.target.value))} required />
        <p className="text-xs text-muted-foreground">Percentage of NFT's value earned as bonus tokens.</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="fixedTokenBonus">Fixed Token Bonus</Label>
        <Input id="fixedTokenBonus" type="number" value={fixedTokenBonus} onChange={e => setFixedTokenBonus(Number(e.target.value))} required />
         <p className="text-xs text-muted-foreground">A flat amount of tokens awarded at the end of staking.</p>
      </div>
       <Card className="bg-muted/50">
            <CardHeader className="p-3">
                <CardTitle className="text-sm flex items-center gap-2"><Calculator className="h-4 w-4"/>Reward Estimator</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-2">
                 <div className="space-y-1">
                    <Label htmlFor="nft-value-calc" className="text-xs">Example NFT Value ($)</Label>
                    <Input id="nft-value-calc" type="number" value={nftValue} onChange={e => setNftValue(Number(e.target.value))} />
                </div>
                <p className="text-sm text-center font-semibold">Estimated Reward: <span className="text-primary">{calculatedReward.toFixed(2)} Tokens</span></p>
            </CardContent>
       </Card>
      
      <DialogFooter>
        <DialogClose asChild><Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button></DialogClose>
        <Button type="submit">Save Package</Button>
      </DialogFooter>
    </form>
  );
};


export default function NftStakingPage() {
  const { toast } = useToast();
  const [packages, setPackages] = useState<NftStakingPackage[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<NftStakingPackage | null>(null);

  useEffect(() => {
    setIsClient(true);
    const stored = localStorage.getItem("nft_staking_packages");
    if (stored) {
      setPackages(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem("nft_staking_packages", JSON.stringify(packages));
    }
  }, [packages, isClient]);

  const handleSave = (pkgData: Omit<NftStakingPackage, 'id'>) => {
    if (editingPackage) {
      setPackages(packages.map(p => (p.id === editingPackage.id ? { ...editingPackage, ...pkgData } : p)));
      toast({ title: "Package Updated" });
    } else {
      setPackages([...packages, { ...pkgData, id: `NFTSTAKE-${Date.now()}` }]);
      toast({ title: "Package Added" });
    }
    closeForm();
  };
  
  const handleEdit = (pkg: NftStakingPackage) => {
    setEditingPackage(pkg);
    setIsFormOpen(true);
  };
  
  const handleDelete = (id: string) => {
    setPackages(packages.filter(p => p.id !== id));
    toast({ title: "Package Deleted", variant: "destructive" });
  };
  
  const handleToggle = (id: string, enabled: boolean) => {
      setPackages(packages.map(p => p.id === id ? {...p, enabled} : p));
      toast({ title: `Package ${enabled ? "Enabled" : "Disabled"}` });
  }

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
            <h1 className="text-3xl font-bold tracking-tight">NFT Staking Packages</h1>
            <p className="text-muted-foreground">Create and manage NFT staking options for users.</p>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Staking Packages ({packages.length})</CardTitle>
              <Button variant="default" onClick={() => { setEditingPackage(null); setIsFormOpen(true); }}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Package
              </Button>
            </div>
            <CardDescription>Define the staking contracts users can choose from.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {packages.map(pkg => (
              <div key={pkg.id} className="border p-4 rounded-lg flex justify-between items-start gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold">{pkg.name}</h3>
                  <div className="text-xs text-muted-foreground grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1 mt-2">
                    <span className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> Duration: {formatDuration(pkg.durationHours)}</span>
                    <span className="flex items-center gap-1.5"><Percent className="h-3 w-3" /> Rate: {pkg.rewardRatePercent}%</span>
                    <span className="flex items-center gap-1.5"><Gem className="h-3 w-3" /> Bonus: {pkg.fixedTokenBonus} Tokens</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={pkg.enabled} onCheckedChange={(checked) => handleToggle(pkg.id, checked)} />
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(pkg)}><Edit className="h-4 w-4" /></Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild><Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button></AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Package?</AlertDialogTitle>
                        <AlertDialogDescription>This will remove the package from the user staking options. This cannot be undone.</AlertDialogDescription>
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
            {packages.length === 0 && <p className="text-muted-foreground text-center py-12">No staking packages configured.</p>}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{editingPackage ? 'Edit' : 'Add New'} Staking Package</DialogTitle></DialogHeader>
          <PackageForm pkg={editingPackage} onSave={handleSave} onCancel={closeForm} />
        </DialogContent>
      </Dialog>
    </>
  );
}
