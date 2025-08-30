
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
import { PlusCircle, Edit, Trash2, DollarSign, CalendarClock, User, Star } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { levels } from "@/components/dashboard/level-tiers";
import { useAuth } from "@/contexts/AuthContext";

export type SalaryPackage = {
  id: string;
  name: string;
  level: number; // 0 for All Levels
  userEmail: string; // Empty string for all users at the level
  amount: number;
  periodDays: number;
};

const SalaryPackageForm = ({
  pkg,
  onSave,
  onCancel,
}: {
  pkg: Partial<SalaryPackage> | null;
  onSave: (pkg: Omit<SalaryPackage, 'id'>) => void;
  onCancel: () => void;
}) => {
  const { users } = useAuth();
  const [name, setName] = useState(pkg?.name || "");
  const [level, setLevel] = useState(pkg?.level ?? 0);
  const [userEmail, setUserEmail] = useState(pkg?.userEmail || "");
  const [amount, setAmount] = useState(pkg?.amount || 0);
  const [periodDays, setPeriodDays] = useState(pkg?.periodDays || 30);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || amount <= 0 || periodDays <= 0) {
      alert("Please fill all fields with valid positive values.");
      return;
    }
    onSave({ name, level, userEmail, amount, periodDays });
  };
  
  const handleUserSelectChange = (value: string) => {
    if (value === "ALL_USERS") {
      setUserEmail("");
    } else {
      setUserEmail(value);
    }
  };


  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Package Name</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
            <Label htmlFor="level">Target Level</Label>
            <Select value={String(level)} onValueChange={(v) => setLevel(Number(v))}>
                <SelectTrigger id="level">
                    <SelectValue placeholder="Select a level" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="0">All Levels</SelectItem>
                    {levels.filter(l => l.level > 0).map(l => (
                        <SelectItem key={l.level} value={String(l.level)}>Level {l.level}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
        <div className="space-y-2">
            <Label htmlFor="userEmail">Specific User (Optional)</Label>
            <Select value={userEmail || "ALL_USERS"} onValueChange={handleUserSelectChange}>
                <SelectTrigger id="userEmail">
                    <SelectValue placeholder="All users at level" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="ALL_USERS">All users at level</SelectItem>
                    {users.map(u => (
                        <SelectItem key={u.email} value={u.email}>{u.email}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
            <Label htmlFor="amount">Salary Amount (USDT)</Label>
            <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} required />
        </div>
        <div className="space-y-2">
            <Label htmlFor="periodDays">Claim Period (Days)</Label>
            <Input id="periodDays" type="number" value={periodDays} onChange={(e) => setPeriodDays(Number(e.target.value))} required />
        </div>
      </div>
      <DialogFooter>
        <DialogClose asChild><Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button></DialogClose>
        <Button type="submit">Save Package</Button>
      </DialogFooter>
    </form>
  );
};

export default function ManageSalaryPage() {
  const { toast } = useToast();
  const [packages, setPackages] = useState<SalaryPackage[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<SalaryPackage | null>(null);

  useEffect(() => {
    setIsClient(true);
    const stored = localStorage.getItem("platform_salary_packages");
    if (stored) {
      setPackages(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem("platform_salary_packages", JSON.stringify(packages));
    }
  }, [packages, isClient]);

  const handleSave = (pkgData: Omit<SalaryPackage, 'id'>) => {
    if (editingPackage) {
      setPackages(packages.map(p => p.id === editingPackage.id ? { ...p, ...pkgData } : p));
      toast({ title: "Package Updated" });
    } else {
      setPackages([...packages, { ...pkgData, id: `SAL-${Date.now()}` }]);
      toast({ title: "Package Added" });
    }
    closeForm();
  };

  const handleAddNew = () => {
    setEditingPackage(null);
    setIsFormOpen(true);
  };

  const handleEdit = (pkg: SalaryPackage) => {
    setEditingPackage(pkg);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    setPackages(packages.filter(p => p.id !== id));
    toast({ title: "Package Deleted", variant: "destructive" });
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingPackage(null);
  };

  if (!isClient) return null;

  return (
    <>
      <div className="grid gap-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Manage Salary Packages</h1>
            <p className="text-muted-foreground">Create and configure salary bonuses for users.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="default" onClick={handleAddNew}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Package
            </Button>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Current Packages ({packages.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {packages.map((pkg) => (
              <div key={pkg.id} className="border p-4 rounded-lg flex justify-between items-start gap-4">
                <div className="flex-1 space-y-2">
                  <h3 className="font-semibold">{pkg.name}</h3>
                  <div className="text-xs text-muted-foreground grid grid-cols-2 md:grid-cols-4 gap-2">
                    <div className="flex items-center gap-1.5"><DollarSign className="h-3 w-3"/><span>${pkg.amount.toLocaleString()}</span></div>
                    <div className="flex items-center gap-1.5"><CalendarClock className="h-3 w-3"/><span>Every {pkg.periodDays} days</span></div>
                    <div className="flex items-center gap-1.5"><Star className="h-3 w-3"/><span>Level {pkg.level === 0 ? "All" : `${pkg.level}+`}</span></div>
                    <div className="flex items-center gap-1.5"><User className="h-3 w-3"/><span>{pkg.userEmail || "All Users"}</span></div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(pkg)}><Edit className="h-4 w-4" /></Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild><Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button></AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Package?</AlertDialogTitle>
                        <AlertDialogDescription>This will remove the salary package. This cannot be undone.</AlertDialogDescription>
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
            {packages.length === 0 && (
              <p className="text-muted-foreground text-center py-12">No salary packages configured.</p>
            )}
          </CardContent>
        </Card>
      </div>
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{editingPackage ? 'Edit' : 'Add New'} Salary Package</DialogTitle></DialogHeader>
          <SalaryPackageForm pkg={editingPackage} onSave={handleSave} onCancel={closeForm} />
        </DialogContent>
      </Dialog>
    </>
  );
}
