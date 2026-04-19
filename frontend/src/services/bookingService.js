import axios from "axios";

const API = "http://localhost:8080/api/bookings";

export const getBookings = () => axios.get(API);

export const createBooking = (data) => axios.post(API, data);

export const updateBookingStatus = (id, status) =>
  axios.put(`${API}/${id}?status=${status}`);