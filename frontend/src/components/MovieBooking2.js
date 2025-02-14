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
  background: ${(props) => (props.selected ? "#2ecc71" : "#ecf0f1")};
  border: 1px solid #7f8c8d;
  cursor: pointer;
  &:hover {
    background: ${(props) => (props.selected ? "#27ae60" : "#bdc3c7")};
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

  useEffect(() => {
    if (!username) navigate("/login");

    axios.get(`http://localhost:5000/api/movies?name=${movieName}`)
      .then((res) => {
        if (res.data.length > 0) {
          setMovieId(res.data[0]._id);
        } else {
          alert("Movie not found!");
          navigate("/dashboard");
        }
      })
      .catch((error) => {
        console.error("Error fetching movie data:", error);
        alert("Error fetching movie data!");
        navigate("/dashboard");
      });
  }, [username, movieName, navigate]);

  useEffect(() => {
    if (movieId) {
      axios.get(`http://localhost:5000/api/movies/${movieId}/booked-seats`)
        .then((res) => setBookedSeats(res.data.map(seat => `${seat.row}${seat.seatNumber}`)))
        .catch((err) => console.error("Error fetching booked seats:", err));
    }
  }, [movieId]);

  const selectSeat = (row, seatNumber, price) => {
    const seatId = `${row}${seatNumber}`;
    setSelectedSeats(prevSeats =>
      prevSeats.includes(seatId)
        ? prevSeats.filter((s) => s !== seatId)
        : [...prevSeats, seatId]
    );
  };

  useEffect(() => {
    const total = selectedSeats.reduce((sum, seat) => {
      const section = Object.keys(seating).find((sec) =>
        seating[sec].rows.includes(seat.charAt(0))
      );
      return sum + (section ? seating[section].price : 0);
    }, 0);
    setTotalAmount(total);
  }, [selectedSeats]);

  const bookTickets = async () => {
    if (!selectedSeats.length) return alert("Please select seats!");

    try {
      const userResponse = await axios.get("http://localhost:5000/api/auth/user", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      
      if (!userResponse.data || !userResponse.data._id) {
        return alert("User ID not found!");
      }

      const bookingDetails = {
        user: userResponse.data._id,
        movie: movieId,
        seats: selectedSeats,
        date: new Date().toISOString(),
        time: "10:00 PM",
        totalAmount,
      };

      await axios.post("http://localhost:5000/api/tickets/book", bookingDetails, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      alert("Booking successful!");
      setSelectedSeats([]);
      setTotalAmount(0);
    } catch (error) {
      alert("Booking failed! Check console for details.");
      console.error("Booking failed:", error.response?.data || error.message);
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
                {Array.from({ length: seats }, (_, seatNumber) => (
                  <SeatButton
                    key={`${row}${seatNumber + 1}`}
                    selected={selectedSeats.includes(`${row}${seatNumber + 1}`)}
                    onClick={() => selectSeat(row, seatNumber + 1, price)}
                  >
                    {seatNumber + 1}
                  </SeatButton>
                ))}
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
