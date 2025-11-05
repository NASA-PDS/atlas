import React, { useEffect, useState } from 'react'
import ImageIcon from '@mui/icons-material/Image'
import light from '../../themes/light'

function getFullImagePath(path = "") {
    try {
        const BaseUrl = process.env.REACT_APP_S3_BUCKET_LOCATION;
        
        // Check if BaseUrl is not empty or null
        if (!BaseUrl || typeof BaseUrl !== 'string') {
            throw new Error("Base URL is invalid");
        }

        // Remove trailing slash from BaseUrl if present
        const cleanBaseUrl = BaseUrl.replace(/\/$/, '');

        // Check if path is empty or null
        if (!path || typeof path !== 'string') {
            throw new Error("Path is invalid");
        }

        // Return concatenated URL
        return cleanBaseUrl + (path.startsWith('/') ? path : '/' + path);
    } catch (error) {
        // Handle the error gracefully
        return "";
    }
}

const BrowseImage = ({ src, addBaseUrl = false, alt, className, style, ...rest }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleLoad = () => {
    setLoading(false);
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
  };

  // Dynamically manage image path with base URL if required
  src = addBaseUrl ? getFullImagePath(src) : src;

  return (
    !error
      ? <img
          /*src={error ? "https://placehold.co/600x400?text=Image\n+not+Found" : loading ? "https://placehold.co/600x400?text=loading..." : src}*/ /* if we want to serve different images based on state */
          src={src}
          alt={error ? 'Error' : alt}
          className={className}
          style={style}
          onLoad={handleLoad}
          onError={handleError}
          {...rest}
        />
      : <div style={{width: 32, height: 32, padding: 5.5, color: light.palette.accent.main}}><ImageIcon style={{display: 'block'}} /></div>
  );

};

export default BrowseImage;