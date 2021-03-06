/*
 *** SQL-like schema simulated in TypeScript ***
 */

export interface Survey {
  id: number; // Auto-increment int
  title: string; // Survey title
}

export interface Question {
  id: number; // Auto-increment int
  value: string; // Question string
  surveyId: number; // Foreign key to survey
}

export interface Test {
  id: number; // Auto-increment int
  surveyId: number; // Foreign key to survey
  // TODO: score
}

export interface Answer {
  id: number; // Auto-increment int
  value: string | null; // Submitted answer
  testId: number; // Foreign key to test submission
  questionId: number; // Foreign key to question
}

/*
 *** Database data (tables) ***
 */

const surveys: Survey[] = [{ id: 1, title: 'Date & Weather' }];

const questions: Question[] = [
  { id: 1, value: 'What day is today?', surveyId: 1 },
  { id: 2, value: 'What month is it?', surveyId: 1 },
  { id: 3, value: 'What time is it?', surveyId: 1 },
  { id: 4, value: 'What is the weather?', surveyId: 1 },
  { id: 5, value: 'What is the season?', surveyId: 1 },
];

const tests: Test[] = [];

const answers: Answer[] = [];

/*
 *** Exposed database operations ***
 */

export const getQuestion = (id: number): Question | null =>
  questions.find((question) => question.id === id) || null;

export const getSurvey = (
  id: number,
): (Survey & { questions: Question[] }) | null => {
  const survey = surveys.find((s) => s.id === id);

  if (survey === undefined) {
    return null;
  }

  return {
    ...survey,
    questions: questions.filter(({ surveyId }) => surveyId === id),
  };
};

const createAnswer = ({
  value,
  testId,
  questionId,
}: Omit<Answer, 'id'>): Answer => {
  const answer = {
    value,
    testId,
    questionId,
    id: answers.length === 0 ? 1 : answers[answers.length - 1].id + 1,
  };

  answers.push(answer);

  return answer;
};

export const createTest = ({
  surveyId,
  answers,
}: {
  surveyId: number;
  answers: Omit<Answer, 'id' | 'testId'>[];
}): Test => {
  const testId = tests.length === 0 ? 1 : tests[tests.length - 1].id + 1;

  const test = {
    id: testId,
    surveyId,
    answers: answers
      .map((answer) => createAnswer({ ...answer, testId }))
      .map(({ id }) => id),
  };

  tests.push(test);

  return test;
};

export const log = (): void => {
  console.log('surveys', surveys);
  console.log('questions', questions);
  console.log('tests', tests);
  console.log('answers', answers);
};
