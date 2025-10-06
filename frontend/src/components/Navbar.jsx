import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import MenuIcon from '@mui/icons-material/Menu';
import { styled, alpha } from '@mui/material/styles';

const PRIMARY_COLOR = 'rgba(29, 138, 105, 0.95)';
const HOVER_COLOR = alpha('#FFFFFF', 0.2);

const NavButton = styled(Button)(({ theme, active }) => ({
  color: theme.palette.common.white,
  fontSize: '1.05rem',
  fontWeight: active ? 700 : 500,
  textTransform: 'none',
  display: 'block',
  margin: theme.spacing(0, 1),
  padding: theme.spacing(1, 1.5),
  borderRadius: theme.shape.borderRadius,
  '&:hover': {
    backgroundColor: HOVER_COLOR,
    boxShadow: `0 1px 3px ${alpha(theme.palette.common.black, 0.1)}`,
    transition: 'background-color 0.2s ease, box-shadow 0.2s ease, font-weight 0.2s ease',
  },
  ...(active && { fontWeight: 700 }),
}));

const LOGO_FONT_FAMILY = 'Merriweather, serif';
const NAV_FONT_FAMILY = 'Roboto, sans-serif';

const pages = [{ name: 'Home', route: '/home' }];

function Navbar() {
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [anchorElCategory, setAnchorElCategory] = useState(null);
  const [categories, setCategories] = useState([]);

  const navigate = useNavigate();
  const location = useLocation();

  // --- Check if user is logged in
  const token = localStorage.getItem('usertoken');
  const settings = token 
    ? [{ name: 'Profile', route: '/profile' }, { name: 'Logout', route: '/logout' }]
    : [{ name: 'Profile', route: '/profile' }, { name: 'Login', route: '/login' }];

  // --- Fetch categories dynamically from MongoDB
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/books/genres');
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCategories();
  }, []);

  const handleOpenNavMenu = (event) => setAnchorElNav(event.currentTarget);
  const handleCloseNavMenu = () => setAnchorElNav(null);
  const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget);
  const handleCloseUserMenu = () => setAnchorElUser(null);
  const handleOpenCategoryMenu = (event) => setAnchorElCategory(event.currentTarget);
  const handleCloseCategoryMenu = () => setAnchorElCategory(null);

  const handleNavClick = (route) => { navigate(route); handleCloseNavMenu(); };

  const handleUserMenuClick = (route) => {
    handleCloseUserMenu();
    if (route === '/logout') {
      localStorage.removeItem('usertoken');
      navigate('/login');
      return;
    }
    navigate(route);
  };

  const handleCategoryClick = (categoryName) => {
    navigate(`/home?genre=${categoryName}`);
    handleCloseCategoryMenu();
  };

  const isRouteActive = (route) => location.pathname === route;

  return (
    <div>
      <AppBar position="static" elevation={4} sx={{ backgroundColor: PRIMARY_COLOR, width: "100vw" }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters>

          
            <Typography variant="h5" noWrap component="a" href="#" sx={{
              mr: 3, display: { xs: 'none', md: 'flex' }, fontFamily: LOGO_FONT_FAMILY, fontWeight: 900,
              letterSpacing: '.1rem', color: 'inherit', textDecoration: 'none',
            }}>
              <Box sx={{ display: { xs: 'none', md: 'flex' }, mr: 1, alignItems: 'center' }}>
                <img src='/images/mylogo.png' alt="READORA Logo" style={{ height: '38px' }} />
              </Box>
              READORA
            </Typography>

          
            <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
              <IconButton size="large" aria-label="open main menu" aria-controls="menu-appbar"
                aria-haspopup="true" onClick={handleOpenNavMenu} color="inherit">
                <MenuIcon />
              </IconButton>
              <Menu id="menu-appbar-mobile" anchorEl={anchorElNav} open={Boolean(anchorElNav)} onClose={handleCloseNavMenu}>
                {pages.map((page) => (
                  <MenuItem key={page.name} onClick={() => handleNavClick(page.route)}>
                    <Typography textAlign="center" sx={{ fontSize: '1.05rem' }}>{page.name}</Typography>
                  </MenuItem>
                ))}
                <MenuItem onClick={handleOpenCategoryMenu}>
                  <Typography textAlign="center" sx={{ fontSize: '1.05rem' }}>Category</Typography>
                </MenuItem>
                {categories.map(cat => (
                  <MenuItem key={cat} onClick={() => handleCategoryClick(cat)}>
                    <Typography textAlign="center">{cat}</Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>

          
            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, justifyContent: 'flex-end', alignItems: 'center', mr: 2 }}>
              {pages.map((page) => (
                <NavButton key={page.name} onClick={() => handleNavClick(page.route)} active={isRouteActive(page.route) ? 1 : 0} sx={{ fontFamily: NAV_FONT_FAMILY }}>
                  {page.name}
                </NavButton>
              ))}

            
              <NavButton onClick={handleOpenCategoryMenu} sx={{ fontFamily: NAV_FONT_FAMILY }}>
                Category
              </NavButton>
              <Menu id="category-menu" anchorEl={anchorElCategory} open={Boolean(anchorElCategory)} onClose={handleCloseCategoryMenu}>
                {categories.map((cat) => (
                  <MenuItem key={cat} onClick={() => handleCategoryClick(cat)}>
                    {cat}
                  </MenuItem>
                ))}
              </Menu>

              <NavButton onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })} sx={{ fontFamily: NAV_FONT_FAMILY }}>Contact Us</NavButton>
              <NavButton onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })} sx={{ fontFamily: NAV_FONT_FAMILY }}>About Us</NavButton>
            </Box>

          
            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title="Open settings">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar alt="User Avatar" src="/static/images/avatar/2.jpg" sx={{ width: 40, height: 40, border: `2px solid ${alpha('#ffffff', 0.8)}` }} />
                </IconButton>
              </Tooltip>
              <Menu sx={{ mt: '45px' }} anchorEl={anchorElUser} open={Boolean(anchorElUser)} onClose={handleCloseUserMenu}>
                {settings.map((setting) => (
                  <MenuItem key={setting.name} onClick={() => handleUserMenuClick(setting.route)}>
                    <Typography textAlign="center" sx={{ fontSize: '1.05rem' }}>{setting.name}</Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>

          </Toolbar>
        </Container>
      </AppBar>
    </div>
  );
}

export default Navbar;
