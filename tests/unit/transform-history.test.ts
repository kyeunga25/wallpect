import { describe, expect, it } from "vitest";
import {
  getTransformTimeline,
  TRANSFORM_HISTORY_LIMIT,
  transformHistoryReducer,
  type TransformHistoryState,
} from "../../src/state/transform-history";
import { DEFAULT_TRANSFORM } from "../../src/types/editor";

const portraitKey = "iphone:portrait";
const landscapeKey = "iphone:landscape";

function setScale(state: TransformHistoryState, key: string, scale: number, record = true) {
  return transformHistoryReducer(state, {
    type: "set",
    key,
    record,
    update: (current) => ({ ...current, scale }),
  });
}

describe("transform history", () => {
  it("undoes and redoes a recorded composition change", () => {
    let state = setScale({}, portraitKey, 1.4);

    expect(getTransformTimeline(state, portraitKey).present.scale).toBe(1.4);
    state = transformHistoryReducer(state, { type: "undo", key: portraitKey });
    expect(getTransformTimeline(state, portraitKey).present).toEqual(DEFAULT_TRANSFORM);
    state = transformHistoryReducer(state, { type: "redo", key: portraitKey });
    expect(getTransformTimeline(state, portraitKey).present.scale).toBe(1.4);
  });

  it("groups continuous previews into one meaningful history step", () => {
    let state = setScale({}, portraitKey, 1.15, false);
    state = setScale(state, portraitKey, 1.4, false);
    expect(getTransformTimeline(state, portraitKey).past).toHaveLength(0);

    state = transformHistoryReducer(state, {
      type: "commit",
      key: portraitKey,
      before: DEFAULT_TRANSFORM,
    });
    expect(getTransformTimeline(state, portraitKey).past).toHaveLength(1);

    state = transformHistoryReducer(state, { type: "undo", key: portraitKey });
    expect(getTransformTimeline(state, portraitKey).present.scale).toBe(1);
  });

  it("keeps device-orientation timelines independent and clears stale redo", () => {
    let state = setScale({}, portraitKey, 1.2);
    state = setScale(state, landscapeKey, 1.6);
    state = transformHistoryReducer(state, { type: "undo", key: portraitKey });

    expect(getTransformTimeline(state, portraitKey).present.scale).toBe(1);
    expect(getTransformTimeline(state, landscapeKey).present.scale).toBe(1.6);
    expect(getTransformTimeline(state, portraitKey).future).toHaveLength(1);

    state = setScale(state, portraitKey, 1.3);
    expect(getTransformTimeline(state, portraitKey).future).toHaveLength(0);
  });

  it("bounds each timeline so long editing sessions stay lightweight", () => {
    let state: TransformHistoryState = {};
    for (let index = 1; index <= TRANSFORM_HISTORY_LIMIT + 5; index += 1) {
      state = setScale(state, portraitKey, 1 + index / 100);
    }
    expect(getTransformTimeline(state, portraitKey).past).toHaveLength(TRANSFORM_HISTORY_LIMIT);
  });

  it("clears every device and orientation timeline for a new image", () => {
    let state = setScale({}, portraitKey, 1.2);
    state = setScale(state, landscapeKey, 1.6);

    state = transformHistoryReducer(state, { type: "reset" });

    expect(state).toEqual({});
    expect(getTransformTimeline(state, portraitKey).present).toEqual(DEFAULT_TRANSFORM);
    expect(getTransformTimeline(state, landscapeKey).past).toHaveLength(0);
  });
});
