import React, { useEffect, useState } from 'react';
import { reviewService } from '../../services/reviewService';

const AdminReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const page = await reviewService.getPendingReviews({ page: 0, size: 50 });
      setReviews(page.content || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div>
      <h1 style={{ marginBottom: 20 }}>Review Moderation</h1>
      {loading ? <p>Loading...</p> : reviews.length === 0 ? (
        <p>No pending reviews.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {reviews.map((r) => (
            <div key={r.id} style={{ background: 'white', padding: 16, borderRadius: 8 }}>
              <strong>{r.title || 'Untitled'}</strong> — {r.rating}/5
              <p style={{ margin: '8px 0' }}>{r.body}</p>
              <small>Product: {r.productId}</small>
              <div style={{ marginTop: 10, display: 8 }}>
                <button className="btn btn-primary" onClick={async () => { await reviewService.approveReview(r.id); load(); }}>Approve</button>
                <button className="btn btn-outline" onClick={async () => { await reviewService.rejectReview(r.id); load(); }}>Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminReviewsPage;
