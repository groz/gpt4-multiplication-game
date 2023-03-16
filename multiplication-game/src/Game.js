import React, { useState, useEffect } from "react";
import "./Game.css";

const Game = () => {
    const [score, setScore] = useState({ correct: 0, incorrect: 0 });
    const [attempts, setAttempts] = useState(0);
    const [currentQuestion, setCurrentQuestion] = useState({});
    const [correctAnswerSelected, setCorrectAnswerSelected] = useState(false);
    const [level, setLevel] = useState({ level: "EASY", emoji: "🟢" });
    const MAX_INCORRECT_ANSWERS = 2;

    const generateRandomNumber = (min, max) =>
        Math.floor(Math.random() * (max - min + 1)) + min;

    const generateQuestionByLevel = () => {
        const min = 1;
        const max =
            level.level === "EASY" ? 5 : level.level === "MEDIUM" ? 7 : 9;
        const num1 = generateRandomNumber(min, max);
        const num2 = generateRandomNumber(min, max);
        return { num1, num2 };
    };

    const generateNewQuestion = () => {
        setCorrectAnswerSelected(false);
        const { num1, num2 } = generateQuestionByLevel();
        const correctAnswer = num1 * num2;

        const min =
            level.level === "EASY" ? 1 : level.level === "MEDIUM" ? 11 : 40;
        const max =
            level.level === "EASY" ? 10 : level.level === "MEDIUM" ? 39 : 81;

        const wrongAnswers = Array.from({ length: 2 }, () =>
            generateRandomNumber(min, max)
        );

        // Ensure that the wrong answers do not equal the correct answer
        while (
            wrongAnswers[0] === correctAnswer ||
            wrongAnswers[1] === correctAnswer
        ) {
            wrongAnswers[0] = generateRandomNumber(min, max);
            wrongAnswers[1] = generateRandomNumber(min, max);
        }

        const allAnswers = [correctAnswer, ...wrongAnswers];
        allAnswers.sort(() => Math.random() - 0.5);

        setCurrentQuestion({
            question: `${num1} x ${num2}`,
            correctAnswer,
            allAnswers,
        });

        const buttons = document.querySelectorAll(".options button");
        buttons.forEach((button) => {
            button.disabled = false;
            button.classList.remove("correct-answer", "incorrect-answer");
        });

        setAttempts(0);
    };

    const handleLevelChange = (selectedLevel, emoji) => {
        setLevel({ level: selectedLevel, emoji });
        generateNewQuestion();
    };

    useEffect(() => {
        generateNewQuestion();
    }, []);

    const markButton = (button) => {
        if (!correctAnswerSelected) {
            button.classList.add("incorrect-answer");
        }
        button.disabled = true;
    };

    const disableAllButtons = () => {
        const buttons = document.querySelectorAll(".options button");
        buttons.forEach((button) => {
            button.disabled = true;
        });
    };

    const checkAnswer = (selectedAnswer, button) => {
        if (selectedAnswer === currentQuestion.correctAnswer) {
            setScore({ ...score, correct: score.correct + 1 });
            button.classList.add("correct-answer");
            setCorrectAnswerSelected(true);
            disableAllButtons();
            setTimeout(() => {
                generateNewQuestion();
            }, 500);
        } else {
            setAttempts((prevAttempts) => {
                const updatedAttempts = prevAttempts + 1;
                if (updatedAttempts < MAX_INCORRECT_ANSWERS) {
                    markButton(button);
                } else {
                    markButton(button);
                    setScore({ ...score, incorrect: score.incorrect + 1 });
                    disableAllButtons();
                    setTimeout(() => {
                        generateNewQuestion();
                    }, 500);
                }
                return updatedAttempts;
            });
        }
    };


    return (
        <div className={`game`}>
            <div className="game-container">
                <div className="levels">
                    {[
                        { level: "EASY", emoji: "🟢" },
                        { level: "MEDIUM", emoji: "🟡" },
                        { level: "HARD", emoji: "🔴" },
                    ].map((lvl) => (
                        <button
                            key={lvl.level}
                            className={`level-button${level.level === lvl.level ? " active-level" : ""
                                }`}
                            onClick={() => handleLevelChange(lvl.level, lvl.emoji)}
                        >
                            {lvl.emoji}
                        </button>
                    ))}
                </div>
                <div className="question">{currentQuestion.question}</div>
                <div className="options">
                    {currentQuestion.allAnswers?.map((answer, index) => (
                        <button
                            key={index}
                            onClick={(e) => checkAnswer(answer, e.target)}
                        >
                            {answer}
                        </button>
                    ))}
                </div>
                <div className="scoreboard">
                    <div className="score-item">
                        <span role="img" aria-label="thumbs-up">
                            👍
                        </span>
                        <span className="score-value">{score.correct}</span>
                    </div>
                    <div className="score-item">
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
