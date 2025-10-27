import React, { useState, useEffect } from 'react';
import { Star, Edit2, Trash2 } from 'lucide-react';
import ReviewStars from './ReviewStars';
import axios from 'axios';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/useAuthStore';

const ReviewsList = ({ userId, reviewType = null }) => {
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState({ averageRating: 0, totalReviews: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    loadReviews();
  }, [userId, reviewType, page]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const url = `${import.meta.env.VITE_API_URL}/reviews/user/${userId}`;
      const params = { page, limit: 10 };
      if (reviewType) params.reviewType = reviewType;

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });

      const { reviews: newReviews, pagination, summary: summaryData } = response.data;

      if (page === 1) {
        setReviews(newReviews);
      } else {
        setReviews(prev => [...prev, ...newReviews]);
      }

      setSummary(summaryData);
      setHasMore(pagination.page < pagination.totalPages);
    } catch (error) {
      console.error('Failed to load reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/reviews/${reviewId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Review deleted successfully');
      setReviews(prev => prev.filter(r => r.id !== reviewId));
      setSummary(prev => ({
        ...prev,
        totalReviews: prev.totalReviews - 1
      }));
    } catch (error) {
      console.error('Failed to delete review:', error);
      toast.error('Failed to delete review');
    }
  };

  if (loading && page === 1) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Overall Rating
            </h3>
            <ReviewStars rating={summary.averageRating} size={24} />
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-gray-900">
              {summary.averageRating.toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">
              {summary.totalReviews} {summary.totalReviews === 1 ? 'review' : 'reviews'}
            </div>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Star className="mx-auto mb-2 text-gray-400" size={48} />
            <p>No reviews yet</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {review.reviewer?.username?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {review.reviewer?.username || 'Anonymous'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                {/* Actions for own reviews */}
                {user?.id === review.reviewerId && (
                  <button
                    onClick={() => handleDelete(review.id)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                    title="Delete review"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>

              <ReviewStars rating={review.rating} size={16} />

              {review.comment && (
                <p className="mt-3 text-gray-700 leading-relaxed">
                  {review.comment}
                </p>
              )}

              {review.isVerified && (
                <div className="mt-2 inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  ✓ Verified Review
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Load More */}
      {hasMore && !loading && (
        <button
          onClick={() => setPage(prev => prev + 1)}
          className="w-full py-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          Load More Reviews
        </button>
      )}

      {loading && page > 1 && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
};

export default ReviewsList;
