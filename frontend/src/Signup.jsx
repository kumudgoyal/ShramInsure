import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Signup = () => {
  const [formData, setFormData] = useState({
    phone: '',
    platform_id: '',
    aadhaar_last4: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post('http://localhost:5001/api/auth/register', formData);
      alert('Registration successful! Please log in.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#f1f5f9] w-full p-4 md:p-10 font-['Outfit']">
      <div className="auth-container shadow-[0_35px_60px_-15px_rgba(0,0,0,0.1)]">
        
        {/* Left Side: Marketing/Welcome */}
        <div className="hidden lg:flex w-1/2 glass-panel flex-col items-center justify-center text-center p-16 text-white relative z-10">
          <div className="space-y-6 relative z-20">
            <h1 className="text-5xl font-bold tracking-tight">Hey There!</h1>
            <p className="text-emerald-50/80 text-xl font-light max-w-sm mx-auto leading-relaxed">
              Create your account now and save your hard-earned peak hours.
            </p>
            <div className="pt-8">
              <Link to="/login" className="px-12 py-3 bg-transparent border-2 border-white/40 rounded-full font-semibold hover:bg-white/10 transition-all">
                Sign In
              </Link>
            </div>
          </div>
          {/* Abstract circles for depth */}
          <div className="absolute top-10 right-10 w-64 h-64 bg-emerald-400/20 rounded-full blur-3xl -z-10"></div>
          <div className="absolute bottom-10 left-10 w-48 h-48 bg-teal-400/20 rounded-full blur-3xl -z-10"></div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full lg:w-1/2 p-8 md:p-16 bg-white flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            <h2 className="text-4xl font-bold text-slate-800 text-center mb-8">Sign Up</h2>
            
            {/* Social Logins */}
            <div className="flex justify-center space-x-4 mb-8">
              <button className="social-btn text-[#1877F2]">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </button>
              <button className="social-btn text-[#EA4335]">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.908 3.152-1.896 4.136-1.248 1.248-3.224 2.536-6.424 2.536-5.176 0-9.272-4.144-9.272-9.32s4.096-9.32 9.272-9.32c2.792 0 4.968 1.104 6.648 2.696l2.336-2.336C18.592 1.232 15.52 0 12.48 0 5.48 0 0 5.48 0 12.48s5.48 12.48 12.48 12.48c3.704 0 6.504-1.224 8.712-3.528 2.272-2.272 2.992-5.472 2.992-8.136 0-.792-.064-1.544-.192-2.24l-11.512.008z"/></svg>
              </button>
              <button className="social-btn text-[#C13584]">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </button>
              <button className="social-btn text-[#0077B5]">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z"/></svg>
              </button>
            </div>

            <div className="relative flex py-5 items-center">
                <div className="flex-grow border-t border-slate-100"></div>
                <span className="flex-shrink mx-4 text-slate-400 text-sm">Or use your account</span>
                <div className="flex-grow border-t border-slate-100"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-4 text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl animate-shake">
                  {error}
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-slate-500 ml-1">Mobile Number</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="premium-input"
                  placeholder="e.g. 9876543210"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-500 ml-1">Platform Worker ID</label>
                <input
                  type="text"
                  name="platform_id"
                  required
                  value={formData.platform_id}
                  onChange={handleChange}
                  className="premium-input"
                  placeholder="Your Blinkit/Zepto ID"
                />
              </div>

              <div className="pb-4">
                <label className="text-sm font-medium text-slate-500 ml-1">Aadhaar (Last 4 Digits)</label>
                <input
                  type="text"
                  name="aadhaar_last4"
                  maxLength="4"
                  value={formData.aadhaar_last4}
                  onChange={handleChange}
                  className="premium-input"
                  placeholder="Optional"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="premium-button mt-4"
              >
                {loading ? 'Creating Account...' : 'Sign Up'}
              </button>
            </form>

            <div className="mt-8 text-center lg:hidden">
              <p className="text-slate-500">
                Already have an account?{' '}
                <Link to="/login" className="font-bold text-emerald-700 hover:text-emerald-800">
                  Log In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
