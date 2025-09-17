
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
import { PlusCircle, Trash2, Save } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export type WheelSlice = {
  id: string;
  name: string;
  amount: number;
  probability: number;
};

const defaultSlices: WheelSlice[] = [
    { id: '1', name: '$1 Bonus', amount: 1, probability: 40 },
    { id: '2', name: 'No Luck', amount: 0, probability: 30 },
    { id: '3', name: '$5 Bonus', amount: 5, probability: 15 },
    { id: '4', name: '$10 Bonus', amount: 10, probability: 10 },
    { id: '5', name: '$50 Jackpot', amount: 50, probability: 4 },
    { id: '6', name: '$100 Grand Prize', amount: 100, probability: 1 },
];

export default function LuckyWheelSettingsPage() {
  const { toast } = useToast();
  const [slices, setSlices] = useState<WheelSlice[]>(defaultSlices);
  const [isEnabled, setIsEnabled] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const storedSlices = localStorage.getItem("lucky_wheel_slices");
    if (storedSlices) {
      setSlices(JSON.parse(storedSlices));
    }
    const storedEnabled = localStorage.getItem("lucky_wheel_enabled");
    if (storedEnabled) {
      setIsEnabled(JSON.parse(storedEnabled));
    }
  }, []);

  const totalProbability = slices.reduce((sum, slice) => sum + slice.probability, 0);

  const handleSliceChange = (id: string, field: keyof Omit<WheelSlice, 'id'>, value: string) => {
    const numericValue = parseFloat(value) || 0;
    setSlices(prev =>
      prev.map(s => (s.id === id ? { ...s, [field]: numericValue } : s))
    );
  };
  
  const handleSliceNameChange = (id: string, value: string) => {
    setSlices(prev =>
      prev.map(s => (s.id === id ? { ...s, name: value } : s))
    );
  };

  const addSlice = () => {
    setSlices(prev => [...prev, {
      id: `slice-${Date.now()}`,
      name: "New Prize",
      amount: 0,
      probability: 0,
    }]);
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
    toast({
      title: "Settings Saved!",
      description: "Lucky wheel settings have been updated.",
    });
  };

  if (!isClient) return null;

  return (
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
        <CardFooter className="flex justify-between items-center">
          <Button onClick={saveChanges}>
            <Save className="mr-2 h-4 w-4" />
            Save All Settings
          </Button>
          <div className={`font-semibold ${totalProbability === 100 ? 'text-green-600' : 'text-destructive'}`}>
            Total Probability: {totalProbability}%
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
