// app/api/check-ip/route.ts
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const ip = searchParams.get('ip');

  const res = await fetch(`https://bet.smsbet.top/check_ip.php?ip=${ip}`);

  const data = await res.json();

  return Response.json(data);
}
