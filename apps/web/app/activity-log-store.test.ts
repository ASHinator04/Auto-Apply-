import { beforeEach, describe, expect, it } from "vitest";

import { clearActivityEntries, getActivityEntries, recordActivity } from "./activity-log-store";

describe("activity log store", () => {
  beforeEach(() => {
    clearActivityEntries();
  });

  it("starts empty so server and client snapshots are stable", () => {
    expect(getActivityEntries()).toEqual([]);
  });

  it("records ordered activity entries", () => {
    recordActivity({
      area: "knowledge",
      level: "info",
      message: "Created question.",
    });
    recordActivity({
      area: "api",
      level: "success",
      message: "Stored entry.",
    });

    const entries = getActivityEntries();

    expect(entries).toHaveLength(2);
    expect(entries[0]?.message).toBe("Created question.");
    expect(entries[1]?.area).toBe("api");
  });

  it("clears activity entries", () => {
    recordActivity({
      area: "resume",
      level: "error",
      message: "Upload failed.",
    });

    clearActivityEntries();

    expect(getActivityEntries()).toEqual([]);
  });
});
