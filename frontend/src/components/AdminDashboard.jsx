import React, { useState, useEffect } from "react";
import {
  MdOutlineDashboard,
  MdLibraryBooks,
  MdOutlineShoppingCart,
  MdPendingActions,
  MdPeople,
  MdOutlineLibraryBooks,
} from "react-icons/md";
import { FaUsers } from "react-icons/fa";
import { RiUserVoiceLine, RiFileList2Line } from "react-icons/ri";
import axiosInstance from "../axiosinterceptor";
import { useNavigate } from "react-router-dom";

const themeColor = "#239c78ff";
const contentHeadingColor = "#1e8667ff";

//dashboard main component overview
const DashboardAnalysis = ({ stats, onCardClick }) => {
  const cardHoverStyle = {
    transform: "translateY(-5px)",
    boxShadow: "0 6px 15px rgba(0,0,0,0.2)",
  };

  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "rgba(208, 209, 207, 0.86)",
        borderRadius: "10px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        marginTop: "20px",
        height: "70%",
      }}
    >
      <h2 style={{ fontSize: "30px" }}>Dashboard Overview 📊</h2>
      <p style={{ color: "#6c757d" }}>
        Quick summary of key system metrics and pending actions.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "25px",
          marginTop: "20px",
        }}
      >
        {stats.map((stat, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "25px",
              borderRadius: "8px",
              boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              cursor: "pointer",
              borderLeft: `5px solid ${stat.color}`,
              backgroundColor: "#f9f9f9",
            }}
            onClick={() => onCardClick(stat.redirectPath)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = cardHoverStyle.transform;
              e.currentTarget.style.boxShadow = cardHoverStyle.boxShadow;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.boxShadow = "0 2px 5px rgba(0,0,0,0.1)";
            }}
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  fontSize: "32px",
                  fontWeight: "700",
                  color: "#333",
                  marginBottom: "5px",
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  fontSize: "14px",
                  color: "#6c757d",
                  fontWeight: "500",
                  textTransform: "uppercase",
                }}
              >
                {stat.label}
              </div>
            </div>
            <div
              style={{
                fontSize: "40px",
                borderRadius: "50%",
                padding: "10px",
                color: "#fff",
                backgroundColor: stat.color,
              }}
            >
              {stat.icon}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

