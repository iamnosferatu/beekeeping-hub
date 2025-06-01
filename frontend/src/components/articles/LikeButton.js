// frontend/src/components/articles/LikeButton.js
import React, { useState, useEffect, useContext } from 'react';
import { BsHeart, BsHeartFill } from 'react-icons/bs';
import { Button } from 'react-bootstrap';
import { useToggleArticleLike } from '../../hooks/queries/useArticles';
import AuthContext from '../../contexts/AuthContext';
import ErrorAlert from '../common/ErrorAlert';
import './LikeButton.scss';

const LikeButton = ({ articleId, initialLikeCount = 0, initialIsLiked = false, onLikeChange, size = 'md' }) => {
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isAnimating, setIsAnimating] = useState(false);
  const [loginError, setLoginError] = useState(null);
  const toggleLikeMutation = useToggleArticleLike();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    setLikeCount(initialLikeCount);
    setIsLiked(initialIsLiked);
  }, [initialLikeCount, initialIsLiked]);

  const handleLikeClick = async () => {
    if (!user) {
      setLoginError('Please log in to like articles');
      return;
    }

    setLoginError(null);
    setIsAnimating(true);

    // React Query handles optimistic updates automatically
    toggleLikeMutation.mutate(
      { articleId, isLiked },
      {
        onSuccess: (data) => {
          // Update local state with server response
          setIsLiked(data.isLiked);
          setLikeCount(data.likesCount);
          
          // Call parent callback if provided
          if (onLikeChange) {
            onLikeChange({ liked: data.isLiked, likeCount: data.likesCount });
          }
        },
        onError: (error) => {
          setLoginError(error.message || 'Failed to update like');
        },
        onSettled: () => {
          // Remove animation class
          setTimeout(() => setIsAnimating(false), 300);
        },
      }
    );
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
    <div>
      <Button
        variant={isLiked ? 'danger' : 'outline-danger'}
        size={size}
        className={`like-button d-flex align-items-center gap-1 ${sizeClasses[size]} ${isAnimating ? 'like-animating' : ''}`}
        onClick={handleLikeClick}
        disabled={toggleLikeMutation.isPending}
        aria-label={isLiked ? 'Unlike article' : 'Like article'}
      >
        {isLiked ? (
          <BsHeartFill size={iconSize[size]} />
        ) : (
          <BsHeart size={iconSize[size]} />
        )}
        <span className="like-count">{likeCount}</span>
      </Button>
      
      <ErrorAlert 
        error={loginError}
        variant="info"
        onDismiss={() => setLoginError(null)}
        className="mt-2"
        showIcon={false}
      />
    </div>
  );
};

export default LikeButton;