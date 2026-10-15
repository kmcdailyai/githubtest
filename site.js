// ===== 새벽뉴스 공통 동작 =====

// 1) 다크모드 / 라이트모드 버튼
//    - 누르면 모드가 바뀌고, 선택한 모드를 브라우저에 저장해 다음 방문에도 유지
//    - 저장된 선택이 없으면 휴대폰·컴퓨터의 기기 설정(다크/라이트)을 따름
//    - 처음 화면을 그리기 전 모드 적용은 각 페이지 <head>의 짧은 스크립트가 맡음 (깜빡임 방지)
const modeBtn = document.getElementById("modeBtn");

function updateModeBtn() {
  const isDark = document.documentElement.classList.contains("dark");
  modeBtn.textContent = isDark ? "☀️ 라이트모드" : "🌙 다크모드";
}

function onThemeChanged() {
  updateModeBtn();
  // 댓글(Disqus)이 있는 글이면 댓글 창도 새 색으로 다시 불러옴
  if (typeof window.reloadComments === "function") window.reloadComments();
}

modeBtn.addEventListener("click", () => {
  const isDark = document.documentElement.classList.toggle("dark");
  try { localStorage.setItem("theme", isDark ? "dark" : "light"); } catch (e) {}
  onThemeChanged();
});

// 사용자가 직접 고른 적이 없으면, 기기 설정이 바뀔 때 따라 바뀜
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", e => {
  let saved = null;
  try { saved = localStorage.getItem("theme"); } catch (err) {}
  if (!saved) {
    document.documentElement.classList.toggle("dark", e.matches);
    onThemeChanged();
  }
});

updateModeBtn();

// 2) 홈: 분류 버튼을 누르면 해당 분류 글만 보이기
const filter = document.getElementById("filter");
if (filter) {
  filter.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", () => {
      filter.querySelectorAll("button").forEach(b => b.classList.remove("on"));
      btn.classList.add("on");
      const cat = btn.dataset.cat;
      document.querySelectorAll("#list .card").forEach(card => {
        card.hidden = !(cat === "전체" || card.dataset.cat === cat);
      });
    });
  });
}

// 3) 문의 폼: 페이지 이동 없이 Formspree로 보내고 결과를 화면에 표시
const contactForm = document.getElementById("contactForm");
if (contactForm) {
  const formMsg = document.getElementById("formMsg");

  contactForm.addEventListener("submit", async e => {
    e.preventDefault();
    const submitBtn = contactForm.querySelector("button[type='submit']");
    submitBtn.disabled = true;
    submitBtn.textContent = "보내는 중...";
    formMsg.className = "";
    formMsg.textContent = "";

    try {
      const res = await fetch(contactForm.action, {
        method: "POST",
        body: new FormData(contactForm),
        headers: { Accept: "application/json" }
      });
      if (!res.ok) throw new Error();
      contactForm.reset();
      formMsg.className = "ok";
      formMsg.textContent = "문의가 접수되었습니다. 확인 후 이메일로 답변드리겠습니다.";
    } catch (err) {
      formMsg.className = "err";
      formMsg.textContent = "전송에 실패했습니다. 잠시 후 다시 시도해 주세요.";
    }
    submitBtn.disabled = false;
    submitBtn.textContent = "문의 보내기";
  });
}
