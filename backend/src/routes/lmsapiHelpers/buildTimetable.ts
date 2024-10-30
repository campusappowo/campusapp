  // Utility function to transform timetable array into a structured object

export const buildTimetable = (timetableArray: string[][]) => {
    type Timetable = {
      [day: string]: {
        [timeSlot: string]: string;
      };
    };
  
    const timetableObj: Timetable = {};
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