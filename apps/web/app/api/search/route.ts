import { NextResponse } from "next/server";

import { executeSearchExperience, SearchExperienceValidationError } from "../../search-execution";
import type { SearchApiPayload } from "../../search-types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as SearchApiPayload;
    const response = await executeSearchExperience(payload);
    return NextResponse.json(response);
  } catch (caught) {
    if (caught instanceof SearchExperienceValidationError) {
      return NextResponse.json({ detail: caught.message }, { status: 400 });
    }

    return NextResponse.json({ detail: "Search execution failed." }, { status: 500 });
  }
}
