// const express=require('express')
// const session = require('express-session');
// const app=express();
// require('dotenv').config() 
// const port=process.env.PORT 
// const jwt=require('jsonwebtoken')
// const paymentRoute = require('./Routes/paymentRoute');
// const mongoose = require('mongoose');
// const { authAdmin } = require('./middleware/auth');
// // app.use(cors())
// app.use(
//   cors({
//     origin: "http://localhost:5173", 
//     credentials: true,                
//   })
// );
// app.use(express.json())
// app.use(express.urlencoded({extended:true}))
// app.use('/api/payment', paymentRoute);

// app.use(
//   session({
//     secret: 'your_secret_key',
//     resave: false,
//     saveUninitialized: true,
//     cookie: {
//       maxAge: 5 * 60 * 1000,
//       httpOnly: true,
//       secure: false,       
//       sameSite: 'lax',    
//     },
//   })
// );

// const userRoute=require('./Routes/userRoute')
// const adminRoute=require('./Routes/adminRoute')
// const adminRoutes=require('./Routes/dashboardApiRoute') 
// const bookRoute = require('./Routes/bookRoute');

// const orderRoute = require('./Routes/orderRoute');

// const userModel=require('./Models/userModel')
// const adminModel=require('./Models/adminModel')
// const orderModel=require('./Models/orderModel')
// const bookModel=require('./Models/bookModel')
// const submissionModel=require('./Models/submissionModel')

// const submissionRoute = require('./Routes/submissionRoute');
// app.use('/submission', submissionRoute);
// const path = require('path');
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// const connectDB=require('./connection')
// connectDB(); 
// const cartRoute = require('./Routes/cartRoute');
// app.use('/user/cart', cartRoute);

// app.use('/user',userRoute)
// app.use('/admin',adminRoute)
// app.use('/api/books', bookRoute);
// app.use('/api/orders', orderRoute);

// app.use('/admindashboard', authAdmin, adminRoutes); 


// app.listen(port,()=>{
//     console.log(`app listening at ${port}`)
// })


const express = require('express');
const session = require('express-session');
const cors = require('cors'); 
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const { authAdmin } = require('./middleware/auth');
const paymentRoute = require('./Routes/paymentRoute');
const userRoute = require('./Routes/userRoute');
const adminRoute = require('./Routes/adminRoute');
const adminRoutes = require('./Routes/dashboardApiRoute');
const bookRoute = require('./Routes/bookRoute');
const orderRoute = require('./Routes/orderRoute');
const submissionRoute = require('./Routes/submissionRoute');
const cartRoute = require('./Routes/cartRoute');

const connectDB = require('./connection');
const path = require('path');

connectDB();


app.use(
  cors({
    origin: "http://localhost:5173",  
    credentials: true,                
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(
  session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 5 * 60 * 1000,
      httpOnly: true,
      secure: false,      
      sameSite: 'lax',
    },
  })
);


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/payment', paymentRoute);
app.use('/api/submission', submissionRoute);
app.use('/api/user/cart', cartRoute);
app.use('/api/user', userRoute);
app.use('/admin', adminRoute);
app.use('/api/books', bookRoute);
app.use('/api/orders', orderRoute);
app.use('/admindashboard', authAdmin, adminRoutes);


app.listen(PORT, () => {
  console.log(` Server running at http://localhost:${PORT}`);
});
