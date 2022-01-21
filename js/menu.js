window.onload = function () {

  // ジャンルボタン
  const radioBtns = document.querySelectorAll("input[type='radio']");

  // スタートボタン
  const startBtn = document.getElementById("start-btn");

  // リトライボタン
  const retryBtn = document.getElementById("retry-btn");

  // 戻るボタン
  const backBtn = document.getElementById("back-btn");

  // ミスタイプ音チェックボックス
  const missSoundCheckBox = document.getElementById("miss-sound");

  // タイピングナビチェックボックス
  const typingNaviCheckBox = document.getElementById("typing-navi");

  // 問題数セレクトボックス
  const questionCountSelectBox = document.getElementById("question-count");

  // スタート画面
  const startWindow = document.getElementById("start-window");

  // カウントダウン画面
  const countDownWindow = document.getElementById("count-down-window");

  // 問題画面
  const questionWindow = document.getElementById("question-window");

  // 結果画面
  const resultWindow = document.getElementById("result-window");

  // 終了文字
  const END_CHAR = "$";

  // 問題数
  let questionCount = Number(questionCountSelectBox.value);

  // タイピング判定フラグ
  let canTypeKey = false;

  // 問題データ保持用
  let questionData = [];
  let currentQuetionData = {};
  let currentQuestionIndex = 0;
  let currentTypingTextArray = [];
  let currentTypingTextIndex = 0;

  // 結果表示用
  

  // key変更監視
  const watchKeyObj = new Proxy({
    targetKey: "",
    prevTargetKey: "",
    missTypeKey: ""
  }, {
    get(target, prop) {
      return target[prop];
    },
    set(target, prop, value) {
      target[prop] = value;

      if (value !== "" && typingNaviCheckBox.checked) {
        const keyElement = document.getElementById("key-" + value);
        const fingerElement = document.getElementById(getTargetFingerId(value));
        if (prop === "targetKey") {
          keyElement.classList.add("target-key");
          fingerElement.classList.add("target-finger");
        } else if (prop === "prevTargetKey") {
          keyElement.classList.remove("target-key");
          fingerElement.classList.remove("target-finger");
        } else if (prop === "missTypeKey") {
          // 点滅のアニメーション設定
          keyElement.style.animationName = "flash";

          // アニメーション終了時にアニメーション設定削除
          keyElement.addEventListener("animationend", function () {
            this.style.animationName = "";
          });
          keyElement.addEventListener("webkitAnimationEnd", function () {
            this.style.animationName = "";
          });
        }
      }
    }
  });

  // 表示テキスト変更監視
  const watchDisplayTextObj = new Proxy({
    question: "",
    remaining: "",
    inputed: ""
  }, {
    get(target, prop) {
      return target[prop];
    },
    set(target, prop, value) {
      // 該当の要素のテキスト変更
      changeDisplayText(prop + "-text", value);
      target[prop] = value;
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

  // スタートボタンのクリックイベント
  startBtn.addEventListener("click", function () {
    for (let radio of radioBtns) {
      if (radio.checked) {
        startQuestion(radio.id);
      }
    }
  });

  // リトライボタンのクリックイベント
  retryBtn.addEventListener("click", function () {
    for (let radio of radioBtns) {
      if (radio.checked) {
        startQuestion(radio.id);
      }
    }
  });

  // 戻るボタンのクリックイベント
  backBtn.addEventListener("click", function () {
    resultWindow.style.display = "none";
    startWindow.style.display = "flex";
  });

  // タイピングナビチェックボックスの変更時イベント
  typingNaviCheckBox.addEventListener("change", function () {
    // 現在の対象キー
    const targetKeyElement = document.getElementById("key-" + watchKeyObj.targetKey);

    // 現在の対象指
    const targetFingerElement = document.getElementById(getTargetFingerId(watchKeyObj.targetKey));

    if (targetKeyElement === null || targetFingerElement === null) {
      return;
    }

    // チェックが付いた場合
    if (this.checked) {
      targetKeyElement.classList.add("target-key");
      targetFingerElement.classList.add("target-finger");
    } else {
      targetKeyElement.classList.remove("target-key");
      targetFingerElement.classList.remove("target-finger");
    }
  });

  // 問題数セレクトボックス値変更時イベント
  questionCountSelectBox.addEventListener("change", function () {
    const changedValue = this.value;
    const pattern = /^[1-9]+[0-9]*$/;
    if (pattern.test(changedValue)) {
      questionCount = Number(changedValue);
    } else {
      questionCount = 5;
      alert("不正な値が選択された為、デフォルト値の5が設定されます。");
    }
  });

  // キー入力処理設定
  window.addEventListener("keydown", keyAction);

  /**
   * 
   * @param {*} id 
   */
  function startQuestion(id) {
    // スタート画面非表示
    startWindow.style.display = "none";

    // 結果画面非表示
    resultWindow.style.display = "none";

    // 3秒カウントダウン処理後、問題表示
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
        createNumTypingQuestion();
      } else if (id === "menu-2") {
        createCalcTypingQuestion();
      } else {

      }

      canTypeKey = true;

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
    watchKeyObj.targetKey = currentTypingTextArray[0];
  }

  /**
   * 
   */
  function createNumTypingQuestion() {
    // テキスト要素作成
    const questionTextElement = document.createElement("p");
    const typingTextElement = document.createElement("p");
    const remainingTextElement = document.createElement("span");
    const inputedTextElement = document.createElement("span");
    questionTextElement.setAttribute("id", "question-text");
    remainingTextElement.setAttribute("id", "remaining-text");
    inputedTextElement.setAttribute("id", "inputed-text");

    typingTextElement.appendChild(inputedTextElement);
    typingTextElement.appendChild(remainingTextElement);

    // 問題表示画面へ追加
    questionWindow.appendChild(questionTextElement);
    questionWindow.appendChild(typingTextElement);

    // 問題生成
    clearQuestionData();
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

  function createCalcTypingQuestion() {
    // テキスト要素作成
    const questionTextElement = document.createElement("p");
    const typingTextElement = document.createElement("p");
    const remainingTextElement = document.createElement("span");
    const inputedTextElement = document.createElement("span");
    questionTextElement.setAttribute("id", "question-text");
    remainingTextElement.setAttribute("id", "remaining-text");
    inputedTextElement.setAttribute("id", "inputed-text");

    typingTextElement.appendChild(inputedTextElement);
    typingTextElement.appendChild(remainingTextElement);

    // 問題表示画面へ追加
    questionWindow.appendChild(questionTextElement);
    questionWindow.appendChild(typingTextElement);

    // 問題生成
    clearQuestionData();
    for (let i = 0; i < questionCount; i++) {
      const type = Math.floor(Math.random() * 3);
      let questionText;
      let typingText;

      if (type === 0) {
        const num1 = Math.floor(Math.random() * 100);
        const num2 = Math.floor(Math.random() * 100);
        questionText = String(num1 + " + " + num2);
        typingText = String(num1 + num2);
      } else if (type === 1) {
        const num1 = Math.floor(Math.random() * 100);
        const num2 = Math.floor(Math.random() * 100);
        questionText = String(num1 + " - " + num2);
        typingText = String(num1 - num2);
      } else {
        const num1 = Math.floor(Math.random() * 10);
        const num2 = Math.floor(Math.random() * 10);
        questionText = String(num1 + " × " + num2);
        typingText = String(num1 * num2);
      }

      const data = {
        questionText: questionText,
        typingText: typingText
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

  function showResultWindow() {
    canTypeKey = false;
    watchKeyObj.targetKey = "";
    watchKeyObj.prevTargetKey = "";
    watchKeyObj.missTypeKey = "";

    // 問題画面非表示
    questionWindow.style.display = "none";

    // 結果画面表示
    resultWindow.style.display = "block";
  }

  function keyAction(e) {
    if (canTypeKey) {
      // イベントキャンセル
      e.preventDefault();

      // タイピング対象の文字
      const currentChar = currentTypingTextArray[currentTypingTextIndex];

      // タイピング判定
      switch (checkInputKey(e.code, currentChar)) {
        case 1: // 正しいタイピング時

          // 
          watchKeyObj.prevTargetKey = currentChar;

          // 表示テキスト更新
          watchDisplayTextObj.inputed += currentChar;
          watchDisplayTextObj.remaining = watchDisplayTextObj.remaining.slice(1);

          // 1文字進める
          currentTypingTextIndex++;
          const nextChar = currentTypingTextArray[currentTypingTextIndex];

          if (nextChar === END_CHAR) {
            // 
            currentQuestionIndex++;
            if (currentQuestionIndex === questionCount) {
              // 結果表示画面へ
              showResultWindow();
            } else {
              // 次の問題を表示
              initDisplayText();
            }
          } else {
            watchKeyObj.targetKey = nextChar;
          }
          break;
        case 0: // ミスタイプ時

          // ミスタイプキーを点滅させる
          watchKeyObj.missTypeKey = currentChar;

          //ミスタイプ音声
          if (missSoundCheckBox.checked) {
            // 音声を鳴らす

          }

      }
    }
  }

  function getTargetFingerId(keyChar) {
    // 左手小指
    const leftLittle = ["1", "q", "a", "z"];
    // 左手薬指
    const leftRing = ["2", "w", "s", "x"];
    // 左手中指
    const leftMiddle = ["3", "e", "d", "c"];
    // 左手人差し指
    const leftIndex = ["4", "5", "r", "t", "f", "g", "v", "b"];
    // 右手人差し指
    const rightIndex = ["6", "7", "y", "u", "h", "j", "n", "m"];
    // 右手中指
    const rightMiddle = ["8", "i", "k", ","];
    // 右手薬指
    const rightRing = ["9", "o", "l", "."];
    // 右手小指
    const rightLittle = ["0", "p", "-"];

    if (leftLittle.includes(keyChar)) {
      return "left-little";
    } else if (leftRing.includes(keyChar)) {
      return "left-ring";
    } else if (leftMiddle.includes(keyChar)) {
      return "left-middle";
    } else if (leftIndex.includes(keyChar)) {
      return "left-index";
    } else if (rightIndex.includes(keyChar)) {
      return "right-index";
    } else if (rightMiddle.includes(keyChar)) {
      return "right-middle";
    } else if (rightRing.includes(keyChar)) {
      return "right-ring";
    } else if (rightLittle.includes(keyChar)) {
      return "right-little";
    } else {
      return "";
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

    if (inputChar === targetChar) {
      return 1;
    }

    return 0;
  }




}
