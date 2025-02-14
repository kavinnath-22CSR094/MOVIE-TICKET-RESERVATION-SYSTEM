import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";

const BookingContainer = styled.div`
  text-align: center;
  font-family: Arial, sans-serif;
`;

const SeatLayout = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  margin: 20px 0;
`;

const SeatRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 5px;
`;

const SeatButton = styled.button`
  padding: 10px;
  min-width: 40px;
  background: ${(props) =>
    props.booked
      ? "#e74c3c" // 🔴 Booked seat (Red)
      : props.selected
      ? "#2ecc71" // 🟢 Selected seat (Green)
      : "#ecf0f1"}; // ⚪ Available seat (Gray)
  border: 1px solid #7f8c8d;
  cursor: ${(props) => (props.booked ? "not-allowed" : "pointer")};
  &:hover {
    background: ${(props) => (!props.booked ? "#bdc3c7" : "#e74c3c")};
  }
`;

const BookButton = styled.button`
  padding: 12px 20px;
  background: #e74c3c;
  color: white;
  border: none;
  cursor: pointer;
  transition: 0.3s;
  &:hover {
    background: #c0392b;
  }
`;

const MovieBooking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { movieName, username } = location.state || {};

  const [selectedSeats, setSelectedSeats] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [movieId, setMovieId] = useState(null);
  const [bookedSeats, setBookedSeats] = useState([]);

  const seating = {
    BOX: { rows: ["A", "B", "C"], seats: 10, price: 100 },
    FIRST_CLASS: { rows: ["D", "E", "F", "G", "H", "I", "J"], seats: 24, price: 150 },
    SECOND_CLASS: { rows: ["K"], seats: 20, price: 120 },
  };

  // ✅ Redirect if user not logged in
  useEffect(() => {
    if (!username) navigate("/login");
  }, [username, navigate]);

  // ✅ Fetch Movie ID & Booked Seats
  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/movies?name=${movieName}`);
        if (res.data.length > 0) {
          setMovieId(res.data[0]._id);
        } else {
          alert("Movie not found!");
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Error fetching movie data:", error);
        alert("Error fetching movie data!");
        navigate("/dashboard");
      }
    };

    fetchMovieData();
  }, [movieName, navigate]);

  // ✅ Fetch Booked Seats
  useEffect(() => {
    if (movieId) {
      axios
        .get(`http://localhost:5000/api/movies/${movieId}/booked-seats`)
        .then((res) => {
          const booked = res.data.map((seat) => `${seat.row}${seat.seatNumber}`);
          setBookedSeats(booked);
        })
        .catch((err) => console.error("Error fetching booked seats:", err));
    }
  }, [movieId]);

  // ✅ Seat Selection Handler (Blocks already booked seats)
  const selectSeat = (row, seatNumber, price) => {
    const seatId = `${row}${seatNumber}`;

    if (bookedSeats.includes(seatId)) {
      alert(`Seat ${seatId} is already booked!`);
      return;
    }

    setSelectedSeats((prevSeats) =>
      prevSeats.includes(seatId)
        ? prevSeats.filter((s) => s !== seatId)
        : [...prevSeats, seatId]
    );
  };

  // ✅ Calculate Total Amount
  useEffect(() => {
    const total = selectedSeats.reduce((sum, seat) => {
      const section = Object.keys(seating).find((sec) =>
        seating[sec].rows.includes(seat.charAt(0))
      );
      return sum + (section ? seating[section].price : 0);
    }, 0);
    setTotalAmount(total);
  }, [selectedSeats]);

  // ✅ Booking Handler
  const bookTickets = async () => {
    if (!selectedSeats.length) return alert("Please select seats!");

    try {
      // 🔹 Fetch User ID
      const userResponse = await axios.get("http://localhost:5000/api/auth/user", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (!userResponse.data || !userResponse.data._id) {
        console.error("❌ User ID not found:", userResponse.data);
        return alert("User ID not found!");
      }

      // 🔹 Fetch Movie ID
      if (!movieId) {
        console.error("❌ Movie ID not found!");
        return alert("Movie ID not found!");
      }

      // 🔹 Format Seats Correctly
      const formattedSeats = selectedSeats.map((seat) => ({
        row: seat.charAt(0), // Extract row (e.g., "A")
        number: parseInt(seat.substring(1)), // Extract seat number (e.g., "1")
      }));

      const bookingDetails = {
        userId: userResponse.data._id, // ✅ Send userId
        movieId, // ✅ Send movieId
        seats: formattedSeats, // ✅ Send formatted seats
      };

      console.log("📩 Sending booking request:", bookingDetails);

      // 🔹 Send Booking Request
      const response = await axios.post("http://localhost:5000/api/book-ticket", bookingDetails, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      console.log("✅ Booking response:", response.data);
      alert("Booking successful!");

      setSelectedSeats([]); // ✅ Clear selection
      setBookedSeats((prev) => [...prev, ...selectedSeats]); // ✅ Update UI to reflect booked seats
    } catch (error) {
      console.error("❌ Booking failed! Server response:", error.response?.data || error.message);
      alert("Booking failed! Check console for details.");
    }
  };

  return (
    <BookingContainer>
      <h1>Book Tickets</h1>
      <h2>Movie: {movieName}</h2>
      <h2>User: {username}</h2>
      <h2>Select Seats:</h2>

      <SeatLayout>
        {Object.entries(seating).map(([section, { rows, seats, price }]) => (
          <div key={section}>
            <h3>{section.replace("_", " ")} - ₹{price}</h3>
            {rows.map((row) => (
              <SeatRow key={row}>
                {Array.from({ length: seats }, (_, seatNumber) => {
                  const seatId = `${row}${seatNumber + 1}`;
                  return (
                    <SeatButton
                      key={seatId}
                      selected={selectedSeats.includes(seatId)}
                      booked={bookedSeats.includes(seatId)}
                      onClick={() => selectSeat(row, seatNumber + 1, price)}
                    >
                      {seatNumber + 1}
                    </SeatButton>
                  );
                })}
              </SeatRow>
            ))}
          </div>
        ))}
      </SeatLayout>

      <h2>Total Amount: ₹{totalAmount}</h2>
      <BookButton onClick={bookTickets}>Book Now</BookButton>
    </BookingContainer>
  );
};

export default MovieBooking;
