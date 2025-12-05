import { Delete, Keyboard, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface OnScreenKeyboardProps {
  onInput: (value: string) => void;
  onClose: () => void;
  currentValue: string;
  isNumeric?: boolean;
  allowPhysicalKeyboard?: boolean;
  isPassword?: boolean;
}

export default function OnScreenKeyboard({
  onInput,
  onClose,
  currentValue,
  isNumeric = false,
  allowPhysicalKeyboard = true,
  isPassword = false,
}: OnScreenKeyboardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [usePhysicalKeyboard, setUsePhysicalKeyboard] = useState(false);
  const [showSpecialChars, setShowSpecialChars] = useState(false);

  useEffect(() => {
    // Prevent body scroll when keyboard is open
    document.body.style.overflow = "hidden";

    // Focus input if using physical keyboard
    if (usePhysicalKeyboard && inputRef.current) {
      inputRef.current.focus();
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [usePhysicalKeyboard]);

  const handleKeyPress = (key: string) => {
    if (key === "backspace") {
      onInput(currentValue.slice(0, -1));
    } else if (key === "space") {
      onInput(currentValue + " ");
    } else if (key === "shift") {
      setShowSpecialChars(!showSpecialChars);
    } else {
      onInput(currentValue + key);
    }
  };

  const numericKeys = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    [".", "0", "backspace"],
  ];

  const alphanumericKeys = [
    ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
    ["z", "x", "c", "v", "b", "n", "m", "backspace"],
    ["shift", "space"],
  ];

  const specialCharKeys = [
    ["!", "@", "#", "$", "%", "^", "&", "*", "(", ")"],
    ["-", "_", "=", "+", "[", "]", "{", "}", "|", "\\"],
    [";", ":", "'", '"', "<", ">", ",", ".", "?", "/"],
    ["shift", "space", "backspace"],
  ];

  const keys = isNumeric
    ? numericKeys
    : showSpecialChars
    ? specialCharKeys
    : alphanumericKeys;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        ref={containerRef}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl bg-slate-900 dark:bg-slate-950 border-t-4 border-[#FF6B35] rounded-t-3xl shadow-2xl p-4 animate-slide-up"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex-1 bg-slate-800 dark:bg-slate-900 rounded-xl px-4 py-3 border border-slate-700">
            {usePhysicalKeyboard ? (
              <input
                ref={inputRef}
                type={isPassword ? "password" : "text"}
                value={currentValue}
                onChange={(e) => onInput(e.target.value)}
                className="w-full bg-transparent text-white font-mono text-lg outline-none"
                placeholder="Type here..."
                autoFocus
              />
            ) : (
              <div className="text-white font-mono text-lg">
                {isPassword && currentValue
                  ? "•".repeat(currentValue.length)
                  : currentValue || (
                      <span className="text-slate-500">Type here...</span>
                    )}
              </div>
            )}
          </div>

          {allowPhysicalKeyboard && (
            <button
              onClick={() => setUsePhysicalKeyboard(!usePhysicalKeyboard)}
              className="ml-2 p-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-all duration-200 flex items-center gap-2"
              title={
                usePhysicalKeyboard
                  ? "Use on-screen keyboard"
                  : "Use physical keyboard"
              }
            >
              <Keyboard size={20} />
              <span className="text-xs font-medium hidden sm:inline">
                {usePhysicalKeyboard ? "Touch" : "Type"}
              </span>
            </button>
          )}

          <button
            onClick={onClose}
            className="ml-2 p-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-all duration-200"
            aria-label="Close keyboard"
          >
            <X size={24} />
          </button>
        </div>

        {/* Keyboard */}
        {!usePhysicalKeyboard && (
          <div className="space-y-2">
            {keys.map((row, rowIndex) => (
              <div
                key={rowIndex}
                className={`flex gap-2 ${
                  row.length === 1 ? "justify-center" : "justify-center"
                }`}
              >
                {row.map((key) => {
                  const isBackspace = key === "backspace";
                  const isSpace = key === "space";
                  const isShift = key === "shift";

                  return (
                    <button
                      key={key}
                      onClick={() => handleKeyPress(key)}
                      className={`
                      ${
                        isSpace
                          ? "flex-1 max-w-md"
                          : isShift
                          ? "min-w-[5rem]"
                          : isNumeric
                          ? "w-20 h-16"
                          : "min-w-[3rem] h-14"
                      }
                      ${
                        isBackspace
                          ? "bg-red-600 hover:bg-red-500"
                          : isShift && showSpecialChars
                          ? "bg-blue-600 hover:bg-blue-500"
                          : isShift
                          ? "bg-blue-700 hover:bg-blue-600"
                          : "bg-slate-800 hover:bg-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
                      }
                      text-white rounded-xl font-semibold text-lg
                      transition-all duration-150 active:scale-95
                      shadow-lg border border-slate-700
                      flex items-center justify-center
                    `}
                    >
                      {isBackspace ? (
                        <Delete size={20} />
                      ) : isSpace ? (
                        "Space"
                      ) : isShift ? (
                        showSpecialChars ? (
                          "ABC"
                        ) : (
                          "!@#"
                        )
                      ) : (
                        key.toUpperCase()
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {/* Done Button */}
        <button
          onClick={onClose}
          className="w-full mt-4 py-3 bg-gradient-to-r from-[#FF6B35] to-orange-500 hover:from-[#e85d2a] hover:to-[#FF6B35] text-white rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg"
        >
          Done
        </button>
      </div>
    </div>
  );
}
