
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
import { Loader2, PlusCircle, Edit, Trash2, Flame } from "lucide-react";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Booster, BoosterType } from "@/contexts/WalletContext";

const boosterTypeLabels: { [key in BoosterType]: string } = {
    TASK_EARNING: "Task Earning Boost (%)",
    TASK_QUOTA: "Task Quota Boost (+Tasks)",
    INTEREST_RATE: "Interest Rate Boost (%)",
    REFERRAL_COMMISSION: "Referral Commission Boost (%)",
    PURCHASE_REFERRAL: "Purchase Referral (+Refs)",
};

const BoosterForm = ({
  booster,
  onSave,
  onCancel,
}: {
  booster: Partial<Booster> | null;
  onSave: (booster: Booster) => void;
  onCancel: () => void;
}) => {
  const [name, setName] = useState(booster?.name || "");
  const [description, setDescription] = useState(booster?.description || "");
  const [type, setType] = useState<BoosterType>(booster?.type || "TASK_EARNING");
  const [value, setValue] = useState(booster?.value || 0);
  const [price, setPrice] = useState(booster?.price || 0);
  const [duration, setDuration] = useState(booster?.duration || 24);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || !type || value <= 0 || price < 0 || duration <= 0) {
      alert("Please fill all fields with valid values.");
      return;
    }
    onSave({
      id: booster?.id || `BSTR-${Date.now()}`,
      name,
      description,
      type,
      value,
      price,
      duration,
      enabled: booster?.enabled ?? true,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-foreground">Booster Name</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description" className="text-foreground">Description</Label>
        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required />
      </div>
      <div className="space-y-2">
          <Label htmlFor="type" className="text-foreground">Booster Type</Label>
          <Select value={type} onValueChange={(v) => setType(v as BoosterType)}>
              <SelectTrigger id="type">
                  <SelectValue placeholder="Select a booster type" />
              </SelectTrigger>
              <SelectContent>
                  {Object.entries(boosterTypeLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
              </SelectContent>
          </Select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <div className="space-y-2">
            <Label htmlFor="value" className="text-foreground">Value</Label>
            <Input id="value" type="number" value={value} onChange={e => setValue(Number(e.target.value))} required />
        </div>
         <div className="space-y-2">
            <Label htmlFor="price" className="text-foreground">Price (USDT)</Label>
            <Input id="price" type="number" value={price} onChange={e => setPrice(Number(e.target.value))} required />
        </div>
         <div className="space-y-2">
            <Label htmlFor="duration" className="text-foreground">Duration (hours)</Label>
            <Input id="duration" type="number" value={duration} onChange={e => setDuration(Number(e.target.value))} required />
        </div>
      </div>
      
      <DialogFooter>
        <DialogClose asChild>
            <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        </DialogClose>
        <Button type="submit">Save Booster</Button>
      </DialogFooter>
    </form>
  );
};

export default function ManageBoostersPage() {
  const { toast } = useToast();
  const [boosters, setBoosters] = useState<Booster[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBooster, setEditingBooster] = useState<Booster | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  useEffect(() => {
    setIsClient(true);
    const storedBoosters = localStorage.getItem("platform_boosters");
    if (storedBoosters) {
      setBoosters(JSON.parse(storedBoosters));
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem("platform_boosters", JSON.stringify(boosters));
    }
  }, [boosters, isClient]);


  const handleSaveBooster = (booster: Booster) => {
    if (editingIndex !== null) {
      const newBoosters = [...boosters];
      newBoosters[editingIndex] = booster;
      setBoosters(newBoosters);
      toast({ title: "Booster Updated" });
    } else {
      setBoosters([...boosters, booster]);
      toast({ title: "Booster Added" });
    }
    closeForm();
  };
  
  const handleAddNew = () => {
    setEditingBooster(null);
    setEditingIndex(null);
    setIsFormOpen(true);
  };

  const handleEdit = (index: number) => {
    setEditingBooster(boosters[index]);
    setEditingIndex(index);
    setIsFormOpen(true);
  };
  
  const handleDelete = (index: number) => {
    const newBoosters = boosters.filter((_, i) => i !== index);
    setBoosters(newBoosters);
    toast({ title: "Booster Deleted", variant: "destructive" });
  };
  
  const handleToggle = (index: number, enabled: boolean) => {
      const newBoosters = [...boosters];
      newBoosters[index].enabled = enabled;
      setBoosters(newBoosters);
      toast({ title: `Booster ${enabled ? "Enabled" : "Disabled"}` });
  }

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingBooster(null);
    setEditingIndex(null);
  }

  if (!isClient) {
    return (
      <div className="grid gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Boosters</h1>
          <p className="text-muted-foreground">
            Create and configure booster packs for the user store.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Manage Boosters</h1>
            <p className="text-muted-foreground">
             Create and configure booster packs for the user store.
            </p>
          </div>
          <div className="flex gap-2">
             <Button variant="default" onClick={handleAddNew}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New Booster
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Current Boosters ({boosters.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {boosters.map((booster, index) => (
              <div key={booster.id} className="border p-4 rounded-lg flex justify-between items-start gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold">{booster.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{booster.description}</p>
                  <div className="text-xs text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 mt-2">
                      <span><strong className="text-foreground">Type:</strong> {boosterTypeLabels[booster.type]}</span>
                      <span><strong className="text-foreground">Value:</strong> {booster.value}</span>
                      <span><strong className="text-foreground">Price:</strong> ${booster.price.toFixed(2)}</span>
                      <span><strong className="text-foreground">Duration:</strong> {booster.duration}h</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                    <Switch 
                        checked={booster.enabled}
                        onCheckedChange={(checked) => handleToggle(index, checked)}
                    />
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(index)}>
                        <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete Booster?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Are you sure you want to delete this booster? This cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                             <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(index)} className="bg-destructive hover:bg-destructive/90">
                                    Delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
              </div>
            ))}
             {boosters.length === 0 && (
                <p className="text-muted-foreground text-center py-8">No boosters created yet.</p>
             )}
          </CardContent>
        </Card>
      </div>
      
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="sm:max-w-lg bg-background">
            <DialogHeader>
                <DialogTitle>{editingBooster ? 'Edit Booster' : 'Add New Booster'}</DialogTitle>
            </DialogHeader>
            <BoosterForm 
                booster={editingBooster}
                onSave={handleSaveBooster}
                onCancel={closeForm}
            />
          </DialogContent>
      </Dialog>
    </>
  );
}
