"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ErrorDisplayProps {
  error: string;
  onRetry?: () => void;
}

export function ErrorDisplay({ error, onRetry }: ErrorDisplayProps) {
  const isConnectionError = error.toLowerCase().includes('database') || 
                           error.toLowerCase().includes('connection') || 
                           error.toLowerCase().includes('mongodb');

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-6 w-6 text-destructive" />
        </div>
        <CardTitle className="text-lg">
          {isConnectionError ? 'Error de Conexión' : 'Error al Cargar Datos'}
        </CardTitle>
        <CardDescription>
          {isConnectionError 
            ? 'No se pudo conectar a la base de datos. Verifica tu conexión a internet e intenta nuevamente.'
            : 'Ocurrió un error al cargar los datos. Por favor, intenta nuevamente.'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-md bg-muted p-3">
          <p className="text-sm text-muted-foreground">
            Detalles del error:
          </p>
          <p className="text-sm font-mono text-destructive">
            {error}
          </p>
        </div>
        {onRetry && (
          <Button onClick={onRetry} className="w-full" variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Reintentar
          </Button>
        )}
      </CardContent>
    </Card>
  );
}