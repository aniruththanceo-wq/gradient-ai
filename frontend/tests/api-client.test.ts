import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, apiFetch } from "@/lib/api";

describe("apiFetch", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("turns backend network failures into a useful Gradient AI message", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.reject(new TypeError("Failed to fetch"))));

    await expect(apiFetch("/auth/me")).rejects.toMatchObject({
      name: "ApiError",
      status: 0,
      kind: "network",
      message: expect.stringContaining("Unable to connect to Gradient AI backend"),
    });
  });

  it("preserves HTTP status and backend validation detail", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve(
          new Response(JSON.stringify({ detail: "Placement Intelligence is available only for Year 3 and Year 4 students." }), {
            status: 403,
            headers: { "content-type": "application/json" },
          }),
        ),
      ),
    );

    await expect(apiFetch("/placement/profile")).rejects.toMatchObject({
      status: 403,
      kind: "http",
      message: "Placement Intelligence is available only for Year 3 and Year 4 students.",
    });
  });
});
