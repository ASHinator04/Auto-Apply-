import { renderToStaticMarkup } from "react-dom/server";
import React from "react";
import { describe, expect, it } from "vitest";

import { EmptyResumeState } from "./resume-empty-state";

describe("EmptyResumeState", () => {
  it("renders the first-upload prompt", () => {
    const html = renderToStaticMarkup(<EmptyResumeState />);

    expect(html).toContain("Upload your first resume");
    expect(html).toContain("Add a PDF resume");
  });
});
