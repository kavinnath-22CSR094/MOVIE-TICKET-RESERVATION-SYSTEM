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
  height: 100vh;
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

const CarouselContainer = styled.div`
 margin: 2rem 0;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
`;

const MovieCard = styled.div`
  background: #fff;
  padding: 1rem;
  border-radius: 10px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
   margin: 0 10px;
`;

const MovieImage = styled.img`
  width: 100%;
  border-radius: 10px;
`;

const MovieName = styled.div`
  font-size: 1.2rem;
  margin: 0.5rem 0;
`;

const BookButton = styled.button`
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

const MovieGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
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
            if (!token) {
                navigate("/login");
                return;
            }

            try {
                const response = await axios.get("http://localhost:5000/api/auth/user", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUsername(response.data.username);
            } catch (error) {
                console.error("Error fetching user data:", error);
                navigate("/login");
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
        slidesToShow: 3,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        centerMode: true,
        centerPadding: "20px",
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
                    <NavItem>{username}</NavItem>
                    <NavItem onClick={handleLogout}>LOGOUT</NavItem>
                </Nav>
            </Header>
            <h2>UPCOMING MOVIES</h2>
                    <CarouselContainer>
                        <Slider {...settings}>
                            {upcomingMovies.map((movie) => (
                                <MovieCard key={movie._id}>
                                    <MovieImage src={movie.imageUrl} alt={movie.name} />
                                    <MovieName>{movie.name}</MovieName>
                                    <BookButton>BOOK TICKETS</BookButton>
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
                    <h2>UPCOMING MOVIES</h2>
                    <CarouselContainer>
                        <Slider {...settings}>
                            {upcomingMovies.map((movie) => (
                                <MovieCard key={movie._id}>
                                    <MovieImage src={movie.imageUrl} alt={movie.name} />
                                    <MovieName>{movie.name}</MovieName>
                                    <BookButton>BOOK TICKETS</BookButton>
                                </MovieCard>
                            ))}
                        </Slider>
                    </CarouselContainer>
                    <h2>NOW PLAYING MOVIES</h2>
                    <MovieGrid>
                        {nowPlayingMovies.map((movie) => (
                            <MovieCard key={movie._id}>
                                <MovieImage src={movie.imageUrl} alt={movie.name} />
                                <MovieName>{movie.name}</MovieName>
                                <BookButton>BOOK TICKETS</BookButton>
                            </MovieCard>
                        ))}
                    </MovieGrid>
                </MainContent>
            </Content>
        </DashboardContainer>
    );
};

export default Dashboard;
