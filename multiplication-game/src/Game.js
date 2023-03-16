import React, { useState, useEffect, useCallback } from "react";
import "./Game.css";

const levelConfig = {
    EASY: { min: 1, max: 5, emoji: "🐣" },
    MEDIUM: { min: 2, max: 6, emoji: "🐥" },
    HARD: { min: 3, max: 9, emoji: "💪" },
};

const QuestionStatus = {
    ONGOING: "ONGOING",
    CORRECT: "CORRECT",
    INCORRECT: "INCORRECT",
};

const getWrongAnswerRange = (level) => {
    const min = level.min * level.min;
    const max = level.max * level.max;
    return { min, max };
};

const generateRandomNumber = (min, max) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

const generateQuestionByLevel = (level) => {
    const num1 = generateRandomNumber(level.min, level.max);
    const num2 = generateRandomNumber(level.min, level.max);
    return { num1, num2 };
};

const generateWrongAnswers = (level, correctAnswer) => {
    const { min, max } = getWrongAnswerRange(level);
    let wrongAnswers = [];

    do {
        wrongAnswers = Array.from({ length: 2 }, () =>
            generateRandomNumber(min, max)
        );
    } while (
        wrongAnswers[0] === correctAnswer ||
        wrongAnswers[1] === correctAnswer ||
        wrongAnswers[0] === wrongAnswers[1]
    );

    return wrongAnswers;
};

const questionGenerator = {
    createQuestion(level) {
        const { num1, num2 } = generateQuestionByLevel(level);
        const correctAnswer = num1 * num2;
        const wrongAnswers = generateWrongAnswers(level, correctAnswer);
        const allAnswers = [correctAnswer, ...wrongAnswers];
        allAnswers.sort(() => Math.random() - 0.5);
    
        return {
            question: `${num1} x ${num2}`,
            correctAnswer,
            allAnswers,
        };
    },
};

const AnswerButton = ({ answer, onClick, currentQuestion }) => {
    const [buttonState, setButtonState] = useState("default");

    useEffect(() => {
        setButtonState("default");
    }, [currentQuestion]);

    const handleClick = () => {
        const isCorrect = onClick(answer);
        setButtonState(isCorrect ? "correct" : "incorrect");
    };

    const buttonClass =
        buttonState === "correct"
            ? "correct-answer"
            : buttonState === "incorrect"
                ? "incorrect-answer"
                : "";

    return (
        <button className={buttonClass} onClick={handleClick}>
            {answer}
        </button>
    );
};




const Game = () => {
    const [score, setScore] = useState({ correct: 0, incorrect: 0 });
    const [attempts, setAttempts] = useState(0);
    const [currentQuestion, setCurrentQuestion] = useState({});
    const [correctAnswerSelected, setCorrectAnswerSelected] = useState(false);
    const [level, setLevel] = useState(levelConfig.EASY);
    const MAX_INCORRECT_ANSWERS = 2;

    const initialQuestionStatus = {
        status: QuestionStatus.ONGOING,
    };

    const [questionStatus, setQuestionStatus] = useState(initialQuestionStatus);

    const generateNewQuestion = useCallback(() => {
        setCorrectAnswerSelected(false);
        setCurrentQuestion(questionGenerator.createQuestion(level));

        setAttempts(0);
    }, [level]);

    const handleLevelChange = (selectedLevel) => {
        setLevel(levelConfig[selectedLevel]);
    };

    useEffect(() => {
        generateNewQuestion();
    }, [generateNewQuestion]);

    const checkAnswer = (selectedAnswer) => {
        const isCorrectAnswer = selectedAnswer === currentQuestion.correctAnswer;

        if (isCorrectAnswer) {
            setScore((prevScore) => ({ ...prevScore, correct: prevScore.correct + 1 }));
            setQuestionStatus({ status: QuestionStatus.CORRECT });
        } else {
            setAttempts((prevAttempts) => prevAttempts + 1);
            setQuestionStatus({ status: QuestionStatus.INCORRECT });

            if (attempts + 1 === MAX_INCORRECT_ANSWERS) {
                setScore((prevScore) => ({ ...prevScore, incorrect: prevScore.incorrect + 1 }));
            }
        }

        if (isCorrectAnswer || attempts + 1 === MAX_INCORRECT_ANSWERS) {
            setTimeout(() => {
                generateNewQuestion();
                setQuestionStatus(initialQuestionStatus);
            }, 500);
        }

        return isCorrectAnswer;
    };

    return (
        <div className={`game`}>
            <div className="game-container">
                <div className="levels">
                    {Object.keys(levelConfig).map((lvl) => (
                        <button
                            key={lvl}
                            className={`level-button${level === levelConfig[lvl] ? " active-level" : ""
                                }`}
                            onClick={() => handleLevelChange(lvl)}
                        >
                            {levelConfig[lvl].emoji}
                        </button>
                    ))}
                </div>
                <div className="question">{currentQuestion.question}</div>
                <div className="options">
                    {currentQuestion.allAnswers?.map((answer, index) => (
                        <AnswerButton
                            key={index}
                            answer={answer}
                            onClick={checkAnswer}
                            currentQuestion={currentQuestion}
                        />
                    ))}
                </div>
                <div className="scoreboard">
                    <div className="score-item">
                        <span role="img" aria-label="thumbs-up">
                            👍
                        </span>
                        <span className="score-value">{score.correct}</span>
                    </div>
                    <div className="      score-item">
                        <span role="img" aria-label="thumbs-down">
                            👎
                        </span>
                        <span className="score-value">{score.incorrect}</span>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default Game;
