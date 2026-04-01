import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Login State
  const [loginPhone, setLoginPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpStep, setOtpStep] = useState(1);

  // Signup State
  const [signupData, setSignupData] = useState({
    phone: '',
    platform_id: '',
    aadhaar_last4: '',
  });

  const handleSignupChange = (e) => {
    setSignupData({ ...signupData, [e.target.name]: e.target.value });
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const resp = await axios.post('http://localhost:5001/api/auth/register', signupData);
      localStorage.setItem('token', resp.data.token);
      localStorage.setItem('user', JSON.stringify(resp.data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const resp = await axios.post('http://localhost:5001/api/auth/request-otp', { phone: loginPhone });
      alert(`MOCK OTP: ${resp.data.otp}`);
      setOtpStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'User not found.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const resp = await axios.post('http://localhost:5001/api/auth/login', { phone: loginPhone, otp });
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
    <div className="flex items-center justify-center min-h-screen w-full relative">
      
      {/* Background Mesh Layer */}
      <div className="bg-mesh">
        <div className="mesh-shape w-[500px] h-[500px] bg-teal-400 top-[-10%] left-[-10%]"></div>
        <div className="mesh-shape w-[400px] h-[400px] bg-emerald-500 bottom-[10%] right-[10%] [animation-delay:2s]"></div>
        <div className="mesh-shape w-[300px] h-[300px] bg-teal-600 top-[40%] left-[20%] [animation-delay:4s]"></div>
      </div>

      <motion.div 
        className="auth-card relative"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        
        {/* Sliding Glass Panel */}
        <motion.div 
          className="absolute top-0 bottom-0 w-1/2 z-50 overflow-hidden hidden lg:block"
          animate={{ x: isLogin ? '100%' : '0%' }}
          transition={{ type: "spring", stiffness: 80, damping: 20 }}
          style={{ left: 0 }}
        >
          <div className="glass-panel group">
            <motion.div
              key={isLogin ? 'welcome' : 'hey'}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="z-10"
            >
              <h1 className="text-4xl font-bold mb-4 tracking-tight">
                {isLogin ? 'Welcome Back!' : 'Hey There!'}
              </h1>
              <p className="text-lg text-emerald-50/70 font-medium mb-10 max-w-[280px] mx-auto leading-relaxed">
                {isLogin 
                  ? 'Login to secure your peak-hour gig earnings.' 
                  : 'Join GigShield and step into an amazing new journey.'}
              </p>
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="px-10 py-3 bg-white/10 border border-white/20 rounded-2xl font-bold hover:bg-white/20 transition-all active:scale-95"
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </motion.div>
            
            {/* Subtle inner glow for glass effect */}
            <div className="absolute inset-0 bg-white/5 opacity-50 pointer-events-none"></div>
          </div>
        </motion.div>

        {/* Forms Container */}
        <div className="flex w-full h-full relative z-10">
          
          {/* Sign In Form Area */}
          <div className={`w-full lg:w-1/2 h-full flex flex-col justify-center p-8 md:p-12 transition-all duration-500 ${!isLogin ? 'hidden lg:flex lg:opacity-0 pointer-events-none' : 'flex opacity-100'}`}>
            <div className="max-w-[320px] mx-auto w-full">
              <h2 className="text-3xl font-bold text-slate-800 text-center mb-8 tracking-tight">Sign In</h2>
              
              <div className="flex justify-center space-x-4 mb-8">
                <SocialBtn provider="google" />
                <SocialBtn provider="x" />
                <SocialBtn provider="facebook" />
              </div>

              <div className="relative mb-8 flex items-center justify-center">
                <div className="w-full border-t border-slate-100"></div>
                <span className="absolute px-3 bg-white/70 text-slate-400 text-[10px] font-bold uppercase tracking-widest">Or use phone</span>
              </div>

              <form onSubmit={otpStep === 1 ? handleRequestOtp : handleVerifyOtp} className="space-y-5">
                {error && isLogin && <ErrorAlert msg={error} />}
                
                {otpStep === 1 ? (
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase ml-1 tracking-wider">Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={loginPhone}
                      onChange={(e) => setLoginPhone(e.target.value)}
                      className="premium-input text-sm"
                      placeholder="e.g. 9876543210"
                    />
                    <button type="submit" disabled={loading} className="premium-button mt-6 text-sm">
                      {loading ? 'Sending...' : 'Get Login OTP'}
                    </button>
                  </div>
                ) : (
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase ml-1 tracking-wider">Verification Code</label>
                    <input
                      type="text"
                      maxLength="6"
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="premium-input text-center text-3xl font-extrabold tracking-[0.4em]"
                      placeholder="000000"
                    />
                    <button type="submit" disabled={loading} className="premium-button mt-6 text-sm">
                      {loading ? 'Verifying...' : 'Sign In Now'}
                    </button>
                    <button onClick={() => setOtpStep(1)} className="w-full text-[10px] mt-4 text-slate-400 hover:text-emerald-700 font-bold uppercase tracking-widest transition-colors">
                      Edit Number
                    </button>
                  </div>
                )}
              </form>
              <div className="mt-8 text-center lg:hidden">
                <button onClick={() => setIsLogin(false)} className="text-slate-500 text-sm font-medium">New? <span className="text-emerald-700 font-bold underline underline-offset-4">Sign Up</span></button>
              </div>
            </div>
          </div>

          {/* Sign Up Form Area */}
          <div className={`w-full lg:w-1/2 h-full flex flex-col justify-center p-8 md:p-12 transition-all duration-500 ${isLogin ? 'hidden lg:flex lg:opacity-0 pointer-events-none' : 'flex opacity-100'}`}>
            <div className="max-w-[320px] mx-auto w-full">
              <h2 className="text-3xl font-bold text-slate-800 text-center mb-8 tracking-tight">Sign Up</h2>
              
              <div className="flex justify-center space-x-4 mb-8">
                <SocialBtn provider="google" />
                <SocialBtn provider="x" />
                <SocialBtn provider="facebook" />
              </div>

              <div className="relative mb-8 flex items-center justify-center">
                <div className="w-full border-t border-slate-100"></div>
                <span className="absolute px-3 bg-white/70 text-slate-400 text-[10px] font-bold uppercase tracking-widest">Create security</span>
              </div>

              <form onSubmit={handleSignupSubmit} className="space-y-4">
                {error && !isLogin && <ErrorAlert msg={error} />}
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase ml-1 tracking-wider">Mobile Number</label>
                  <input type="tel" name="phone" required value={signupData.phone} onChange={handleSignupChange} className="premium-input text-sm" placeholder="9876543210" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase ml-1 tracking-wider">Platform ID</label>
                  <input type="text" name="platform_id" required value={signupData.platform_id} onChange={handleSignupChange} className="premium-input text-sm" placeholder="Blinkit/Zepto ID" />
                </div>
                <div className="pb-2">
                  <label className="text-xs font-bold text-slate-700 uppercase ml-1 tracking-wider">Aadhaar (Last 4)</label>
                  <input type="text" name="aadhaar_last4" maxLength="4" value={signupData.aadhaar_last4} onChange={handleSignupChange} className="premium-input text-sm" placeholder="Optional" />
                </div>
                <button type="submit" disabled={loading} className="premium-button text-sm mt-2">
                  {loading ? 'Processing...' : 'Register as Partner'}
                </button>
              </form>
              <div className="mt-8 text-center lg:hidden">
                <button onClick={() => setIsLogin(true)} className="text-slate-500 text-sm font-medium">Have account? <span className="text-emerald-700 font-bold underline underline-offset-4">Sign In</span></button>
              </div>
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
};

const SocialBtn = ({ provider }) => {
  const icons = {
    google: (
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
      </svg>
    ),
    x: (
      <svg className="w-4 h-4 text-slate-900" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.451-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/>
      </svg>
    ),
    facebook: (
      <svg className="w-6 h-6 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    )
  };

  return (
    <button className="social-btn group">
      {icons[provider]}
    </button>
  );
};

const ErrorAlert = ({ msg }) => (
  <div className="p-3 text-[11px] text-red-500 bg-red-50/50 border border-red-100 rounded-xl animate-pulse text-center font-bold">
    {msg}
  </div>
);

export default AuthPage;
