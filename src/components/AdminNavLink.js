"use server"
import { useState } from 'react';

function AdminNavLink() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleClick = async () => {
    setLoading(true);
    setError('');

    try {
      const email = process.env.GMAIL_USER; // Replace with the user's email or dynamically get it
      const response = await fetch('/api/sendOtp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        console.log('OTP sent successfully');
        // Handle successful OTP sending (e.g., show a confirmation message)
      } else {
        throw new Error(data.message || 'Failed to send OTP');
      }
    } catch (err) {
      console.error('Error sending OTP:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <a href="#" onClick={handleClick}>
        Request OTP
      </a>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
    </div>
  );
}

export default AdminNavLink;
