import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Styled Components
const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 175vh;
  background: #f4f4f4;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #1a1a2e;
  color: white;
`;

const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
`;

const Nav = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const NavItem = styled.div`
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`;

const CarouselContainer = styled.div`
  width: 100vw;
  height: 400px;
`;

const MovieCard = styled.div`
  width: 100vw;
  position: relative;
`;

const MovieImage = styled.img`
  width: 100vw;
  height: 400px;
`;

const MovieOverlay = styled.div`
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
`;

const MovieName = styled.div`
  font-size: 1.5rem;
  color: white;
  background: rgba(0, 0, 0, 0.6);
  padding: 10px 20px;
  border-radius: 5px;
  margin-bottom: 10px;
`;

const BookButton = styled.button`
  padding: 10px 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  &:hover {
    background: #0056b3;
  }
`;

const MovieCard1 = styled.div`
  background: #fff;
  padding: 1rem;
  border-radius: 10px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
  margin: 0 10px;
`;

const MovieImage1 = styled.img`
  width: 100%;
  height: 100px;
  border-radius: 10px;
`;

const MovieName1 = styled.div`
  font-size: 1.2rem;
  margin: 0.5rem 0;
`;

const BookButton1 = styled.button`
  width: 100%;
  padding: 10px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  &:hover {
    background: #0056b3;
  }
`;

const MovieGrid1 = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const Content = styled.div`
  display: flex;
  flex: 1;
  padding: 1rem;
`;

const Sidebar = styled.div`
  width: 200px;
  background: #fff;
  padding: 1rem;
  border-right: 1px solid #ccc;
`;

const MainContent = styled.div`
  flex: 1;
  padding: 1rem;
`;

const SearchBar = styled.input`
  width: 100%;
  padding: 10px;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

const Dashboard = () => {
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [nowPlayingMovies, setNowPlayingMovies] = useState([]);
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const upcomingResponse = await axios.get("http://localhost:5000/api/movies", {
          params: { status: "upcoming" },
        });
        setUpcomingMovies(upcomingResponse.data);

        const nowPlayingResponse = await axios.get("http://localhost:5000/api/movies", {
          params: { status: "now playing" },
        });
        setNowPlayingMovies(nowPlayingResponse.data);
      } catch (error) {
        console.error("Error fetching movies:", error);
      }
    };

    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      console.log("Token from localStorage:", token); // Debugging

      if (!token) {
        console.error("No token found. Redirecting to login...");
        navigate("/login");
        return;
      }

      try {
        const response = await axios.get("http://localhost:5000/api/auth/user", {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("User data received:", response.data); // Debugging

        if (response.data && response.data.username) {
          setUsername(response.data.username);
        } else {
          console.error("Username not found in response:", response.data);
          setUsername("Guest"); // Fallback
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        navigate("/dashboard");
      }
    };

    fetchMovies();
    fetchUserData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: false,
  };

  return (
    <DashboardContainer>
      <Header>
        <Logo>LOGO</Logo>
        <Nav>
          <NavItem>DASHBOARD</NavItem>
          <NavItem>MOVIES</NavItem>
          <NavItem onClick={() => alert("Theaters page coming soon!")}>THEATERS</NavItem>
          <NavItem onClick={() => alert("Orders page coming soon!")}>ORDERS</NavItem>
          <NavItem>{username || "Guest"}</NavItem>
          <NavItem onClick={handleLogout}>LOGOUT</NavItem>
        </Nav>
      </Header>

      <h2 style={{ textAlign: "center" }}>UPCOMING MOVIES</h2>
      <CarouselContainer>
        <Slider {...settings}>
          {upcomingMovies.map((movie) => (
            <MovieCard key={movie._id}>
              <MovieImage src={movie.imageUrl} alt={movie.name} />
              <MovieOverlay>
                <MovieName>{movie.name}</MovieName>
                <BookButton>BOOK TICKETS</BookButton>
              </MovieOverlay>
            </MovieCard>
          ))}
        </Slider>
      </CarouselContainer>

      <Content>
        <Sidebar>
          <h3>GENRES</h3>
          <div>Drama</div>
          <div>Thriller</div>
          <div>Romance</div>
          <div>Mystery</div>
        </Sidebar>

        <MainContent>
          <SearchBar type="text" placeholder="Search movie or theatre" />

          <h2>NOW PLAYING MOVIES</h2>
          <MovieGrid1>
            {nowPlayingMovies.map((movie) => (
              <MovieCard1 key={movie._id}>
                <MovieImage1 src={movie.imageUrl} alt={movie.name} />
                <MovieName1>{movie.name}</MovieName1>
                <BookButton1>BOOK TICKETS</BookButton1>
              </MovieCard1>
            ))}
          </MovieGrid1>
        </MainContent>
      </Content>
    </DashboardContainer>
  );
};

export default Dashboard;
