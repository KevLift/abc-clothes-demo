import React, { useEffect, useState } from 'react';
import { reviewService } from '../../services/reviewService';
import StarRating from '../../components/Product/StarRating';

const AdminReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const page = await reviewService.getPendingReviews({ page: 0, size: 50 });
      setReviews(page.content || []);
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const act = async (id, fn) => {
    setBusyId(id);
    try {
      await fn(id);
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    } finally {
      setBusyId(null);
    }
  };

  const fmtDate = (d) => {
    try {
      return new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    } catch { return ''; }
  };

  return (
    <div>
      <h1 style={{ marginBottom: 6 }}>Review Moderation</h1>
      <p style={{ color: '#666', marginBottom: 20, fontSize: 14 }}>
        Approved reviews appear on the product page. Pending reviews are only visible to their author.
      </p>

      {loading ? (
        <p>Loading…</p>
      ) : reviews.length === 0 ? (
        <p style={{ color: '#888' }}>No pending reviews.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {reviews.map((r) => (
            <div key={r.id} style={{ background: 'white', padding: 16, borderRadius: 8, border: '1px solid #eee' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                <StarRating value={r.rating} size={14} color="#e6a817" />
                <strong>{r.title || 'Untitled'}</strong>
                {r.createdAt && <span style={{ fontSize: 12, color: '#888' }}>· {fmtDate(r.createdAt)}</span>}
              </div>
              <p style={{ margin: '8px 0', color: '#333', lineHeight: 1.6 }}>{r.body}</p>
              <div style={{ fontSize: 12, color: '#999', marginBottom: 12, wordBreak: 'break-all' }}>
                Product: {r.productId} · User: {r.userId}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className="btn btn-primary"
                  disabled={busyId === r.id}
                  onClick={() => act(r.id, reviewService.approveReview)}
                >
                  {busyId === r.id ? '…' : 'Approve'}
                </button>
                <button
                  className="btn btn-outline"
                  disabled={busyId === r.id}
                  onClick={() => act(r.id, reviewService.rejectReview)}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminReviewsPage;
