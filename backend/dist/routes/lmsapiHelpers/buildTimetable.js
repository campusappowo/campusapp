"use strict";
// Utility function to transform timetable array into a structured object
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildTimetable = void 0;
const buildTimetable = (timetableArray) => {
    const timetableObj = {};
    const headers = timetableArray[0];
    for (let i = 1; i < timetableArray.length; i++) {
        const row = timetableArray[i];
        const timeSlot = row[0];
        for (let j = 1; j < row.length; j++) {
            const day = headers[j];
            const classDetail = row[j];
            if (!timetableObj[day]) {
                timetableObj[day] = {};
            }
            timetableObj[day][timeSlot] = classDetail || "No Class";
        }
    }
    return timetableObj;
};
exports.buildTimetable = buildTimetable;
