import React, { useState } from "react";
import axios from "axios";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: #1a1a2e;
`;

const Card = styled.div`
  background: #fff;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.3);
  text-align: center;
  width: 400px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

const Button = styled.button`
  width: 100%;
  padding: 10px;
  background: #007bff;
  color: white;
  border: none;
  font-size: 16px;
  border-radius: 5px;
  cursor: pointer;
  &:hover {
    background: #0056b3;
  }
`;

const AdminPanel = () => {
    const [theaterData, setTheaterData] = useState({
        name: "",
        location: "",
        movies: [{ movieId: "", date: "", time: "" }],
    });

    const handleChange = (e) => {
        setTheaterData({ ...theaterData, [e.target.name]: e.target.value });
    };

    const handleMovieChange = (index, e) => {
        const newMovies = [...theaterData.movies];
        newMovies[index][e.target.name] = e.target.value;
        setTheaterData({ ...theaterData, movies: newMovies });
    };

    const handleAddMovie = () => {
        setTheaterData({ ...theaterData, movies: [...theaterData.movies, { movieId: "", date: "", time: "" }] });
    };

    const handleSubmit = async () => {
        try {
            await axios.post("http://localhost:5000/api/admin/add-theater", theaterData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            alert("Theater added successfully!");
            setTheaterData({ name: "", location: "", movies: [{ movieId: "", date: "", time: "" }] });
        } catch (error) {
            console.error("❌ Error adding theater:", error);
            alert("Error adding theater!");
        }
    };

    return (
        <Container>
            <Card>
                <h2>Add Theater</h2>
                <Input type="text" name="name" placeholder="Theater Name" value={theaterData.name} onChange={handleChange} />
                <Input type="text" name="location" placeholder="Location" value={theaterData.location} onChange={handleChange} />
                {theaterData.movies.map((movie, index) => (
                    <div key={index}>
                        <Input type="text" name="movieId" placeholder="Movie ID" value={movie.movieId} onChange={(e) => handleMovieChange(index, e)} />
                        <Input type="date" name="date" value={movie.date} onChange={(e) => handleMovieChange(index, e)} />
                        <Input type="time" name="time" value={movie.time} onChange={(e) => handleMovieChange(index, e)} />
                    </div>
                ))}
                <Button onClick={handleAddMovie}>Add Another Movie</Button>
                <Button onClick={handleSubmit}>Add Theater</Button>
            </Card>
        </Container>
    );
};

export default AdminPanel;
