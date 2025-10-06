// import React, { useState, useEffect } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import {
//   Box, Button, TextField, Typography, CircularProgress,
//   Card, CardMedia, CardContent, MenuItem, Select, InputLabel, FormControl
// } from "@mui/material";

// const OrderPage = () => {
//   const { bookId } = useParams();
//   const navigate = useNavigate();
//   const token = localStorage.getItem("token") || localStorage.getItem("usertoken");

//   const [book, setBook] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [quantity, setQuantity] = useState(1);
//   const [address, setAddress] = useState("");
//   const [phone, setPhone] = useState("");
//   const [paymentMethod, setPaymentMethod] = useState("COD");
//   const [placingOrder, setPlacingOrder] = useState(false);

//   // Fetch book details
//   useEffect(() => {
//     const fetchBook = async () => {
//       try {
//         const res = await fetch(`http://localhost:5500/api/books/${bookId}`);
//         const data = await res.json();
//         setBook(data);
//       } catch (err) {
//         console.error("Error fetching book:", err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchBook();
//   }, [bookId]);

//   // Place order
//   const handlePlaceOrder = async () => {
//     if (!address || !phone) return alert("Please provide address and phone number");

//     if (paymentMethod === "Online") return handleOnlinePayment();

//     setPlacingOrder(true);
//     try {
//       const res = await fetch("http://localhost:5500/api/orders/place", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           items: [{ bookId: book._id, quantity }],
//           totalAmount: book.price * quantity,
//           address,
//           phone,
//           paymentMethod,
//         }),
//       });

//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || "Failed to place order");
//       alert("Order placed successfully!");
//       navigate("/profile");
//     } catch (err) {
//       console.error("Order error:", err);
//       alert(err.message);
//     } finally {
//       setPlacingOrder(false);
//     }
//   };

//   // Online Payment via Razorpay
//   const handleOnlinePayment = async () => {
//     try {
//       const res = await fetch("http://localhost:5500/api/payment/create-order", {
//         method: "POST",
//         headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
//         body: JSON.stringify({ amount: book.price * quantity, currency: "INR" }),
//       });

//       const order = await res.json();
//       if (!res.ok) throw new Error(order.message || "Failed to create order");

//       const options = {
//         key: import.meta.env.VITE_RAZORPAY_KEY_ID,
//         amount: order.amount,
//         currency: order.currency,
//         name: "READORA",
//         description: `Purchase of ${book.title}`,
//         order_id: order.id,
//         handler: async function (response) {
//           const verifyRes = await fetch("http://localhost:5500/api/payment/verify-payment", {
//             method: "POST",
//             headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
//             body: JSON.stringify({
//               ...response,
//               items: [{ bookId: book._id, quantity }],
//               totalAmount: book.price * quantity,
//               address,
//               phone,
//             }),
//           });
//           const verifyData = await verifyRes.json();
//           if (verifyData.success) {
//             alert("Payment successful!");
//             navigate("/profile");
//           } else alert("Payment verification failed.");
//         },
//         prefill: { name: "Customer", contact: phone },
//         theme: { color: "#239c78" },
//       };

//       const rzp = new window.Razorpay(options);
//       rzp.open();
//     } catch (err) {
//       console.error("Payment error:", err);
//       alert("Payment failed. Please try again.");
//     }
//   };

//   if (loading) return <CircularProgress />;
//   if (!book) return <Typography>Book not found</Typography>;

//   return (
//     <Box sx={{ maxWidth: 800, m: "20px auto", p: 2 }}>
//       <Card sx={{ display: "flex", mb: 3 }}>
//         <CardMedia component="img" sx={{ width: 200 }} image={book.imageUrl || "/placeholder.png"} alt={book.title} />
//         <CardContent>
//           <Typography variant="h5">{book.title}</Typography>
//           <Typography variant="subtitle1">{book.author}</Typography>
//           <Typography variant="body1" sx={{ mt: 1 }}>{book.description}</Typography>
//           <Typography variant="h6" sx={{ mt: 2 }}>Price: ₹{book.price}</Typography>
//         </CardContent>
//       </Card>

//       <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
//         <TextField label="Address" multiline rows={3} value={address} onChange={(e) => setAddress(e.target.value)} />
//         <TextField label="Phone Number" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
//         <TextField label="Quantity" type="number" inputProps={{ min: 1, max: book.stock }} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />

//         <FormControl>
//           <InputLabel>Payment Method</InputLabel>
//           <Select value={paymentMethod} label="Payment Method" onChange={(e) => setPaymentMethod(e.target.value)}>
//             <MenuItem value="COD">Cash on Delivery</MenuItem>
//             <MenuItem value="Online">Online Payment</MenuItem>
//           </Select>
//         </FormControl>

