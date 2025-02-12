import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
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
  width: 350px;
`;

const Avatar = styled.div`
  width: 80px;
  height: 80px;
  background: #ccc;
  border-radius: 50%;
  margin: 0 auto 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 16px;
`;

const Button = styled.button`
  width: 100%;
  padding: 10px;
  margin-top: 10px;
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
    const [movieData, setMovieData] = useState({
        name: "",
        imageUrl: "",
        genres: "",
        status: "upcoming",
    });
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setMovieData({ ...movieData, [name]: value });
    };

    const handleSubmit = async () => {
        try {
            const genresArray = movieData.genres.split(",").map((genre) => genre.trim());
            await axios.post(
                "http://localhost:5000/api/movies",
                {
                    ...movieData,
                    genres: genresArray,
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );
            alert("Movie added successfully!");
            setMovieData({ name: "", imageUrl: "", genres: "", status: "upcoming" });
        } catch (error) {
            alert("Error adding movie!");
        }
    };

    return (
        <Container>
            <Card>
                <h2>Add Movie</h2>
                <Input
                    type="text"
                    name="name"
                    placeholder="Movie Name"
                    value={movieData.name}
                    onChange={handleChange}
                />
                <Input
                    type="text"
                    name="imageUrl"
                    placeholder="Movie Image URL"
                    value={movieData.imageUrl}
                    onChange={handleChange}
                />
                <Input
                    type="text"
                    name="genres"
                    placeholder="Genres (comma-separated)"
                    value={movieData.genres}
                    onChange={handleChange}
                />
                <select name="status" value={movieData.status} onChange={handleChange}>
                    <option value="upcoming">Upcoming</option>
                    <option value="now playing">Now Playing</option>
                </select>
                <Button onClick={handleSubmit}>Add Movie</Button>
            </Card>
        </Container>
    );
};

export default AdminPanel;