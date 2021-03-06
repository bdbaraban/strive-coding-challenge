import React, { useCallback, useEffect, useState } from 'react';
import type { ChangeEventHandler, FC } from 'react';
import { Button, Flex, Heading, Input, Stack, Text } from '@chakra-ui/react';
import * as db from './database';
import useTimer from './useTimer';

/*
 *** Constants ***
 */

const TIME_PER_SURVEY = 60 * 15; // 15 minutes
const TIME_PER_QUESTION = 60 * 3; // 3 minutes

/**
 * Thank you message rendered upon quiz completion
 */
const ThankYou: FC = () => (
  <Heading size="lg">Thank you for taking our quiz!</Heading>
);

/**
 * Input component for answering a timed question
 */

interface QuestionInputProps {
  question: string;
  submit: (value: string | null) => void;
}

const QuestionInput: FC<QuestionInputProps> = ({
  question,
  submit,
}: QuestionInputProps) => {
  const [value, setValue] = useState<string>('');
  const timer = useTimer(TIME_PER_QUESTION);

  const handleInputChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setValue(event.target.value);
  };

  const handleSubmit = useCallback((): void => {
    submit(value.length === 0 ? null : value);
    setValue('');
    timer.reset();
  }, [submit, value, timer]);

  useEffect((): void | VoidFunction => {
    if (timer.time === 0) {
      // Time ran out, skip question
      return handleSubmit();
    }
  }, [timer.time, handleSubmit]);

  return (
    <Stack align="flex-start">
      <Heading size="md">{question}</Heading>
      <Input variant="outline" value={value} onChange={handleInputChange} />
      <Flex dir="row" align="center" justify="space-between" w="100%">
        <Button onClick={handleSubmit}>Submit</Button>
        <Text
          color={
            timer.time < 10
              ? 'red.500'
              : timer.time < 30
              ? 'yellow.500'
              : 'inherit'
          }
        >
          {timer.string}
        </Text>
      </Flex>
    </Stack>
  );
};

/**
 * Main quiz component
 */
export const App: FC = () => {
  const [survey] = useState<db.Survey & { questions: db.Question[] }>(
    db.getSurvey(1)!,
  );

  const [answers, setAnswers] = useState<
    { questionId: number; value: string | null }[]
  >([]);

  const timer = useTimer(TIME_PER_SURVEY);

  const handleSubmit = (
    question: db.Question,
    answer: string | null = null,
  ): void => {
    const newAnswers = [...answers, { questionId: question.id, value: answer }];
    if (newAnswers.length === survey.questions.length) {
      db.createTest({ surveyId: survey.id, answers });
      db.log();
    }
    setAnswers([...answers, { questionId: question.id, value: answer }]);
  };

  useEffect((): void | VoidFunction => {
    if (timer.time === 0) {
      // Time ran out, submit unfinished test
      // TODO: add null answers for unsubmitted questions
      db.createTest({ surveyId: survey.id, answers });
      db.log();
    }
  }, [timer.time, survey.id, answers]);

  return (
    <Flex
      minH="100vh"
      align="center"
      justify="space-between"
      flexDir="column"
      p={[2, 4, 6, 8]}
    >
      <Stack alignSelf="flex-start">
        <Heading size="md">{survey.title}</Heading>
        <Text>
          Question <strong>{answers.length}</strong> of{' '}
          <strong>{survey.questions.length}</strong>
        </Text>
      </Stack>
      <Stack w={['90%', '80%', '70%', '60%']}>
        {answers.length < survey.questions.length ? (
          <QuestionInput
            question={survey.questions[answers.length].value}
            submit={(value: string | null) =>
              handleSubmit(survey.questions[answers.length], value)
            }
          />
        ) : (
          <ThankYou />
        )}
      </Stack>
      <Text alignSelf="flex-end">{timer.string} remaining</Text>
    </Flex>
  );
};
