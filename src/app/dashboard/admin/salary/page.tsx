
"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Edit, Trash2, DollarSign, CalendarClock, User, Star, Briefcase, UserCheck as UserCheckIcon, HandCoins } from "lucide-react";
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
import { levels as defaultLevels, Level } from "@/components/dashboard/level-tiers";
import { useAuth } from "@/contexts/AuthContext";
import { Switch } from "@/components/ui/switch";
import { grantManualReward } from "@/app/actions";
import { Loader2 } from "lucide-react";

export type SalaryPackage = {
  id: string;
  name: string;
  level: number; // 0 for All Levels
  userEmail: string; // Empty string for all users at the level
  amount: number;
  periodDays: number;
  requiredTeamBusiness: number;
  requiredActiveReferrals: number;
  enabled: boolean;
};

const ManualGrantForm = () => {
  const { users } = useAuth();
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleGrant = async () => {
    if (!selectedUser || !amount || !reason) {
      toast({ variant: "destructive", title: "Missing fields", description: "Please select a user and fill in all fields." });
      return;
    }
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast({ variant: "destructive", title: "Invalid Amount", description: "Please enter a valid positive number." });
      return;
    }

    setIsLoading(true);
    // This is a server action, it won't have direct access to localStorage.
    // In a real app, this would update a database.
    // For this demo, we will log to console and assume success, then update client-side state.
    try {
      // Fake server delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mainBalanceKey = `${selectedUser}_mainBalance`;
      const currentBalance = parseFloat(localStorage.getItem(mainBalanceKey) || '0');
      localStorage.setItem(mainBalanceKey, (currentBalance + numericAmount).toString());

      const activityHistoryKey = `${selectedUser}_activityHistory`;
      const currentHistory = JSON.parse(localStorage.getItem(activityHistoryKey) || '[]');
      const newActivity = {
        id: `ACT-MANUAL-${Date.now()}`,
        type: "Manual Salary",
        description: `Manually granted by admin: ${reason}`,
        amount: numericAmount,
        date: new Date().toISOString(),
      };
      localStorage.setItem(activityHistoryKey, JSON.stringify([newActivity, ...currentHistory]));

      toast({ title: "Salary Granted", description: `${selectedUser} has been credited with $${numericAmount}.` });
      setSelectedUser("");
      setAmount("");
      setReason("");
    } catch (error) {
       toast({ variant: "destructive", title: "Error", description: "Could not grant salary." });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Grant Manual Salary</CardTitle>
        <CardDescription>Directly credit a salary bonus to a user's main wallet.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Select User</Label>
          <Select value={selectedUser} onValueChange={setSelectedUser}>
            <SelectTrigger><SelectValue placeholder="Select a user..." /></SelectTrigger>
            <SelectContent>
              {users.map(u => <SelectItem key={u.email} value={u.email}>{u.email}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Amount (USDT)</Label>
          <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="e.g., 500" />
        </div>
        <div className="space-y-2">
          <Label>Reason</Label>
          <Input value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g., Top performer award" />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleGrant} disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <HandCoins className="mr-2 h-4 w-4" />}
          Grant Salary
        </Button>
      </CardFooter>
    </Card>
  );
};


const SalaryPackageForm = ({
  pkg,
  onSave,
  onCancel,
  availableLevels,
}: {
  pkg: Partial<SalaryPackage> | null;
  onSave: (pkg: Omit<SalaryPackage, 'id'>) => void;
  onCancel: () => void;
  availableLevels: Level[];
}) => {
  const { users } = useAuth();
  const [name, setName] = useState(pkg?.name || "");
  const [level, setLevel] = useState(pkg?.level ?? 0);
  const [userEmail, setUserEmail] = useState(pkg?.userEmail || "");
  const [amount, setAmount] = useState(pkg?.amount || 0);
  const [periodDays, setPeriodDays] = useState(pkg?.periodDays || 30);
  const [requiredTeamBusiness, setRequiredTeamBusiness] = useState(pkg?.requiredTeamBusiness || 0);
  const [requiredActiveReferrals, setRequiredActiveReferrals] = useState(pkg?.requiredActiveReferrals || 0);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || amount <= 0 || periodDays <= 0 || requiredTeamBusiness < 0 || requiredActiveReferrals < 0) {
      alert("Please fill all fields with valid values. Amounts cannot be negative.");
      return;
    }
    onSave({ 
        name, 
        level, 
        userEmail, 
        amount, 
        periodDays, 
        requiredTeamBusiness, 
        requiredActiveReferrals,
        enabled: pkg?.enabled ?? true 
    });
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
                    {availableLevels.filter(l => l.level > 0).map(l => (
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
       <div className="space-y-2">
        <Label htmlFor="requiredTeamBusiness">Required Team Business (USDT)</Label>
        <Input id="requiredTeamBusiness" type="number" value={requiredTeamBusiness} onChange={(e) => setRequiredTeamBusiness(Number(e.target.value))} required />
      </div>
       <div className="space-y-2">
        <Label htmlFor="requiredActiveReferrals">Required Active L1 Referrals</Label>
        <Input id="requiredActiveReferrals" type="number" value={requiredActiveReferrals} onChange={(e) => setRequiredActiveReferrals(Number(e.target.value))} required />
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
  const [availableLevels, setAvailableLevels] = useState<Level[]>(defaultLevels);

  useEffect(() => {
    setIsClient(true);
    const stored = localStorage.getItem("platform_salary_packages");
    if (stored) {
      setPackages(JSON.parse(stored));
    }
    const storedLevels = localStorage.getItem("platform_levels");
    if (storedLevels) {
        setAvailableLevels(JSON.parse(storedLevels));
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
  
  const handleToggle = (id: string, enabled: boolean) => {
      setPackages(packages.map(p => p.id === id ? {...p, enabled} : p));
      toast({ title: `Package ${enabled ? "Enabled" : "Disabled"}` });
  }

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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                <Card>
                <CardHeader>
                    <CardTitle>Current Packages ({packages.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {packages.map((pkg) => (
                    <div key={pkg.id} className="border p-4 rounded-lg flex justify-between items-start gap-4">
                        <div className="flex-1 space-y-2">
                        <h3 className="font-semibold">{pkg.name}</h3>
                        <div className="text-xs text-muted-foreground grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                            <div className="flex items-center gap-1.5"><DollarSign className="h-3 w-3"/><span>${pkg.amount.toLocaleString()}</span></div>
                            <div className="flex items-center gap-1.5"><CalendarClock className="h-3 w-3"/><span>Every {pkg.periodDays} days</span></div>
                            <div className="flex items-center gap-1.5"><Star className="h-3 w-3"/><span>Level {pkg.level === 0 ? "All" : `${pkg.level}+`}</span></div>
                            <div className="flex items-center gap-1.5"><Briefcase className="h-3 w-3"/><span>&gt; ${pkg.requiredTeamBusiness.toLocaleString()} business</span></div>
                            <div className="flex items-center gap-1.5"><UserCheckIcon className="h-3 w-3"/><span>&gt; {pkg.requiredActiveReferrals} active L1</span></div>
                            <div className="flex items-center gap-1.5"><User className="h-3 w-3"/><span>{pkg.userEmail || "All Users"}</span></div>
                        </div>
                        </div>
                        <div className="flex items-center gap-2">
                        <Switch 
                            checked={pkg.enabled}
                            onCheckedChange={(checked) => handleToggle(pkg.id, checked)}
                        />
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
            <div>
                <ManualGrantForm />
            </div>
        </div>
      </div>
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{editingPackage ? 'Edit' : 'Add New'} Salary Package</DialogTitle></DialogHeader>
          <SalaryPackageForm pkg={editingPackage} onSave={handleSave} onCancel={closeForm} availableLevels={availableLevels}/>
        </DialogContent>
      </Dialog>
    </>
  );
}
