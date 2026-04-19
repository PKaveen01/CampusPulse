import React, { useEffect, useState } from "react";
import { getBookings, createBooking } from "../../services/bookingService";
import "./BookingPage.css";

const BookingPage = () => {
  const [bookings, setBookings] = useState([]);

  const [form, setForm] = useState({
    resourceName: "",
    date: "",
    startTime: "",
    endTime: "",
    purpose: ""
  });

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const res = await getBookings();
    setBookings(res.data);
  };

  const handleSubmit = async () => {
    await createBooking(form);
    setForm({
      resourceName: "",
      date: "",
      startTime: "",
      endTime: "",
      purpose: ""
    });
    load();
  };

  return (
    <div className="booking-container">

      <h1 className="title">Booking Management</h1>

      {/* FORM */}
      <div className="form-card">
        <h3>New Booking</h3>

        <input placeholder="Room"
          value={form.resourceName}
          onChange={(e) => setForm({...form, resourceName: e.target.value})} />

        <input type="date"
          value={form.date}
          onChange={(e) => setForm({...form, date: e.target.value})} />

        <input type="time"
          value={form.startTime}
          onChange={(e) => setForm({...form, startTime: e.target.value})} />

        <input type="time"
          value={form.endTime}
          onChange={(e) => setForm({...form, endTime: e.target.value})} />

        <input placeholder="Purpose"
          value={form.purpose}
          onChange={(e) => setForm({...form, purpose: e.target.value})} />

        <button onClick={handleSubmit}>Create Booking</button>
      </div>

      {/* BOOKINGS LIST */}
      <div className="list-card">
        <h3>My Bookings</h3>

        {bookings.length === 0 && <p>No bookings yet</p>}

        {bookings.map(b => (
          <div className="booking-item" key={b.id}>
            <div>
              <h4>{b.resourceName}</h4>
              <p>{b.date} | {b.startTime} - {b.endTime}</p>
            </div>

            <span className={`status ${b.status?.toLowerCase()}`}>
              {b.status}
            </span>
          </div>
        ))}
      </div>

    </div>
  );
};

export default BookingPage;