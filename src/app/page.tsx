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
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <line x1="10" y1="9" x2="8" y2="9" />
                </svg>
                <h1 className="text-3xl font-bold text-primary">
                    Invoice Insight
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
