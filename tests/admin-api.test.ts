import { describe, expect, it } from "vitest";
import { enforceSameOrigin, forbidden, readJsonBody, serverError } from "@/lib/admin-api";

const APP_URL = "https://www.gosposisi.web.id/api/admin/upload";
const APP_ORIGIN = "https://www.gosposisi.web.id";

function request(headers: Record<string, string>, body?: string, url = APP_URL): Request {
  return new Request(url, { method: "POST", headers, body });
}

async function errorOf(response: Response | null) {
  expect(response).not.toBeNull();
  return (await response!.json()) as { error: string };
}

describe("forbidden / serverError", () => {
  it("forbidden returns 403 with a default message", async () => {
    const response = forbidden();
    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: "Tidak diizinkan." });
  });

  it("forbidden accepts a custom message", async () => {
    expect(await forbidden("x").json()).toEqual({ error: "x" });
  });

  it("serverError returns 500", async () => {
    const response = serverError("rusak");
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "rusak" });
  });
});

describe("enforceSameOrigin", () => {
  it("allows a request whose Origin matches the request URL origin", () => {
    expect(enforceSameOrigin(request({ origin: APP_ORIGIN }))).toBeNull();
  });

  it("allows Sec-Fetch-Site same-origin and same-site with a matching Origin", () => {
    expect(enforceSameOrigin(request({ origin: APP_ORIGIN, "sec-fetch-site": "same-origin" }))).toBeNull();
    expect(enforceSameOrigin(request({ origin: APP_ORIGIN, "sec-fetch-site": "same-site" }))).toBeNull();
  });

  it("rejects cross-site and user-initiated (none) fetches even with a matching Origin", async () => {
    for (const site of ["cross-site", "none"]) {
      const response = enforceSameOrigin(request({ origin: APP_ORIGIN, "sec-fetch-site": site }));
      expect(response?.status).toBe(403);
      expect(await errorOf(response)).toEqual({ error: "Permintaan lintas situs ditolak." });
    }
  });

  it("rejects a request without an Origin header", async () => {
    const response = enforceSameOrigin(request({ "sec-fetch-site": "same-origin" }));
    expect(response?.status).toBe(403);
    expect(await errorOf(response)).toEqual({ error: "Origin permintaan tidak valid." });
  });

  it("rejects an Origin that differs in host, scheme, port or subdomain", async () => {
    for (const origin of [
      "https://evil.example",
      "http://www.gosposisi.web.id",
      "https://www.gosposisi.web.id:8443",
      "https://admin.gosposisi.web.id",
      "https://www.gosposisi.web.id.evil.example",
      "null",
    ]) {
      const response = enforceSameOrigin(request({ origin }));
      expect(response?.status, origin).toBe(403);
      expect(await errorOf(response)).toEqual({ error: "Permintaan lintas situs ditolak." });
    }
  });

  it("rejects same-site requests from a sibling subdomain (Origin must match exactly)", () => {
    const response = enforceSameOrigin(
      request({ origin: "https://admin.gosposisi.web.id", "sec-fetch-site": "same-site" })
    );
    expect(response?.status).toBe(403);
  });

  it("compares against the request URL, including non-default ports", () => {
    const url = "http://localhost:3000/api/admin/preview";
    expect(enforceSameOrigin(request({ origin: "http://localhost:3000" }, undefined, url))).toBeNull();
    expect(enforceSameOrigin(request({ origin: "http://localhost:3001" }, undefined, url))?.status).toBe(403);
  });

  it("rejects when the request URL cannot be parsed", async () => {
    const fake = { url: "not a url", headers: new Headers({ origin: APP_ORIGIN }) } as Request;
    const response = enforceSameOrigin(fake);
    expect(response?.status).toBe(403);
    expect(await errorOf(response)).toEqual({ error: "Origin permintaan tidak valid." });
  });
});

describe("readJsonBody", () => {
  const JSON_HEADERS = { "content-type": "application/json" };

  async function expectError(
    result: Awaited<ReturnType<typeof readJsonBody>>,
    status: number,
    error: string
  ) {
    expect("response" in result).toBe(true);
    if (!("response" in result)) return;
    expect(result.response.status).toBe(status);
    expect(await result.response.json()).toEqual({ error });
  }

  it("parses a valid JSON body", async () => {
    const result = await readJsonBody<{ content: string }>(
      request(JSON_HEADERS, JSON.stringify({ content: "halo" })),
      1000
    );
    expect(result).toEqual({ data: { content: "halo" } });
  });

  it("accepts a charset parameter on the Content-Type", async () => {
    const result = await readJsonBody(
      request({ "content-type": "application/json; charset=utf-8" }, "{}"),
      1000
    );
    expect(result).toEqual({ data: {} });
  });

  it("returns 415 for a missing or non-JSON Content-Type", async () => {
    await expectError(
      await readJsonBody(request({ "content-type": "text/plain" }, "{}"), 1000),
      415,
      "Content-Type wajib application/json."
    );
    await expectError(
      await readJsonBody(request({ "content-type": "multipart/form-data" }, "{}"), 1000),
      415,
      "Content-Type wajib application/json."
    );
    const noType = { url: APP_URL, headers: new Headers(), text: async () => "{}" } as unknown as Request;
    await expectError(await readJsonBody(noType, 1000), 415, "Content-Type wajib application/json.");
  });

  it("returns 400 for an invalid Content-Length", async () => {
    for (const length of ["abc", "-1", "1.5"]) {
      await expectError(
        await readJsonBody(request({ ...JSON_HEADERS, "content-length": length }, "{}"), 1000),
        400,
        "Content-Length tidak valid."
      );
    }
  });

  it("returns 413 when the declared Content-Length exceeds the limit", async () => {
    await expectError(
      await readJsonBody(request({ ...JSON_HEADERS, "content-length": "1001" }, "{}"), 1000),
      413,
      "Payload terlalu besar."
    );
  });

  it("returns 413 when the actual body exceeds the limit, counted in UTF-8 bytes", async () => {
    // 6 characters, but "é" is 2 bytes in UTF-8: '"éééé"' is 10 bytes.
    const body = JSON.stringify("éééé");
    expect(body.length).toBe(6);
    await expectError(await readJsonBody(request(JSON_HEADERS, body), 9), 413, "Payload terlalu besar.");
    expect(await readJsonBody(request(JSON_HEADERS, body), 10)).toEqual({ data: "éééé" });
  });

  it("checks the real body size even when Content-Length under-declares it", async () => {
    const body = JSON.stringify({ content: "x".repeat(100) });
    await expectError(
      await readJsonBody(request({ ...JSON_HEADERS, "content-length": "2" }, body), 50),
      413,
      "Payload terlalu besar."
    );
  });

  it("returns 400 for malformed JSON", async () => {
    await expectError(
      await readJsonBody(request(JSON_HEADERS, "{not json"), 1000),
      400,
      "Payload JSON tidak valid."
    );
  });

  it("returns 400 when the body cannot be read", async () => {
    const broken = {
      url: APP_URL,
      headers: new Headers(JSON_HEADERS),
      text: async () => {
        throw new Error("stream error");
      },
    } as unknown as Request;
    await expectError(await readJsonBody(broken, 1000), 400, "Gagal membaca payload.");
  });
});
