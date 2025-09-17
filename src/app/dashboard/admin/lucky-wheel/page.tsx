
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
import { PlusCircle, Trash2, Save, Edit, DollarSign } from "lucide-react";
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

export type WheelSlice = {
  id: string;
  name: string;
  amount: number;
  probability: number;
};

export type SpinPackage = {
  id: string;
  name: string;
  price: number;
  spinsGranted: number;
  enabled: boolean;
};

const defaultSlices: WheelSlice[] = [
    { id: '1', name: '$1 Bonus', amount: 1, probability: 40 },
    { id: '2', name: 'No Luck', amount: 0, probability: 30 },
    { id: '3', name: '$5 Bonus', amount: 5, probability: 15 },
    { id: '4', name: '$10 Bonus', amount: 10, probability: 10 },
    { id: '5', name: '$50 Jackpot', amount: 50, probability: 4 },
    { id: '6', name: '$100 Grand Prize', amount: 100, probability: 1 },
];

const SpinPackageForm = ({
  pkg,
  onSave,
  onCancel,
}: {
  pkg: Partial<SpinPackage> | null;
  onSave: (pkg: Omit<SpinPackage, 'id'>) => void;
  onCancel: () => void;
}) => {
  const [name, setName] = useState(pkg?.name || "");
  const [price, setPrice] = useState(pkg?.price || 1);
  const [spinsGranted, setSpinsGranted] = useState(pkg?.spinsGranted || 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || price <= 0 || spinsGranted <= 0) {
      alert("Please fill all fields with valid positive values.");
      return;
    }
    onSave({
      name,
      price,
      spinsGranted,
      enabled: pkg?.enabled ?? true,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Package Name</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g., 5 Spin Pack" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Price (USDT)</Label>
          <Input id="price" type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="spinsGranted">Spins Granted</Label>
          <Input id="spinsGranted" type="number" value={spinsGranted} onChange={(e) => setSpinsGranted(Number(e.target.value))} required />
        </div>
      </div>
      <DialogFooter>
        <DialogClose asChild><Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button></DialogClose>
        <Button type="submit">Save Package</Button>
      </DialogFooter>
    </form>
  );
};


export default function LuckyWheelSettingsPage() {
  const { toast } = useToast();
  const [slices, setSlices] = useState<WheelSlice[]>(defaultSlices);
  const [spinPackages, setSpinPackages] = useState<SpinPackage[]>([]);
  const [isEnabled, setIsEnabled] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [isPackageFormOpen, setIsPackageFormOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<SpinPackage | null>(null);

  useEffect(() => {
    setIsClient(true);
    const storedSlices = localStorage.getItem("lucky_wheel_slices");
    if (storedSlices) setSlices(JSON.parse(storedSlices));
    const storedEnabled = localStorage.getItem("lucky_wheel_enabled");
    if (storedEnabled) setIsEnabled(JSON.parse(storedEnabled));
    const storedPackages = localStorage.getItem("lucky_wheel_packages");
    if (storedPackages) setSpinPackages(JSON.parse(storedPackages));
  }, []);

  const totalProbability = slices.reduce((sum, slice) => sum + slice.probability, 0);

  const handleSliceChange = (id: string, field: keyof Omit<WheelSlice, 'id'>, value: string) => {
    const numericValue = parseFloat(value) || 0;
    setSlices(prev => prev.map(s => (s.id === id ? { ...s, [field]: numericValue } : s)));
  };
  
  const handleSliceNameChange = (id: string, value: string) => {
    setSlices(prev => prev.map(s => (s.id === id ? { ...s, name: value } : s)));
  };

  const addSlice = () => {
    setSlices(prev => [...prev, { id: `slice-${Date.now()}`, name: "New Prize", amount: 0, probability: 0 }]);
  };

  const deleteSlice = (id: string) => {
    setSlices(prev => prev.filter(s => s.id !== id));
  };
  
  const saveChanges = () => {
    if (totalProbability !== 100) {
      toast({
        variant: "destructive",
        title: "Probability Error",
        description: `Total probability must be exactly 100%, but it is currently ${totalProbability}%.`,
      });
      return;
    }
    localStorage.setItem("lucky_wheel_slices", JSON.stringify(slices));
    localStorage.setItem("lucky_wheel_enabled", JSON.stringify(isEnabled));
    localStorage.setItem("lucky_wheel_packages", JSON.stringify(spinPackages));
    toast({
      title: "Settings Saved!",
      description: "Lucky wheel settings have been updated.",
    });
  };

  const handleSavePackage = (pkgData: Omit<SpinPackage, 'id'>) => {
    if (editingPackage) {
      setSpinPackages(spinPackages.map(p => p.id === editingPackage.id ? { ...editingPackage, ...pkgData } : p));
      toast({ title: "Package Updated" });
    } else {
      setSpinPackages([...spinPackages, { ...pkgData, id: `SPINPKG-${Date.now()}` }]);
      toast({ title: "Package Added" });
    }
    closePackageForm();
  };

  const handleEditPackage = (pkg: SpinPackage) => {
    setEditingPackage(pkg);
    setIsPackageFormOpen(true);
  };
  
  const handleDeletePackage = (id: string) => {
    setSpinPackages(spinPackages.filter(p => p.id !== id));
    toast({ title: "Package Deleted", variant: "destructive" });
  };
  
  const handleTogglePackage = (id: string, enabled: boolean) => {
    setSpinPackages(spinPackages.map(p => p.id === id ? {...p, enabled} : p));
    toast({ title: `Package ${enabled ? "Enabled" : "Disabled"}` });
  };

  const closePackageForm = () => {
    setEditingPackage(null);
    setIsPackageFormOpen(false);
  };

  if (!isClient) return null;

  return (
    <>
    <div className="grid gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Lucky Wheel Settings</h1>
        <p className="text-muted-foreground">
          Configure the daily lucky wheel prizes and probabilities for users.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Feature Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Switch id="enable-lucky-wheel" checked={isEnabled} onCheckedChange={setIsEnabled} />
            <Label htmlFor="enable-lucky-wheel">Enable Daily Lucky Wheel for Users</Label>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Wheel Prizes (Slices)</CardTitle>
          <CardDescription>
            Define the prizes and their win chance. Total probability must equal 100%.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {slices.map(slice => (
            <div key={slice.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center border p-3 rounded-md">
              <div className="space-y-1 md:col-span-2">
                <Label htmlFor={`name-${slice.id}`}>Prize Name</Label>
                <Input id={`name-${slice.id}`} value={slice.name} onChange={e => handleSliceNameChange(slice.id, e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor={`amount-${slice.id}`}>Amount ($)</Label>
                <Input id={`amount-${slice.id}`} type="number" value={slice.amount} onChange={e => handleSliceChange(slice.id, 'amount', e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor={`prob-${slice.id}`}>Probability (%)</Label>
                <Input id={`prob-${slice.id}`} type="number" value={slice.probability} onChange={e => handleSliceChange(slice.id, 'probability', e.target.value)} />
              </div>
              <div className="md:col-start-4 md:text-right">
                <Button variant="ghost" size="icon" onClick={() => deleteSlice(slice.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
          <Button variant="outline" onClick={addSlice} className="w-full">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Prize Slice
          </Button>
        </CardContent>
      </Card>

      <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Spin Purchase Packages</CardTitle>
              <Button variant="default" onClick={() => { setEditingPackage(null); setIsPackageFormOpen(true); }}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Package
              </Button>
            </div>
            <CardDescription>Define the packages users can buy for extra spins.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {spinPackages.map(pkg => (
              <div key={pkg.id} className="border p-4 rounded-lg flex justify-between items-start gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold">{pkg.name}</h3>
                  <div className="text-xs text-muted-foreground grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1 mt-2">
                    <span className="flex items-center gap-1.5"><DollarSign className="h-3 w-3" /> Price: ${pkg.price.toLocaleString()}</span>
                    <span className="flex items-center gap-1.5">Spins: {pkg.spinsGranted}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={pkg.enabled} onCheckedChange={(checked) => handleTogglePackage(pkg.id, checked)} />
                  <Button variant="ghost" size="icon" onClick={() => handleEditPackage(pkg)}><Edit className="h-4 w-4" /></Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild><Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button></AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Package?</AlertDialogTitle>
                        <AlertDialogDescription>This will remove the package from the store. This cannot be undone.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeletePackage(pkg.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
            {spinPackages.length === 0 && <p className="text-muted-foreground text-center py-12">No spin packages configured.</p>}
          </CardContent>
        </Card>

      <CardFooter className="flex justify-between items-center">
          <Button onClick={saveChanges}>
            <Save className="mr-2 h-4 w-4" />
            Save All Settings
          </Button>
          <div className={`font-semibold ${totalProbability === 100 ? 'text-green-600' : 'text-destructive'}`}>
            Prize Probability: {totalProbability}%
          </div>
        </CardFooter>
    </div>

    <Dialog open={isPackageFormOpen} onOpenChange={setIsPackageFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{editingPackage ? 'Edit' : 'Add New'} Spin Package</DialogTitle></DialogHeader>
          <SpinPackageForm pkg={editingPackage} onSave={handleSavePackage} onCancel={closePackageForm} />
        </DialogContent>
      </Dialog>
    </>
  );
}
