import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useApp } from '../context/AppContext';
import type { ApiError, AssessmentQuestion } from '../types/api';

const options: Array<'agree' | 'neutral' | 'disagree'> = ['agree', 'neutral', 'disagree'];

export function AssessmentPage() {
  const navigate = useNavigate();
  const { session } = useApp();
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<number, 'agree' | 'neutral' | 'disagree'>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const response = await api.getAssessmentQuestions();
        setQuestions(response.questions);
      } catch (err) {
        setError((err as ApiError).message);
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  const allAnswered = useMemo(() => questions.length > 0 && questions.every((q) => Boolean(answers[q.id])), [answers, questions]);
  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);

  if (!session.userId) {
    return (
      <div className="rounded-lg border border-dashed bg-slate-50 p-4">
        <p className="text-sm font-semibold text-slate-900">No user session detected.</p>
        <p className="text-sm text-slate-600">Start with onboarding to create a user before taking the assessment.</p>
        <Link to="/onboarding" className="mt-3 inline-flex rounded-md bg-primary-600 px-3 py-2 text-sm font-medium text-white">
          Go to onboarding
        </Link>
      </div>
    );
  }

  const submit = async () => {
    if (!session.userId || !allAnswered) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await api.submitAssessmentBatch({
        user_id: session.userId,
        answers: questions.map((question) => ({
          question_id: question.id,
          answer: answers[question.id],
        })),
      });

      await api.runAnalysis(session.userId);
      navigate('/analysis');
    } catch (err) {
      setError((err as ApiError).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-slate-600">Loading assessment questions...</p>;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold">RIASEC Assessment</h2>
        <p className="text-sm text-slate-600">
          Answer every statement. When you submit, we’ll call the backend to save answers and trigger analysis automatically.
        </p>
        <p className="text-xs text-slate-500">
          Progress: {answeredCount}/{questions.length} answered
        </p>
      </div>

      {error ? <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}

      <div className="space-y-3">
        {questions.map((question) => (
          <div key={question.id} className="rounded-lg border p-3">
            <p className="text-sm font-medium">
              {question.id}. {question.text}
            </p>
            <div className="mt-2 flex gap-2">
              {options.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setAnswers((prev) => ({ ...prev, [question.id]: option }))}
                  className={`rounded-md border px-3 py-1 text-sm ${
                    answers[question.id] === option ? 'bg-primary-600 text-white' : 'bg-white text-slate-700'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        disabled={!allAnswered || submitting}
        onClick={submit}
        className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm disabled:opacity-50"
      >
        {submitting ? 'Submitting...' : 'Submit assessment and run analysis'}
      </button>
    </div>
  );
}
