
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
import { Loader2, PlusCircle, Edit, Trash2 } from "lucide-react";
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

export type RechargeAddress = {
  id: string;
  name: string;
  address: string;
  type: string;
  enabled: boolean;
};

const AddressForm = ({
  address,
  onSave,
  onCancel,
}: {
  address: Partial<RechargeAddress> | null;
  onSave: (address: RechargeAddress) => void;
  onCancel: () => void;
}) => {
  const [name, setName] = useState(address?.name || "");
  const [addr, setAddr] = useState(address?.address || "");
  const [type, setType] = useState(address?.type || "BEP20");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !addr || !type) {
      alert("Please fill all fields.");
      return;
    }
    onSave({
      id: address?.id || `ADDR-${Date.now()}`,
      name,
      address: addr,
      type,
      enabled: address?.enabled ?? true,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Label / Name</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="type">Address Type (e.g., BEP20, TRC20)</Label>
        <Input id="type" value={type} onChange={(e) => setType(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">Full Address</Label>
        <Input id="address" value={addr} onChange={(e) => setAddr(e.target.value)} required />
      </div>
      
      <DialogFooter>
        <DialogClose asChild>
            <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        </DialogClose>
        <Button type="submit">Save Address</Button>
      </DialogFooter>
    </form>
  );
};


export default function ManageRechargeAddressesPage() {
  const { toast } = useToast();
  const [addresses, setAddresses] = useState<RechargeAddress[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<RechargeAddress | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  useEffect(() => {
    setIsClient(true);
    const stored = localStorage.getItem("system_recharge_addresses");
    if (stored) {
      setAddresses(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem("system_recharge_addresses", JSON.stringify(addresses));
    }
  }, [addresses, isClient]);

  const handleSave = (address: RechargeAddress) => {
    if (editingIndex !== null) {
      const newAddresses = [...addresses];
      newAddresses[editingIndex] = address;
      setAddresses(newAddresses);
      toast({ title: "Address Updated" });
    } else {
      setAddresses([...addresses, address]);
      toast({ title: "Address Added" });
    }
    closeForm();
  };
  
  const handleAddNew = () => {
    setEditingAddress(null);
    setEditingIndex(null);
    setIsFormOpen(true);
  };

  const handleEdit = (index: number) => {
    setEditingAddress(addresses[index]);
    setEditingIndex(index);
    setIsFormOpen(true);
  };
  
  const handleDelete = (index: number) => {
    const newAddresses = addresses.filter((_, i) => i !== index);
    setAddresses(newAddresses);
    toast({ title: "Address Deleted", variant: "destructive" });
  };
  
  const handleToggle = (index: number, enabled: boolean) => {
      const newAddresses = [...addresses];
      newAddresses[index].enabled = enabled;
      setAddresses(newAddresses);
      toast({ title: `Address ${enabled ? "Enabled" : "Disabled"}` });
  }

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingAddress(null);
    setEditingIndex(null);
  }
    
  return (
    <>
        <div className="grid gap-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Manage Recharge Addresses</h1>
                    <p className="text-muted-foreground">
                        Configure the official addresses where users send funds.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="default" onClick={handleAddNew}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add New Address
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Current Addresses ({addresses.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {addresses.map((addr, index) => (
                    <div key={addr.id} className="border p-4 rounded-lg flex justify-between items-start gap-4">
                        <div className="flex-1 overflow-hidden">
                            <h3 className="font-semibold">{addr.name} <span className="text-xs font-normal bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full ml-2">{addr.type}</span></h3>
                            <p className="text-sm text-muted-foreground mt-1 font-mono break-all">{addr.address}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Switch 
                                checked={addr.enabled}
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
                                        <AlertDialogTitle>Delete Address?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This address will be removed from the user recharge panel. This cannot be undone.
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
                    {addresses.length === 0 && (
                        <p className="text-muted-foreground text-center py-12">No recharge addresses have been configured yet.</p>
                    )}
                </CardContent>
            </Card>
        </div>
        
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{editingAddress ? 'Edit Address' : 'Add New Address'}</DialogTitle>
                </DialogHeader>
                <AddressForm 
                    address={editingAddress}
                    onSave={handleSave}
                    onCancel={closeForm}
                />
            </DialogContent>
        </Dialog>
    </>
  );
}
