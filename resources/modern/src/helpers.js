export function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

/**
 * Проверка кода нажатой клавиши на разрешённые для ввода чисел
 *
 * @param keyCode Код клавиши <$event.keyCode>
 * @param isFloatCheck Если true, то допускает ввод точки
 *
 * @return {boolean}
 */
export function filterKeyboardNumbers(keyCode, isFloatCheck = false) {
  const KEYCODE_ZERO = 48;
  const KEYCODE_NINE = 57;
  const KEYCODE_NUMPAD_ZERO = 96;
  const KEYCODE_NUMPAD_NINE = 105;
  const KEYCODE_BACKSPACE = 8;
  const KEYCODE_DELETE = 46;

  const isDeleteKey = keyCode === KEYCODE_BACKSPACE || keyCode === KEYCODE_DELETE;
  const isNumberFromKeyboard = keyCode >= KEYCODE_ZERO && keyCode <= KEYCODE_NINE;
  const isNumberFromNumpad = keyCode >= KEYCODE_NUMPAD_ZERO && keyCode <= KEYCODE_NUMPAD_NINE;

  let isCorrectKeyCode = isNumberFromKeyboard || isNumberFromNumpad || isDeleteKey;

  if (isFloatCheck) {
    const KEYCODE_DOTS = [
      110, // "." - Numpad
      190, // "." - Английская раскладка
      191  // "." - Русская раскладка
    ];

    const isDot = KEYCODE_DOTS.indexOf(keyCode) !== -1;

    isCorrectKeyCode = isCorrectKeyCode || isDot;
  }

  return isCorrectKeyCode;
}
