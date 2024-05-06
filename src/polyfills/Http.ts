// polyfill_http.ts

// Reemplaza el módulo http de Node.js con un polyfill que utiliza fetch en React Native.

// Define una interfaz para las opciones de solicitud HTTP.
interface HttpRequestOptions {
    method: string;
    hostname: string;
    port: number;
    path: string;
    headers?: { [key: string]: string };
    body?: string | FormData;
}

// Define una función para realizar solicitudes HTTP.
export function httpRequest(options: HttpRequestOptions): Promise<string> {
    // Extrae la información necesaria de las opciones.
    const { method, hostname, port, path, headers, body } = options;

    // Construye la URL para la solicitud fetch.
    const url = `http://${hostname}:${port}${path}`;

    // Configura las opciones para la solicitud fetch.
    const fetchOptions: RequestInit = {
        method: method,
        headers: headers,
        body: body,
    };

    // Realiza la solicitud fetch y devuelve la promesa resultante.
    return fetch(url, fetchOptions).then((response) => {
        // Verifica si la solicitud fue exitosa.
        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.status} ${response.statusText}`);
        }
        // Convierte la respuesta a texto.
        return response.text();
    });
}
