
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
import { PlusCircle, Edit, Trash2, Users, Percent, UserCheck, Star } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { levels as defaultLevels, Level } from "@/components/dashboard/level-tiers";

export type CommunityCommissionRule = {
  id: string;
  name: string;
  commissionRate: number;
  requiredLevel: number;
  requiredDirectReferrals: number;
  requiredTeamSize: number;
  enabled: boolean;
};

const RuleForm = ({
  rule,
  onSave,
  onCancel,
  availableLevels,
}: {
  rule: Partial<CommunityCommissionRule> | null;
  onSave: (rule: Omit<CommunityCommissionRule, 'id'>) => void;
  onCancel: () => void;
  availableLevels: Level[];
}) => {
  const [name, setName] = useState(rule?.name || "");
  const [commissionRate, setCommissionRate] = useState(rule?.commissionRate || 0);
  const [requiredLevel, setRequiredLevel] = useState(rule?.requiredLevel || 1);
  const [requiredDirectReferrals, setRequiredDirectReferrals] = useState(rule?.requiredDirectReferrals || 0);
  const [requiredTeamSize, setRequiredTeamSize] = useState(rule?.requiredTeamSize || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || commissionRate <= 0 || requiredLevel <= 0 || requiredDirectReferrals < 0 || requiredTeamSize < 0) {
      alert("Please fill all fields with valid, positive values.");
      return;
    }
    onSave({
      name,
      commissionRate,
      requiredLevel,
      requiredDirectReferrals,
      requiredTeamSize,
      enabled: rule?.enabled ?? true,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Rule Name</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g., Senior Leader Bonus" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
            <Label htmlFor="commissionRate">Commission Rate (%)</Label>
            <Input id="commissionRate" type="number" value={commissionRate} onChange={(e) => setCommissionRate(Number(e.target.value))} required />
        </div>
        <div className="space-y-2">
            <Label htmlFor="requiredLevel">Minimum User Level</Label>
            <Select value={String(requiredLevel)} onValueChange={(v) => setRequiredLevel(Number(v))}>
                <SelectTrigger id="requiredLevel">
                    <SelectValue placeholder="Select a level" />
                </SelectTrigger>
                <SelectContent>
                    {availableLevels.filter(l => l.level > 0).map(l => (
                        <SelectItem key={l.level} value={String(l.level)}>Level {l.level}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
      </div>
       <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
            <Label htmlFor="requiredDirectReferrals">Required Active L1 Referrals</Label>
            <Input id="requiredDirectReferrals" type="number" value={requiredDirectReferrals} onChange={(e) => setRequiredDirectReferrals(Number(e.target.value))} required />
        </div>
        <div className="space-y-2">
            <Label htmlFor="requiredTeamSize">Required L1-L3 Team Size</Label>
            <Input id="requiredTeamSize" type="number" value={requiredTeamSize} onChange={(e) => setRequiredTeamSize(Number(e.target.value))} required />
        </div>
      </div>
      
      <DialogFooter>
        <DialogClose asChild>
            <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        </DialogClose>
        <Button type="submit">Save Rule</Button>
      </DialogFooter>
    </form>
  );
};


export default function ManageCommunityCommissionPage() {
  const { toast } = useToast();
  const [rules, setRules] = useState<CommunityCommissionRule[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<CommunityCommissionRule | null>(null);
  const [availableLevels, setAvailableLevels] = useState<Level[]>(defaultLevels);


  useEffect(() => {
    setIsClient(true);
    const storedRules = localStorage.getItem("community_commission_rules");
    if (storedRules) {
      setRules(JSON.parse(storedRules));
    }
     const storedLevels = localStorage.getItem("platform_levels");
    if (storedLevels) {
        setAvailableLevels(JSON.parse(storedLevels));
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem("community_commission_rules", JSON.stringify(rules));
    }
  }, [rules, isClient]);

  const handleSaveRule = (ruleData: Omit<CommunityCommissionRule, 'id'>) => {
    if (editingRule) {
      setRules(rules.map(r => r.id === editingRule.id ? { ...editingRule, ...ruleData } : r));
      toast({ title: "Rule Updated" });
    } else {
      setRules([...rules, { ...ruleData, id: `CCR-${Date.now()}` }]);
      toast({ title: "Rule Added" });
    }
    closeForm();
  };
  
  const handleAddNew = () => {
    setEditingRule(null);
    setIsFormOpen(true);
  };

  const handleEdit = (rule: CommunityCommissionRule) => {
    setEditingRule(rule);
    setIsFormOpen(true);
  };
  
  const handleDelete = (id: string) => {
    setRules(rules.filter(r => r.id !== id));
    toast({ title: "Rule Deleted", variant: "destructive" });
  };

  const handleToggle = (id: string, enabled: boolean) => {
      setRules(rules.map(r => r.id === id ? {...r, enabled} : r));
      toast({ title: `Rule ${enabled ? "Enabled" : "Disabled"}` });
  }
  
  const closeForm = () => {
    setIsFormOpen(false);
    setEditingRule(null);
  }
    
  return (
    <>
        <div className="grid gap-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Manage Community Commission</h1>
                    <p className="text-muted-foreground">
                       Define rules for rewarding users for their L4+ team activity.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="default" onClick={handleAddNew}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add New Rule
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Commission Rules ({rules.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {rules.map((rule) => (
                    <div key={rule.id} className="border p-4 rounded-lg flex justify-between items-start gap-4">
                        <div className="flex-1">
                            <h3 className="font-semibold">{rule.name}</h3>
                            <div className="text-xs text-muted-foreground grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-1 mt-2">
                                <span className="flex items-center gap-1.5"><Percent className="h-3 w-3"/> Rate: {rule.commissionRate}%</span>
                                <span className="flex items-center gap-1.5"><Star className="h-3 w-3"/> Level: {rule.requiredLevel}+</span>
                                <span className="flex items-center gap-1.5"><UserCheck className="h-3 w-3"/> L1 Referrals: {rule.requiredDirectReferrals}+</span>
                                <span className="flex items-center gap-1.5"><Users className="h-3 w-3"/> L1-L3 Team: {rule.requiredTeamSize}+</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Switch 
                                checked={rule.enabled}
                                onCheckedChange={(checked) => handleToggle(rule.id, checked)}
                            />
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(rule)}>
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
                                        <AlertDialogTitle>Delete Rule?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Are you sure you want to delete this rule? This cannot be undone.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDelete(rule.id)} className="bg-destructive hover:bg-destructive/90">
                                            Delete
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>
                    ))}
                    {rules.length === 0 && (
                        <p className="text-muted-foreground text-center py-12">No community commission rules have been configured yet.</p>
                    )}
                </CardContent>
            </Card>
        </div>
        
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{editingRule ? 'Edit Rule' : 'Add New Rule'}</DialogTitle>
                </DialogHeader>
                <RuleForm
                    rule={editingRule}
                    onSave={handleSaveRule}
                    onCancel={closeForm}
                    availableLevels={availableLevels}
                />
            </DialogContent>
        </Dialog>
    </>
  );
}
