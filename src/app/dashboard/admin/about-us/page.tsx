
"use client";

import { useState, useEffect, useCallback, ChangeEvent } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import Image from "next/image";
import { X, Upload } from "lucide-react";

export type AboutUsData = {
  title: string;
  description: string;
  mainImage: string | null;
  logo: string | null;
};

export default function ManageAboutUsPage() {
    const { toast } = useToast();
    const [isClient, setIsClient] = useState(false);
    const [isEnabled, setIsEnabled] = useState(false);
    const [aboutData, setAboutData] = useState<AboutUsData>({
        title: "About Our Company",
        description: "We are a dedicated team passionate about providing the best service in our industry. Our mission is to empower users by providing innovative solutions and rewarding engagement. We believe in transparency, community, and continuous improvement.",
        mainImage: null,
        logo: null
    });

    useEffect(() => {
        setIsClient(true);
        const storedEnabled = localStorage.getItem("about_us_enabled");
        if (storedEnabled) {
            setIsEnabled(JSON.parse(storedEnabled));
        }
        const storedData = localStorage.getItem("about_us_data");
        if (storedData) {
            setAboutData(JSON.parse(storedData));
        }
    }, []);

    const handleDataChange = (field: keyof AboutUsData, value: string | null) => {
        setAboutData(prev => ({...prev, [field]: value}));
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>, field: 'mainImage' | 'logo') => {
        const file = e.target.files?.[0];
        if(file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                handleDataChange(field, reader.result as string);
            }
            reader.readAsDataURL(file);
        }
    };
    
    const handleSaveChanges = () => {
        localStorage.setItem("about_us_enabled", JSON.stringify(isEnabled));
        localStorage.setItem("about_us_data", JSON.stringify(aboutData));
        toast({
            title: "Settings Saved",
            description: "About Us page settings have been updated.",
        });
    };
    
    if (!isClient) return null;

    return (
        <div className="grid gap-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Manage About Us Page</h1>
                <p className="text-muted-foreground">
                    Control the content and visibility of the company information panel for users.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Visibility</CardTitle>
                    <CardDescription>
                        Use this switch to show or hide the "About Us" panel from all users.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center space-x-2">
                        <Switch id="enable-about-us" checked={isEnabled} onCheckedChange={setIsEnabled} />
                        <Label htmlFor="enable-about-us">{isEnabled ? "Panel is Visible to Users" : "Panel is Hidden from Users"}</Label>
                    </div>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle>Content Editor</CardTitle>
                    <CardDescription>
                        Edit the content that will be displayed on the About Us panel.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input id="title" value={aboutData.title} onChange={e => handleDataChange('title', e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" value={aboutData.description} onChange={e => handleDataChange('description', e.target.value)} rows={5} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>Company Logo</Label>
                             <div className="w-48 h-24 border rounded-md flex items-center justify-center bg-muted overflow-hidden">
                                {aboutData.logo ? <Image src={aboutData.logo} alt="Logo Preview" width={192} height={96} className="object-contain w-full h-full" unoptimized /> : <span className="text-xs text-muted-foreground">No Logo</span>}
                            </div>
                            <Input id="logo-upload" type="file" accept="image/*" onChange={e => handleFileChange(e, 'logo')} />
                            {aboutData.logo && <Button size="sm" variant="destructive" onClick={() => handleDataChange('logo', null)}><X className="mr-2 h-4 w-4"/>Remove</Button>}
                        </div>
                         <div className="space-y-2">
                            <Label>Main Image / GIF</Label>
                             <div className="w-48 h-24 border rounded-md flex items-center justify-center bg-muted overflow-hidden">
                                {aboutData.mainImage ? <Image src={aboutData.mainImage} alt="Main Image Preview" width={192} height={96} className="object-contain w-full h-full" unoptimized /> : <span className="text-xs text-muted-foreground">No Image</span>}
                            </div>
                            <Input id="main-image-upload" type="file" accept="image/*,image/gif" onChange={e => handleFileChange(e, 'mainImage')} />
                             {aboutData.mainImage && <Button size="sm" variant="destructive" onClick={() => handleDataChange('mainImage', null)}><X className="mr-2 h-4 w-4"/>Remove</Button>}
                        </div>
                    </div>
                </CardContent>
            </Card>
            <CardFooter>
                 <Button onClick={handleSaveChanges}>Save All Changes</Button>
            </CardFooter>
        </div>
    );
}
