import { useState } from "react";
import { useNavigate } from "react-router-dom";

function LoginPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "", otp: "" });
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");

  const ADMIN_ID = "12345";
  const ADMIN_PASS = "shourya-mishra";

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleOtpSend = () => {
    if (!form.email || !form.password) {
      setError("Please enter email and password before sending OTP.");
      return;
    }
    setOtpSent(true);
    setError("");
    alert("Mock OTP sent to your email (123456)");
  };

  const handleOtpVerify = () => {
    if (form.otp === "123456") {
      navigate("/employee-dashboard");
    } else {
      setError("Invalid OTP. Please try again.");
    }
  };

  const handleAdminLogin = () => {
    if (form.email === ADMIN_ID && form.password === ADMIN_PASS) {
      navigate("/admin-dashboard");
    } else {
      setError("Invalid admin credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-6">
      <div className="max-w-md w-full rounded-2xl border border-gray-800 bg-zinc-950 shadow-2xl p-8 space-y-6">
        <h2 className="text-3xl font-semibold text-center text-emerald-400">
          ScaleShield Access Portal
        </h2>
        <p className="text-center text-gray-400 text-sm">
          Real-Time Security Monitoring Platform
        </p>

        {/* Role Selector */}
        <div>
          <label className="block text-sm text-gray-400 mb-2">Select Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full rounded-md border border-gray-700 bg-zinc-900 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">-- Choose Role --</option>
            <option value="employee">Employee</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* Employee Login */}
        {role === "employee" && (
          <div className="space-y-4 mt-4">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-700 bg-zinc-900 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-700 bg-zinc-900 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-700 bg-zinc-900 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />

            {!otpSent ? (
              <button
                onClick={handleOtpSend}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 rounded-md text-white font-medium transition"
              >
                Send OTP
              </button>
            ) : (
              <>
                <input
                  type="text"
                  name="otp"
                  placeholder="Enter OTP"
                  value={form.otp}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-700 bg-zinc-900 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleOtpVerify}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-medium transition"
                >
                  Verify OTP
                </button>
              </>
            )}

            <button
              className="w-full py-2 bg-red-600 hover:bg-red-700 rounded-md text-white font-medium transition"
              onClick={() => alert("Google Login Coming Soon!")}
            >
              Login with Google
            </button>
          </div>
        )}

        {/* Admin Login */}
        {role === "admin" && (
          <div className="space-y-4 mt-4">
            <input
              type="text"
              name="email"
              placeholder="Admin ID"
              value={form.email}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-700 bg-zinc-900 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <input
              type="password"
              name="password"
              placeholder="Admin Password"
              value={form.password}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-700 bg-zinc-900 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button
              onClick={handleAdminLogin}
              className="w-full py-2 bg-amber-600 hover:bg-amber-700 rounded-md text-white font-medium transition"
            >
              Login as Admin
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="text-red-500 text-sm text-center mt-2">{error}</p>
        )}
      </div>
    </div>
  );
}

export default LoginPage;
