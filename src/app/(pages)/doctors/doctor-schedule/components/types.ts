// src\app\(pages)\doctors\doctor-schedule\components\types.ts
export type Appointment = {
    id: string;
    appointment_date: string;
    appointment_time: string;
    status: string;
    patient: {
      first_name: string;
      last_name: string;
    };
  };
  
  export type Availability = {
    id: string;
    day_of_week: string;
    start_time: string;
    end_time: string;
  };
  
  export type ProfileUser = {
    id: string;
    [key: string]: unknown;
  };