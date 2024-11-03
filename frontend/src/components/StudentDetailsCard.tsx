import axios from "axios"
import { useEffect, useState } from "react"


export const StudentCards = () => {
    interface userDetails {
        uid : string,
        name : string,
        password? : string
    }
    
    interface timeTable{
        day : string,
        TT : string
    }
    
    const [userData, setUserData] = useState<userDetails | null>();
    const [timeTable, setTT] = useState<timeTable | null>()
    const [freshData, setFreshData] = useState(false);
    const [captcha, setCaptcha] = useState("");


    // IMPLEMENT REDIS FOR FAST DATA FETCHING, IMPLEMENT CAPTCHA BHEJNA LENA, 
    useEffect(() => {

        if(!freshData){
            getDetails();
        }
        if(freshData) {
            console.log("in freshdata");
            getFreshDetails();
        }
    }, [freshData]);

    const getDetails = async () => {
        const response = await axios.get("http://localhost:3000/dbapi/details", {
            headers : {
                Authorization : localStorage.getItem("token")
            },
            withCredentials : true
        });

        if(response.data.user !== "EMPTY"){
            setUserData({
                uid : response.data.user.uid,
                // password : response.data.user.password,
                name : response.data.user.name
            });
            setTT({
                day : response.data.timeTable.day,
                TT : response.data.timeTable.schedule
            })
        }
        else {
            console.log("in empty user");
            setFreshData(true);
        }
    }

    const getFreshDetails = async () => {
        const firstResponse = await axios.get("http://localhost:3000/lmsapi", {
            headers : {
                Authorization : localStorage.getItem("token")
            },
            withCredentials : true
        });
        
        localStorage.setItem("PupSession", firstResponse.data);
        alert("please send captcha");
    }

    async function handleSendCaptcha() {
        const secondResponse = await axios.post("http://localhost:3000/lmsapi", {
            sessionId: localStorage.getItem("PupSession"),
            captcha: captcha,
        },{
            headers: {
                Authorization: localStorage.getItem("token"),
            },
        withCredentials : true
        })
        setUserData({
            uid : secondResponse.data.user.uid,
            // password : secondResponse.data.user.password,
            name : secondResponse.data.user.name
        });
        setTT({
            day : secondResponse.data.timeTable.day,
            TT : secondResponse.data.timeTable.schedule
        })
        }

    return (
        <>
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

        <div className="flex flex-col justify-center items-center m-5 p-5 bg-blue-200">
            <input type="text" placeholder="captcha" className="border-4" onChange={(e) => {
                    setCaptcha(e.target.value);
            }}/>
            <button className="border-4 m-5" onClick={handleSendCaptcha}>Send Captcha</button>
        </div>
        </>
    )
    
}
