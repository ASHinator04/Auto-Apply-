import { renderToStaticMarkup } from "react-dom/server";
import React from "react";
import { describe, expect, it } from "vitest";

import { EmptyKnowledgeState } from "./knowledge-empty-state";

describe("EmptyKnowledgeState", () => {
  it("renders the knowledge-base prompt", () => {
    const html = renderToStaticMarkup(<EmptyKnowledgeState />);

    expect(html).toContain("Add your first profile detail");
    expect(html).toContain("reusable long-form answers");
  });
});
