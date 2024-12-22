const express = require('express');
const bodyParser = require('body-parser');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase configuration
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const app = express();
app.use(bodyParser.json());

app.post('/signup', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
    }

    try {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) {
            return res.status(400).json({ error: error.message });
        }
        res.status(200).json({ message: 'Sign up successful!', data });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error.', details: err.message });
    }
});

app.post('/signin', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
    }

    try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            return res.status(400).json({ error: error.message });
        }
        res.status(200).json({ message: 'Sign in successful!', data });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error.', details: err.message });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
