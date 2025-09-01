

"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { levels as defaultLevels, Level } from "@/components/dashboard/level-tiers";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/contexts/AuthContext";
import { useWallet } from "@/contexts/WalletContext";
import { User } from "@/contexts/AuthContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { PlusCircle, Edit, Trash2, ShieldAlert } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";


export type BonusTier = {
    id: string;
    minDeposit: number;
    bonusAmount: number;
};

export type AdvancedWithdrawalRestriction = {
    id: string;
    enabled: boolean;
    days: number;
    levels: number[];
    withdrawalPercentage: number;
    targetType: 'all' | 'specific';
    targetUser: string;
    message: string;
};

const BonusTierForm = ({
  tier,
  onSave,
  onCancel,
}: {
  tier: Partial<BonusTier> | null;
  onSave: (tier: Omit<BonusTier, 'id'>) => void;
  onCancel: () => void;
}) => {
  const [minDeposit, setMinDeposit] = useState(tier?.minDeposit || 100);
  const [bonusAmount, setBonusAmount] = useState(tier?.bonusAmount || 8);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (minDeposit <= 0 || bonusAmount <= 0) {
      alert("Please fill all fields with valid positive values.");
      return;
    }
    onSave({ minDeposit, bonusAmount });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="min-deposit">Min First Deposit ($)</Label>
        <Input id="min-deposit" type="number" value={minDeposit} onChange={e => setMinDeposit(Number(e.target.value))} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="bonus-amount">Bonus Amount ($)</Label>
        <Input id="bonus-amount" type="number" value={bonusAmount} onChange={e => setBonusAmount(Number(e.target.value))} required />
      </div>
      <DialogFooter>
        <DialogClose asChild>
            <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        </DialogClose>
        <Button type="submit">Save Tier</Button>
      </DialogFooter>
    </form>
  );
};

const AdvancedRestrictionForm = ({
    rule,
    onSave,
    onClose,
    users,
    defaultLevels,
}: {
    rule: Partial<AdvancedWithdrawalRestriction> | null;
    onSave: (rule: Omit<AdvancedWithdrawalRestriction, 'id'>) => void;
    onClose: () => void;
    users: User[];
    defaultLevels: Level[];
}) => {
    const [enabled, setEnabled] = useState(rule?.enabled ?? true);
    const [days, setDays] = useState(rule?.days || 45);
    const [levels, setLevels] = useState<number[]>(rule?.levels || []);
    const [withdrawalPercentage, setWithdrawalPercentage] = useState(rule?.withdrawalPercentage || 100);
    const [targetType, setTargetType] = useState<'all' | 'specific'>(rule?.targetType || 'all');
    const [targetUser, setTargetUser] = useState(rule?.targetUser || "");
    const [message, setMessage] = useState(rule?.message || "Your withdrawal amount will make your account inactive for your level. Please maintain a sufficient balance.");

    const handleLevelChange = useCallback((level: number, checked: boolean) => {
        setLevels(prev =>
            checked ? [...prev, level] : prev.filter(l => l !== level)
        );
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ enabled, days, levels, withdrawalPercentage, targetType, targetUser: targetType === 'specific' ? targetUser : '', message });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center space-x-2">
                <Switch id="rule-enabled" checked={enabled} onCheckedChange={setEnabled} />
                <Label htmlFor="rule-enabled">Enable this rule</Label>
            </div>
            <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label htmlFor="days">Restriction Days</Label>
                    <Input id="days" type="number" value={days} onChange={e => setDays(Number(e.target.value))} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="withdrawal-percentage">Withdrawal % Limit</Label>
                    <Input id="withdrawal-percentage" type="number" value={withdrawalPercentage} onChange={e => setWithdrawalPercentage(Number(e.target.value))} />
                </div>
            </div>
            <div className="space-y-2">
                <Label>Target Levels</Label>
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                    {defaultLevels.filter(l => l.level > 0).map(level => (
                        <div key={level.level} className="flex items-center space-x-2">
                            <Checkbox id={`level-${level.level}`} checked={levels.includes(level.level)} onCheckedChange={(checked) => handleLevelChange(level.level, !!checked)} />
                            <Label htmlFor={`level-${level.level}`} className="font-normal">Level {level.level}</Label>
                        </div>
                    ))}
                </div>
            </div>
            <div className="space-y-2">
                <Label>Target Users</Label>
                <RadioGroup value={targetType} onValueChange={(v) => setTargetType(v as 'all' | 'specific')}>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="all" id="target-all" /><Label htmlFor="target-all" className="font-normal">All Users in selected levels</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="specific" id="target-specific" /><Label htmlFor="target-specific" className="font-normal">Specific User</Label></div>
                </RadioGroup>
                {targetType === 'specific' && (
                    <Select value={targetUser} onValueChange={setTargetUser}>
                        <SelectTrigger><SelectValue placeholder="Select a user..." /></SelectTrigger>
                        <SelectContent>
                            {users.map(u => <SelectItem key={u.email} value={u.email}>{u.email}</SelectItem>)}
                        </SelectContent>
                    </Select>
                )}
            </div>
             <div className="space-y-2">
                <Label htmlFor="message">Popup Message</Label>
                <Textarea id="message" value={message} onChange={e => setMessage(e.target.value)} rows={4} />
            </div>
            <DialogFooter>
                <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                <Button type="submit">Save Rule</Button>
            </DialogFooter>
        </form>
    );
};


