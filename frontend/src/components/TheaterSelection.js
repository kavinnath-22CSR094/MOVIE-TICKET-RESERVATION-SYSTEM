import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";

const TheaterContainer = styled.div`
  padding: 20px;
  font-family: Arial, sans-serif;
`;

const SelectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 20px 0;
`;

const Select = styled.select`
  padding: 10px;
  font-size: 16px;
`;

const Button = styled.button`
  padding: 10px 20px;
  background: #007bff;
  color: white;
  border: none;
  cursor: pointer;
  &:hover {
    background: #0056b3;
  }
`;

const TheaterSelection = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { movieId, movieName, username } = location.state || {};

  const [theaters, setTheaters] = useState([]);
  const [selectedTheater, setSelectedTheater] = useState("");
  const [theaterDetails, setTheaterDetails] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  // Fetch theaters for the selected movie
  useEffect(() => {
    if (movieId) {
      axios
        .get(`http://localhost:5000/api/theaters?movieId=${movieId}`)
        .then((res) => setTheaters(res.data))
        .catch((err) => console.error("Error fetching theaters:", err));
    }
  }, [movieId]);

  // Fetch theater details (date and time) when a theater is selected
  useEffect(() => {
    if (selectedTheater) {
      axios
        .get(`http://localhost:5000/api/theater-details?theaterId=${selectedTheater}`)
        .then((res) => setTheaterDetails(res.data))
        .catch((err) => console.error("Error fetching theater details:", err));
    }
  }, [selectedTheater]);

  const handleTheaterChange = (e) => {
    setSelectedTheater(e.target.value);
    setSelectedDate("");
    setSelectedTime("");
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleTimeChange = (e) => {
    setSelectedTime(e.target.value);
  };

  const handleBookTicket = () => {
    if (!selectedTheater || !selectedDate || !selectedTime) {
      alert("Please select theater, date, and time!");
      return;
    }

    navigate("/moviebooking", {
      state: {
        movieId,
        movieName,
        username,
        theaterId: selectedTheater,
        date: selectedDate,
        time: selectedTime,
      },
    });
  };

  return (
    <TheaterContainer>
      <h1>Select Theater, Date, and Time</h1>
      <h2>Movie: {movieName}</h2> {/* Display movie name */}
      <h2>User: {username}</h2>

      <SelectionContainer>
        {/* Theater Dropdown */}
        <Select onChange={handleTheaterChange} value={selectedTheater}>
          <option value="">Select Theater</option>
          {theaters.map((theater) => (
            <option key={theater._id} value={theater._id}>
              {theater.name} - {theater.location}
            </option>
          ))}
        </Select>

        {/* Date Dropdown */}
        {selectedTheater && (
          <Select onChange={handleDateChange} value={selectedDate}>
            <option value="">Select Date</option>
            {theaterDetails
              .filter((detail) => detail.movieId === movieId) // Filter by movieId
              .map((detail, index) => (
                <option key={index} value={detail.date}>
                  {detail.date}
                </option>
              ))}
          </Select>
        )}

        {/* Time Dropdown */}
        {selectedDate && (
          <Select onChange={handleTimeChange} value={selectedTime}>
            <option value="">Select Time</option>
            {theaterDetails
              .filter(
                (detail) =>
                  detail.movieId === movieId && detail.date === selectedDate // Filter by movieId and date
              )
              .map((detail, index) => (
                <option key={index} value={detail.time}>
                  {detail.time}
                </option>
              ))}
          </Select>
        )}

        <Button onClick={handleBookTicket}>Proceed to Book Ticket</Button>
      </SelectionContainer>
    </TheaterContainer>
  );
};

export default TheaterSelection;