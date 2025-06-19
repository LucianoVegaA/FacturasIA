import { AzureLoginButton } from '@/components/auth/AzureLoginButton';
import Image from 'next/image';

const HyperNovaLabsIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="48" rx="12" fill="hsl(var(--primary))"/>
    <circle cx="24" cy="24" r="14" fill="hsl(var(--accent))" fillOpacity="0.8"/>
    <circle cx="24" cy="24" r="8" fill="hsl(var(--primary))" />
  </svg>
);

export default function LoginPage() {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Left Column */}
      <div className="hidden md:flex w-1/3 bg-card p-10 flex-col justify-center items-start space-y-8">
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <HyperNovaLabsIcon />
            <span className="text-3xl font-bold text-primary">Hyper Nova Labs</span>
          </div>
          <h2 className="text-2xl font-semibold text-foreground ml-2">HNL Planner</h2>
        </div>
        <div className="mt-auto text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Hyper Nova Labs. All rights reserved.
        </div>
      </div>

      {/* Right Column */}
      <div className="w-full md:w-2/3 relative flex items-center justify-center p-4">
        <Image
          src="https://placehold.co/1200x800.png"
          alt="Office background"
          layout="fill"
          objectFit="cover"
          className="absolute inset-0 z-0"
          data-ai-hint="office collaboration"
          priority
        />
        {/* Sign-in Card */}
        <div className="relative z-10 bg-card p-8 md:p-10 rounded-xl shadow-2xl w-full max-w-md space-y-6">
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Sign In
            </h1>
            <p className="text-muted-foreground">
              Usa tu cuenta de Microsoft para continuar.
            </p>
          </div>
          
          <AzureLoginButton />

          <p className="text-center text-xs text-muted-foreground pt-4">
            Secured by Microsoft Azure
          </p>
        </div>
      </div>
    </div>
  );
}