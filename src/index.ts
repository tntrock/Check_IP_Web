import { renderPage } from "./page";

export interface IpInfo {
  ip: string;
  version: "IPv4" | "IPv6" | "unknown";
  country?: string;
  region?: string;
  city?: string;
  postalCode?: string;
  timezone?: string;
  latitude?: string;
  longitude?: string;
  asn?: number;
  asOrganization?: string;
  colo?: string;
  httpProtocol?: string;
  tlsVersion?: string;
  userAgent?: string;
}

function getClientIp(request: Request): string {
  // Cloudflare 會在 CF-Connecting-IP 放入真正的連線來源 IP；本機 wrangler dev 時也會設定
  return (
    request.headers.get("CF-Connecting-IP") ??
    request.headers.get("X-Forwarded-For")?.split(",")[0].trim() ??
    "unknown"
  );
}

function ipVersion(ip: string): IpInfo["version"] {
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(ip)) return "IPv4";
  if (ip.includes(":")) return "IPv6";
  return "unknown";
}

function collectInfo(request: Request): IpInfo {
  const ip = getClientIp(request);
  const cf = request.cf;
  return {
    ip,
    version: ipVersion(ip),
    country: cf?.country as string | undefined,
    region: cf?.region as string | undefined,
    city: cf?.city as string | undefined,
    postalCode: cf?.postalCode as string | undefined,
    timezone: cf?.timezone as string | undefined,
    latitude: cf?.latitude as string | undefined,
    longitude: cf?.longitude as string | undefined,
    asn: cf?.asn as number | undefined,
    asOrganization: cf?.asOrganization as string | undefined,
    colo: cf?.colo as string | undefined,
    httpProtocol: cf?.httpProtocol as string | undefined,
    tlsVersion: cf?.tlsVersion as string | undefined,
    userAgent: request.headers.get("User-Agent") ?? undefined,
  };
}

// curl、wget 等命令列工具不會要求 text/html，直接回傳純文字 IP
function wantsHtml(request: Request): boolean {
  return (request.headers.get("Accept") ?? "").includes("text/html");
}

const noStore = { "Cache-Control": "no-store" };

function text(body: string): Response {
  return new Response(body + "\n", {
    headers: { ...noStore, "Content-Type": "text/plain; charset=utf-8" },
  });
}

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method Not Allowed\n", {
        status: 405,
        headers: { Allow: "GET, HEAD" },
      });
    }

    const info = collectInfo(request);
    console.log(
      JSON.stringify({ event: "visit", path: url.pathname, ip: info.ip, userAgent: info.userAgent }),
    );

    switch (url.pathname) {
      case "/":
        if (!wantsHtml(request)) return text(info.ip);
        return new Response(renderPage(info), {
          headers: {
            ...noStore,
            "Content-Type": "text/html; charset=utf-8",
            "Content-Security-Policy":
              "default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'",
            "X-Content-Type-Options": "nosniff",
          },
        });
      case "/ip":
        return text(info.ip);
      case "/json":
        return new Response(JSON.stringify(info, null, 2) + "\n", {
          headers: {
            ...noStore,
            "Content-Type": "application/json; charset=utf-8",
            "Access-Control-Allow-Origin": "*",
          },
        });
      default:
        return new Response("Not Found\n", { status: 404, headers: noStore });
    }
  },
} satisfies ExportedHandler;
