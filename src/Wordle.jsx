import { useState, useEffect } from "react";
import { ROWSIZE, TILESIZE, Tiles } from "./App";

export function Wordle() {
  const [currentGuess, setCurrentGuess] = useState("");
  const [savedGuess, setSavedGuess] = useState([...Array(ROWSIZE).fill("")]);
  const currentRowRef = useRef(0);

  const rows = Array.from({ length: ROWSIZE });

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
        setCurrentGuess((prev) => {
          if (prev.length < 5) {
            return prev;
          }
          setCurrentRow((prevRow) => prevRow + 1);
          setSavedGuess((prevSaved) => {
            const next = [...prevSaved];
            next[currentRow - 1] = prev;
            return next;
          });
          return "";
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentRow]);

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
          />
        );
      })}
    </div>
  );
}