//book management component
const BookManagement = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formVisible, setFormVisible] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    genre: "",
    price: "",
    stock: "",
    description: "",
    imageUrl: "",
    isFeatured: false,
  });
  const [editBookId, setEditBookId] = useState(null);
  const token = localStorage.getItem("token");

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/api/books/all");
      setBooks(res.data);
    } catch (err) {
      console.error("Failed to fetch books:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleAddBook = async () => {
    try {
      const res = await axiosInstance.post("/api/books/", formData);
      if (res.status === 201) {
        fetchBooks();
        setFormData({
          title: "",
          author: "",
          genre: "",
          price: "",
          stock: "",
          description: "",
          imageUrl: "",
          isFeatured: false,
        });
        setFormVisible(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditBook = (book) => {
    setEditBookId(book._id);
    setFormData({
      title: book.title,
      author: book.author,
      genre: book.genre,
      price: book.price,
      stock: book.stock,
      description: book.description,
      imageUrl: book.imageUrl,
      isFeatured: book.isFeatured,
    });
  };

  const handleUpdateBook = async () => {
    try {
      const res = await axiosInstance.put(`/api/books/${editBookId}`, formData);
      if (res.status === 200) {
        fetchBooks();
        setEditBookId(null);
        setFormData({
          title: "",
          author: "",
          genre: "",
          price: "",
          stock: "",
          description: "",
          imageUrl: "",
          isFeatured: false,
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteBook = async (id) => {
    try {
      const res = await axiosInstance.delete(`/api/books/${id}`);
      if (res.status === 200) fetchBooks();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "rgba(208, 209, 207, 0.86)",
        borderRadius: "10px",
        marginTop: "20px",
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
      }}
    >
      <h2 style={{ fontSize: "30px" }}>Book Management 📚</h2>
      {!formVisible && (
        <button
          onClick={() => setFormVisible(true)}
          style={{
            padding: "10px 20px",
            backgroundColor: "#2f8a5fff",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            marginBottom: "20px",
            marginLeft: "88%",
          }}
        >
          ADD BOOK
        </button>
      )}
      {/* Form */}
      {formVisible && (
        <div
          style={{
            marginBottom: "20px",
            display: "grid",
            gap: "10px",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          }}
        >
          {["title", "author", "genre", "price", "stock", "description", "imageUrl"].map(
            (field) => (
              <input
                key={field}
                name={field}
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                value={formData[field]}
                onChange={handleInputChange}
                type={field === "price" || field === "stock" ? "number" : "text"}
                style={{ padding: "8px", borderRadius: "5px", border: "1px solid #ccc" }}
              />
            )
          )}
          <label style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            Featured
            <input
              type="checkbox"
              name="isFeatured"
              checked={formData.isFeatured}
              onChange={handleInputChange}
            />
          </label>
          <button
            onClick={editBookId ? handleUpdateBook : handleAddBook}
            style={{
              padding: "10px",
              backgroundColor: editBookId ? "#00ffffff" : "#278d5aff",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            {editBookId ? "Update Book" : "Add Book"}
          </button>
        </div>
      )}
  
      {loading ? (
        <p>Loading books...</p>
      ) : (
        <table
          style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #ddd" }}
        >
          <thead style={{ backgroundColor: "#f1f1f1" }}>
            <tr>
              {["Title", "Author", "Genre", "Price", "Stock", "Featured", "Actions"].map(
                (col) => (
                  <th key={col} style={{ padding: "10px", border: "1px solid #ddd" }}>
                    {col}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {books.map((book) => (
              <tr key={book._id}>
                <td style={{ padding: "8px", border: "1px solid #ddd" }}>{book.title}</td>
                <td style={{ padding: "8px", border: "1px solid #ddd" }}>{book.author}</td>
                <td style={{ padding: "8px", border: "1px solid #ddd" }}>{book.genre}</td>
                <td style={{ padding: "8px", border: "1px solid #ddd" }}>{book.price}</td>
                <td style={{ padding: "8px", border: "1px solid #ddd" }}>{book.stock}</td>
                <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                  {book.isFeatured ? "Yes" : "No"}
                </td>
                <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                  <button
                    onClick={() => handleEditBook(book)}
                    style={{
                      marginRight: "10px",
                      width: "90px",
                      padding: "6px 12px",
                      backgroundColor: "#41a54fff",
                      color: "#fff",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer",
                      marginLeft: "35px",
                    }}
                  >
                    Edit
                  </button>
                  <br />
                  <button
                    onClick={() => handleDeleteBook(book._id)}
                    style={{
                      padding: "6px 12px",
                      backgroundColor: "#3a9ba8ff",
                      color: "#fff",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer",
                      width: "90px",
                      marginLeft: "35px",
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

//user management component
const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/admindashboard/users");
      if (res.status !== 200) throw new Error(`Failed to fetch users: ${res.status}`);
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleBlockUnblock = async (id, isBlocked) => {
    try {
      const res = await axiosInstance.put(`/api/user/block/${id}`, { block: !isBlocked });
      if (res.status === 200) fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "rgba(208, 209, 207, 0.86)",
        borderRadius: "10px",
        marginTop: "20px",
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
      }}
    >
      <h2 style={{ fontSize: "30px" }}>User Management 👥</h2>
      {loading ? (
        <p>Loading users...</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #ddd" }}>
          <thead style={{ backgroundColor: "#f1f1f1" }}>
            <tr>
              {["Username", "Phone No.", "Address", "Blocked", "Actions"].map((col) => (
                <th key={col} style={{ padding: "10px", border: "1px solid #ddd" }}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td style={{ padding: "8px", border: "1px solid #ddd" }}>{user.username}</td>
                <td style={{ padding: "8px", border: "1px solid #ddd" }}>{user.phoneno}</td>
                <td style={{ padding: "8px", border: "1px solid #ddd" }}>{user.address}</td>
                <td style={{ padding: "8px", border: "1px solid #ddd" }}>{user.isBlocked ? "Yes" : "No"}</td>
                <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                  <button
                    onClick={() => handleBlockUnblock(user._id, user.isBlocked)}
                    style={{
                      padding: "6px 12px",
                      backgroundColor: user.isBlocked ? "#28a745" : "#dc3545",
                      color: "#fff",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer",
                    }}
                  >
                    {user.isBlocked ? "Unblock" : "Block"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

//order management component
const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/api/orders/all");
      if (res.status !== 200) throw new Error("Failed to fetch orders");
      setOrders(res.data);
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await axiosInstance.put(`/api/orders/${orderId}`, { status: newStatus });
      if (res.status === 200) fetchOrders();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "rgba(215, 218, 214, 0.86)",
        borderRadius: "10px",
        marginTop: "20px",
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
      }}
    >
      <h2>Order Management 🛒</h2>
      {loading ? (
        <p>Loading orders...</p>
      ) : orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #ddd" }}>
          <thead style={{ backgroundColor: "#f1f1f1" }}>
            <tr>
              {["User", "Items", "Total Amount", "Status", "Actions"].map((col) => (
                <th key={col} style={{ padding: "10px", border: "1px solid #ddd" }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                              <td style={{ padding: "8px", border: "1px solid #ddd" }}>{order.userName}</td>
                <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                  {order.items.map((item, idx) => (
                    <div key={idx}>📖 {item.bookId?.title || "Unknown"} × {item.quantity}</div>
                  ))}
                </td>
                <td style={{ padding: "8px", border: "1px solid #ddd" }}>₹{order.totalAmount}</td>
                <td style={{ padding: "8px", border: "1px solid #ddd" }}>{order.status}</td>
                <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    style={{ padding: "6px", borderRadius: "5px", border: "1px solid #ccc" }}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

//author submission management component
const AuthorSubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/admindashboard/submissions");
      if (res.status !== 200) {
        const errText = res.data.message || 'Unknown error';
        throw new Error("Failed to fetch submissions: " + errText);
      }
      setSubmissions(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };
const handleDeleteSubmission = async (id) => {
  if (!window.confirm("Are you sure you want to delete this submission?")) return;

  try {
    const res = await axiosInstance.delete(`/admindashboard/submissions/${id}`);
    if (res.status !== 200) throw new Error("Failed to delete submission");
    setSubmissions(prev => prev.filter(sub => sub._id !== id));
    alert("Submission deleted successfully.");
  } catch (err) {
    console.error("Delete submission error:", err);
    alert("Error deleting submission");
  }
};


  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await axiosInstance.put(`/admindashboard/submissions/${id}`, { status: newStatus });
      if (res.status === 200) fetchSubmissions();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "rgba(208, 209, 207, 0.86)",
        borderRadius: "10px",
        marginTop: "20px",
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
      }}
    >
      <h2 style={{ fontSize: "30px" }}>Submission Management ✍️</h2>
      {loading ? (
        <p>Loading submissions...</p>
      ) : submissions.length === 0 ? (
        <p>No submissions found.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #ddd" }}>
          <thead style={{ backgroundColor: "#f1f1f1" }}>
            <tr>
              {["Title", "Author Name", "Synopsis","Manuscript", "Date Submitted", "Status", "Actions"].map(
                (col) => (
                  <th key={col} style={{ padding: "10px", border: "1px solid #ddd" }}>
                    {col}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {submissions.map((sub) => (
              <tr key={sub._id}>
                <td style={{ padding: "8px", border: "1px solid #ddd" }}>{sub.title}</td>
                <td style={{ padding: "8px", border: "1px solid #ddd" }}>{sub.authorName}</td>
                <td style={{ padding: "8px", border: "1px solid #ddd" }}>{sub.synopsis}</td>
                <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                  {sub.manuscriptUrl ? (
                    <a href={sub.manuscriptUrl} target="_blank" rel="noopener noreferrer">
                      📄 View Manuscript
                    </a>
                  ) : "N/A"}
                </td>

                <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                  {new Date(sub.submissionDate).toLocaleDateString()}
                </td>
                <td style={{ padding: "8px", border: "1px solid #ddd" }}>{sub.status}</td>
                <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                  <select
                    value={sub.status}
                    onChange={(e) => handleStatusChange(sub._id, e.target.value)}
                    style={{ padding: "6px", borderRadius: "5px", border: "1px solid #ccc" }}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                  <button
                    onClick={() => handleDeleteSubmission(sub._id)}
                    style={{
                      padding: "6px 12px",
                      marginTop: "5px",
                      backgroundColor: "#dc3545",
                      color: "#fff",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer",
                      display: "block"
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

//main admin dashboard
const AdminDashboard = () => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [activeTab, setActiveTab] = useState("/admin/dashboard");
  const [stats, setStats] = useState([]);
  const navigate = useNavigate()

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem("token");
      if (!token) return console.error("Admin token not found");

      try {
        const response = await axiosInstance.get("/admindashboard/dashboard/stats");
        if (response.status !== 200) return console.error(response.data.message);
        const data = response.data;
        setStats([
          {
            label: "Total Books",
            value: data.totalBooks,
            icon: <MdOutlineLibraryBooks />,
            color: themeColor,
            redirectPath: "/admin/books",
          },
          {
            label: "Active Users",
            value: data.activeUsers,
            icon: <MdPeople />,
            color: themeColor,
            redirectPath: "/admin/users",
          },
          {
            label: "Pending Orders",
            value: data.pendingOrders,
            icon: <MdPendingActions />,
            color: "#24aa8dff",
            redirectPath: "/admin/orders",
          },
          {
            label: "Submitted Manuscripts",
            value: data.submittedManuscripts,
            icon: <RiFileList2Line />,
            color: "#35c494ff",
            redirectPath: "/admin/authors",
          },
        ]);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const links = [
    { path: "/admin/dashboard", label: "Dashboard", icon: <MdOutlineDashboard />, component: () => <DashboardAnalysis stats={stats} onCardClick={setActiveTab} /> },
    { path: "/admin/books", label: "Book Management", icon: <MdLibraryBooks />, component: BookManagement },
    { path: "/admin/users", label: "User Management", icon: <FaUsers />, component: UserManagement },
    { path: "/admin/orders", label: "Order Management", icon: <MdOutlineShoppingCart />, component: OrderManagement },
    { path: "/admin/authors", label: "Author Submissions", icon: <RiUserVoiceLine />, component: AuthorSubmissions },
  ];

  const renderContent = () => {
    const activeLink = links.find((link) => link.path === activeTab);
    if (activeLink) {
      const ActiveComponent = activeLink.component;
      return <ActiveComponent />;
    }
    return <div>Select a management option from the sidebar.</div>;
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "Arial, sans-serif", fontSize: "16px", color: "#333" }}>
      <aside style={{ width: "250px", padding: "20px", backgroundColor: themeColor, display: "flex", flexDirection: "column", boxShadow: "2px 0 8px rgba(0,0,0,0.3)", color: "#fff" }}>
        <h2 style={{ marginBottom: "20px", textAlign: "center", fontSize: "25px", fontWeight: "bold" }}>READORA</h2>
        <hr style={{ border: "1px solid rgba(255,255,255,0.4)", marginBottom: "20px" }} />
        <ul style={{ padding: 0, margin: 0, listStyle: "none" }}>
          {links.map((link, index) => (
            <div
              key={index}
              onClick={() => setActiveTab(link.path)}
              style={{
                display: "flex",
                alignItems: "center",
                height: "50px",
                padding: "0 10px",
                borderRadius: "8px",
                marginBottom: "10px",
                transition: "all 0.3s ease",
                cursor: "pointer",
                backgroundColor: activeTab === link.path ? "#1a6e56" : hoveredIndex === index ? "#1f7f64" : "transparent",
              }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <span style={{ marginRight: "10px", fontSize: "20px", display: "flex", alignItems: "center" }}>{link.icon}</span>
              <span style={{ fontSize: "18px" }}>{link.label}</span>
            </div>
          ))}
        </ul>
      
        <button
          onClick={handleLogout}
          style={{
            marginTop: "auto",
            padding: "10px",
            backgroundColor: "#dc3545",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Logout
        </button>
      </aside>

      <main style={{ flexGrow: 1, padding: "20px", backgroundColor: "white" }}>
        <h1 style={{ color: contentHeadingColor, fontSize: "35px" }}>Admin Dashboard</h1>
        {renderContent()}
      </main>
    </div>
  );
};

export default AdminDashboard;


