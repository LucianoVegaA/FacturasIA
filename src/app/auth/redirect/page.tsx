"use client";

import { Loader2 } from "lucide-react";

const AuthRedirect = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <p className="text-lg text-muted-foreground">Processing authentication...</p>
    </div>
  );
};

export default AuthRedirect;