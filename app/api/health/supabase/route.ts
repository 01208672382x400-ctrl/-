import { NextResponse } from "next/server";
import { createServerClient } from "../../../lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from("app_settings")
      .select("key")
      .limit(1);

    if (error) {
      return NextResponse.json(
        { ok: false, service: "supabase", error: error.message },
        { status: 503 }
      );
    }

    return NextResponse.json({
      ok: true,
      service: "supabase",
      database: "connected",
      sample_rows: data?.length ?? 0,
      checked_at: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { ok: false, service: "supabase", error: "Supabase connection failed" },
      { status: 503 }
    );
  }
}
