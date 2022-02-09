window.onload = function () {

  // メニューボタン
  const menuBtns = document.querySelectorAll("input[name='menu']");

  // スタートボタン
  const startBtn = document.getElementById("start-btn");

  // リトライボタン
  const retryBtn = document.getElementById("retry-btn");

  // 戻るボタン
  const backBtn = document.getElementById("back-btn");

  // 音声チェックボックス
  const soundCheckBox = document.getElementById("sound");

  // タイピングナビチェックボックス
  const typingNaviCheckBox = document.getElementById("typing-navi");

  // 苦手キーチェックボックス
  const settingWeakKeyCheckBox = document.getElementById("setting-weak-key");

  // 苦手キーセレクトボックス
  const weakKeySelectBox = document.getElementById("weak-key");

  // 問題数セレクトボックス
  const questionCountSelectBox = document.getElementById("question-count");

  // もぐら出現間隔ボタン
  const showMoleIntervalBtns = document.querySelectorAll("input[name='show-mole-interval']");

  // もぐら滞在時間セレクトボックス
  const moleDurationBtns = document.querySelectorAll("input[name='mole-duration']");

  // もぐらたたき回数セレクトボックス
  const whackMoleClearCountSelectBox = document.getElementById("whack-mole-clear-count");

  // 時間制限チェックボックス
  const settingTimeLimitCheckBox = document.getElementById("setting-time-limit");

  // 時間制限セレクトボックス
  const timeLimitSelectBox = document.getElementById("time-limit");

  // 残り時間カウンター
  const timeLimitCounter = document.getElementById("time-limit-counter");

  // 残り時間テキスト
  const remainingTimeTextElement = document.getElementById("remaining-time-text");

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

  // 結果評価
  const resultEvaluation = document.getElementById("evaluation-text");

  // 結果スコア
  const resultScore = document.getElementById("score-text");

  // 結果表
  const normalResultTable = document.getElementById("normal-result-table");

  // 結果表：WPM
  const resultWpm = document.getElementById("wpm");

  // 結果表：タイプ数
  const resultTypeCount = document.getElementById("type-count");

  // 結果表：ミスタイプ数
  const resultMissTypeCount = document.getElementById("miss-type-count");

  // 結果表：正答率
  const resultCorrectPercentage = document.getElementById("correct-percentage");

  // 結果表：ミスタイプキー
  const resultMissKey = document.getElementById("miss-key");

  // 結果表（もぐらたたき）
  const whackMoleResultTable = document.getElementById("whack-mole-result-table");

  // 結果表（もぐらたたき）：もぐら出現数
  const resultWhackMoleShowCount = document.getElementById("whack-mole-show-count");

  // 結果表（もぐらたたき）：叩いた数
  const resultWhackMoleCount = document.getElementById("whack-mole-count");

  // 結果表（もぐらたたき）：逃げられた数
  const resultWhackMoleMissCount = document.getElementById("whack-mole-miss-count");

  // 結果表（もぐらたたき）：撃破率
  const resultWhackMolePercentage = document.getElementById("whack-mole-percentage");

  // 結果表（もぐらたたき）：ミスタイプ数
  const resultWhackMoleMissTypeCount = document.getElementById("whack-mole-miss-type-count");

  // ミスタイプ音
  const missTypeAudio = new Audio("audio/miss.mp3");

  // ピコピコハンマー音
  const pikopikoAudio = new Audio("audio/pikopiko.wav");

  // 選択カテゴリー
  let selectedId;

  // 問題数
  let questionCount;

  // 苦手キー
  let weakKey;

  // 時間制限
  let timeLimit;

  // タイピング時間計測
  let typingTime;

  // もぐら出現間隔
  let showMoleInterval;

  // もぐら滞在時間
  let moleDuration;

  // もぐらたたきクリア回数設定
  let settingWhackMoleCount;

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
  let totalQuestionTypeCount = 0;

  // 結果表示用（もぐらたたき）
  let whackMoleShowCount = 0;
  let whackMoleMissCount = 0;

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
      remainingTimeTextElement.textContent = value / 1000;

      if (value === 10000) {
        remainingTimeTextElement.classList.add("last-10");
      } else if (value === 5000) {
        remainingTimeTextElement.classList.remove("last-10");
        remainingTimeTextElement.classList.add("last-5");
      } else if (value === 0) {
        remainingTimeTextElement.classList.remove("last-5");
        showResultWindow();
      }
    }
  });

  // メニューボタンイベント設定
  for (let radio of menuBtns) {
    radio.addEventListener("change", function () {
      if (this.checked) {
        for (let i = 1; i <= menuBtns.length; i++) {
          document.getElementById("menu-" + i + "-text").style.display = "none";
        }
        document.getElementById(radio.id + "-text").style.display = "block";
        document.getElementById("description-img").setAttribute("src", "img/" + radio.id + ".gif")
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

  /**
   * データ初期化
   */
  function clearData() {
    // 問題データ保持用
    questionData = [];
    currentQuetionData = {};
    currentQuestionIndex = 0;
    currentTypingTextArray = [];
    currentTypingTextIndex = 0;

    // もぐらたたき
    showedKey = [];
    canShowKey = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
    canShowIndex = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    whackMoleShowCount = 0;
    whackMoleMissCount = 0;

    // 結果表示用
    typeCount = 0;
    missTypeCount = 0;
    missTypeKey = {};
    totalQuestionTypeCount = 0;

    // ミスタイプキーのスタイルクリア
    clearMissTypeKeyStyle();

    // 問題テキストクリア
    watchDisplayTextObj.question = "";
    watchDisplayTextObj.remaining = "";
    watchDisplayTextObj.inputed = "";

    // 残り時間カウンターリセット
    timeLimitCounter.style.display = "none";
    removeForwardMatchClass("circle-", timeLimitCounter.firstElementChild);
  }

  /**
   * ミスタイプキーのスタイル解除
   */
  function clearMissTypeKeyStyle() {
    // 対象の要素
    const targetElements = document.getElementsByClassName("missed-key");

    Array.from(targetElements).forEach(e => {
      e.classList.remove("missed-key");

      // opacity-*クラス名の削除
      removeForwardMatchClass("opacity-", e);
    });
  }

  /**
   * 前方一致クラス名削除
   * @param {String} pattern 検索文字列
   * @param {HTMLElement} targetElement 対象の要素
   */
  function removeForwardMatchClass(pattern, targetElement) {
    // 'pattern'-*のクラス名検索用正規表現
    const regExp = new RegExp(pattern + "\\S+", "g");
    const className = targetElement.className;
    const matchedNameList = className.match(regExp) || [];
    matchedNameList.forEach(name => {
      targetElement.classList.remove(name);
    });
  }

  /**
   * 問題開始
   */
  function startQuestion() {
    // 問題数の設定値チェック
    let pattern = /^[1-9]+[0-9]*$/;
    if (pattern.test(questionCountSelectBox.value)) {
      questionCount = Number(questionCountSelectBox.value);
    } else {
      alert(ERROR_SELECT_QUESTION_COUNT);
      return;
    }

    // 苦手キーの設定値チェック
    if (settingWeakKeyCheckBox.checked) {
      pattern = /^[0-9-]$/;
      if (pattern.test(weakKeySelectBox.value)) {
        weakKey = weakKeySelectBox.value;
      } else {
        alert(ERROR_SELECT_WEAK_KEY);
        return;
      }
    }

    // 制限時間の設定値チェック
    if (settingTimeLimitCheckBox.checked) {
      pattern = /^[1-9]+[0-9]*$/;
      if (pattern.test(timeLimitSelectBox.value)) {
        timeLimit = timeLimitSelectBox.value;
      } else {
        alert(ERROR_SELECT_TIME_LIMIT);
        return;
      }
    }

    // もぐら出現間隔の設定値チェック
    let isCheckedShowMoleInterval = false;
    pattern = /^[1-9]+[0-9]*$/;
    showMoleIntervalBtns.forEach(button => {
      if (button.checked) {
        if (pattern.test(button.value)) {
          showMoleInterval = Number(button.value);
          isCheckedShowMoleInterval = true;
        } else {
          alert(ERROR_SELECT_SHOW_MOLE_INTERVAL);
          return;
        }
      }
    });
    if (!isCheckedShowMoleInterval) {
      alert(NOT_CHECKED_SHOW_MOLE_INTERVAL);
      return;
    }

    // もぐら滞在時間の設定値チェック
    let isCheckedMoleDuration = false;
    pattern = /^[1-9]+[0-9]*$/;
    moleDurationBtns.forEach(button => {
      if (button.checked) {
        if (pattern.test(button.value)) {
          moleDuration = Number(button.value);
          isCheckedMoleDuration = true;
        } else {
          alert(ERROR_MOLE_DURATION);
          return;
        }
      }
    });
    if (!isCheckedMoleDuration) {
      alert(NOT_CHECKED_MOLE_DURATION);
      return;
    }

    // もぐらたたきクリア回数の設定値チェック
    pattern = /^[1-9]+[0-9]*$/;
    if (pattern.test(whackMoleClearCountSelectBox.value)) {
      settingWhackMoleCount = Number(whackMoleClearCountSelectBox.value);
    } else {
      alert(ERROR_SELECT_WHACK_MOLE_CLEAR_COUNT);
      return;
    }


    // 選択カテゴリー
    for (let radio of menuBtns) {
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
        timeLimitCounter.firstElementChild.classList.add("circle-" + timeLimit);
        watchTimeObj.remainingTime = Number(timeLimit) * 1000;

        // 1秒ずつカウント
        timeLimitIntervalId = setInterval(() => {
          watchTimeObj.remainingTime -= 1000;
        }, 1000);
      }

      // タイピング時間計測スタート
      typingTime = performance.now();

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

  /**
   * もぐらたたき開始
   */
  function startWhackMole() {
    canPlayWhackMole = true;
    whackMoleIntervalId = setInterval(() => {
      const adjustmentMillisecond = Math.floor(Math.random() * ADJUSTMENT_MAX_RANDOM_VALUE);
      setTimeout(() => {
        // 出現処理
        const key = shuffle(canShowKey).shift();
        if (key === undefined) {
          return;
        }
        const index = shuffle(canShowIndex).shift();
        const id = Math.random();
        showedKey.push({ key: key, index: index, id: id });

        const imgElement = document.createElement("img");
        imgElement.setAttribute("src", "img/number_" + key + ".png");
        imgElement.setAttribute("id", id);
        imgElement.setAttribute("class", "number-img");
        imgElement.style.setProperty("animation-duration", moleDuration + "ms");
        const area = document.getElementById("area-" + index);
        area.appendChild(imgElement);

        // もぐら出現カウント
        whackMoleShowCount++;

        // 一定時間経過後、削除処理
        setTimeout(() => {
          removeMoleAuto(key, id);
        }, moleDuration);
      }, adjustmentMillisecond);

    }, showMoleInterval);
  }

  /**
   * もぐら自動削除
   * @param {String} keyChar キー文字列 
   * @param {String} targetId 対象のid
   */
  function removeMoleAuto(keyChar, targetId) {
    const targetIndex = showedKey.findIndex(item => item.key === keyChar);
    if (targetIndex !== -1) {
      const key = showedKey[targetIndex].key;
      const index = showedKey[targetIndex].index;
      const id = showedKey[targetIndex].id;
      if (id === targetId) {
        const imgElement = document.getElementById(targetId);
        imgElement.parentNode.removeChild(imgElement);
        showedKey.splice(targetIndex, 1);
        canShowKey.push(key);
        canShowIndex.push(index);

        // もぐら見逃し数カウント
        whackMoleMissCount++;
      }
    }
  }

  /**
   * もぐら手動削除
   * @param {String} keyChar キー文字列
   * @returns {Boolean} 削除されたかどうか
   */
  function removeMoleManual(keyChar) {
    const targetIndex = showedKey.findIndex(item => item.key === keyChar);
    if (targetIndex !== -1) {
      const key = showedKey[targetIndex].key;
      const index = showedKey[targetIndex].index;
      const id = showedKey[targetIndex].id;
      const imgElement = document.getElementById(id);
      imgElement.parentNode.removeChild(imgElement);

      const whackImgElement = document.createElement("img");
      whackImgElement.setAttribute("src", "img/pikopiko_hummer.png");
      whackImgElement.setAttribute("class", "whack-img");
      const area = document.getElementById("area-" + index);
      area.appendChild(whackImgElement);
      playSound(pikopikoAudio);

      showedKey.splice(targetIndex, 1);
      setTimeout(() => {
        whackImgElement.parentNode.removeChild(whackImgElement);
        canShowKey.push(key);
        canShowIndex.push(index);
      }, WHACK_MOLE_EFFECT_IMAGE_DURATION);
      return true;
    }
    return false;
  }

  /**
   * 配列内容をシャッフル
   * @param {Array} array 配列
   * @returns {Array} シャッフルされた配列
   */
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

  /**
   * 問題表示テキスト初期化
   */
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
   * 数値問題作成
   */
  function createNumTypingQuestion() {
    for (let i = 0; i < questionCount; i++) {
      let questionNum = Math.floor((Math.random() * 2 - 1) * NUMBER_TYPING_QUESTION_MAX_VALUE);

      // 苦手キー設定時、問題に含まれるまで再度作成
      if (settingWeakKeyCheckBox.checked) {
        while (String(questionNum).indexOf(weakKey) === -1) {
          questionNum = Math.floor((Math.random() * 2 - 1) * NUMBER_TYPING_QUESTION_MAX_VALUE);
        }
      }
      const data = {
        questionText: String(questionNum),
        typingText: String(questionNum)
      };

      // 作成した問題追加
      questionData.push(data);
      totalQuestionTypeCount += data.typingText.length;
    }

    // 問題表示初期化
    initDisplayText();
  }

  /**
   * 計算問題作成
   */
  function createCalcTypingQuestion() {
    for (let i = 0; i < questionCount; i++) {
      let questionText;
      let typingText;

      do {
        // 乱数　0:加算、1:減算、2:乗算
        const type = Math.floor(Math.random() * 3);
        if (type === 0) {
          // 加算
          const num1 = Math.floor((Math.random() * 2 - 1) * ADDITION_QUESTION_MAX_VALUE);
          const num2 = Math.floor((Math.random() * 2 - 1) * ADDITION_QUESTION_MAX_VALUE);
          questionText = String(num1 + " + " + num2);
          typingText = String(num1 + num2);
        } else if (type === 1) {
          // 減算
          const num1 = Math.floor((Math.random() * 2 - 1) * SUBTRACTION_QUESTION_MAX_VALUE);
          const num2 = Math.floor((Math.random() * 2 - 1) * SUBTRACTION_QUESTION_MAX_VALUE);
          questionText = String(num1 + " - " + num2);
          typingText = String(num1 - num2);
        } else {
          // 乗算
          const num1 = Math.floor((Math.random() * 2 - 1) * MULTIPLICATION_QUESTION_MAX_VALUE);
          const num2 = Math.floor((Math.random() * 2 - 1) * MULTIPLICATION_QUESTION_MAX_VALUE);
          questionText = String(num1 + " × " + num2);
          typingText = String(num1 * num2);
        }
      } while (settingWeakKeyCheckBox.checked && typingText.indexOf(weakKey) === -1);

      const data = {
        questionText: questionText,
        typingText: typingText
      };

      // 作成問題を追加
      questionData.push(data);
      totalQuestionTypeCount += data.typingText.length;
    }

    // 問題表示初期化
    initDisplayText();
  }

  /**
   * 表示テキスト変更
   * @param {String} elementId テキスト要素id
   * @param {String} newValue 新しいテキスト 
   */
  function changeDisplayText(elementId, newValue) {
    document.getElementById(elementId).textContent = newValue;
  }

  /**
   * 結果表示用テキスト作成
   * @param {Object} obj キー連想配列
   * @param {Number} count 表示上限数
   * @returns {String} 結果表示用テキスト
   */
  function formatKeySet(obj, count) {
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

    let n = 0;
    for (let i = 0; i < arr.length; i++) {
      result += arr[i].key + ", ";
      n++;
      if (n === count) {
        break;
      }
    }

    result = result.slice(0, -2);
    return result;
  }

  /**
   * ミスタイプキーのスタイル設定
   * @param {Number} missTypeCount ミスタイプ数
   * @param {Object} missTypeKey ミスタイプキー連想配列
   */
  function fillMissKey(missTypeCount, missTypeKey) {
    Object.keys(missTypeKey).forEach(key => {
      const opacityType = Math.ceil((missTypeKey[key] / missTypeCount) * 10);
      document.getElementById("key-" + key).classList.add("missed-key");
      document.getElementById("key-" + key).classList.add("opacity-" + opacityType);
    });
  }

  /**
   * 数値、計算タイピングの評価ランクを取得
   * @param {Number} wpm wpm
   * @param {Number} typeCount 正解タイプ数
   * @param {Number} totalQuestionTypeCount 問題総タイプ数
   * @param {Number} correctPercentage 正答率
   * @returns {Object} 評価データ
   */
  function calcNumTypingEvaluationRank(wpm, typeCount, totalQuestionTypeCount, correctPercentage) {
    let result = { score: "", evaluation: "" };
    const wpmRank = wpm / 250;
    const score = Math.floor((correctPercentage - Math.floor((1 - (typeCount / totalQuestionTypeCount)) * 100)) * wpmRank);
    if (score === 100) {
      result.evaluation = "S";
    } else if (90 <= score && score <= 99) {
      result.evaluation = "A";
    } else if (75 <= score && score <= 89) {
      result.evaluation = "B"
    } else if (60 <= score && score <= 74) {
      result.evaluation = "C";
    } else if (30 <= score && score <= 59) {
      result.evaluation = "D";
    } else if (1 <= score && score <= 29) {
      result.evaluation = "E";
    } else {
      result.evaluation = "F";
    }
    result.score = score;

    return result;
  }

  /**
   * もぐらたたきの評価ランクを取得
   * @param {Number} percentage 撃破率
   * @param {Number} missTypeCount ミスタイプ数
   * @returns {Object} 評価データ
   */
  function calcWhackMoleEvaluationRank(percentage, missTypeCount) {
    let result = { score: "", evaluation: "" };
    let score = percentage - missTypeCount;
    if (score === 100) {
      result.evaluation = "S";
    } else if (90 <= score && score <= 99) {
      result.evaluation = "A";
    } else if (75 <= score && score <= 89) {
      result.evaluation = "B"
    } else if (60 <= score && score <= 74) {
      result.evaluation = "C";
    } else if (30 <= score && score <= 59) {
      result.evaluation = "D";
    } else if (1 <= score && score <= 29) {
      result.evaluation = "E";
    } else {
      result.evaluation = "F";
      score = 0;
    }
    result.score = score;

    return result;
  }

  /**
   * スコアのカウントアップ表示処理
   * @param {Number} score 結果スコア
   */
  function setResultScore(score) {
    let n = 0;
    const intervalId = setInterval(() => {
      resultScore.textContent = n;
      if (n === score) {
        clearInterval(intervalId);
      }
      n++;
    }, 10);
  }

  /**
   * 結果表示
   */
  function showResultWindow() {
    // タイピング時間計測ストップ
    typingTime = performance.now() - typingTime;

    // 制限時間タイマーストップ処理
    if (settingTimeLimitCheckBox.checked) {
      clearInterval(timeLimitIntervalId);
      timeLimitCounter.style.display = "none";
    }

    // タイピング判定無し
    canTypeKey = false;

    if (selectedId === "menu-1" || selectedId === "menu-2") {
      // 問題画面非表示
      questionWindow.style.display = "none";

      // タイピングナビ初期化用
      watchKeyObj.targetKey = "";
      watchKeyObj.missTypeKey = "";

      // 各結果値設定
      const wpm = Math.floor((typeCount / typingTime) * 1000 * 60);
      let percentage;
      if (typeCount === 0 && missTypeCount === 0) {
        percentage = 0;
      } else {
        percentage = Math.floor((typeCount / (typeCount + missTypeCount)) * 100);
      }
      const evaluationData = calcNumTypingEvaluationRank(wpm, typeCount, totalQuestionTypeCount, percentage);
      resultWpm.textContent = wpm;
      resultTypeCount.textContent = typeCount + " / " + totalQuestionTypeCount;
      resultMissTypeCount.textContent = missTypeCount;
      resultCorrectPercentage.textContent = percentage;
      resultMissKey.textContent = formatKeySet(missTypeKey, 3);
      resultEvaluation.textContent = evaluationData.evaluation;
      setResultScore(evaluationData.score);

      // ミスキーのスタイル設定
      fillMissKey(missTypeCount, missTypeKey);

      // 結果表表示
      normalResultTable.style.display = "flex";
      whackMoleResultTable.style.display = "none";
    } else if (selectedId === "menu-3") {
      // もぐらたたき画面非表示
      whackMoleWindow.style.display = "none";
      clearInterval(whackMoleIntervalId);
      canPlayWhackMole = false;

      // 各結果値設定
      resultWhackMoleShowCount.textContent = whackMoleShowCount;
      resultWhackMoleCount.textContent = typeCount;
      resultWhackMoleMissCount.textContent = whackMoleMissCount;
      const percentage = Math.floor((typeCount / whackMoleShowCount) * 100);
      resultWhackMolePercentage.textContent = percentage;
      resultWhackMoleMissTypeCount.textContent = missTypeCount;
      const evaluationData = calcWhackMoleEvaluationRank(percentage, missTypeCount);
      resultEvaluation.textContent = evaluationData.evaluation;
      setResultScore(evaluationData.score);

      // 結果表表示
      whackMoleResultTable.style.display = "flex";
      normalResultTable.style.display = "none";
    }

    // 結果画面表示
    resultWindow.style.display = "flex";
  }

  /**
   * 音声再生
   * @param {Audio} audio 音声データ
   */
  function playSound(audio) {
    if (soundCheckBox.checked) {
      audio.currentTime = 0;
      audio.play();
    }
  }

  /**
   * キータイプ判定処理
   * @param {*} e keydownイベント
   */
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
          case true: // 正しいタイピング時

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
          case false: // ミスタイプ時

            // カウント
            missTypeCount++;
            if (missTypeKey[currentChar]) {
              missTypeKey[currentChar]++;
            } else {
              missTypeKey[currentChar] = 1;
            }

            // ミスタイプキーを点滅させる
            watchKeyObj.missTypeKey = currentChar;

            // 音声を鳴らす
            playSound(missTypeAudio);

        }

      } else {
        // もぐらたたきモードのタイピング

        // 入力キー文字列
        const inputedKeyChar = getChar(e.code);

        // もぐらたたき判定
        if (removeMoleManual(inputedKeyChar)) {
          // 成功時
          typeCount++;
          if (typeCount === settingWhackMoleCount) {
            showResultWindow();
          }
        } else {
          // 失敗時
          missTypeCount++;
          playSound(missTypeAudio);
        }
      }


    }
  }

  /**
   * 対象の指要素id取得
   * @param {String} keyChar キー文字列
   * @returns {String} 要素id
   */
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
   * キーコードから文字列取得
   * @param {String} code キーコード
   * @returns {String} キー文字列
   */
  function getChar(code) {
    switch (code) {
      case "Digit0":
      case "Numpad0":
        return "0";
      case "Digit1":
      case "Numpad1":
        return "1";
      case "Digit2":
      case "Numpad2":
        return "2";
      case "Digit3":
      case "Numpad3":
        return "3";
      case "Digit4":
      case "Numpad4":
        return "4";
      case "Digit5":
      case "Numpad5":
        return "5";
      case "Digit6":
      case "Numpad6":
        return "6";
      case "Digit7":
      case "Numpad7":
        return "7";
      case "Digit8":
      case "Numpad8":
        return "8";
      case "Digit9":
      case "Numpad9":
        return "9";
      case "Comma":
        return ",";
      case "Period":
        return ".";
      case "Minus":
      case "NumpadSubtract":
        return "-";
      default:
        return "";
    }
  }

  /**
   * 入力キー判定
   * @param {*} code キーコード
   * @param {*} targetChar 対象の文字列
   * @returns {Boolean} 入力キーが正しいかどうか
   */
  function checkInputKey(code, targetChar) {
    const inputChar = getChar(code);

    if (inputChar === targetChar) {
      return true;
    }

    return false;
  }




}
