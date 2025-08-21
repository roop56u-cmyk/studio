import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { WelcomeAnimation } from '@/components/landing/welcome-animation';
import { Logo } from '@/components/logo';

export default function Home() {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-background">
      <WelcomeAnimation />
      <div className="absolute inset-0 bg-background/50 backdrop-blur-sm" />
      <div className="relative z-10 flex flex-col items-center justify-center text-center">
        <Logo className="mb-8 text-5xl md:text-7xl" />
        <h1 className="text-4xl font-bold tracking-tighter text-foreground sm:text-5xl md:text-6xl">
          Welcome to TaskReview Hub
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground md:text-xl">
          Your central place to rate, review, and analyze tasks and services.
          Get started by creating an account or signing in.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Link href="/signup">Get Started</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
