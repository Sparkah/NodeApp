require('dotenv').config();

const express = require("express");
const httpProxy = require('http-proxy');
const proxy = httpProxy.createProxyServer({});
const PORT = process.env.PORT || 3001;

const app = express();

//app.use(express.json());  // Ensure JSON request bodies are parsed

// Log all incoming requests
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

app.get("/api", (req, res) => {
    res.json({ message: "Hello from server!" });
    console.log('Handled /api request');
});

// Middleware for proxying to motchi process
app.use((req, res, next) => {
    if (req.url.startsWith('/get-user-data/')) {
        console.log(`Proxying GET request to motchi process: ${req.url}`);
        proxy.web(req, res, { target: 'http://localhost:5000' }, (error) => {
            if (error) {
                console.error('Proxy error:', error);
                res.status(500).send('Proxy Error');
            } else {
                console.log('Proxying successful for:', req.url);
            }
        });
    } else if (req.url.startsWith('/update-user-data')) {
        console.log(`Proxying POST request to motchi process: ${req.url}`);
        console.log('Request Body:', req.body); // Add logging here to inspect the request body

        proxy.web(req, res, { target: 'http://localhost:5000', timeout: 5000 }, (error) => {
            if (error) {
                console.error('Proxy error:', error);
                res.status(500).send('Proxy Error');
            } else {
                console.log('Proxying successful for:', req.url);
            }
        });        
    } else {
        console.log(`Something else ${req.url}`);
        next(); // Continue to other routes handled by index
    }
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});
