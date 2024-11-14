import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

// Register required components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
    const [products, setProducts] = useState([]);

    // Fetch product data from the backend
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch('http://localhost:5000/products');
                const data = await response.json();
                setProducts(data);
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        };

        fetchProducts();
    }, []);

    const totalStock = products.reduce((total, product) => total + product.quantity, 0);
    const totalPrice = products.reduce((total, product) => total + (product.price * product.quantity), 0);

    // Prepare data for the bar chart
    const chartData = {
        labels: products.map(product => product.name),
        datasets: [{
            label: 'Product Quantity',
            data: products.map(product => product.quantity),
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
        }]
    };

    const chartOptions = {
        responsive: true,
        scales: {
            y: {
                beginAtZero: true,
            }
        }
    };

    // State to manage the current image index for the slideshow
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const images = [
        "b5.jpeg",
        "b4.jpeg",
        "b3.jpeg",
        "b2.jpeg",
        "b1.jpeg",
    ];

    // Effect to change image every 3 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex(prevIndex => (prevIndex + 1) % images.length);
        }, 3000);
        return () => clearInterval(interval); // Cleanup on component unmount
    }, [images.length]);

    return (
        <section id="dashboard" style={styles.dashboard}>
            <h2>Dashboard</h2>
           
            <h3>Product Overview</h3>
            <table style={styles.table}>
                <thead>
                    <tr>
                        <th>Product Name</th>
                        <th>Quantity</th>
                        <th>Total Value (M)</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((product, index) => (
                        <tr key={index}>
                            <td>{product.name}</td>
                            <td>{product.quantity}</td>
                            <td>{(product.price * product.quantity).toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            
            <h3>Stock Quantity Bar Chart</h3>
            <div style={styles.chartContainer}>
                <Bar data={chartData} options={chartOptions} />
            </div>

            {/* Image Carousel Section */}
            <div style={styles.imageCarousel}>
                <img 
                    src={images[currentImageIndex]} 
                    alt={`Slide ${currentImageIndex + 1}`} 
                    style={styles.image}
                />
            </div>
        </section>
    );
};

// Styles to adjust the layout
const styles = {
    dashboard: {
        padding: "20px",
        fontFamily: "Arial, sans-serif",
        maxWidth: "1200px",
        margin: "0 auto",
        zoom: "0.9",
    },
    table: {
        width: "100%",
        borderCollapse: "collapse",
        marginBottom: "20px",
        zIndex: 2,
        position: "relative",
        backgroundColor: 'rgba(255, 255, 255, 0.8)', // Add some contrast to the table
    },
    chartContainer: {
        width: "80%",  // Make the chart container smaller
        margin: "0 auto",  // Center the chart
    },
    imageCarousel: {
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        marginTop: "20px", // Space between chart and images
    },
    image: {
        width: "80%", // Adjust to your desired width
        maxWidth: "300px", // Limit max width for better display
        height: "auto", // Maintain aspect ratio
        borderRadius: "10px", // Optional: add rounded corners
    },
};

export default Dashboard;