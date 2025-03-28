// /app/api/availability/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

function generateTimeSlots(startTime: string, endTime: string): string[] {
  const slots: string[] = [];
  let currentTime = startTime;

  while (currentTime < endTime) {
    const nextTime = addMinutesToTime(currentTime, 30);
    if (nextTime > endTime) break; // Avoid exceeding end time

    slots.push(`${currentTime}-${nextTime}`);
    currentTime = nextTime;
  }
  return slots;
}

// Helper function to add minutes to a time string
function addMinutesToTime(time: string, minutes: number): string {
  const [hours, minutesPart] = time.split(':').map(Number);
  const newMinutes = minutesPart + minutes;
  const newHours = hours + Math.floor(newMinutes / 60);
  const remainingMinutes = newMinutes % 60;

  const paddedHours = String(newHours % 24).padStart(2, '0'); // Handle overflow
  const paddedMinutes = String(remainingMinutes).padStart(2, '0');
  return `${paddedHours}:${paddedMinutes}:00`;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const doctorId = searchParams.get('doctor_id');
    const dayOfWeek = searchParams.get('day_of_week');
    const selectedDate = searchParams.get('selected_date');

    if (!doctorId || !dayOfWeek || !selectedDate) {
      return NextResponse.json({
        error: 'doctor_id, day_of_week, and selected_date are required',
      }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('availability')
      .select('*')
      .eq('doctor_id', doctorId)
      .eq('day_of_week', dayOfWeek);

    if (error) {
      console.error('Error fetching availability:', error);
      return NextResponse.json({ error: 'Error fetching availability' }, {
        status: 500,
      });
    }

    if (data && data.length > 0) {
      // Assuming you only expect one availability slot per doctor per day for simplicity
      const { start_time, end_time } = data[0];
      const timeSlots = generateTimeSlots(start_time, end_time);

      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select('appointment_time')
        .eq('doctor_id', doctorId)
        .eq('appointment_date', selectedDate)
        .eq('status', 'booked'); // Only check booked appointments

      if (appointmentsError) {
        console.error('Error fetching appointments:', appointmentsError);
        return NextResponse.json({ error: 'Error fetching appointments' }, {
          status: 500,
        });
      }

      // Filter out booked time slots
      const bookedTimes = appointmentsData ? appointmentsData.map(app => app.appointment_time) : [];
      // eslint-disable-next-line
      const availableTimeSlots = timeSlots.filter(slot => {
        const slotStartTime = slot.split('-')[0]; // Extract start time
        return !bookedTimes.includes(slotStartTime);
      });

      return NextResponse.json({ data: { timeSlots } }, { status: 200 });
    } else {
      return NextResponse.json({ data: { timeSlots: [] } }, { status: 200 }); // No availability
    }

    //return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error('Error in availability GET route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Authentication and authorization logic here (check if user is a doctor)

    const { doctor_id, day_of_week, start_time, end_time } = await req.json();

    if (!doctor_id || !day_of_week || !start_time || !end_time) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('availability')
      .insert({
        doctor_id,
        day_of_week,
        start_time,
        end_time,
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error creating availability:', error);
      return NextResponse.json({ error: 'Error creating availability' }, {
        status: 500,
      });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('Error in availability POST route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}