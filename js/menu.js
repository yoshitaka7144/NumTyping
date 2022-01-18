window.onload = function () {

  // ジャンルボタン
  const radioBtns = document.querySelectorAll("input[type='radio']");

  // スタートボタン
  const startBtn = document.getElementById("start-btn");

  // 問題画面
  const questionWindow = document.getElementById("question-window");

  // 問題数
  const questionCount = 10;

  // 終了文字
  const END_CHAR = "$";

  // 
  let questionData = [];
  let currentQuetionData = {};
  let currentQuestionIndex = 0;
  let currentTypingTextArray = [];
  let currentTypingTextIndex = 0;
  let mode = 1;

  let displayTextObj = {
    question: "",
    remaining: "",
    inputed: ""
  };

  // 値変更監視オブジェクト
  const watchDisplayTextObj = new Proxy(displayTextObj, {
    set(target, property, value) {
      // 該当の要素のテキスト変更
      changeDisplayText(property + "-text", value);
    }
  });

  // 各ジャンルボタンへイベント設定
  for (let radio of radioBtns) {
    radio.addEventListener("change", function () {
      if (this.checked) {
        for (let i = 1; i <= radioBtns.length; i++) {
          document.getElementById("menu-" + i + "-text").style.display = "none";
        }
        document.getElementById(radio.id + "-text").style.display = "block";
      }
    });
  }

  // スタートボタンのイベント設定
  startBtn.addEventListener("click", function () {
    for (let radio of radioBtns) {
      if (radio.checked) {
        startQuestion(radio.id);
      }
    }
  });

  window.addEventListener("keydown", keyAction);

  /**
   * 
   * @param {*} id 
   */
  function startQuestion(id) {

    // 問題データクリア
    clearQuestionData();

    // スタート画面非表示
    document.getElementById("start-window").style.display = "none";

    // 3秒カウントダウン処理後、問題表示
    const countDownWindow = document.getElementById("count-down-window");
    countDownWindow.style.display = "block";
    setTimeout(() => {
      countDownWindow.style.display = "none";

      // 問題画面表示
      while (questionWindow.firstChild) {
        questionWindow.removeChild(questionWindow.firstChild);
      }
      questionWindow.style.display = "block";

      // 選択した問題開始
      if (id === "menu-1") {
        normalNumTypingQuestion();
      } else if (id === "menu-2") {

      } else {

      }

      mode = 2;

    }, 3000);

  }

  function clearQuestionData() {
    questionData = [];
    currentQuestionIndex = 0;
  }

  function initDisplayText() {
    currentQuetionData = questionData[currentQuestionIndex];
    currentTypingTextArray = currentQuetionData.typingText.split("");
    currentTypingTextIndex = 0;
    currentTypingTextArray.push(END_CHAR);
    watchDisplayTextObj.question = currentQuetionData.questionText;
    watchDisplayTextObj.remaining = currentQuetionData.typingText;
    watchDisplayTextObj.inputed = "";
  }

  /**
   * 
   */
  function normalNumTypingQuestion() {
    // テキスト要素作成
    const questionTextElement = document.createElement("p");
    const typingTextElement = document.createElement("p");
    const remainingTextElement = document.createElement("span");
    const inputedTextElement = document.createElement("span");
    questionTextElement.setAttribute("id", "question-text");
    remainingTextElement.setAttribute("id", "remaining-text");
    inputedTextElement.setAttribute("id", "inputed-text");

    typingTextElement.appendChild(remainingTextElement);
    typingTextElement.appendChild(inputedTextElement);

    // 問題表示画面へ追加
    questionWindow.appendChild(questionTextElement);
    questionWindow.appendChild(typingTextElement);

    // 問題生成
    questionData = [];
    for (let i = 0; i < questionCount; i++) {
      const questionNum = Math.floor(Math.random() * 10000);
      const data = {
        questionText: String(questionNum),
        typingText: String(questionNum)
      };
      questionData.push(data);
    }

    // 問題表示初期化
    initDisplayText();
  }

  /**
   * 
   * @param {*} elementId 
   * @param {*} newValue 
   */
  function changeDisplayText(elementId, newValue) {
    document.getElementById(elementId).textContent = newValue;
  }

  function keyAction(e) {
    if (mode === 2) {
      e.preventDefault();

      const currentChar = currentTypingTextArray[currentTypingTextIndex];
      switch (checkInputKey(e.code, currentChar)) {
        case 1:
          // 正しいタイプ時

          currentTypingTextIndex++;
          const nextChar = currentTypingTextArray[currentTypingTextIndex];
          if (nextChar === END_CHAR) {
            // 
            currentQuestionIndex++;
            if (currentQuestionIndex + 1 === questionCount) {
              // 結果表示画面へ

            } else {
              // 次の問題を表示
              initDisplayText();
            }
          } else {
            console.log(watchDisplayTextObj.inputed);
            console.log(watchDisplayTextObj.remaining);

            watchDisplayTextObj.inputed += currentChar;
            watchDisplayTextObj.remaining = watchDisplayTextObj.remaining.slice(1);
          }

          break;
        case 2:
        // ミスタイプ時
      }
    }
  }

  /**
   * 
   * @param {*} code 
   * @returns 
   */
  function getChar(code) {
    switch (code) {
      case "Digit0":
        return "0";
      case "Digit1":
        return "1";
      case "Digit2":
        return "2";
      case "Digit3":
        return "3";
      case "Digit4":
        return "4";
      case "Digit5":
        return "5";
      case "Digit6":
        return "6";
      case "Digit7":
        return "7";
      case "Digit8":
        return "8";
      case "Digit9":
        return "9";
      case "Comma":
        return ",";
      case "Period":
        return ".";
      case "Minus":
        return "-";
      default:
        return "";
    }
  }

  /**
   * 
   * @param {*} code 
   * @param {*} targetChar 
   * @returns 
   */
  function checkInputKey(code, targetChar) {
    const inputChar = getChar(code);

    if (inputChar === "") {
      return 0;
    }

    if (inputChar === targetChar) {
      return 1;
    }

    return 2;
  }




}
