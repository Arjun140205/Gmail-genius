import React, { useState, useEffect } from 'react';

const ProfileImage = ({ src, alt = 'Profile' }) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [error, setError] = useState(false);
  const cacheKey = `profile-image-${src}`;
  const cacheDuration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  useEffect(() => {
    const checkCachedImage = () => {
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          const now = Date.now();
          
          // Check if cache is still valid (within 24 hours)
          if (now - timestamp < cacheDuration) {
            setImageSrc(data);
            return true;
          } else {
            // Clear expired cache
            localStorage.removeItem(cacheKey);
          }
        }
        return false;
      } catch (e) {
        console.warn('Error reading from cache:', e);
        return false;
      }
    };

    const fetchAndCacheImage = async () => {
      try {
        // Check if we've recently had a rate limit error
        const rateLimitKey = 'profile-image-rate-limit';
        const rateLimitData = localStorage.getItem(rateLimitKey);
        
        if (rateLimitData) {
          const { timestamp } = JSON.parse(rateLimitData);
          const now = Date.now();
          
          // If we hit rate limit in last 5 minutes, don't try again
          if (now - timestamp < 5 * 60 * 1000) {
            setError(true);
            return;
          }
        }

        const response = await fetch(src, {
          headers: {
            'Cache-Control': 'max-age=86400', // Tell browser to cache for 24 hours
          },
        });

        if (!response.ok) {
          if (response.status === 429) {
            // Store rate limit timestamp
            localStorage.setItem(rateLimitKey, JSON.stringify({ timestamp: Date.now() }));
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        
        // Cache the image data and timestamp
        localStorage.setItem(cacheKey, JSON.stringify({
          data: objectUrl,
          timestamp: Date.now()
        }));
        
        setImageSrc(objectUrl);
      } catch (error) {
        console.error('Error loading profile image:', error);
        setError(true);
      }
    };

    // Try to load from cache first
    if (!checkCachedImage()) {
      fetchAndCacheImage();
    }

    return () => {
      if (imageSrc && imageSrc.startsWith('blob:')) {
        URL.revokeObjectURL(imageSrc);
      }
    };
  }, [src, cacheKey]);

  const getUserInitials = () => {
    if (!alt || alt === 'Profile') return '?';
    return alt.split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (error || !imageSrc) {
    return (
      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium">
        <span className="text-sm">{getUserInitials()}</span>
      </div>
    );
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      className="w-10 h-10 rounded-full object-cover"
      onError={() => setError(true)}
    />
  );
};

export default ProfileImage;
