// frontend/src/components/articles/LikeButton.js
import React, { useState, useEffect, useContext } from 'react';
import { BsHeart, BsHeartFill } from 'react-icons/bs';
import { Button } from 'react-bootstrap';
import { useLikes } from '../../hooks/api/useLikes';
import AuthContext from '../../contexts/AuthContext';
import './LikeButton.scss';

const LikeButton = ({ articleId, initialLikeCount = 0, initialIsLiked = false, onLikeChange, size = 'md' }) => {
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isAnimating, setIsAnimating] = useState(false);
  const { toggleLike, loading } = useLikes();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    setLikeCount(initialLikeCount);
    setIsLiked(initialIsLiked);
  }, [initialLikeCount, initialIsLiked]);

  const handleLikeClick = async () => {
    if (!user) {
      // Could show a modal or redirect to login
      alert('Please log in to like articles');
      return;
    }

    // Optimistic update
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    setIsAnimating(true);

    const result = await toggleLike(articleId);
    
    if (result.success) {
      // Update with server response
      setIsLiked(result.liked);
      setLikeCount(result.likeCount);
      
      // Call parent callback if provided
      if (onLikeChange) {
        onLikeChange({ liked: result.liked, likeCount: result.likeCount });
      }
    } else {
      // Revert on error
      setIsLiked(!isLiked);
      setLikeCount(isLiked ? likeCount + 1 : likeCount - 1);
    }

    // Remove animation class
    setTimeout(() => setIsAnimating(false), 300);
  };

  const sizeClasses = {
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg'
  };

  const iconSize = {
    sm: 14,
    md: 18,
    lg: 24
  };

  return (
    <Button
      variant={isLiked ? 'danger' : 'outline-danger'}
      size={size}
      className={`like-button d-flex align-items-center gap-1 ${sizeClasses[size]} ${isAnimating ? 'like-animating' : ''}`}
      onClick={handleLikeClick}
      disabled={loading}
      aria-label={isLiked ? 'Unlike article' : 'Like article'}
    >
      {isLiked ? (
        <BsHeartFill size={iconSize[size]} />
      ) : (
        <BsHeart size={iconSize[size]} />
      )}
      <span className="like-count">{likeCount}</span>
    </Button>
  );
};

export default LikeButton;