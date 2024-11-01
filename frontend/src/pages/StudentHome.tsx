import axios from "axios"
import { useEffect, useState } from "react"


export const StudentHome = () => {

    interface userDetails {
        uid : string,
        name : string,
        password : string
    }

    interface timeTable{
        day : String,
        TT : string
    }

    const [userData, setUserData] = useState<userDetails | null>();
    const [timeTable, setTT] = useState<timeTable | null>()

    useEffect(() => {
        async function getDetails() {
            const response = await axios.get("http://localhost:3000/dbapi/details");
            setUserData({
                uid : response.data.user.uid,
                password : response.data.user.password,
                name : response.data.user.name
            });
            setTT({
                day : response.data.timeTable.day,
                TT : response.data.timeTable.schedule
            })
        }
        getDetails();
    }, []);

    return (
        <div className="flex">
        <div className="flex-col justify-center bg-blue-200 w-2/5 p-12 m-12 rounded-lg">
            <div className="text-xl font-bold">
            Student Details
            </div>
            <div className="flex justify-center">
                {userData?.uid}
                {userData?.password}
                {userData?.name}
            </div>
        </div>
        <div className="flex-col justify-center bg-blue-200 w-2/5 p-12 m-12 rounded-lg">
        <div className="text-xl font-bold">
        Student Timetable
        </div>
        <div className="flex justify-center">
            <div className="text-lg font-semibold">
                {timeTable?.day}
            </div>
                {JSON.stringify(timeTable?.TT)}
        </div>
    </div>
    </div>
    )
}