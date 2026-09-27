import { NextResponse } from "next/server";

const JSON_CONTENT_TYPE = "application/json";

export function forbidden(message = "Tidak diizinkan.") {
  return NextResponse.json({ error: message }, { status: 403 });
}

export function enforceSameOrigin(request: Request): NextResponse | null {
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite && fetchSite !== "same-origin" && fetchSite !== "same-site") {
    return forbidden("Permintaan lintas situs ditolak.");
  }

  const origin = request.headers.get("origin");
  if (!origin) return forbidden("Origin permintaan tidak valid.");

  let requestOrigin: string;
  try {
    requestOrigin = new URL(request.url).origin;
  } catch {
    return forbidden("Origin permintaan tidak valid.");
  }

  if (origin !== requestOrigin) return forbidden("Permintaan lintas situs ditolak.");
  return null;
}

export async function readJsonBody<T>(
  request: Request,
  maxBytes: number
): Promise<{ data: T } | { response: NextResponse }> {
  const contentType = request.headers.get("content-type")?.split(";", 1)[0].trim();
  if (contentType !== JSON_CONTENT_TYPE) {
    return {
      response: NextResponse.json(
        { error: "Content-Type wajib application/json." },
        { status: 415 }
      ),
    };
  }

  const declaredLength = request.headers.get("content-length");
  if (declaredLength) {
    const bytes = Number(declaredLength);
    if (!Number.isSafeInteger(bytes) || bytes < 0) {
      return {
        response: NextResponse.json(
          { error: "Content-Length tidak valid." },
          { status: 400 }
        ),
      };
    }
    if (bytes > maxBytes) {
      return {
        response: NextResponse.json(
          { error: "Payload terlalu besar." },
          { status: 413 }
        ),
      };
    }
  }

  let raw: string;
  try {
    raw = await request.text();
  } catch {
    return {
      response: NextResponse.json(
        { error: "Gagal membaca payload." },
        { status: 400 }
      ),
    };
  }

  if (new TextEncoder().encode(raw).byteLength > maxBytes) {
    return {
      response: NextResponse.json(
        { error: "Payload terlalu besar." },
        { status: 413 }
      ),
    };
  }

  try {
    return { data: JSON.parse(raw) as T };
  } catch {
    return {
      response: NextResponse.json(
        { error: "Payload JSON tidak valid." },
        { status: 400 }
      ),
    };
  }
}

export function serverError(message: string) {
  return NextResponse.json({ error: message }, { status: 500 });
}
