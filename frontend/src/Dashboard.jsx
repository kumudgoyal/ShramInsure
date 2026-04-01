import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#f8fafc] w-full p-6 font-['Outfit']">
      <div className="w-full max-w-4xl p-10 space-y-8 bg-white rounded-[2rem] shadow-xl border border-slate-100">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-slate-800 tracking-tight">Active Shield</h1>
            <p className="text-slate-400 mt-2 flex items-center">
              <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
              Protection status: <span className="text-emerald-600 font-semibold ml-1">Live</span>
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-6 py-2.5 text-sm font-semibold text-slate-500 border border-slate-200 rounded-full hover:bg-slate-50 hover:text-slate-800 transition-all"
          >
            Sign Out
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 group hover:border-emerald-200 transition-all">
            <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Mobile Number</p>
            <p className="text-2xl font-bold text-slate-800 mt-2">{user.phone}</p>
          </div>
          <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 group hover:border-emerald-200 transition-all">
            <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Platform ID</p>
            <p className="text-2xl font-bold text-slate-800 mt-2">{user.platform_id}</p>
          </div>
          <div className="p-8 bg-[#2d6159] rounded-3xl text-white shadow-lg shadow-emerald-900/10">
            <p className="text-emerald-100/70 text-sm font-medium uppercase tracking-wider">Weekly Cap</p>
            <p className="text-2xl font-bold mt-2">₹700.00</p>
          </div>
        </div>

        <div className="p-12 mt-10 text-center border-2 border-dashed border-slate-100 rounded-[2.5rem] bg-slate-50/50">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.040L3 20l9 2 9-2-1.382-14.016z"></path></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800">Monitoring Active Zone</h3>
            <p className="text-slate-500 leading-relaxed">
              We are currently tracking Rainfall, AQI, and Platform Status in your delivery area. Payouts are automatic.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
