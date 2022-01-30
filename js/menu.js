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

  // 苦手キーチェックボックス
  const settingWeakKeyCheckBox = document.getElementById("setting-weak-key");

  // 苦手キーセレクトボックス
  const weakKeySelectBox = document.getElementById("weak-key");

  // 問題数セレクトボックス
  const questionCountSelectBox = document.getElementById("question-count");

  // 時間制限チェックボックス
  const settingTimeLimitCheckBox = document.getElementById("setting-time-limit");

  // 時間制限セレクトボックス
  const timeLimitSelectBox = document.getElementById("time-limit");

  // 残り時間カウンター
  const timeLimitCounter = document.getElementById("time-limit-counter");

  // スタート画面
  const startWindow = document.getElementById("start-window");

  // カウントダウン画面
  const countDownWindow = document.getElementById("count-down-window");

  // もぐらたたき画面
  const whackMoleWindow = document.getElementById("whack-mole-window");

  // 問題画面
  const questionWindow = document.getElementById("question-window");

  // 結果画面
  const resultWindow = document.getElementById("result-window");

  // 結果画面：タイプ数
  const resultTypeCount = document.getElementById("type-count");

  // 結果画面：ミスタイプ数
  const resultMissTypeCount = document.getElementById("miss-type-count");

  // 結果画面：ミスタイプキー
  const resultMissKey = document.getElementById("miss-key");

  // 終了文字
  const END_CHAR = "$";

  // 問題数
  let questionCount;

  // 苦手キー
  let weakKey;

  // 時間制限
  let timeLimit;

  // タイピング判定フラグ
  let canTypeKey = false;

  // もぐらたたきモード
  let canPlayWhackMole = false;

  // 問題データ保持用
  let questionData = [];
  let currentQuetionData = {};
  let currentQuestionIndex = 0;
  let currentTypingTextArray = [];
  let currentTypingTextIndex = 0;

  // 結果表示用
  let typeCount = 0;
  let missTypeCount = 0;
  let missTypeKey = {};

  // 制限時間タイマー制御用
  let timeLimitIntervalId;

  // もぐらたたきタイマー制御用
  let whackMoleIntervalId;

  // 出現済みキー
  let showedKey = [];

  // 出現可能キー
  let canShowKey = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

  // 出現可能位置
  let canShowIndex = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

  // key変更監視
  const watchKeyObj = new Proxy({
    targetKey: "",
    missTypeKey: ""
  }, {
    get(target, prop) {
      return target[prop];
    },
    set(target, prop, value) {
      target[prop] = value;

      if (typingNaviCheckBox.checked) {
        const keyElement = document.getElementById("key-" + value);
        const fingerElement = document.getElementById(getTargetFingerId(value));
        if (prop === "targetKey") {
          // 対象になっていたキー、指からクラス削除
          const prevTargetKeyElements = document.getElementsByClassName("target-key");
          const prevTargetFingerElements = document.getElementsByClassName("target-finger");
          Array.from(prevTargetKeyElements).forEach(e => {
            e.classList.remove("target-key");
          });
          Array.from(prevTargetFingerElements).forEach(e => {
            e.classList.remove("target-finger");
          });

          if (value !== "") {
            // タイピング対象のキー、指にクラス付与
            keyElement.classList.add("target-key");
            fingerElement.classList.add("target-finger");
          }
        } else if (prop === "missTypeKey" && value !== "") {
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
      target[prop] = value;

      // 該当の要素のテキスト変更
      changeDisplayText(prop + "-text", value);
    }
  });

  // 時間制限カウントテキスト変更監視
  const watchTimeObj = new Proxy({
    remainingTime: "",
  }, {
    get(target, prop) {
      return target[prop];
    },
    set(target, prop, value) {
      target[prop] = value;

      // 残り時間表示テキスト更新
      const remainingTimeTextElement = document.getElementById("remaining-time-text");
      remainingTimeTextElement.textContent = value / 1000;

      if (value === 10000) {
        remainingTimeTextElement.style.color = "orange";
      } else if (value === 5000) {
        remainingTimeTextElement.style.color = "red";
      } else if (value === 0) {
        clearInterval(timeLimitIntervalId);
        showResultWindow();
      }
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
    startQuestion();
  });

  // リトライボタンのクリックイベント
  retryBtn.addEventListener("click", function () {
    startQuestion();
  });

  // 戻るボタンのクリックイベント
  backBtn.addEventListener("click", function () {
    // データリセット
    clearData();

    // 結果画面非表示
    resultWindow.style.display = "none";

    // スタート画面表示
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

  // キー入力処理設定
  window.addEventListener("keydown", keyAction);

  function clearData() {
    // 問題データ保持用
    questionData = [];
    currentQuetionData = {};
    currentQuestionIndex = 0;
    currentTypingTextArray = [];
    currentTypingTextIndex = 0;

    // 結果表示用
    typeCount = 0;
    missTypeCount = 0;
    missTypeKey = {};

    // ミスタイプキーのスタイルクリア
    clearMissTypeKeyStyle();

    // 問題テキストクリア
    watchDisplayTextObj.question = "";
    watchDisplayTextObj.remaining = "";
    watchDisplayTextObj.inputed = "";

    // 残り時間カウンターリセット
    timeLimitCounter.style.display = "none";
    removeForwardMatchClass("circle-", timeLimitCounter);
  }

  function clearMissTypeKeyStyle() {
    // 対象の要素
    const targetElements = document.getElementsByClassName("missed-key");

    Array.from(targetElements).forEach(e => {
      e.classList.remove("missed-key");

      // opacity-*クラス名の削除
      removeForwardMatchClass("opacity-", e);
    });
  }

  function removeForwardMatchClass(pattern, targetElement) {
    // 'pattern'-*のクラス名検索用正規表現
    const regExp = new RegExp(pattern + "\\S+", "g");
    const className = targetElement.className;
    const matchedNameList = className.match(regExp) || [];
    matchedNameList.forEach(name => {
      targetElement.classList.remove(name);
    });
  }

  function startQuestion() {
    // 問題数の設定値チェック
    let pattern = /^[1-9]+[0-9]*$/;
    if (pattern.test(questionCountSelectBox.value)) {
      questionCount = Number(questionCountSelectBox.value);
    } else {
      alert("問題数セレクトボックスに不正な値が選択されています。");
      return;
    }

    // 苦手キーの設定値チェック
    if (settingWeakKeyCheckBox.checked) {
      pattern = /^[0-9-]$/;
      if (pattern.test(weakKeySelectBox.value)) {
        weakKey = weakKeySelectBox.value;
      } else {
        alert("苦手キーセレクトボックスに不正な値が選択されています。");
        return;
      }
    }

    // 制限時間の設定値チェック
    if (settingTimeLimitCheckBox.checked) {
      pattern = /^[1-9]+[0-9]*$/;
      if (pattern.test(timeLimitSelectBox.value)) {
        timeLimit = timeLimitSelectBox.value;
      } else {
        alert("時間制限セレクトボックスに不正な値が選択されています。");
        return;
      }
    }

    // 選択カテゴリー
    let selectedId;
    for (let radio of radioBtns) {
      if (radio.checked) {
        selectedId = radio.id;
        break;
      }
    }

    // スタート画面非表示
    startWindow.style.display = "none";

    // 結果画面非表示
    resultWindow.style.display = "none";

    // データリセット
    clearData();

    // 3秒カウントダウン処理後、問題表示
    countDownWindow.style.display = "block";
    setTimeout(() => {
      // 選択した問題作成
      if (selectedId === "menu-1") {
        createNumTypingQuestion();
        document.getElementById("remaining-text").style.display = "inline";
      } else if (selectedId === "menu-2") {
        createCalcTypingQuestion();
        document.getElementById("remaining-text").style.display = "none";
      }

      // 時間制限カウントスタート
      if (settingTimeLimitCheckBox.checked) {
        timeLimitCounter.style.display = "block";
        timeLimitCounter.classList.add("circle-" + timeLimit);
        watchTimeObj.remainingTime = Number(timeLimit) * 1000;
        timeLimitIntervalId = setInterval(() => {
          watchTimeObj.remainingTime -= 1000;
        }, 1000);
      }

      // タイピング判定
      canTypeKey = true;

      // カウントダウン画面非表示
      countDownWindow.style.display = "none";

      // 問題画面表示
      if (selectedId === "menu-1" || selectedId === "menu-2") {
        questionWindow.style.display = "block";
      } else if (selectedId === "menu-3") {
        whackMoleWindow.style.display = "block";
        startWhackMole();
      }

    }, 3000);

  }

  function startWhackMole() {
    canPlayWhackMole = true;
    whackMoleIntervalId = setInterval(() => {
      // 出現処理
      const key = shuffle(canShowKey).shift();
      const index = shuffle(canShowIndex).shift();
      if (key === undefined) {
        return;
      }
      const id = Math.random();
      showedKey.push({ key: key, index: index, id: id });

      const imgElement = document.createElement("img");
      imgElement.src = "img/number_" + key + ".png";
      imgElement.id = id;
      const area = document.getElementById("area-" + index);
      area.appendChild(imgElement);

      // 一定時間経過後、削除処理
      setTimeout(() => {
        removeMoleAuto(key, id);
      }, 2200);

    }, 800);
  }

  function removeMoleAuto(keyChar, targetId) {
    const targetIndex = showedKey.findIndex(item => item.key === keyChar);
    if (targetIndex !== -1) {
      const key = showedKey[targetIndex].key;
      const index = showedKey[targetIndex].index;
      const id = showedKey[targetIndex].id;
      if (id !== targetId) {
        return;
      } else {
        const imgElement = document.getElementById(targetId);
        imgElement.parentNode.removeChild(imgElement);
        showedKey.splice(targetIndex, 1);
        canShowKey.push(key);
        canShowIndex.push(index);
      }
    }
  }

  function removeMoleManual(keyChar) {
    const targetIndex = showedKey.findIndex(item => item.key === keyChar);
    if (targetIndex !== -1) {
      const key = showedKey[targetIndex].key;
      const index = showedKey[targetIndex].index;
      const id = showedKey[targetIndex].id;
      const imgElement = document.getElementById(id);
      imgElement.parentNode.removeChild(imgElement);

      const whackImgElement = document.createElement("img");
      whackImgElement.src = "img/onigiri.png";
      const area = document.getElementById("area-" + index);
      area.appendChild(whackImgElement);

      showedKey.splice(targetIndex, 1);
      setTimeout(() => {
        whackImgElement.parentNode.removeChild(whackImgElement);
        canShowKey.push(key);
        canShowIndex.push(index);
      }, 500);
      return true;
    }
    return false;
  }

  function shuffle(array) {
    let n = array.length, t, i;

    while (n) {
      i = Math.floor(Math.random() * n--);
      t = array[n];
      array[n] = array[i];
      array[i] = t;
    }

    return array;
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
    // 問題生成
    for (let i = 0; i < questionCount; i++) {
      let questionNum = Math.floor((Math.random() * 2 - 1) * 10000);
      if (settingWeakKeyCheckBox.checked) {
        while (String(questionNum).indexOf(weakKey) === -1) {
          questionNum = Math.floor((Math.random() * 2 - 1) * 10000);
        }
      }
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
    // 問題生成
    for (let i = 0; i < questionCount; i++) {
      let questionText;
      let typingText;

      do {
        const type = Math.floor(Math.random() * 3);
        if (type === 0) {
          const num1 = Math.floor((Math.random() * 2 - 1) * 100);
          const num2 = Math.floor((Math.random() * 2 - 1) * 100);
          questionText = String(num1 + " + " + num2);
          typingText = String(num1 + num2);
        } else if (type === 1) {
          const num1 = Math.floor((Math.random() * 2 - 1) * 100);
          const num2 = Math.floor((Math.random() * 2 - 1) * 100);
          questionText = String(num1 + " - " + num2);
          typingText = String(num1 - num2);
        } else {
          const num1 = Math.floor((Math.random() * 2 - 1) * 10);
          const num2 = Math.floor((Math.random() * 2 - 1) * 10);
          questionText = String(num1 + " × " + num2);
          typingText = String(num1 * num2);
        }
      } while (settingWeakKeyCheckBox.checked && typingText.indexOf(weakKey) === -1);

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

  function formatKeySet(obj) {
    let result = "";
    let arr = Object.keys(obj).map(key => {
      return { key: key, value: obj[key] };
    });

    arr.sort((a, b) => {
      if (a.value === b.value) {
        if (a.key < b.key) {
          return -1;
        } else {
          return 1;
        }
      } else {
        return b.value - a.value;
      }
    });

    arr.forEach(item => {
      result += item.key + ": " + item.value + ", ";
    });

    result = result.slice(0, -2);
    return result;
  }

  function fillMissKey(missTypeCount, missTypeKey) {
    Object.keys(missTypeKey).forEach(key => {
      const opacityType = Math.ceil((missTypeKey[key] / missTypeCount) * 10);
      document.getElementById("key-" + key).classList.add("missed-key");
      document.getElementById("key-" + key).classList.add("opacity-" + opacityType);
    });
  }

  function showResultWindow() {
    if (settingTimeLimitCheckBox.checked) {
      clearInterval(timeLimitIntervalId);
    }
    canPlayWhackMole = false;
    canTypeKey = false;
    watchKeyObj.targetKey = "";
    watchKeyObj.missTypeKey = "";

    resultTypeCount.textContent = typeCount;
    resultMissTypeCount.textContent = missTypeCount;
    resultMissKey.textContent = formatKeySet(missTypeKey);
    fillMissKey(missTypeCount, missTypeKey)

    // 問題画面非表示
    questionWindow.style.display = "none";
    whackMoleWindow.style.display = "none";

    // 結果画面表示
    resultWindow.style.display = "block";
  }

  function keyAction(e) {
    if (canTypeKey) {
      // イベントキャンセル
      e.preventDefault();

      if (!canPlayWhackMole) {
        // 通常のタイピング判定処理

        // タイピング対象の文字
        const currentChar = currentTypingTextArray[currentTypingTextIndex];

        // タイピング判定
        switch (checkInputKey(e.code, currentChar)) {
          case 1: // 正しいタイピング時

            // タイプ数カウント
            typeCount++;

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

            // カウント
            missTypeCount++;
            if (missTypeKey[currentChar]) {
              missTypeKey[currentChar]++;
            } else {
              missTypeKey[currentChar] = 1;
            }

            // ミスタイプキーを点滅させる
            watchKeyObj.missTypeKey = currentChar;

            //ミスタイプ音声
            if (missSoundCheckBox.checked) {
              // 音声を鳴らす

            }

        }

      } else {
        // もぐらたたきモードのタイピング

        // 入力キー文字列
        const inputedKeyChar = getChar(e.code);

        // 
        if(removeMoleManual(inputedKeyChar)){
          // 成功時
          console.log("nice");
        }else{
          // 失敗時
          console.log("miss");
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
