declare namespace Deno {
  export interface Env {
    get(key: string): string | undefined;
    set(key: string, value: string): void;
    delete?(key: string): void;
    has?(key: string): boolean;
    toObject?(): Record<string, string>;
  }

  export const env: Env;
}

declare module "https://deno.land/std@0.224.0/http/server.ts" {
  export type Handler = (req: Request) => Response | Promise<Response>;
  export interface ServeOptions {
    port?: number;
    hostname?: string;
    signal?: AbortSignal;
    onError?: (error: unknown) => Response | Promise<Response>;
    onListen?: (params: { hostname: string; port: number }) => void;
  }
  export function serve(handler: Handler, options?: ServeOptions): void;
}

declare module "https://deno.land/std@0.224.0/encoding/base64.ts" {
  export function encodeBase64(data: ArrayBuffer | Uint8Array | string): string;
  export function decodeBase64(b64: string): Uint8Array;
}

declare module "https://esm.sh/@supabase/supabase-js@2.42.0" {
  export * from "@supabase/supabase-js";
}

declare module "https://*" {
  const content: any;
  export default content;
  export const serve: any;
  export const encodeBase64: any;
  export const decodeBase64: any;
  export const createClient: any;
}
