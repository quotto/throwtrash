import type { ExcludeDate, TrashData } from "trash-common";

export type TrashSchedulePayload = {
    trashData: TrashData[],
    globalExcludes?: ExcludeDate[]
};
