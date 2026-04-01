import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const resp = await axios.post('http://localhost:5001/api/auth/request-otp', { phone });
      alert(`MOCK OTP: ${resp.data.otp}`);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const resp = await axios.post('http://localhost:5001/api/auth/login', { phone, otp });
      localStorage.setItem('token', resp.data.token);
      localStorage.setItem('user', JSON.stringify(resp.data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP.');
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
            <h1 className="text-5xl font-bold tracking-tight">Welcome Back!</h1>
            <p className="text-emerald-50/80 text-xl font-light max-w-sm mx-auto leading-relaxed">
              Login and stay protected against every disruption.
            </p>
            <div className="pt-8">
              <Link to="/signup" className="px-12 py-3 bg-transparent border-2 border-white/40 rounded-full font-semibold hover:bg-white/10 transition-all">
                Sign Up
              </Link>
            </div>
          </div>
          <div className="absolute top-10 right-10 w-64 h-64 bg-emerald-400/20 rounded-full blur-3xl -z-10"></div>
          <div className="absolute bottom-10 left-10 w-48 h-48 bg-teal-400/20 rounded-full blur-3xl -z-10"></div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full lg:w-1/2 p-8 md:p-16 bg-white flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            <h2 className="text-4xl font-bold text-slate-800 text-center mb-8">Sign In</h2>
            
            {/* Social Logins */}
            <div className="flex justify-center space-x-4 mb-8">
              <button className="social-btn text-[#1877F2]">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </button>
              <button className="social-btn text-[#EA4335]">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.908 3.152-1.896 4.136-1.248 1.248-3.224 2.536-6.424 2.536-5.176 0-9.272-4.144-9.272-9.32s4.096-9.32 9.272-9.32c2.792 0 4.968 1.104 6.648 2.696l2.336-2.336C18.592 1.232 15.52 0 12.48 0 5.48 0 0 5.48 0 12.48s5.48 12.48 12.48 12.48c3.704 0 6.504-1.224 8.712-3.528 2.272-2.272 2.992-5.472 2.992-8.136 0-.792-.064-1.544-.192-2.24l-11.512.008z"/></svg>
              </button>
            </div>

            <div className="relative flex py-5 items-center">
                <div className="flex-grow border-t border-slate-100"></div>
                <span className="flex-shrink mx-4 text-slate-400 text-sm">Or use your account</span>
                <div className="flex-grow border-t border-slate-100"></div>
            </div>

            {step === 1 ? (
              <form onSubmit={handleRequestOtp} className="space-y-6">
                {error && (
                  <div className="p-4 text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl animate-shake">
                    {error}
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-slate-500 ml-1">Mobile Number</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="premium-input placeholder:text-slate-300"
                    placeholder="e.g. 9876543210"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="premium-button mt-4"
                >
                  {loading ? 'Sending OTP...' : 'Get Login OTP'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-slate-500 ml-1">6-Digit Verification Code</label>
                  <input
                    type="text"
                    maxLength="6"
                    required
                    autoFocus
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="premium-input text-center text-3xl font-bold tracking-[0.5em] focus:bg-emerald-50/10"
                    placeholder="000000"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="premium-button"
                >
                  {loading ? 'Verifying...' : 'Login Securely'}
                </button>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full text-sm font-medium text-slate-400 hover:text-emerald-700 transition-colors"
                >
                  Edit phone number
                </button>
              </form>
            )}

            <div className="mt-12 text-center lg:hidden">
              <p className="text-slate-500">
                Don't have an account?{' '}
                <Link to="/signup" className="font-bold text-emerald-700 hover:text-emerald-800">
                  Join Now
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
