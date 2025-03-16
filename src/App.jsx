import { useCallback, useEffect } from "react";
import "./App.css";
import { useState } from "react";

const TILESIZE = 5;
const ROWSIZE = 6;

function Tile({ word, className }) {
  const classNames = ["tile", className];
  return <div className={classNames.join(" ")}>{word}</div>;
}

function Tiles({ rowIndex, savedGuess, currentGuess, currentRow, solution }) {
  const tiles = Array.from({ length: TILESIZE });
  const checkSolution = (index) => {
    if (rowIndex === currentRow) {
      return;
    }
    if (
      savedGuess[rowIndex].length === 5 &&
      solution[index] === savedGuess[rowIndex][index]
    ) {
      return "hits";
    }
    if (
      savedGuess[rowIndex].length === 5 &&
      solution.includes(savedGuess[rowIndex][index])
    ) {
      return "includes";
    }
  };
  return (
    <div className="tiles">
      {tiles.map((tile, index) => {
        const word =
          rowIndex === currentRow
            ? currentGuess[index] || ""
            : savedGuess[rowIndex][index] || "";
        const className = checkSolution(index);

        return <Tile key={index} word={word} className={className} />;
      })}
    </div>
  );
}

function fetchWords() {
  const url = "/api/fe/wordle-words";
  return new Promise((resolve, reject) => {
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          reject(new Error(`Response status: ${response.status}`));
        } else {
          return response.json();
        }
      })
      .then((json) => {
        resolve(json);
      })
      .catch((error) => {
        reject(error);
      });
  });

  // return fetch(url)
  //   .then((response) => {
  //     if (!response.ok) {
  //       throw new Error(`Response status: ${response.status}`);
  //     }
  //     return response.json();
  //   })
  //   .catch((error) => {
  //     console.log(error);
  //     return [];
  //   });
  // try {
  //   const response = await fetch(url);
  //   if (!response.ok) {
  //     throw new Error(`Response status: ${response.status}`);
  //   }
  //
  //   const json = await response.json();
  //   return json;
  // } catch (error) {
  //   console.log(error);
  //   return [];
  // }
}

function Wordle({ solution, handleShowSolution }) {
  const [currentGuess, setCurrentGuess] = useState("");
  const [currentRow, setCurrentRow] = useState(0);
  const [savedGuess, setSavedGuess] = useState([...Array(ROWSIZE).fill("")]);

  const rows = Array.from({ length: ROWSIZE });

  useEffect(() => {
    setCurrentGuess("");
    setCurrentRow(0);
    setSavedGuess([...Array(ROWSIZE).fill("")]);
  }, [solution]);

  useEffect(() => {
    if (currentRow >= ROWSIZE) {
      handleShowSolution();
    }
  }, [currentRow, handleShowSolution]);

  useEffect(() => {
    const pushToCurrentGuess = (letter) => {
      setCurrentGuess((prev) => (prev + letter).slice(0, TILESIZE));
    };
    const removeFromCurrentGuess = () => {
      setCurrentGuess((prev) => prev.slice(0, -1));
    };
    const handleKeyDown = (e) => {
      if (/^[a-zA-Z]$/.test(e.key)) {
        pushToCurrentGuess(e.key.toUpperCase());
      } else if (e.key === "Backspace") {
        removeFromCurrentGuess();
      } else if (e.key === "Enter") {
        if (currentGuess.length < 5) {
          return;
        }
        setCurrentRow((prev) => prev + 1);
        setSavedGuess((prev) => {
          const next = [...prev];
          next[currentRow] = currentGuess;
          return next;
        });
        setCurrentGuess("");
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentGuess, currentRow]);

  return (
    <div className="rows">
      {rows.map((row, index) => {
        return (
          <Tiles
            key={index}
            rowIndex={index}
            currentGuess={currentGuess}
            currentRow={currentRow}
            savedGuess={savedGuess}
            solution={solution}
          />
        );
      })}
    </div>
  );
}

function NewGame({ handleOnClick }) {
  return (
    <button className="newGame" onClick={handleOnClick}>
      {" "}
      New Game
    </button>
  );
}

function App() {
  const [wordList, setWordList] = useState([]);
  const [solution, setSolution] = useState("");
  const [showSolution, setShowSolution] = useState(false);

  const handleShowSolution = useCallback(() => {
    setShowSolution((prev) => {
      if (prev === false) {
        return true;
      } else {
        return false;
      }
    });
  }, []);

  const handleOnClick = useCallback(() => {
    const resetGame = () => {
      const newSolution = wordList[Math.floor(Math.random() * wordList.length)];
      setSolution(newSolution);
      setShowSolution(false);
    };

    resetGame();
  }, [wordList]);

  useEffect(() => {
    fetchWords()
      .then((words) => {
        setWordList(words);
        setSolution(words[Math.floor(Math.random() * words.length)]);
      })
      .catch((error) => {
        console.log("Error fetching words: ", error);
        setWordList([]);
      });
  }, []);
  return (
    <>
      <h1>Wordle</h1>
      <Wordle solution={solution} handleShowSolution={handleShowSolution} />
      <h3>{showSolution && "Answer: " + solution}</h3>
      <h3>{showSolution && <NewGame handleOnClick={handleOnClick} />}</h3>
    </>
  );
}

export default App;
