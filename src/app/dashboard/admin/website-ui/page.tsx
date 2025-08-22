

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
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Helper to convert hex to HSL string
const hexToHslString = (hex: string): string => {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex.slice(1, 3), 16);
    g = parseInt(hex.slice(3, 5), 16);
    b = parseInt(hex.slice(5, 7), 16);
  }
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  
  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);

  return `${h} ${s}% ${l}%`;
};

export default function WebsiteUIPage() {
    const { toast } = useToast();
    const [selectedTheme, setSelectedTheme] = useState("abstract-tech");
    
    // Website content states
    const [websiteName, setWebsiteName] = useState("TaskReview Hub");
    const [logoUrl, setLogoUrl] = useState("");
    const [websiteTitle, setWebsiteTitle] = useState("Welcome to TaskReview Hub");
    const [websiteSubtitle, setWebsiteSubtitle] = useState("Your central place to rate, review, and analyze tasks and services. Get started by creating an account or signing in.");

    // Color states with default hex values
    const [primaryColor, setPrimaryColor] = useState("#673ab7");
    const [accentColor, setAccentColor] = useState("#009688");
    const [backgroundColor, setBackgroundColor] = useState("#f5f5f5");

    const [isClient, setIsClient] = useState(false);

    const applyColors = useCallback(() => {
        document.documentElement.style.setProperty('--primary', hexToHslString(primaryColor));
        document.documentElement.style.setProperty('--accent', hexToHslString(accentColor));
        document.documentElement.style.setProperty('--background', hexToHslString(backgroundColor));
        // Adjust card and sidebar background based on main background for better visibility
        const bgLuminance = parseInt(hexToHslString(backgroundColor).split(' ')[2]);
        const cardBg = bgLuminance > 50 ? `${bgLuminance - 2}%` : `${bgLuminance + 2}%`;
        const cardHsl = hexToHslString(backgroundColor).split(' ');
        document.documentElement.style.setProperty('--card', `${cardHsl[0]} ${cardHsl[1]} ${cardBg}`);
        document.documentElement.style.setProperty('--sidebar-background', `${cardHsl[0]} ${cardHsl[1]} ${cardBg}`);
    }, [primaryColor, accentColor, backgroundColor]);


    useEffect(() => {
        // Content
        const savedWebsiteName = localStorage.getItem('website_name');
        if (savedWebsiteName) setWebsiteName(savedWebsiteName);
        const savedLogoUrl = localStorage.getItem('website_logo_url');
        if (savedLogoUrl) setLogoUrl(savedLogoUrl);
        const savedWebsiteTitle = localStorage.getItem('website_title');
        if (savedWebsiteTitle) setWebsiteTitle(savedWebsiteTitle);
        const savedWebsiteSubtitle = localStorage.getItem('website_subtitle');
        if (savedWebsiteSubtitle) setWebsiteSubtitle(savedWebsiteSubtitle);

        // Theme & Colors
        const savedTheme = localStorage.getItem('landing_theme');
        if (savedTheme) setSelectedTheme(savedTheme);
        const savedPrimaryColor = localStorage.getItem('theme_primary_color');
        if (savedPrimaryColor) setPrimaryColor(savedPrimaryColor);
        const savedAccentColor = localStorage.getItem('theme_accent_color');
        if (savedAccentColor) setAccentColor(savedAccentColor);
        const savedBackgroundColor = localStorage.getItem('theme_background_color');
        if (savedBackgroundColor) setBackgroundColor(savedBackgroundColor);
        
        setIsClient(true);
    }, []);
    
    useEffect(() => {
        if(isClient) {
            applyColors();
        }
    }, [isClient, applyColors])


    const handleSaveChanges = () => {
        // Content
        localStorage.setItem('website_name', websiteName);
        localStorage.setItem('website_logo_url', logoUrl);
        localStorage.setItem('website_title', websiteTitle);
        localStorage.setItem('website_subtitle', websiteSubtitle);
        
        // Theme & Colors
        localStorage.setItem('landing_theme', selectedTheme);
        localStorage.setItem('theme_primary_color', primaryColor);
        localStorage.setItem('theme_accent_color', accentColor);
        localStorage.setItem('theme_background_color', backgroundColor);
        
        applyColors();
        
        // Force a page reload to apply changes to components that don't re-render automatically
        // like the logo and title. A more advanced solution would use a global state manager.
        window.location.reload();

        toast({
            title: "Settings Saved",
            description: "Website UI settings have been updated.",
        });
    };
    
    if (!isClient) {
        return null;
    }

  return (
    <div className="grid gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Website &amp; UI</h1>
        <p className="text-muted-foreground">
          Manage your website's branding, content, and appearance.
        </p>
      </div>

       <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
          <CardDescription>
            Manage the core branding and content of your website.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="website-name">Website Name</Label>
                <Input id="website-name" value={websiteName} onChange={(e) => setWebsiteName(e.target.value)} />
                <p className="text-xs text-muted-foreground">This name appears in the browser tab and next to the logo.</p>
            </div>
            <div className="space-y-2">
                <Label htmlFor="logo-url">Logo Image URL</Label>
                <Input id="logo-url" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://example.com/logo.png" />
                <p className="text-xs text-muted-foreground">Leave blank to use the default vector logo.</p>
            </div>
             <div className="space-y-2">
                <Label htmlFor="website-title">Welcome Screen Title</Label>
                <Input id="website-title" value={websiteTitle} onChange={(e) => setWebsiteTitle(e.target.value)} />
            </div>
             <div className="space-y-2">
                <Label htmlFor="website-subtitle">Welcome Screen Subtitle</Label>
                <Textarea id="website-subtitle" value={websiteSubtitle} onChange={(e) => setWebsiteSubtitle(e.target.value)} rows={3}/>
            </div>
        </CardContent>
      </Card>
      
       <Card>
        <CardHeader>
          <CardTitle>Theme &amp; Colors</CardTitle>
          <CardDescription>
            Customize the global color scheme and landing page appearance.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>3D Welcome Animation Theme</Label>
            <RadioGroup value={selectedTheme} onValueChange={setSelectedTheme}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="abstract-tech" id="abstract-tech" />
                <Label htmlFor="abstract-tech" className="font-normal">Abstract Tech</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cosmic-voyage" id="cosmic-voyage" />
                <Label htmlFor="cosmic-voyage" className="font-normal">Cosmic Voyage</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="digital-matrix" id="digital-matrix" />
                <Label htmlFor="digital-matrix" className="font-normal">Digital Matrix</Label>
              </div>
               <div className="flex items-center space-x-2">
                <RadioGroupItem value="organic-growth" id="organic-growth" />
                <Label htmlFor="organic-growth" className="font-normal">Organic Growth</Label>
              </div>
            </RadioGroup>
          </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primary-color">Primary Color</Label>
                <div className="flex items-center gap-2">
                    <Input id="primary-color" type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="p-1 h-10"/>
                    <Input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="h-10"/>
                </div>
              </div>
               <div className="space-y-2">
                <Label htmlFor="accent-color">Accent Color</Label>
                 <div className="flex items-center gap-2">
                    <Input id="accent-color" type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="p-1 h-10"/>
                    <Input value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="h-10"/>
                 </div>
              </div>
               <div className="space-y-2">
                <Label htmlFor="background-color">Background Color</Label>
                 <div className="flex items-center gap-2">
                    <Input id="background-color" type="color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} className="p-1 h-10"/>
                    <Input value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} className="h-10"/>
                 </div>
              </div>
          </div>
        </CardContent>
      </Card>


      <div className="flex justify-end">
          <Button onClick={handleSaveChanges}>Save All Settings</Button>
      </div>

    </div>
  );
}
