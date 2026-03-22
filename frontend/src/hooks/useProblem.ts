import { useState, useCallback, useRef } from 'react';
import type {
  Problem,
  Language,
  ThoughtFeedback,
  Solution,
  LoadingState,
  SectionLoadState,
  MathProof,
  CodeSolution,
} from '@/types';
import {
  analyzeThoughtProcess,
  generateThoughtProcess,
  generateMathProof,
  generateCode,
} from '@/services/api';

interface UseProblemReturn {
  problem: Problem | null;
  setProblem: (p: Problem) => void;

  // Analysis flow
  feedback: ThoughtFeedback | null;
  userThought: string;
  analyzeState: LoadingState;
  analyzeError: string | null;
  submitThought: (thought: string) => Promise<void>;

  // Solution flow
  solution: Partial<Solution>;
  sectionLoadState: SectionLoadState;
  solutionError: string | null;
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
  const [userThought, setUserThought] = useState<string>('');
  const [analyzeState, setAnalyzeState] = useState<LoadingState>('idle');
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);

  // Solution
  const [solution, setSolution] = useState<Partial<Solution>>({});
  const [sectionLoadState, setSectionLoadState] = useState<SectionLoadState>(INITIAL_SECTION_STATE);
  const [solutionError, setSolutionError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const isGeneratingRef = useRef(false);
  const [activeLanguage, setActiveLanguage] = useState<Language>('python');

  const submitThought = useCallback(async (thought: string) => {
    if (!problem) return;
    setAnalyzeState('loading');
    setAnalyzeError(null);
    try {
      const result = await analyzeThoughtProcess(problem, thought);
      setFeedback(result);
      setUserThought(thought);
      setAnalyzeState('success');
    } catch (e) {
      setAnalyzeState('error');
      setAnalyzeError((e as Error)?.message ?? 'Could not analyze your approach. Please try again.');
    }
  }, [problem]);

  const generateSolution = useCallback(async (lang: Language) => {
    if (!problem || isGeneratingRef.current) return;

    isGeneratingRef.current = true;
    setIsGenerating(true);
    setSolution({});
    setSectionLoadState({ thoughtProcess: 'loading', mathProof: 'idle', code: 'idle' });

    setSolutionError(null);
    try {
      // Step 1: Thought process (streamed progressively)
      let tpAccumulated = '';
      await generateThoughtProcess(problem, lang, (chunk) => {
        tpAccumulated += chunk;
        setSolution(prev => ({ ...prev, language: lang, thoughtProcess: tpAccumulated }));
      });
      setSectionLoadState({ thoughtProcess: 'success', mathProof: 'loading', code: 'idle' });

      // Step 2: Math proof (pass thought process for multi-solution complexity analysis)
      const mp: MathProof = await generateMathProof(problem, lang, tpAccumulated);
      setSolution(prev => ({ ...prev, mathProof: mp }));
      setSectionLoadState({ thoughtProcess: 'success', mathProof: 'success', code: 'loading' });

      // Step 3: Code (all solutions, informed by thought process)
      const codeResult: { solutions: CodeSolution[] } = await generateCode(problem, lang, tpAccumulated);
      setSolution(prev => ({ ...prev, codeSolutions: codeResult.solutions }));
      setSectionLoadState({ thoughtProcess: 'success', mathProof: 'success', code: 'success' });
    } catch (e) {
      setSectionLoadState(prev => ({
        ...prev,
        ...(prev.thoughtProcess === 'loading' && { thoughtProcess: 'error' }),
        ...(prev.mathProof === 'loading' && { mathProof: 'error' }),
        ...(prev.code === 'loading' && { code: 'error' }),
      }));
      setSolutionError((e as Error)?.message ?? 'Could not generate solution. Please try again.');
    } finally {
      isGeneratingRef.current = false;
      setIsGenerating(false);
    }
  }, [problem]);

  const handleSetActiveLanguage = useCallback((lang: Language) => {
    setActiveLanguage(lang);
    setSolution({});
    setSectionLoadState(INITIAL_SECTION_STATE);
  }, []);

  return {
    problem,
    setProblem,
    feedback,
    userThought,
    analyzeState,
    analyzeError,
    submitThought,
    solution,
    sectionLoadState,
    solutionError,
    isGenerating,
    activeLanguage,
    setActiveLanguage: handleSetActiveLanguage,
    generateSolution,
  };
}
