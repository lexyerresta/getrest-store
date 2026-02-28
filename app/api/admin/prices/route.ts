import { NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import { join } from "path";

export async function GET() {
    try {
        const pricesPath = join(process.cwd(), "public", "prices.json");
        const data = await readFile(pricesPath, "utf-8");
        return NextResponse.json(JSON.parse(data));
    } catch (error) {
        return NextResponse.json({ error: "Failed to read prices" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const newItems = await req.json();

        if (!Array.isArray(newItems)) {
            return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
        }

        const pricesPath = join(process.cwd(), "public", "prices.json");

        // Formatting with 2 spaces to match existing file format
        await writeFile(pricesPath, JSON.stringify(newItems, null, 2));

        return NextResponse.json({ success: true, count: newItems.length });
    } catch (error) {
        return NextResponse.json({ error: "Failed to write prices" }, { status: 500 });
    }
}
