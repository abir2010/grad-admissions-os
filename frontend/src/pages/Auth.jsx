import { useState } from 'react';
import { GraduationCap, LogIn, UserPlus } from 'lucide-react';
import { loginUser, registerUser } from '../api/admissionsApi.js';

function Auth({ onAuthenticated }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({
    name: 'Demo Applicant',
    email: 'demo@grad-os.local',
    password: 'password123',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload =
        mode === 'login'
          ? { email: form.email, password: form.password }
          : { name: form.name, email: form.email, password: form.password };
      const user = mode === 'login' ? await loginUser(payload) : await registerUser(payload);
      localStorage.setItem('gradAdmissionsUser', JSON.stringify(user));
      onAuthenticated(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white/90 p-6 shadow-xl backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="rounded-md bg-slate-950 p-2 text-white">
            <GraduationCap size={22} />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Graduate Admissions OS</p>
            <h1 className="text-2xl font-semibold text-slate-950">
              {mode === 'login' ? 'Sign in' : 'Create account'}
            </h1>
          </div>
        </div>

        <form onSubmit={submit} className="mt-6 space-y-4">
          {mode === 'register' ? (
            <label className="space-y-1 text-sm font-medium text-slate-700">
              Name
              <input
                required
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
          ) : null}
          <label className="space-y-1 text-sm font-medium text-slate-700">
            Email
            <input
              required
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="space-y-1 text-sm font-medium text-slate-700">
            Password
            <input
              required
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
          {error ? <p className="rounded-md bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}
          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {mode === 'login' ? <LogIn size={16} /> : <UserPlus size={16} />}
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => setMode((current) => (current === 'login' ? 'register' : 'login'))}
          className="mt-4 text-sm font-semibold text-slate-600 hover:text-slate-950"
        >
          {mode === 'login' ? 'Need an account? Register' : 'Already have an account? Sign in'}
        </button>
      </section>
    </main>
  );
}

export default Auth;
