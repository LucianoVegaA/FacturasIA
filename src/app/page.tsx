import { LoginForm } from '@/components/auth/LoginForm';
import { AppLogo } from '@/components/common/AppLogo';
import Image from 'next/image';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center">
            {/* Using a simple text logo, as AppLogo is designed for sidebar with specific colors */}
            <div className="flex items-center gap-2 text-primary mb-6">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-8 w-8 text-primary"
                >
                    <path d="M12 2l2.35 7.16h7.65l-6.18 4.48 2.35 7.16L12 16.32l-6.17 4.48 2.35-7.16L2 9.16h7.65L12 2z"/>
                </svg>
                <h1 className="text-3xl font-bold text-primary">
                    Hypernova
                </h1>
            </div>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Sign in to access your dashboard
          </p>
        </div>
        <LoginForm />
        <p className="mt-10 text-center text-xs text-muted-foreground">
          AWS Cognito integration for login to be implemented.
        </p>
         <div className="relative h-64 w-full mt-8 rounded-lg overflow-hidden shadow-xl">
            <Image 
                src="https://placehold.co/600x400.png" 
                alt="Financial data illustration"
                layout="fill"
                objectFit="cover"
                data-ai-hint="finance data"
            />
        </div>
      </div>
    </div>
  );
}
