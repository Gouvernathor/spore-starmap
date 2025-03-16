import express from 'express';
const app = express();
const PORT = 4200;

import path from 'path';

app.use(express.static(path.join(import.meta.dirname, 'public')));

// Redirect root route
app.get('/', (req, res) => {
    res.redirect('/starmap');
});

// Serve client on /starmap
app.get('/starmap', (req, res) => {
    res.sendFile(path.join(import.meta.dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
