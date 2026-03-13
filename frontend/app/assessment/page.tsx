'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { ThumbsUp, ThumbsDown, HelpCircle, ArrowRight } from 'lucide-react';

interface Question {
  id: number;
  text: string;
  dimension: string;
  weight: number;
}

export default function Assessment() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const userId = searchParams.get('userId');
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<{question_id: number; answer: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);

  useEffect(() => {
    if (!userId) {
      toast.error('Please complete onboarding first');
      router.push('/onboarding');
      return;
    }
    
    fetchQuestions();
  }, [userId]);

  const fetchQuestions = async () => {
    try {
      const response = await axios.get('/api/assessment/questions');
      setQuestions(response.data.questions);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load questions');
      setLoading(false);
    }
  };

  const handleAnswer = async (answer: 'agree' | 'neutral' | 'disagree') => {
    if (!userId) return;
    
    const currentQuestion = questions[currentIndex];
    const newAnswers = [...answers, { question_id: currentQuestion.id, answer }];
    setAnswers(newAnswers);
    
    // Animate card out
    setDirection(answer === 'agree' ? 'right' : 'left');
    
    // Submit to API
    try {
      await axios.post('/api/assessment/answer', {
        user_id: parseInt(userId),
        question_id: currentQuestion.id,
        answer
      });
    } catch (error) {
      console.error('Failed to save answer');
    }

    // Move to next or finish
    setTimeout(() => {
      setDirection(null);
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        // All done - run analysis
        finishAssessment();
      }
    }, 300);
  };

  const finishAssessment = async () => {
    try {
      await axios.post('/api/analysis/run', { user_id: parseInt(userId) });
      toast.success('Assessment complete!');
      router.push(`/analysis?userId=${userId}`);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Analysis failed');
      router.push(`/dashboard?userId=${userId}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-gray-600">Loading questions...</div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen py-8">
      <Toaster />
      <div className="max-w-2xl mx-auto px-4">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Question {currentIndex + 1} of {questions.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full">
            <div 
              className="h-2 bg-primary-600 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Card */}
        <div className="relative h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion.id}
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ 
                x: direction === 'right' ? 300 : -300, 
                opacity: 0,
                rotate: direction === 'right' ? 20 : -20
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute inset-0 bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center justify-center"
            >
              <div className="text-sm text-primary-600 font-medium mb-4">
                {currentQuestion.dimension}
              </div>
              <h2 className="text-2xl font-semibold text-center mb-8">
                "{currentQuestion.text}"
              </h2>
              
              <div className="flex gap-4">
                <button
                  onClick={() => handleAnswer('disagree')}
                  className="flex flex-col items-center p-4 border-2 border-red-200 rounded-xl hover:bg-red-50 transition"
                >
                  <ThumbsDown className="w-8 h-8 text-red-500 mb-2" />
                  <span className="text-red-600 font-medium">Disagree</span>
                </button>
                
                <button
                  onClick={() => handleAnswer('neutral')}
                  className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition"
                >
                  <HelpCircle className="w-8 h-8 text-gray-500 mb-2" />
                  <span className="text-gray-600 font-medium">Neutral</span>
                </button>
                
                <button
                  onClick={() => handleAnswer('agree')}
                  className="flex flex-col items-center p-4 border-2 border-green-200 rounded-xl hover:bg-green-50 transition"
                >
                  <ThumbsUp className="w-8 h-8 text-green-500 mb-2" />
                  <span className="text-green-600 font-medium">Agree</span>
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Skip */}
        <div className="text-center mt-8">
          <button
            onClick={() => router.push(`/dashboard?userId=${userId}`)}
            className="text-gray-500 hover:text-gray-700"
          >
            Skip assessment →
          </button>
        </div>
      </div>
    </div>
  );
}
