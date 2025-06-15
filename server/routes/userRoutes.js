import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();

router.get('/profile-image', async (req, res) => {
    if (!req.user || !req.user.photos || !req.user.photos[0]) {
        return res.status(404).send('No profile image available');
    }

    try {
        const imageUrl = req.user.photos[0].value;
        const response = await fetch(imageUrl);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.status}`);
        }

        // Forward the content type header
        res.set('Content-Type', response.headers.get('content-type'));
        res.set('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
        
        // Pipe the image data directly to the response
        response.body.pipe(res);
    } catch (error) {
        console.error('Error serving profile image:', error);
        res.status(500).send('Error serving profile image');
    }
});

// Get current user info
router.get('/me', (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
    }

    // Send user info without exposing sensitive data
    const userInfo = {
        id: req.user.id,
        displayName: req.user.displayName,
        email: req.user.emails?.[0]?.value,
        profileUrl: '/api/user/profile-image' // Use our local endpoint instead of Google's URL
    };

    res.json(userInfo);
});

export default router;
