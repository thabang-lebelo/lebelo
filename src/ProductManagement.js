import React, { useState, useEffect } from "react";
import './ProductManagement.css';

const ProductManagement = ({ updateProducts }) => {
    const [products, setProducts] = useState([]);
    const [productName, setProductName] = useState('');
    const [productDescription, setProductDescription] = useState('');
    const [productPrice, setProductPrice] = useState('');
    const [productQuantity, setProductQuantity] = useState('');
    const [productCategory, setProductCategory] = useState('');
    const [editProductId, setEditProductId] = useState(null);
    const [sellQuantity, setSellQuantity] = useState(1);
    const [transactions, setTransactions] = useState([]); // New state for transactions

    const fetchProducts = () => {
        fetch('http://localhost:5000/products')
            .then(response => response.json())
            .then(data => {
                setProducts(data);
                updateProducts(data);
            })
            .catch(error => console.error('Error fetching products:', error));
    };

    const addProduct = (e) => {
        e.preventDefault();
        const newProduct = {
            name: productName,
            description: productDescription,
            price: parseFloat(productPrice),
            quantity: parseInt(productQuantity),
            category: productCategory
        };

        fetch('http://localhost:5000/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newProduct),
        })
        .then(() => {
            clearFields();
            fetchProducts();
        })
        .catch(error => console.error('Error adding product:', error));
    };

    const updateProduct = (e) => {
        e.preventDefault();
        const updatedProduct = {
            name: productName,
            description: productDescription,
            price: parseFloat(productPrice),
            quantity: parseInt(productQuantity),
            category: productCategory
        };

        fetch(`http://localhost:5000/products/${editProductId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedProduct),
        })
        .then(() => {
            clearFields();
            fetchProducts();
        })
        .catch(error => console.error('Error updating product:', error));
    };

    const deleteProduct = (id) => {
        fetch(`http://localhost:5000/products/${id}`, {
            method: 'DELETE'
        })
        .then(() => {
            fetchProducts();
        })
        .catch(error => console.error('Error deleting product:', error));
    };

    const sellProduct = (productId, currentQuantity) => {
        const quantityToSell = parseInt(sellQuantity);
        
        if (quantityToSell > currentQuantity || quantityToSell <= 0) {
            alert('Invalid quantity to sell.');
            return;
        }

        fetch(`http://localhost:5000/products/${productId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ quantity: currentQuantity - quantityToSell })
        })
        .then(() => {
            setProducts(prevProducts => 
                prevProducts.map(product => 
                    product.id === productId 
                    ? { ...product, quantity: product.quantity - quantityToSell } 
                    : product
                )
            );
            
            // Log the transaction
            const transaction = {
                productId,
                quantity: quantityToSell,
                timestamp: new Date().toLocaleString()
            };
            setTransactions(prevTransactions => [...prevTransactions, transaction]);

            setSellQuantity(1);
            alert(`Successfully sold ${quantityToSell} of product id ${productId}.`);
        })
        .catch(error => console.error('Error selling product:', error));
    };

    const clearFields = () => {
        setProductName('');
        setProductDescription('');
        setProductPrice('');
        setProductQuantity('');
        setProductCategory('');
        setEditProductId(null); 
    };

    const handleEdit = (product) => {
        setProductName(product.name);
        setProductDescription(product.description);
        setProductPrice(product.price);
        setProductQuantity(product.quantity);
        setProductCategory(product.category);
        setEditProductId(product.id);
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    return (
        <div>
            <h2>Product Management</h2>
            <form onSubmit={editProductId ? updateProduct : addProduct}>
                <input 
                    value={productName} 
                    onChange={e => setProductName(e.target.value)} 
                    placeholder="Product Name" 
                    required 
                />
                <input 
                    value={productDescription} 
                    onChange={e => setProductDescription(e.target.value)} 
                    placeholder="Description" 
                    required 
                />
                <input 
                    value={productPrice} 
                    onChange={e => setProductPrice(e.target.value)} 
                    placeholder="Price" 
                    required 
                    type="number" 
                />
                <input 
                    value={productQuantity} 
                    onChange={e => setProductQuantity(e.target.value)} 
                    placeholder="Quantity" 
                    required 
                    type="number" 
                />
                <input 
                    value={productCategory} 
                    onChange={e => setProductCategory(e.target.value)} 
                    placeholder="Category" 
                    required 
                />
                <button type="submit">{editProductId ? "Update Product" : "Add Product"}</button>
                <button type="button" onClick={clearFields}>Clear</button>
            </form>

            <h3>Available Products</h3>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Category</th>
                        <th>Actions</th>
                        <th>Sell</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map(product => (
                        <tr key={product.id}>
                            <td>{product.name}</td>
                            <td>{product.description}</td>
                            <td>{product.price}</td>
                            <td>{product.quantity}</td>
                            <td>{product.category}</td>
                            <td>
                                <button onClick={() => handleEdit(product)}>Edit</button>
                                <button onClick={() => deleteProduct(product.id)}>Delete</button>
                            </td>
                            <td>
                                <input 
                                    type="number"
                                    min="1"
                                    value={sellQuantity}
                                    onChange={e => setSellQuantity(e.target.value)}
                                />
                                <button 
                                    onClick={() => sellProduct(product.id, product.quantity)}
                                >
                                    Sell
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <h3>Transaction List</h3>
            <table>
                <thead>
                    <tr>
                        <th>Product Name</th>
                        <th>Quantity Sold</th>
                        <th>Timestamp</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.map((transaction, index) => (
                        <tr key={index}>
                            <td>{transaction.productId}</td>
                            <td>{transaction.quantity}</td>
                            <td>{transaction.timestamp}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ProductManagement;