//         <Button
//           variant="contained"
//           disabled={placingOrder}
//           onClick={handlePlaceOrder}
//           sx={{ backgroundColor: "#239c78ff" }}
//         >
//           {placingOrder ? "Processing..." : paymentMethod === "Online" ? "Pay Now" : "Place Order"}
//         </Button>
//       </Box>
//     </Box>
//   );
// };

// export default OrderPage;

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Card,
  CardMedia,
  CardContent,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import axiosInstance from "../axiosinterceptor";

const OrderPage = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const token =
    localStorage.getItem("token") || localStorage.getItem("usertoken");

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [placingOrder, setPlacingOrder] = useState(false);

  // ✅ Fetch book details
  useEffect(() => {
    const fetchBook = async () => {
      try {
        const res = await axiosInstance.get(`/api/books/${bookId}`);
        const data = res.data;
        setBook(data);
      } catch (err) {
        console.error("Error fetching book:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [bookId]);

  // ✅ COD order
  const handlePlaceOrder = async () => {
    if (!address || !phone)
      return alert("Please provide address and phone number");

    if (paymentMethod === "Online") return handleOnlinePayment();

    setPlacingOrder(true);
    try {
      const response = await axiosInstance.post("/api/orders/place", {
        items: [{ bookId: book._id, quantity }],
        totalAmount: book.price * quantity,
        address,
        phone,
        paymentMethod,
      });

      if (response.status !== 200 && response.status !== 201) {
        throw new Error(response.data.message || "Failed to place order");
      }

      alert(" Order placed successfully!");
      navigate("/profile");
    } catch (err) {
      console.error("Order error:", err);
      alert(err.message);
    } finally {
      setPlacingOrder(false);
    }
  };

  // ✅ Online payment (Razorpay)
  const handleOnlinePayment = async () => {
    try {
      console.log("🔹 Starting online payment process...");

      const res = await axiosInstance.post("/api/payment/create-order", {
        amount: book.price * quantity,
        currency: "INR",
      });

      const order = res.data;
      if (res.status !== 200) throw new Error(order.message || "Failed to create order");

      console.log("✅ Razorpay order created:", order.id);

      let paymentVerified = false;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "READORA",
        description: `Purchase of ${book.title}`,
        order_id: order.id,
        handler: async function (response) {
          if (paymentVerified) return;
          paymentVerified = true;

          console.log("💳 Payment successful. Verifying on backend...");

          const verifyRes = await axiosInstance.post("/api/payment/verify-payment", {
            ...response,
            items: [{ bookId: book._id, quantity }],
            totalAmount: book.price * quantity,
            address,
            phone,
          });

          const verifyData = verifyRes.data;
          if (verifyData.success) {
            console.log("✅ Payment verified and order placed:", verifyData);
            alert("Payment successful!");
            navigate("/profile");
          } else {
            console.warn("❌ Payment verification failed:", verifyData);
            alert("Payment verification failed.");
          }
        },
        prefill: { name: "Customer", contact: phone },
        theme: { color: "#239c78" },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", function (response) {
        console.error("❌ Payment failed:", response.error);
        alert("Payment failed. Please try again.");
      });

      rzp.open();
    } catch (err) {
      console.error("Payment error:", err);
      alert("Payment failed. Please try again.");
    }
  };

  // ✅ Render logic
  if (loading) return <CircularProgress />;
  if (!book) return <Typography>Book not found</Typography>;

  return (
    <Box sx={{ maxWidth: 800, m: "20px auto", p: 2 }}>
      <Card sx={{ display: "flex", mb: 3 }}>
        <CardMedia
          component="img"
          sx={{ width: 200 }}
          image={book.imageUrl || "/placeholder.png"}
          alt={book.title}
        />
        <CardContent>
          <Typography variant="h5">{book.title}</Typography>
          <Typography variant="subtitle1">{book.author}</Typography>
          <Typography variant="body1" sx={{ mt: 1 }}>
            {book.description}
          </Typography>
          <Typography variant="h6" sx={{ mt: 2 }}>
            Price: ₹{book.price}
          </Typography>
        </CardContent>
      </Card>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField
          label="Address"
          multiline
          rows={3}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        <TextField
          label="Phone Number"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <TextField
          label="Quantity"
          type="number"
          inputProps={{ min: 1, max: book.stock }}
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
        />

        <FormControl>
          <InputLabel>Payment Method</InputLabel>
          <Select
            value={paymentMethod}
            label="Payment Method"
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <MenuItem value="COD">Cash on Delivery</MenuItem>
            <MenuItem value="Online">Online Payment</MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="contained"
          disabled={placingOrder}
          onClick={handlePlaceOrder}
          sx={{ backgroundColor: "#239c78ff" }}
        >
          {placingOrder
            ? "Processing..."
            : paymentMethod === "Online"
            ? "Pay Now"
            : "Place Order"}
        </Button>
      </Box>
    </Box>
  );
};

export default OrderPage;
