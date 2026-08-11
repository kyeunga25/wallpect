import type { ImageTransform } from "../types/editor";
import { DEFAULT_TRANSFORM } from "../types/editor";

export const TRANSFORM_HISTORY_LIMIT = 50;

export type TransformUpdate = ImageTransform | ((current: ImageTransform) => ImageTransform);

export type TransformTimeline = {
  present: ImageTransform;
  past: ImageTransform[];
  future: ImageTransform[];
};

export type TransformHistoryState = Record<string, TransformTimeline>;

export type TransformHistoryAction =
  | { type: "reset" }
  | { type: "set"; key: string; update: TransformUpdate; record: boolean }
  | { type: "commit"; key: string; before: ImageTransform }
  | { type: "undo"; key: string }
  | { type: "redo"; key: string };

const EMPTY_TIMELINE: TransformTimeline = {
  present: DEFAULT_TRANSFORM,
  past: [],
  future: [],
};

export function transformsAreEqual(left: ImageTransform, right: ImageTransform) {
  return (
    left.scale === right.scale &&
    left.translateX === right.translateX &&
    left.translateY === right.translateY &&
    left.rotationDeg === right.rotationDeg &&
    left.fitMode === right.fitMode
  );
}

export function getTransformTimeline(state: TransformHistoryState, key: string) {
  return state[key] ?? EMPTY_TIMELINE;
}

function appendPast(past: ImageTransform[], transform: ImageTransform) {
  return [...past, transform].slice(-TRANSFORM_HISTORY_LIMIT);
}

export function transformHistoryReducer(
  state: TransformHistoryState,
  action: TransformHistoryAction,
): TransformHistoryState {
  if (action.type === "reset") return Object.keys(state).length ? {} : state;
  const timeline = getTransformTimeline(state, action.key);

  if (action.type === "set") {
    const next =
      typeof action.update === "function" ? action.update(timeline.present) : action.update;
    if (transformsAreEqual(timeline.present, next)) return state;
    return {
      ...state,
      [action.key]: action.record
        ? {
            present: next,
            past: appendPast(timeline.past, timeline.present),
            future: [],
          }
        : { ...timeline, present: next },
    };
  }

  if (action.type === "commit") {
    if (transformsAreEqual(action.before, timeline.present)) return state;
    return {
      ...state,
      [action.key]: {
        present: timeline.present,
        past: appendPast(timeline.past, action.before),
        future: [],
      },
    };
  }

  if (action.type === "undo") {
    const previous = timeline.past.at(-1);
    if (!previous) return state;
    return {
      ...state,
      [action.key]: {
        present: previous,
        past: timeline.past.slice(0, -1),
        future: [...timeline.future, timeline.present],
      },
    };
  }

  const next = timeline.future.at(-1);
  if (!next) return state;
  return {
    ...state,
    [action.key]: {
      present: next,
      past: appendPast(timeline.past, timeline.present),
      future: timeline.future.slice(0, -1),
    },
  };
}
