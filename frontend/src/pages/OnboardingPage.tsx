import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useApp } from '../context/AppContext';
import type { ApiError } from '../types/api';

function toList(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function OnboardingPage() {
  const navigate = useNavigate();
  const { setSession } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    tenth_marks: '',
    twelfth_marks: '',
    entrance_exam: 'EAMCET',
    entrance_rank: '',
    budget: '',
    preferred_cities: 'Hyderabad',
    interests: 'AI, Machine Learning',
    generate_roadmap: true,
  });

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.onboard({
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        location: form.location || undefined,
        tenth_marks: form.tenth_marks ? Number(form.tenth_marks) : undefined,
        twelfth_marks: form.twelfth_marks ? Number(form.twelfth_marks) : undefined,
        entrance_exam: form.entrance_exam || undefined,
        entrance_rank: form.entrance_rank ? Number(form.entrance_rank) : undefined,
        budget: form.budget ? Number(form.budget) : undefined,
        preferred_cities: toList(form.preferred_cities),
        interests: toList(form.interests),
        generate_roadmap: form.generate_roadmap,
      });

      setSession({
        userId: response.user.id,
        userName: response.user.name,
        userEmail: response.user.email,
      });

      setSuccess('Profile created successfully. You can continue to assessment.');
      navigate('/assessment');
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold">Onboarding</h2>
        <p className="text-sm text-slate-600">
          Enter your details to create a profile in the FastAPI backend. We’ll auto-generate a roadmap if you keep it enabled.
        </p>
      </div>

      {error ? <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}
      {success ? <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">{success}</div> : null}

      <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
        {[
          ['Name', 'name', 'Full name as it should appear'],
          ['Email', 'email', 'We’ll use this to look you up later'],
          ['Phone', 'phone', 'Optional contact number'],
          ['Location', 'location', 'City or town'],
          ['10th Marks %', 'tenth_marks', 'Numeric e.g. 92'],
          ['12th Marks %', 'twelfth_marks', 'Numeric e.g. 88'],
          ['Entrance Exam', 'entrance_exam', 'Default is EAMCET'],
          ['Entrance Rank', 'entrance_rank', 'Numeric rank'],
          ['Budget (lakhs)', 'budget', 'Approximate fee budget'],
          ['Preferred Cities (comma separated)', 'preferred_cities', 'e.g. Hyderabad, Vijayawada'],
          ['Interests (comma separated)', 'interests', 'e.g. AI, Machine Learning'],
        ].map(([label, key, helper]) => (
          <label key={key} className="flex flex-col gap-1 text-sm">
            <div className="flex items-center justify-between">
              <span className="font-medium text-slate-800">
                {label} {(key === 'name' || key === 'email') && <span className="text-red-500">*</span>}
              </span>
              {helper ? <span className="text-[12px] text-slate-500">{helper}</span> : null}
            </div>
            <input
              type={key?.includes('marks') || key === 'budget' || key === 'entrance_rank' ? 'number' : 'text'}
              required={key === 'name' || key === 'email'}
              className="rounded-md border px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
              value={form[key as keyof typeof form]}
              onChange={(event) => setForm((prev) => ({ ...prev, [key]: event.target.value }))}
            />
          </label>
        ))}

        <div className="flex flex-col gap-2 rounded-lg border bg-slate-50 p-3 text-sm md:col-span-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.generate_roadmap}
              onChange={(event) => setForm((prev) => ({ ...prev, generate_roadmap: event.target.checked }))}
            />
            <span className="font-medium text-slate-800">Auto-generate roadmap after onboarding</span>
          </label>
          <p className="text-slate-600">
            When enabled, the backend will queue roadmap creation right after your profile is saved.
          </p>
        </div>

        <div className="md:col-span-2 flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm disabled:opacity-60"
          >
            {loading ? 'Creating user...' : 'Create user and continue to assessment'}
          </button>
          <p className="text-sm text-slate-600">We save to PostgreSQL and return your user ID for next steps.</p>
        </div>
      </form>
    </div>
  );
}
