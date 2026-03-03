import { useState, useCallback } from 'react';
import type {
  Problem,
  Language,
  ThoughtFeedback,
  Solution,
  LoadingState,
  SectionLoadState,
  MathProof,
  CodeStep,
} from '@/types';
import {
  analyzeThoughtProcess,
  generateThoughtProcess,
  generateMathProof,
  generateCode,
} from '@/services/mockApi';

interface UseProblemReturn {
  problem: Problem | null;
  setProblem: (p: Problem) => void;

  // Analysis flow
  feedback: ThoughtFeedback | null;
  analyzeState: LoadingState;
  submitThought: (thought: string) => Promise<void>;

  // Solution flow
  solution: Partial<Solution>;
  sectionLoadState: SectionLoadState;
  isGenerating: boolean;
  activeLanguage: Language;
  setActiveLanguage: (lang: Language) => void;
  generateSolution: (lang: Language) => Promise<void>;
}

const INITIAL_SECTION_STATE: SectionLoadState = {
  thoughtProcess: 'idle',
  mathProof: 'idle',
  code: 'idle',
};

export function useProblem(): UseProblemReturn {
  const [problem, setProblem] = useState<Problem | null>(null);

  // Analysis
  const [feedback, setFeedback] = useState<ThoughtFeedback | null>(null);
  const [analyzeState, setAnalyzeState] = useState<LoadingState>('idle');

  // Solution
  const [solution, setSolution] = useState<Partial<Solution>>({});
  const [sectionLoadState, setSectionLoadState] = useState<SectionLoadState>(INITIAL_SECTION_STATE);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState<Language>('python');

  const submitThought = useCallback(async (thought: string) => {
    if (!problem) return;
    setAnalyzeState('loading');
    try {
      const result = await analyzeThoughtProcess(problem, thought);
      setFeedback(result);
      setAnalyzeState('success');
    } catch {
      setAnalyzeState('error');
    }
  }, [problem]);

  const generateSolution = useCallback(async (lang: Language) => {
    if (!problem || isGenerating) return;

    setIsGenerating(true);
    setSolution({});
    setSectionLoadState({ thoughtProcess: 'loading', mathProof: 'idle', code: 'idle' });

    try {
      // Step 1: Thought process
      const tp = await generateThoughtProcess(problem, lang);
      setSolution(prev => ({ ...prev, language: lang, thoughtProcess: tp }));
      setSectionLoadState({ thoughtProcess: 'success', mathProof: 'loading', code: 'idle' });

      // Step 2: Math proof
      const mp: MathProof = await generateMathProof(problem, lang);
      setSolution(prev => ({ ...prev, mathProof: mp }));
      setSectionLoadState({ thoughtProcess: 'success', mathProof: 'success', code: 'loading' });

      // Step 3: Code + steps
      const codeResult: { code: string; steps: CodeStep[] } = await generateCode(problem, lang);
      setSolution(prev => ({ ...prev, code: codeResult.code, steps: codeResult.steps }));
      setSectionLoadState({ thoughtProcess: 'success', mathProof: 'success', code: 'success' });
    } catch {
      setSectionLoadState(prev => ({
        ...prev,
        ...(prev.thoughtProcess === 'loading' && { thoughtProcess: 'error' }),
        ...(prev.mathProof === 'loading' && { mathProof: 'error' }),
        ...(prev.code === 'loading' && { code: 'error' }),
      }));
    } finally {
      setIsGenerating(false);
    }
  }, [problem, isGenerating]);

  const handleSetActiveLanguage = useCallback((lang: Language) => {
    setActiveLanguage(lang);
    setSolution({});
    setSectionLoadState(INITIAL_SECTION_STATE);
  }, []);

  return {
    problem,
    setProblem,
    feedback,
    analyzeState,
    submitThought,
    solution,
    sectionLoadState,
    isGenerating,
    activeLanguage,
    setActiveLanguage: handleSetActiveLanguage,
    generateSolution,
  };
}
