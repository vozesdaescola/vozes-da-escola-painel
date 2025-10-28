const WEBAPP_URL = "https://script.google.com/macros/library/d/1nHvsIaQt19rDUxpcxwamKmoac_4orcJIZwMSXvorreR2bixGMw2-vfVc/1"; // Cole a URL do Apps Script aqui
let articles = [];

// Membros cadastrados (para login)
const members = [
  {username: "alice", password: "123"},
  {username: "bob", password: "456"}
];

// LOGIN
function login() {
  const user = document.getElementById("username").value;
  const pass = document.getElementById("password").value;

  const validUser = members.find(u => u.username === user && u.password === pass);

  if(validUser) {
    document.getElementById("login-section").style.display = "none";
    document.getElementById("dashboard").style.display = "block";
    loadArticles();
    startAutoRefresh();
  } else {
    alert("Usuário ou senha inválidos!");
  }
}

// CARREGAR PUBLICAÇÕES
async function loadArticles() {
  try {
    const res = await fetch(WEBAPP_URL);
    articles = await res.json();
    renderArticles();
  } catch (err) {
    console.error("Erro ao carregar artigos:", err);
  }
}

// RENDERIZA NO PAINEL
function renderArticles() {
  const list = document.getElementById("articles");
  list.innerHTML = "";
  articles.forEach(a => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${a.titulo}</strong> <small>(${a.autor} - ${a.data})</small><p>${a.conteudo}</p>`;
    list.appendChild(li);
  });
}

// CRIAR NOVO ARTIGO E ENVIAR AO SHEETS
function addArticle() {
  const title = document.getElementById("title").value;
  const content = document.getElementById("content").value;
  const author = document.getElementById("username").value;

  if(title && content) {
    const date = new Date().toLocaleString();
    const newArticle = {titulo: title, conteudo: content, autor: author, data: date};

    // Envia para Google Sheets
    fetch(WEBAPP_URL, {
      method: "POST",
      body: JSON.stringify(newArticle),
      headers: {"Content-Type": "application/json"}
    })
    .then(res => res.json())
    .then(data => {
      if(data.status === "sucesso") {
        articles.push(newArticle);
        renderArticles();
        document.getElementById("title").value = "";
        document.getElementById("content").value = "";
        alert("Publicação criada com sucesso!");
      } else {
        alert("Erro ao salvar publicação!");
      }
    })
    .catch(err => {
      console.error("Erro ao enviar para Sheets:", err);
      alert("Erro ao salvar publicação!");
    });

  } else {
    alert("Preencha título e conteúdo!");
  }
}

// ATUALIZA AUTOMATICAMENTE A CADA 10 SEGUNDOS
function startAutoRefresh() {
  setInterval(loadArticles, 10000);
}
