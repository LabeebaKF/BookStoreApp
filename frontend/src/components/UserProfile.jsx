import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Box, Grid, TextField, Button, Paper, Tabs, Tab, 
  CircularProgress, Alert, AlertTitle, Card, CardContent
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import DescriptionIcon from '@mui/icons-material/Description';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import { useNavigate } from "react-router-dom";
import axiosInstance from '../axiosinterceptor';

const PRIMARY_COLOR = 'rgba(27, 136, 100, 1)';

const initialUserData = { username: '', phoneno: '', address: '', _id: '' };

// --- Order History Component ---
const OrderHistory = ({ orders, loading, error }) => {
  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}><CircularProgress sx={{ color: PRIMARY_COLOR }} /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!orders || orders.length === 0) return <Typography sx={{ mt: 2 }}>You have no past orders.</Typography>;

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h5" sx={{ mb: 3, color: PRIMARY_COLOR }}>Order History ({orders.length})</Typography>
      {orders.map(order => (
        <Card key={order._id} sx={{ mb: 2, boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h6" color="primary">Order ID: {order._id.substring(0, 10)}...</Typography>
            <Typography variant="body2" color="text.secondary">Date: {new Date(order.createdAt).toLocaleDateString()}</Typography>
            <Typography sx={{ mt: 1 }}>Total: ₹{order.totalAmount?.toFixed(2) || 'N/A'} | Status: {order.status}</Typography>
            <Box sx={{ mt: 1, borderTop: '1px solid #eee', pt: 1 }}>
              {order.items.map(item => (
                <Typography key={item._id} variant="body2">{item.bookId?.title || 'Unknown Book'} ({item.quantity} units)</Typography>
              ))}
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

// --- Cart Display Component ---
const CartDisplay = ({ cartItems, loading, error, onRemove, onBuy }) => {
  const navigate = useNavigate();

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}><CircularProgress sx={{ color: PRIMARY_COLOR }} /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!cartItems || cartItems.length === 0) return <Typography sx={{ mt: 2 }}>Your cart is empty.</Typography>;

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h5" sx={{ mb: 3, color: PRIMARY_COLOR }}>My Cart ({cartItems.length})</Typography>
      <Grid container spacing={3}>
        {cartItems.map(item => (
          <Grid item xs={12} sm={6} md={4} key={item.bookId._id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', boxShadow: 3, cursor: "pointer" }}
              onClick={() => navigate(`/book/${item.bookId._id}`)}>
              <CardContent>
                <Typography variant="h6">{item.bookId.title}</Typography>
                <Typography variant="body2" color="text.secondary">By: {item.bookId.author}</Typography>
                <Typography variant="body1" sx={{ mt: 1, color: 'error.main' }}>₹{item.bookId.price?.toFixed(2)}</Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>Quantity: {item.quantity}</Typography>
              </CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", p: 2, pt: 0 }}>
                <Button variant="outlined" color="error" onClick={(e) => { e.stopPropagation(); onRemove(item.bookId._id); }}>Remove</Button>
                <Button variant="contained" sx={{ backgroundColor: PRIMARY_COLOR }} onClick={(e) => { e.stopPropagation(); onBuy(item.bookId._id); }}>Buy Now</Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

// --- My Submissions Component ---
const MySubmissions = ({ submissions, loading, error }) => {
  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}><CircularProgress sx={{ color: PRIMARY_COLOR }} /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!submissions || submissions.length === 0) return <Typography sx={{ mt: 2 }}>You have no submissions yet.</Typography>;

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'orange';
      case 'Approved': return 'green';
      case 'Rejected': return 'red';
      default: return 'gray';
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h5" sx={{ mb: 3, color: PRIMARY_COLOR }}>My Submissions ({submissions.length})</Typography>
      {submissions.map(sub => (
        <Card key={sub._id} sx={{ mb: 2, boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h6">{sub.title}</Typography>
            <Typography variant="body2" color="text.secondary">Submitted On: {new Date(sub.createdAt).toLocaleDateString()}</Typography>
            <Typography sx={{ mt: 1, fontWeight: 'bold', color: getStatusColor(sub.status) }}>Status: {sub.status}</Typography>
            {sub.synopsis && <Typography variant="body2" sx={{ mt: 1 }}>Synopsis: {sub.synopsis}</Typography>}
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

// --- Main UserProfile Component ---
const UserProfile = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [userData, setUserData] = useState(initialUserData);
  const [orders, setOrders] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [profileForm, setProfileForm] = useState(initialUserData);

  const handleTabChange = (event, newValue) => setTabValue(newValue);

  // --- Fetch all user-related data ---
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem('usertoken');
      if (!token) {
        setError("You must be logged in to view your profile.");
        setIsLoading(false);
        return;
      }

      try {
        // Use axiosInstance for all API calls
        const [profileRes, ordersRes, cartRes, submissionsRes] = await Promise.all([
          axiosInstance.get('/api/user/profile'),
          axiosInstance.get('/api/orders/history'),
          axiosInstance.get('/api/user/cart'),
          axiosInstance.get('/api/submission/my')
        ]);

        const profileData = profileRes.data;
        const ordersData = ordersRes.data;
        const cartData = cartRes.data;
        const submissionsData = submissionsRes.data;

        setUserData(profileData);
        setProfileForm(profileData);
        setOrders(ordersData);
        setCartItems(cartData.items || []);
        setSubmissions(submissionsData || []);
      } catch (err) {
        console.error("Fetch Data Error:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleFormChange = e => setProfileForm({ ...profileForm, [e.target.name]: e.target.value });

  const handleSaveProfile = async () => {
    const token = localStorage.getItem('usertoken');
    if (!token) return;

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await axiosInstance.put('/api/user/profile', profileForm);
      
      if (response.status !== 200) throw new Error(response.data.message || 'Failed to update profile.');
      setUserData(response.data);
      setIsEditing(false);
      setSuccessMessage("Profile updated successfully!");
    } catch (err) {
      console.error("Update Profile Error:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFromCart = async (bookId) => {
    const token = localStorage.getItem("usertoken");
    if (!token) return;

    try {
      await axiosInstance.delete(`/api/user/cart/${bookId}`);
      setCartItems(cartItems.filter(item => item.bookId._id !== bookId));
    } catch (err) {
      console.error("Remove from cart error:", err);
    }
  };

  const handleBuyNow = (bookId) => {
    navigate(`/checkout/${bookId}`);
  };

  const renderProfileDetails = () => (
    <Box component="form" noValidate autoComplete="off" sx={{ mt: 3 }}>
      <Typography variant="h5" sx={{ mb: 3, color: PRIMARY_COLOR }}>
        Profile Details
        <Button onClick={() => { setIsEditing(!isEditing); if (isEditing) setProfileForm(userData); }}
          sx={{ ml: 2, color: PRIMARY_COLOR }}
          startIcon={isEditing ? <SaveIcon /> : <EditIcon />}>
          {isEditing ? 'Cancel Edit' : 'Edit Profile'}
        </Button>
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}><TextField fullWidth label="Username" name="username" value={profileForm.username} onChange={handleFormChange} disabled={!isEditing} variant="outlined" /></Grid>
        <Grid item xs={12}><TextField fullWidth label="Phone Number" name="phoneno" value={profileForm.phoneno} onChange={handleFormChange} disabled={!isEditing} variant="outlined" type="tel" /></Grid>
        <Grid item xs={12}><TextField fullWidth label="Address" name="address" value={profileForm.address} onChange={handleFormChange} disabled={!isEditing} multiline rows={3} variant="outlined" /></Grid>
      </Grid>

      {isEditing && (
        <Button variant="contained" onClick={handleSaveProfile} disabled={isLoading} sx={{ mt: 4, backgroundColor: PRIMARY_COLOR, '&:hover': { backgroundColor: '#15654C' } }}>
          {isLoading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Save Changes'}
        </Button>
      )}

      <Box sx={{ mt: 4 }}>
        <Button variant="contained" sx={{ backgroundColor: PRIMARY_COLOR, '&:hover': { backgroundColor: '#15654C' } }} onClick={() => navigate('/authorsubmission')}>
          Publish a Book
        </Button>
      </Box>
    </Box>
  );

  const renderTabContent = () => {
    switch (tabValue) {
      case 0: return renderProfileDetails();
      case 1: return <OrderHistory orders={orders} loading={isLoading} error={error} />;
      case 2: return <CartDisplay cartItems={cartItems} loading={isLoading} error={error} onRemove={handleRemoveFromCart} onBuy={handleBuyNow} />;
      case 3: return <MySubmissions submissions={submissions} loading={isLoading} error={error} />;
      default: return null;
    }
  };

  if (isLoading && !error)
    return (
      <Container maxWidth="md" sx={{ mt: 8, textAlign: 'center' }}>
        <CircularProgress sx={{ color: PRIMARY_COLOR }} />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading Profile...</Typography>
      </Container>
    );

  return (
    <Container maxWidth="md" sx={{ mt: 5, mb: 10, p: 4, borderRadius: "12px", boxShadow: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ color: PRIMARY_COLOR, fontWeight: 'bold' }}>
        Welcome Back, {userData.username || 'User'}!
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}><AlertTitle>Error</AlertTitle>{error}</Alert>}
      {successMessage && <Alert severity="success" sx={{ mb: 3 }}><AlertTitle>Success</AlertTitle>{successMessage}</Alert>}

      <Paper elevation={6} sx={{ borderRadius: '16px', overflow: 'hidden', minHeight: '60vh' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', backgroundColor: "rgba(215, 218, 214, 0.86)" }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="User Profile Tabs"
            variant="fullWidth"
            TabIndicatorProps={{ style: { backgroundColor: "rgba(223, 220, 220, 0.9)" } }}
          >
            <Tab icon={<AccountCircleIcon />} label="Profile Details" sx={{ '&.Mui-selected': { color: PRIMARY_COLOR } }} />
            <Tab icon={<ShoppingBagIcon />} label="Order History" sx={{ '&.Mui-selected': { color: PRIMARY_COLOR } }} />
            <Tab icon={<ShoppingCartIcon />} label="Cart" sx={{ '&.Mui-selected': { color: PRIMARY_COLOR } }} />
            <Tab icon={<DescriptionIcon />} label="My Submissions" sx={{ '&.Mui-selected': { color: PRIMARY_COLOR } }} />
          </Tabs>
        </Box>
        <Box sx={{ p: { xs: 2, sm: 4 } }}>
          {renderTabContent()}
        </Box>
      </Paper>
    </Container>
  );
};

export default UserProfile;
