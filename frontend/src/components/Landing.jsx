
import React, { useEffect, useState, useRef } from 'react';
import { Box, Typography, Card, CardMedia } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const [scrollPosition1, setScrollPosition1] = useState(0);
  const [scrollPosition2, setScrollPosition2] = useState(0);
  const carouselRef1 = useRef(null);
  const carouselRef2 = useRef(null);

  const navigate = useNavigate();
  const handleRedirect = () => {
    navigate('/home');
  };

 const trendingBooks = [
    { title: "Book A", image: "/images/aaa.jpg" },
    { title: "Book B", image: "/images/anuraga.jpg" },
    { title: "Book C", image: "/images/epe.jpg" },
    { title: "Book D", image: "/images/rcoa.jpg" },
    { title: "Book E", image: "/images/nanay.jpg" },
    { title: "Book F", image: "/images/orikkal.jpg" },
  ];
  
  // A different set of books for the second carousel
  const newTrendingBooks = [
    { title: "Book G", image: "/images/agni.jpg" },
    { title: "Book H", image: "/images/odk.jpg" },
    { title: "Book I", image: "/images/aathma.jpg" },
    { title: "Book J", image: "/images/naalu.jpg" },
    { title: "Book K", image: "/images/mayyazhi.jpg" },
    { title: "Book L", image: "/images/kaali.jpg" },
  ];
  // Duplicate books to create a seamless loop
  const animatedBooks1 = [...trendingBooks, ...trendingBooks];
  const animatedBooks2 = [...newTrendingBooks, ...newTrendingBooks];

  useEffect(() => {
    // Set up the interval for the first carousel
    const interval1 = setInterval(() => {
      setScrollPosition1(prevPos => {
        const itemWidth = 256 + 16; // Item width + margin
        const totalWidth = itemWidth * animatedBooks1.length / 2;
        const newPos = prevPos - 1; // Change by 1px at a time
        return newPos <-totalWidth ? 0 : newPos;
      });
    }, 25); // Controls the speed of the scroll

    // Set up the interval for the second carousel (reverse)
    const interval2 = setInterval(() => {
      setScrollPosition2(prevPos => {
        const itemWidth = 256 + 16; // Item width + margin
        const newPos = prevPos + 1; // Change by 1px at a time
        return newPos > 0 ? -itemWidth * animatedBooks2.length / 2 : newPos;
      });
    }, 25);

    // Clean up the intervals on component unmount
    return () => {
      clearInterval(interval1);
      clearInterval(interval2);
    };
  }, []);

  return (
    <Box
      onClick={handleRedirect}
      sx={{
        minHeight: '100vh',
        backgroundColor: 'rgba(110, 116, 114, 0.3)',
        fontFamily: 'sans-serif',
        color: '#333',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        p: { xs: 2, md: 4 }
      }}
    >
      <Box sx={{ zIndex: 10, textAlign: 'center' ,width:"100vw",height:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
        
        <Typography
          variant="h2"
          component="h1"
          sx={{
            fontWeight: 800,
            color: '#00897b',
            lineHeight: 1.25,
            letterSpacing: '-0.025em',
            textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
            fontSize: { xs: '2.25rem', md: '3.75rem' }
          }}
        >
          Welcome to Readora
        </Typography>
        <Typography
          variant="subtitle1"
          sx={{
            mt: 1,
            fontWeight: 300,
            color: '#555',
            fontSize: { xs: '1.25rem', md: '1.5rem' }
          }}
        >
          Click anywhere to explore our collection.
        </Typography>
      </Box>

       {/* Animated Trending Books Section (top carousel)  */}
      <Box
        sx={{
          position: 'absolute',
          top: '25%',
          left: '10%',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0.2,
          transform: 'translate(-10%, -50%) rotate(-20deg)',
          pointerEvents: 'none'
        }}
      >
        <Box sx={{ width: '200vw', height: '256px', overflow: 'hidden' }}>
          <Box
            ref={carouselRef1}
            sx={{
              display: 'flex',
              width: '100%',
              height: '100%',
              transform: `translateX(${scrollPosition1}px)`
            }}
          >
            {animatedBooks1.map((book, index) => (
              <Card
                key={index}
                sx={{
                  flexShrink: 0,
                  width: 256,
                  height: 256,
                  m: '0 0.5rem',
                  transition: 'transform 0.3s',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  borderRadius: '0.5rem',
                  '&:hover': {
                    transform: 'scale(1.05)',
                  },
                }}
              >
                <CardMedia
                  component="img"
                  image={book.image}
                  alt={book.title}
                  sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </Card>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Animated Trending Books Section (bottom carousel) */}
      <Box
        sx={{
          position: 'absolute',
          bottom: '25%',
          left: '90%',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0.2,
          transform: 'translate(-90%, 50%) rotate(-20deg)',
          pointerEvents: 'none'
        }}
      >
        <Box sx={{ width: '200vw', height: '256px', overflow: 'hidden' }}>
          <Box
            ref={carouselRef2}
            sx={{
              display: 'flex',
              width: '100%',
              height: '100%',
              transform: `translateX(${scrollPosition2}px)`
            }}
          >
            {animatedBooks2.map((book, index) => (
              <Card
                key={index}
                sx={{
                  flexShrink: 0,
                  width: 256,
                  height: 256,
                  m: '0 0.5rem',
                  transition: 'transform 0.3s',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  borderRadius: '0.5rem',
                  '&:hover': {
                    transform: 'scale(1.05)',
                  },
                }}
              >
                <CardMedia
                  component="img"
                  image={book.image}
                  alt={book.title}
                  sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </Card>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Landing;
