/* eslint-disable @typescript-eslint/no-unused-vars */
import { jest } from "@jest/globals";
import { TrashData, TrashSchedule } from "../types.mjs";
import { TrashScheduleService } from "../client/trash-schedule-service.mjs";

import { DBAdapter } from "../client/db-adapter.mjs";
import { TextCreator } from "../client/text-creator.mjs";

const dbAdapter: DBAdapter = {
  getUserIDByAccessToken: jest.fn(async (access_token: string) => {
    return "dummy_token"
  }),
  getTrashSchedule: jest.fn(async (user_id: string) => {
    return {
      trashData: [
        {
          type: "brun",
          schedules: [
            {
              type: "evweek",
              value: {
                start: "2024-12-29",
                weekday: "3",
                interval: 2
              }
            }
          ]
        }
      ],
      checkedNextday: false,
    } as TrashSchedule
  })
}

jest.mock("../client/text-creator.mts");
const textCreator = new TextCreator("ja-JP");
textCreator.getTrashName = jest.fn((type: string) => {
  return "もえるゴミ"
});


describe("getEnableTrashData", () => {
  describe("IntervalWeeklySchedule", () => {
    it("return_trashTypeValue_when_start_is_sunday_and_weekda_is_match", () => {
      const trash: TrashData = {
        type: "brun",
        schedules: [
          {
            type: "evweek",
            value: {
              start: "2024-12-29",
              weekday: "3",
              interval: 2
            }
          }
        ],
      };
      const today = new Date("2025-1-15");
      const trashService = new TrashScheduleService("Asia/Tokyo", textCreator, dbAdapter)

      const result = trashService.getEnableTrashData(trash, today);
      expect(result?.type).toBe("brun");
      expect(result?.name).toBe("もえるゴミ");
    });
    it("return_trashTypeValue_when_start_is_wedenesday_and_weekda_is_match", () => {
      const trash: TrashData = {
        type: "brun",
        schedules: [
          {
            type: "evweek",
            value: {
              start: "2025-1-1",
              weekday: "3",
              interval: 2
            }
          }
        ],
      };
      const today = new Date("2025-1-15");
      const trashService = new TrashScheduleService("Asia/Tokyo", textCreator, dbAdapter)

      const result = trashService.getEnableTrashData(trash, today);
      expect(result?.type).toBe("brun");
      expect(result?.name).toBe("もえるゴミ");
    });
    it("return_undefined_when_start_is_sunday_and_weekda_is_not_match", () => {
      const trash: TrashData = {
        type: "brun",
        schedules: [
          {
            type: "evweek",
            value: {
              start: "2024-12-29",
              weekday: "2",
              interval: 2
            }
          }
        ],
      };
      const today = new Date("2025-1-15");
      const trashService = new TrashScheduleService("Asia/Tokyo", textCreator, dbAdapter)

      const result = trashService.getEnableTrashData(trash, today);
      expect(result).toBeUndefined();
    });
    it("return_undefined_when_start_is_wedenesday_and_weekday_is_not_match", () => {
      const trash: TrashData = {
        type: "brun",
        schedules: [
          {
            type: "evweek",
            value: {
              start: "2025-1-1",
              weekday: "2",
              interval: 2
            }
          }
        ],
      };
      const today = new Date("2025-1-15");
      const trashService = new TrashScheduleService("Asia/Tokyo", textCreator, dbAdapter)

      const result = trashService.getEnableTrashData(trash, today);
      expect(result).toBeUndefined();
    });
    it("return_undefined_when_start_is_sunday_and_weekday_is_match_but_interval_is_not_match", () => {
      const trash: TrashData = {
        type: "brun",
        schedules: [
          {
            type: "evweek",
            value: {
              start: "2024-12-29",
              weekday: "3",
              interval: 3
            }
          }
        ],
      };
      const today = new Date("2025-1-15");
      const trashService = new TrashScheduleService("Asia/Tokyo", textCreator, dbAdapter)

      const result = trashService.getEnableTrashData(trash, today);
      expect(result).toBeUndefined();
    });
    it("return_undefined_when_start_is_wedenesday_and_weekday_is_match_but_interval_is_not_match", () => {
      const trash: TrashData = {
        type: "brun",
        schedules: [
          {
            type: "evweek",
            value: {
              start: "2025-1-1",
              weekday: "3",
              interval: 3
            }
          }
        ],
      };
      const today = new Date("2025-1-15");
      const trashService = new TrashScheduleService("Asia/Tokyo", textCreator, dbAdapter)

      const result = trashService.getEnableTrashData(trash, today);
      expect(result).toBeUndefined();
    });
  });
});

describe("calculateNextDateBySchedule", () => {
  describe("IntervalWeeklySchedule", () => {
    it("return_this_wednesday_when_start_is_sunday_and_interval_is_match", () => {
      const trash: TrashData = {
        type: "brun",
        schedules: [
          {
            type: "evweek",
            value: {
              start: "2024-12-29",
              weekday: "3",
              interval: 2
            }
          }
        ],
      };
      const today = new Date("2025-1-12");
      const trashService = new TrashScheduleService("Asia/Tokyo", textCreator, dbAdapter)

      const result = trashService.calculateNextDateBySchedule( today, trash.schedules[0].type, trash.schedules[0].value, []);
      expect(result).toEqual(new Date("2025-1-15"));
    });
    it("return_this_wednesday_when_start_is_wednesday_and_interval_is_match", () => {
      const trash: TrashData = {
        type: "brun",
        schedules: [
          {
            type: "evweek",
            value: {
              start: "2025-1-1",
              weekday: "3",
              interval: 2
            }
          }
        ],
      };
      const today = new Date("2025-1-15");
      const trashService = new TrashScheduleService("Asia/Tokyo", textCreator, dbAdapter)

      const result = trashService.calculateNextDateBySchedule( today, trash.schedules[0].type, trash.schedules[0].value, []);
      expect(result).toEqual(new Date("2025-1-15"));
    });
    it("return_next_wednesday_when_start_is_sunday_and_interval_is_not_match", () => {
      const trash: TrashData = {
        type: "brun",
        schedules: [
          {
            type: "evweek",
            value: {
              start: "2024-12-29",
              weekday: "3",
              interval: 3
            }
          }
        ],
      };
      const today = new Date("2025-1-12");
      const trashService = new TrashScheduleService("Asia/Tokyo", textCreator, dbAdapter)

      const result = trashService.calculateNextDateBySchedule( today, trash.schedules[0].type, trash.schedules[0].value, []);
      expect(result).toEqual(new Date("2025-1-22"));
    });
    it("return_next_wednesday_when_start_is_wednesday_and_interval_is_not_match", () => {
      const trash: TrashData = {
        type: "brun",
        schedules: [
          {
            type: "evweek",
            value: {
              start: "2025-1-1",
              weekday: "3",
              interval: 3
            }
          }
        ],
      };
      const today = new Date("2025-1-15");
      const trashService = new TrashScheduleService("Asia/Tokyo", textCreator, dbAdapter)

      const result = trashService.calculateNextDateBySchedule( today, trash.schedules[0].type, trash.schedules[0].value, []);
      expect(result).toEqual(new Date("2025-1-22"));
    });
  });
})