export default function SystemSettingsPage() {
    const { toast } = useToast();
    const { users, updateUser } = useAuth();
    const { addTransaction } = useWallet();

    // Signup Bonus
    const [signupBonusEnabled, setSignupBonusEnabled] = useState(true);
    const [signupBonusApprovalRequired, setSignupBonusApprovalRequired] = useState(false);
    const [signupBonuses, setSignupBonuses] = useState<BonusTier[]>([]);
    const [manualBonusUser, setManualBonusUser] = useState("");
    const [manualBonusAmount, setManualBonusAmount] = useState("");
    const [disableBonusUser, setDisableBonusUser] = useState("");
    const [isSignupFormOpen, setIsSignupFormOpen] = useState(false);
    const [editingSignupBonus, setEditingSignupBonus] = useState<BonusTier | null>(null);

    // Referral Bonus
    const [referralBonusEnabled, setReferralBonusEnabled] = useState(true);
    const [referralBonusApprovalRequired, setReferralBonusApprovalRequired] = useState(false);
    const [referralBonuses, setReferralBonuses] = useState<BonusTier[]>([]);
    const [isReferralFormOpen, setIsReferralFormOpen] = useState(false);
    const [editingReferralBonus, setEditingReferralBonus] = useState<BonusTier | null>(null);

    // Withdrawal
    const [isWithdrawalRestriction, setIsWithdrawalRestriction] = useState(true);
    const [withdrawalRestrictionDays, setWithdrawalRestrictionDays] = useState("45");
    const [withdrawalRestrictionMessage, setWithdrawalRestrictionMessage] = useState("Please wait for 45 days to initiate withdrawal request.");
    const [restrictedLevels, setRestrictedLevels] = useState<number[]>([1]); // Default to level 1
    const [multipleAddressesEnabled, setMultipleAddressesEnabled] = useState(true);

    // Advanced Withdrawal
    const [advRestrictions, setAdvRestrictions] = useState<AdvancedWithdrawalRestriction[]>([]);
    const [isAdvRestrictionFormOpen, setIsAdvRestrictionFormOpen] = useState(false);
    const [editingAdvRestriction, setEditingAdvRestriction] = useState<AdvancedWithdrawalRestriction | null>(null);


    // Earning Model
    const [earningModel, setEarningModel] = useState("dynamic"); // 'dynamic' or 'fixed'
    
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        // Signup Bonus
        const savedBonusEnabled = localStorage.getItem('system_signup_bonus_enabled');
        if (savedBonusEnabled) setSignupBonusEnabled(JSON.parse(savedBonusEnabled));
        const savedSignupBonusApproval = localStorage.getItem('system_signup_bonus_approval_required');
        if (savedSignupBonusApproval) setSignupBonusApprovalRequired(JSON.parse(savedSignupBonusApproval));
        const savedSignupBonuses = localStorage.getItem('system_signup_bonuses');
        if (savedSignupBonuses) setSignupBonuses(JSON.parse(savedSignupBonuses));
        else setSignupBonuses([{id: 'default-signup', minDeposit: 100, bonusAmount: 8}]);


        // Referral Bonus
        const savedRefBonusEnabled = localStorage.getItem('system_referral_bonus_enabled');
        if (savedRefBonusEnabled) setReferralBonusEnabled(JSON.parse(savedRefBonusEnabled));
        const savedRefBonusApproval = localStorage.getItem('system_referral_bonus_approval_required');
        if (savedRefBonusApproval) setReferralBonusApprovalRequired(JSON.parse(savedRefBonusApproval));
        const savedReferralBonuses = localStorage.getItem('system_referral_bonuses');
        if (savedReferralBonuses) setReferralBonuses(JSON.parse(savedReferralBonuses));
        else setReferralBonuses([{id: 'default-referral', minDeposit: 100, bonusAmount: 5}]);
        
        // Withdrawal
        const savedWithdrawalRestriction = localStorage.getItem('system_withdrawal_restriction_enabled');
        if (savedWithdrawalRestriction) setIsWithdrawalRestriction(JSON.parse(savedWithdrawalRestriction));

        const savedWithdrawalDays = localStorage.getItem('system_withdrawal_restriction_days');
        if (savedWithdrawalDays) setWithdrawalRestrictionDays(savedWithdrawalDays);
        
        const savedWithdrawalMessage = localStorage.getItem('system_withdrawal_restriction_message');
        if (savedWithdrawalMessage) setWithdrawalRestrictionMessage(savedWithdrawalMessage);

        const savedRestrictedLevels = localStorage.getItem('system_withdrawal_restricted_levels');
        if (savedRestrictedLevels) setRestrictedLevels(JSON.parse(savedRestrictedLevels));

        const savedMultipleAddresses = localStorage.getItem('system_multiple_addresses_enabled');
        if (savedMultipleAddresses) setMultipleAddressesEnabled(JSON.parse(savedMultipleAddresses));
        
        // Earning Model
        const savedEarningModel = localStorage.getItem('system_earning_model');
        if (savedEarningModel) setEarningModel(savedEarningModel);

        // Advanced Withdrawal Restrictions
        const savedAdvRestrictions = localStorage.getItem('system_advanced_withdrawal_restrictions');
        if (savedAdvRestrictions) setAdvRestrictions(JSON.parse(savedAdvRestrictions));
        
        setIsClient(true);
    }, []);


    const handleSaveChanges = () => {
        // Signup Bonus
        localStorage.setItem('system_signup_bonus_enabled', JSON.stringify(signupBonusEnabled));
        localStorage.setItem('system_signup_bonus_approval_required', JSON.stringify(signupBonusApprovalRequired));
        localStorage.setItem('system_signup_bonuses', JSON.stringify(signupBonuses));

        // Referral Bonus
        localStorage.setItem('system_referral_bonus_enabled', JSON.stringify(referralBonusEnabled));
        localStorage.setItem('system_referral_bonus_approval_required', JSON.stringify(referralBonusApprovalRequired));
        localStorage.setItem('system_referral_bonuses', JSON.stringify(referralBonuses));
        
        // Withdrawal
        localStorage.setItem('system_withdrawal_restriction_enabled', JSON.stringify(isWithdrawalRestriction));
        localStorage.setItem('system_withdrawal_restriction_days', withdrawalRestrictionDays);
        localStorage.setItem('system_withdrawal_restriction_message', withdrawalRestrictionMessage);
        localStorage.setItem('system_withdrawal_restricted_levels', JSON.stringify(restrictedLevels));
        localStorage.setItem('system_multiple_addresses_enabled', JSON.stringify(multipleAddressesEnabled));

        // Earning Model
        localStorage.setItem('system_earning_model', earningModel);
        
        // Advanced Withdrawal
        localStorage.setItem('system_advanced_withdrawal_restrictions', JSON.stringify(advRestrictions));

        toast({
            title: "Settings Saved",
            description: "Global system settings have been updated.",
        });
        
        window.location.reload();
    };

    const handleLevelRestrictionChange = useCallback((level: number, checked: boolean) => {
        setRestrictedLevels(prev => 
            checked ? [...prev, level] : prev.filter(l => l !== level)
        );
    }, []);

    const handleGrantBonus = () => {
        if (!manualBonusUser || !manualBonusAmount) {
            toast({ variant: 'destructive', title: 'Missing Information', description: 'Please select a user and enter a bonus amount.'});
            return;
        }
        const amount = parseFloat(manualBonusAmount);
        if (isNaN(amount) || amount <= 0) {
            toast({ variant: 'destructive', title: 'Invalid Amount', description: 'Please enter a valid bonus amount.'});
            return;
        }

        const mainBalanceKey = `${manualBonusUser}_mainBalance`;
        const currentBalance = parseFloat(localStorage.getItem(mainBalanceKey) || '0');
        localStorage.setItem(mainBalanceKey, (currentBalance + amount).toString());

        addTransaction(manualBonusUser, {
            type: 'Manual Bonus',
            description: `Bonus granted by admin`,
            amount: amount,
            date: new Date().toISOString(),
        });
        
        toast({ title: 'Bonus Granted!', description: `$${amount.toFixed(2)} has been credited to ${manualBonusUser}.`});
        setManualBonusAmount("");
        setManualBonusUser("");
    }

    const handleDisableBonus = () => {
        if (!disableBonusUser) {
            toast({ variant: 'destructive', title: 'No User Selected', description: 'Please select a user to disable their bonus.'});
            return;
        }
        const userToUpdate = users.find(u => u.email === disableBonusUser);
        if (!userToUpdate) return;
        
        updateUser(disableBonusUser, { ...userToUpdate, isBonusDisabled: true });
        
        toast({ title: 'Bonus Disabled for User', description: `Automatic sign-up bonus has been disabled for ${disableBonusUser}.`});
        setDisableBonusUser("");
    }
    
    // Sign-up bonus tier management
    const handleSaveSignupBonus = (tier: Omit<BonusTier, 'id'>) => {
        if (editingSignupBonus) {
            setSignupBonuses(prev => prev.map(t => t.id === editingSignupBonus.id ? {...t, ...tier} : t).sort((a,b) => a.minDeposit - b.minDeposit));
        } else {
            setSignupBonuses(prev => [...prev, { ...tier, id: `s-bonus-${Date.now()}` }].sort((a,b) => a.minDeposit - b.minDeposit));
        }
        closeSignupForm();
    };

    const handleEditSignupBonus = (tier: BonusTier) => {
        setEditingSignupBonus(tier);
        setIsSignupFormOpen(true);
    };

    const handleDeleteSignupBonus = (id: string) => {
        setSignupBonuses(prev => prev.filter(t => t.id !== id));
    };

    const closeSignupForm = () => {
        setEditingSignupBonus(null);
        setIsSignupFormOpen(false);
    }
    
    // Referral bonus tier management
    const handleSaveReferralBonus = (tier: Omit<BonusTier, 'id'>) => {
        if (editingReferralBonus) {
            setReferralBonuses(prev => prev.map(t => t.id === editingReferralBonus.id ? {...t, ...tier} : t).sort((a,b) => a.minDeposit - b.minDeposit));
        } else {
            setReferralBonuses(prev => [...prev, { ...tier, id: `r-bonus-${Date.now()}` }].sort((a,b) => a.minDeposit - b.minDeposit));
        }
        closeReferralForm();
    };

    const handleEditReferralBonus = (tier: BonusTier) => {
        setEditingReferralBonus(tier);
        setIsReferralFormOpen(true);
    };

    const handleDeleteReferralBonus = (id: string) => {
        setReferralBonuses(prev => prev.filter(t => t.id !== id));
    };

    const closeReferralForm = () => {
        setEditingReferralBonus(null);
        setIsReferralFormOpen(false);
    }
    
    // Advanced restriction management
    const handleSaveAdvRestriction = (rule: Omit<AdvancedWithdrawalRestriction, 'id'>) => {
        if (editingAdvRestriction) {
            setAdvRestrictions(prev => prev.map(r => r.id === editingAdvRestriction.id ? { ...r, ...rule } : r));
        } else {
            setAdvRestrictions(prev => [...prev, { ...rule, id: `adv-restrict-${Date.now()}` }]);
        }
        closeAdvRestrictionForm();
    };
    
    const handleEditAdvRestriction = (rule: AdvancedWithdrawalRestriction) => {
        setEditingAdvRestriction(rule);
        setIsAdvRestrictionFormOpen(true);
    };

    const handleDeleteAdvRestriction = (id: string) => {
        setAdvRestrictions(prev => prev.filter(r => r.id !== id));
    };

    const closeAdvRestrictionForm = () => {
        setEditingAdvRestriction(null);
        setIsAdvRestrictionFormOpen(false);
    };


    if (!isClient) {
        return null;
    }

  return (
    <div className="grid gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
        <p className="text-muted-foreground">
          Manage global application settings and features.
        </p>
      </div>
       <Card>
        <CardHeader>
          <CardTitle>Earning Model</CardTitle>
          <CardDescription>
            Choose how task earnings are calculated for users.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <RadioGroup value={earningModel} onValueChange={setEarningModel} className="space-y-2">
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dynamic" id="dynamic-earning" />
                    <Label htmlFor="dynamic-earning" className="font-normal">Dynamic Earning (Daily Percentage)</Label>
                </div>
                 <p className="text-xs text-muted-foreground pl-6">Income is based on a % of the user's balance. (e.g., 2% of $500 balance / 20 tasks = $0.50 per task)</p>

                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="fixed" id="fixed-earning" />
                    <Label htmlFor="fixed-earning" className="font-normal">Fixed Earning (Per Task)</Label>
                </div>
                 <p className="text-xs text-muted-foreground pl-6">Income is a fixed amount per task, set for each level in "Manage Levels".</p>
            </RadioGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sign-up Bonus Program</CardTitle>
          <CardDescription>
            Configure bonuses for a new user's first qualifying deposit. The highest applicable bonus will be awarded.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch id="signup-bonus-toggle" checked={signupBonusEnabled} onCheckedChange={setSignupBonusEnabled} />
            <Label htmlFor="signup-bonus-toggle">Enable Sign-up Bonus Program</Label>
          </div>
           <div className="flex items-center space-x-2">
            <Switch id="signup-bonus-approval-toggle" checked={signupBonusApprovalRequired} onCheckedChange={setSignupBonusApprovalRequired} />
            <Label htmlFor="signup-bonus-approval-toggle">Require Admin Approval for Claims</Label>
          </div>
           <div className="space-y-2">
                <Label>Bonus Tiers</Label>
                <div className="space-y-2 rounded-md border p-2">
                    {signupBonuses.map(tier => (
                        <div key={tier.id} className="flex justify-between items-center text-sm p-1">
                            <span>Deposit ${tier.minDeposit}+, get ${tier.bonusAmount} bonus</span>
                             <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEditSignupBonus(tier)}><Edit className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDeleteSignupBonus(tier.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                            </div>
                        </div>
                    ))}
                    {signupBonuses.length === 0 && <p className="text-xs text-muted-foreground text-center py-2">No bonus tiers configured.</p>}
                </div>
                <Dialog open={isSignupFormOpen} onOpenChange={setIsSignupFormOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => { setEditingSignupBonus(null); setIsSignupFormOpen(true); }}><PlusCircle className="mr-2 h-4 w-4"/>Add Tier</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader><DialogTitle>{editingSignupBonus ? 'Edit' : 'Add'} Sign-up Bonus Tier</DialogTitle></DialogHeader>
                        <BonusTierForm tier={editingSignupBonus} onSave={handleSaveSignupBonus} onCancel={closeSignupForm} />
                    </DialogContent>
                </Dialog>
           </div>
          <Separator className="my-6"/>
            <div className="space-y-4">
                <h4 className="text-sm font-medium">Manual Bonus Controls</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Grant Manual Bonus</Label>
                        <Select value={manualBonusUser} onValueChange={setManualBonusUser}>
                            <SelectTrigger><SelectValue placeholder="Select user..." /></SelectTrigger>
                            <SelectContent>
                                {users.map(u => <SelectItem key={u.email} value={u.email}>{u.email}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Input type="number" placeholder="Bonus amount ($)" value={manualBonusAmount} onChange={e => setManualBonusAmount(e.target.value)} />
                        <Button onClick={handleGrantBonus} size="sm">Grant Bonus</Button>
                    </div>
                    <div className="space-y-2">
                        <Label>Disable Sign-up Bonus for User</Label>
                         <Select value={disableBonusUser} onValueChange={setDisableBonusUser}>
                            <SelectTrigger><SelectValue placeholder="Select user..." /></SelectTrigger>
                            <SelectContent>
                                {users.filter(u => !u.isBonusDisabled).map(u => <SelectItem key={u.email} value={u.email}>{u.email}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">Select a user to prevent them from receiving the automatic sign-up bonus.</p>
                        <Button onClick={handleDisableBonus} size="sm" variant="destructive">Disable for User</Button>
                    </div>
                </div>
            </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Referral Bonus Program</CardTitle>
          <CardDescription>
            Reward referrers when their invited users make their first deposit. The highest applicable bonus will be awarded.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch id="referral-bonus-toggle" checked={referralBonusEnabled} onCheckedChange={setReferralBonusEnabled} />
            <Label htmlFor="referral-bonus-toggle">Enable Referral Bonus Program</Label>
          </div>
           <div className="flex items-center space-x-2">
            <Switch id="referral-bonus-approval-toggle" checked={referralBonusApprovalRequired} onCheckedChange={setReferralBonusApprovalRequired} />
            <Label htmlFor="referral-bonus-approval-toggle">Require Admin Approval for Claims</Label>
          </div>
          <div className="space-y-2">
                <Label>Bonus Tiers</Label>
                <div className="space-y-2 rounded-md border p-2">
                    {referralBonuses.map(tier => (
                        <div key={tier.id} className="flex justify-between items-center text-sm p-1">
                            <span>Referred user deposits ${tier.minDeposit}+, referrer gets ${tier.bonusAmount}</span>
                             <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEditReferralBonus(tier)}><Edit className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDeleteReferralBonus(tier.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                            </div>
                        </div>
                    ))}
                    {referralBonuses.length === 0 && <p className="text-xs text-muted-foreground text-center py-2">No bonus tiers configured.</p>}
                </div>
                <Dialog open={isReferralFormOpen} onOpenChange={setIsReferralFormOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => { setEditingReferralBonus(null); setIsReferralFormOpen(true); }}><PlusCircle className="mr-2 h-4 w-4"/>Add Tier</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader><DialogTitle>{editingReferralBonus ? 'Edit' : 'Add'} Referral Bonus Tier</DialogTitle></DialogHeader>
                        <BonusTierForm tier={editingReferralBonus} onSave={handleSaveReferralBonus} onCancel={closeReferralForm} />
                    </DialogContent>
                </Dialog>
           </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Withdrawal Settings</CardTitle>
          <CardDescription>
            Set rules for when and how users can make withdrawals.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="flex items-center space-x-2">
                <Switch id="multiple-addresses-toggle" checked={multipleAddressesEnabled} onCheckedChange={setMultipleAddressesEnabled} />
                <Label htmlFor="multiple-addresses-toggle">Allow Multiple Withdrawal Addresses</Label>
            </div>
             <p className="text-xs text-muted-foreground -mt-4">If disabled, users can only save one withdrawal address.</p>

            <div className="border-t pt-6">
                <div className="flex items-center space-x-2">
                    <Switch id="withdrawal-restriction-toggle" checked={isWithdrawalRestriction} onCheckedChange={setIsWithdrawalRestriction} />
                    <Label htmlFor="withdrawal-restriction-toggle">Enable Basic Withdrawal Time Restriction</Label>
                </div>
                 <p className="text-xs text-muted-foreground mb-4">Set a simple waiting period after a user's first deposit.</p>
            </div>
             <div className="space-y-2">
                <Label htmlFor="withdrawal-days">Restriction Period (Days)</Label>
                <Input 
                    id="withdrawal-days" 
                    type="number"
                    value={withdrawalRestrictionDays} 
                    onChange={e => setWithdrawalRestrictionDays(e.target.value)}
                    disabled={!isWithdrawalRestriction}
                />
            </div>
             <div className="space-y-2">
                <Label htmlFor="withdrawal-message">Restriction Popup Message</Label>
                <Textarea 
                    id="withdrawal-message" 
                    value={withdrawalRestrictionMessage} 
                    onChange={(e) => setWithdrawalRestrictionMessage(e.target.value)}
                    disabled={!isWithdrawalRestriction}
                    rows={3}
                />
            </div>
             <div className="space-y-2">
                <Label>Apply Restriction to Levels</Label>
                 <div className="flex flex-wrap gap-4 pt-2">
                    {defaultLevels.filter(l => l.level > 0).map(level => (
                        <div key={level.level} className="flex items-center space-x-2">
                            <Checkbox
                                id={`level-${level.level}`}
                                checked={restrictedLevels.includes(level.level)}
                                onCheckedChange={(checked) => handleLevelRestrictionChange(level.level, !!checked)}
                                disabled={!isWithdrawalRestriction}
                            />
                            <Label htmlFor={`level-${level.level}`} className="font-normal">Level {level.level}</Label>
                        </div>
                    ))}
                </div>
            </div>
        </CardContent>
      </Card>
      
       <Card>
            <CardHeader>
                <CardTitle>Advanced Withdrawal Restrictions</CardTitle>
                <CardDescription>
                    Create specific rules that can block withdrawals to maintain account activity or for other custom scenarios. These rules apply in addition to the basic settings above.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Accordion type="multiple" className="w-full space-y-2">
                    {advRestrictions.map(rule => (
                        <AccordionItem value={rule.id} key={rule.id} className="border rounded-md px-4">
                            <AccordionTrigger>
                                <div className="flex items-center gap-4 text-left">
                                     <Switch checked={rule.enabled} onCheckedChange={(checked) => { const newRules = [...advRestrictions]; const r = newRules.find(x=>x.id===rule.id); if(r) r.enabled = checked; setAdvRestrictions(newRules); }} onClick={(e) => e.stopPropagation()} />
                                    <div>
                                        <h4 className={cn("font-semibold", !rule.enabled && "text-muted-foreground")}>
                                            Rule for {rule.targetType === 'all' ? `Levels ${rule.levels.join(', ')}` : rule.targetUser}
                                        </h4>
                                        <p className="text-xs text-muted-foreground font-normal">
                                            {rule.message.substring(0, 50)}...
                                        </p>
                                    </div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pt-4">
                                <div className="flex justify-end gap-2">
                                     <Button variant="outline" size="sm" onClick={() => handleEditAdvRestriction(rule)}><Edit className="mr-2 h-4 w-4"/>Edit</Button>
                                     <Button variant="destructive" size="sm" onClick={() => handleDeleteAdvRestriction(rule.id)}><Trash2 className="mr-2 h-4 w-4"/>Delete</Button>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
                <Dialog open={isAdvRestrictionFormOpen} onOpenChange={setIsAdvRestrictionFormOpen}>
                     <DialogTrigger asChild>
                         <Button variant="outline" className="w-full mt-4" onClick={() => { setEditingAdvRestriction(null); setIsAdvRestrictionFormOpen(true); } }>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add New Rule
                         </Button>
                     </DialogTrigger>
                     <DialogContent className="max-h-[90vh] overflow-y-auto">
                        <DialogHeader><DialogTitle>{editingAdvRestriction ? "Edit Rule" : "Create New Rule"}</DialogTitle></DialogHeader>
                        <AdvancedRestrictionForm rule={editingAdvRestriction} onSave={handleSaveAdvRestriction} onClose={closeAdvRestrictionForm} users={users} defaultLevels={defaultLevels} />
                    </DialogContent>
                </Dialog>

            </CardContent>
        </Card>


      <div className="flex justify-end">
          <Button onClick={handleSaveChanges}>Save All Settings</Button>
      </div>

    </div>
  );
}
