
'use server';

interface FetchResult {
  success: boolean;
  data?: string; // Base64 encoded PDF data
  error?: string;
  contentType?: string;
}

export async function fetchPdfAsBase64(pdfUrl: string): Promise<FetchResult> {
  if (!pdfUrl) {
    return { success: false, error: 'La URL del PDF es requerida.' };
  }

  try {
    const response = await fetch(pdfUrl, {
        method: 'GET',
        // SharePoint URLs with tokens often work directly from a server without extra headers
    });

    if (!response.ok) {
      // Intenta leer el cuerpo del error si lo hay, para más detalles
      let errorBody = '';
      try {
        errorBody = await response.text();
      } catch (e) {}
      
      throw new Error(`Fallo al obtener el PDF: ${response.status} ${response.statusText}. ${errorBody}`);
    }

    const contentType = response.headers.get('content-type') || 'application/pdf';
    const buffer = await response.arrayBuffer();
    const base64Data = Buffer.from(buffer).toString('base64');
    
    return { success: true, data: base64Data, contentType };

  } catch (error: any) {
    console.error('Error fetching PDF via proxy:', error);
    return { success: false, error: error.message || 'Ocurrió un error desconocido al obtener el PDF.' };
  }
}
