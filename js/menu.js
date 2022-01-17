window.onload = function () {

  // 
  const radioBtns = document.querySelectorAll("input[type='radio']");

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

  // スタートボタン
  const startBtn = document.getElementById("start-btn");
  startBtn.addEventListener("click", function () {
    for (let radio of radioBtns) {
      if (radio.checked) {
        startQuestion(radio.id);
      }
    }
  });

  // 問題画面
  const questionWindow = document.getElementById("question-window");

  /**
   * 
   * @param {*} id 
   */
  function startQuestion(id) {

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

    }, 3000);

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

    //
    questionTextElement.insertAdjacentText("afterbegin", "サンプル問題");
    remainingTextElement.insertAdjacentText("afterbegin", "sannpurumonndai");
    inputedTextElement.insertAdjacentText("afterbegin", "111");
  }
}
