import DoctorSchedule from "./components/calendar";
import Header from "@/app/layout/header";
const Appointments = () => {
    return (
        <div>
            <Header background="white" title="Calendar" />
            <DoctorSchedule />
        </div>
    );
}

export default Appointments;

