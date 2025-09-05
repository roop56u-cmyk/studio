

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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PlusCircle, Edit, Trash2, Upload, X } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogTrigger
} from "@/components/ui/dialog";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { gradients } from "@/lib/gradients";


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

export type CustomButton = {
  id: string;
  text: string;
  url: string; // Can be a standard URL or a Data URL for a file
  fileName?: string; // Original name of the uploaded file
  enabled: boolean;
};

const ButtonForm = ({
  button,
  onSave,
  onClose,
}: {
  button: Partial<CustomButton> | null;
  onSave: (button: Omit<CustomButton, 'id' | 'enabled'> & { enabled?: boolean }) => void;
  onClose: () => void;
}) => {
  const [text, setText] = useState(button?.text || 'Download App');
  const [url, setUrl] = useState(button?.url && !button.url.startsWith('data:') ? button.url : '');
  const [fileDataUrl, setFileDataUrl] = useState(button?.url && button.url.startsWith('data:') ? button.url : null);
  const [fileName, setFileName] = useState(button?.fileName || '');
  const { toast } = useToast();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          if (file.size > 5 * 1024 * 1024) { // 5MB limit
             toast({
                title: "File Too Large",
                description: "The uploaded file exceeds the 5MB limit for this feature.",
                variant: "destructive",
            });
            e.target.value = ''; // Clear the input
            return;
          }
          const reader = new FileReader();
          reader.onloadend = () => {
              setFileDataUrl(reader.result as string);
              setFileName(file.name);
              setUrl(''); // Clear URL if a file is uploaded
              toast({ title: "File Selected", description: file.name });
          };
          reader.readAsDataURL(file);
      }
  };

  const handleUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
      setUrl(e.target.value);
      if (e.target.value) {
          setFileDataUrl(null); // Clear file if URL is typed
          setFileName('');
      }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text || (!url && !fileDataUrl)) {
      alert("Please provide either a URL or upload a file.");
      return;
    }
    onSave({
      text,
      url: fileDataUrl || url,
      fileName: fileName || undefined,
      enabled: button?.enabled ?? true,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="button-text">Button Text</Label>
        <Input id="button-text" value={text} onChange={(e) => setText(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="button-url">Button URL</Label>
        <Input id="button-url" type="url" placeholder="https://example.com/download" value={url} onChange={handleUrlChange} />
      </div>
      <div className="flex items-center gap-2">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">OR</span>
          <Separator className="flex-1" />
      </div>
       <div className="space-y-2">
        <Label htmlFor="button-file">Upload File (e.g., .apk, max 5MB)</Label>
        <Input id="button-file" type="file" onChange={handleFileChange} />
        {fileName && <p className="text-xs text-muted-foreground mt-1">Selected: {fileName}</p>}
      </div>
      <DialogFooter>
        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
        <Button type="submit">Save Button</Button>
      </DialogFooter>
    </form>
  );
};

export default function WebsiteUIPage() {
    const { toast } = useToast();
    
    // Website content states
    const [websiteName, setWebsiteName] = useState("Taskify");
    const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
    const [mainLogoDataUrl, setMainLogoDataUrl] = useState<string | null>(null);
    const [websiteTitle, setWebsiteTitle] = useState("Welcome to Taskify");
    const [websiteSubtitle, setWebsiteSubtitle] = useState("Your central place to rate, review, and analyze tasks and services. Get started by creating an account or signing in.");

    // Theme & Colors
    const [selectedTheme, setSelectedTheme] = useState("abstract-tech");
    const [authBg, setAuthBg] = useState("random-cycle");
    const [userDashboardBg, setUserDashboardBg] = useState("default");
    const [adminDashboardBg, setAdminDashboardBg] = useState("default");
    const [primaryColor, setPrimaryColor] = useState("#673ab7");
    const [accentColor, setAccentColor] = useState("#009688");
    const [backgroundColor, setBackgroundColor] = useState("#f5f5f5");

    // Custom Buttons
    const [customButtons, setCustomButtons] = useState<CustomButton[]>([]);
    const [isButtonFormOpen, setIsButtonFormOpen] = useState(false);
    const [editingButton, setEditingButton] = useState<CustomButton | null>(null);

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
        const savedLogoDataUrl = localStorage.getItem('website_logo_data_url');
        if (savedLogoDataUrl) setLogoDataUrl(savedLogoDataUrl);
        const savedMainLogoDataUrl = localStorage.getItem('website_main_logo_data_url');
        if (savedMainLogoDataUrl) setMainLogoDataUrl(savedMainLogoDataUrl);
        const savedWebsiteTitle = localStorage.getItem('website_title');
        if (savedWebsiteTitle) setWebsiteTitle(savedWebsiteTitle);
        const savedWebsiteSubtitle = localStorage.getItem('website_subtitle');
        if (savedWebsiteSubtitle) setWebsiteSubtitle(savedWebsiteSubtitle);

        // Theme & Colors
        const savedTheme = localStorage.getItem('landing_theme');
        if (savedTheme) setSelectedTheme(savedTheme);
        const savedAuthBg = localStorage.getItem('auth_background');
        if(savedAuthBg) setAuthBg(savedAuthBg);
        const savedUserDashboardBg = localStorage.getItem('user_dashboard_background');
        if(savedUserDashboardBg) setUserDashboardBg(savedUserDashboardBg);
        const savedAdminDashboardBg = localStorage.getItem('admin_dashboard_background');
        if(savedAdminDashboardBg) setAdminDashboardBg(savedAdminDashboardBg);

        const savedPrimaryColor = localStorage.getItem('theme_primary_color');
        if (savedPrimaryColor) setPrimaryColor(savedPrimaryColor);
        const savedAccentColor = localStorage.getItem('theme_accent_color');
        if (savedAccentColor) setAccentColor(savedAccentColor);
        const savedBackgroundColor = localStorage.getItem('theme_background_color');
        if (savedBackgroundColor) setBackgroundColor(savedBackgroundColor);

        // Custom buttons
        const savedButtons = localStorage.getItem('website_custom_buttons');
        if (savedButtons) setCustomButtons(JSON.parse(savedButtons));
        
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
        if (logoDataUrl) {
          localStorage.setItem('website_logo_data_url', logoDataUrl);
        } else {
          localStorage.removeItem('website_logo_data_url');
        }
        if (mainLogoDataUrl) {
          localStorage.setItem('website_main_logo_data_url', mainLogoDataUrl);
        } else {
          localStorage.removeItem('website_main_logo_data_url');
        }
        localStorage.setItem('website_title', websiteTitle);
        localStorage.setItem('website_subtitle', websiteSubtitle);
        
        // Theme & Colors
        localStorage.setItem('landing_theme', selectedTheme);
        localStorage.setItem('auth_background', authBg);
        localStorage.setItem('user_dashboard_background', userDashboardBg);
        localStorage.setItem('admin_dashboard_background', adminDashboardBg);
        localStorage.setItem('theme_primary_color', primaryColor);
        localStorage.setItem('theme_accent_color', accentColor);
        localStorage.setItem('theme_background_color', backgroundColor);
        
        toast({
            title: "Settings Saved",
            description: "Website UI settings have been updated. Reloading to apply all changes.",
        });
        
        setTimeout(() => window.location.reload(), 1000);
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>, setLogo: (dataUrl: string | null) => void) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setLogo(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    };
    
    const persistButtons = (newButtons: CustomButton[]) => {
      setCustomButtons(newButtons);
      localStorage.setItem('website_custom_buttons', JSON.stringify(newButtons));
    }

    const handleSaveButton = (buttonData: Omit<CustomButton, 'id' | 'enabled'> & { enabled?: boolean }) => {
      let newButtons: CustomButton[];
      if (editingButton) {
        newButtons = customButtons.map(b => b.id === editingButton.id ? { ...editingButton, ...buttonData } : b)
        toast({ title: "Button Updated" });
      } else {
        newButtons = [...customButtons, { ...buttonData, id: `BTN-${Date.now()}`, enabled: true }];
        toast({ title: "Button Added" });
      }
      persistButtons(newButtons);
      closeButtonForm();
    };

    const handleEditButton = (button: CustomButton) => {
        setEditingButton(button);
        setIsButtonFormOpen(true);
    }
    
    const handleDeleteButton = (id: string) => {
        const newButtons = customButtons.filter(b => b.id !== id);
        persistButtons(newButtons);
        toast({ title: "Button Deleted", variant: 'destructive' });
    }

    const handleToggleButton = (id: string, enabled: boolean) => {
        const newButtons = customButtons.map(b => b.id === id ? { ...b, enabled } : b);
        persistButtons(newButtons);
        toast({ title: `Button ${enabled ? "Enabled" : "Disabled"}` });
    }

    const closeButtonForm = () => {
        setEditingButton(null);
        setIsButtonFormOpen(false);
    }
    
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
                <Label>Main Welcome Logo (Large)</Label>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 border rounded-md flex items-center justify-center bg-muted">
                    {mainLogoDataUrl ? (
                      <Image src={mainLogoDataUrl} alt="Main Logo preview" width={96} height={96} className="object-contain w-full h-full" unoptimized />
                    ) : (
                      <span className="text-xs text-muted-foreground">No Logo</span>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <Input id="main-logo-upload" type="file" accept="image/*" onChange={(e) => handleFileChange(e, setMainLogoDataUrl)} className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"/>
                    {mainLogoDataUrl && (
                      <Button variant="destructive" size="sm" onClick={() => setMainLogoDataUrl(null)}>
                        <X className="mr-2 h-4 w-4" /> Remove Logo
                      </Button>
                    )}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">The main hero logo for welcome/login screens. Max height: 128px.</p>
            </div>
            <div className="space-y-2">
                <Label>Header Logo (Small)</Label>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 border rounded-md flex items-center justify-center bg-muted">
                    {logoDataUrl ? (
                      <Image src={logoDataUrl} alt="Header Logo preview" width={96} height={96} className="object-contain w-full h-full" unoptimized />
                    ) : (
                      <span className="text-xs text-muted-foreground">No Logo</span>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <Input id="logo-upload" type="file" accept="image/*" onChange={(e) => handleFileChange(e, setLogoDataUrl)} className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"/>
                    {logoDataUrl && (
                      <Button variant="destructive" size="sm" onClick={() => setLogoDataUrl(null)}>
                        <X className="mr-2 h-4 w-4" /> Remove Logo
                      </Button>
                    )}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">The small logo that appears next to the website name. Leave blank to use the default icon.</p>
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
          <CardTitle>Start Screen Buttons</CardTitle>
          <CardDescription>
            Add, edit, or remove custom call-to-action buttons on the welcome screen.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {customButtons.map(button => (
            <div key={button.id} className="border p-3 rounded-lg flex justify-between items-center gap-4">
              <div className="flex-1 overflow-hidden">
                <p className="font-semibold truncate">{button.text}</p>
                <p className="text-xs text-muted-foreground truncate">{button.fileName || button.url}</p>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={button.enabled} onCheckedChange={(checked) => handleToggleButton(button.id, checked)} />
                <Button variant="ghost" size="icon" onClick={() => handleEditButton(button)}><Edit className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => handleDeleteButton(button.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </div>
          ))}
           <Dialog open={isButtonFormOpen} onOpenChange={setIsButtonFormOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" className="w-full mt-4" onClick={() => { setEditingButton(null); setIsButtonFormOpen(true); }}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add New Button
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingButton ? 'Edit Button' : 'Add New Button'}</DialogTitle>
                    </DialogHeader>
                    <ButtonForm button={editingButton} onSave={handleSaveButton} onClose={closeButtonForm} />
                </DialogContent>
            </Dialog>
        </CardContent>
      </Card>
      
       <Card>
        <CardHeader>
          <CardTitle>Theme &amp; Appearance</CardTitle>
          <CardDescription>
            Customize the global color scheme, background, and animations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label>Auth Screen Background</Label>
                    <Select value={authBg} onValueChange={setAuthBg}>
                        <SelectTrigger><SelectValue placeholder="Select a background..." /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="random-cycle">Random Cycle (Default)</SelectItem>
                            {gradients.map(g => (
                                <SelectItem key={g.name} value={g.className}>{g.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">Background for Welcome, Login, and Signup pages.</p>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label>User Dashboard Background</Label>
                        <Select value={userDashboardBg} onValueChange={setUserDashboardBg}>
                            <SelectTrigger><SelectValue placeholder="Select a background..." /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="default">Default (Plain)</SelectItem>
                                <SelectItem value="random-cycle">Random Cycle</SelectItem>
                                {gradients.map(g => (
                                    <SelectItem key={g.name} value={g.className}>{g.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                         <p className="text-xs text-muted-foreground">Background for the main user dashboard areas.</p>
                    </div>
                     <div className="space-y-2">
                        <Label>Admin Dashboard Background</Label>
                         <Select value={adminDashboardBg} onValueChange={setAdminDashboardBg}>
                            <SelectTrigger><SelectValue placeholder="Select a background..." /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="default">Default (Plain)</SelectItem>
                                <SelectItem value="random-cycle">Random Cycle</SelectItem>
                                {gradients.map(g => (
                                    <SelectItem key={g.name} value={g.className}>{g.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                         <p className="text-xs text-muted-foreground">Background for the main admin dashboard areas.</p>
                    </div>
                </div>
            </div>
            <Separator />
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
               <div className="flex items-center space-x-2">
                <RadioGroupItem value="floating-crystals" id="floating-crystals" />
                <Label htmlFor="floating-crystals" className="font-normal">Floating Crystals</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cosmic-nebula" id="cosmic-nebula" />
                <Label htmlFor="cosmic-nebula" className="font-normal">Cosmic Nebula</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="abstract-particles" id="abstract-particles" />
                <Label htmlFor="abstract-particles" className="font-normal">Abstract Particles</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="synthwave-sunset" id="synthwave-sunset" />
                <Label htmlFor="synthwave-sunset" className="font-normal">Synthwave Sunset</Label>
              </div>
            </RadioGroup>
          </div>
           <Separator />
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
