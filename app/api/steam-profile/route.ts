import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const steamId = searchParams.get("steamId");

  if (!steamId) {
    return NextResponse.json({ error: "Missing steamId" }, { status: 400 });
  }

  const apiKey = "D932390F976E8EABFB6A8EF0AF866467";
  const steamProfileUrl = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${apiKey}&steamids=${steamId}`;

  try {
    const res = await fetch(steamProfileUrl);
    const data = await res.json();

    if (data.response.players.length === 0) {
      return NextResponse.json({ error: "Profile data not found" }, { status: 404 });
    }

    const profile = data.response.players[0];
    return NextResponse.json(profile);
  } catch (error) {
    return NextResponse.json({ error: "Error fetching profile" }, { status: 500 });
  }
}
