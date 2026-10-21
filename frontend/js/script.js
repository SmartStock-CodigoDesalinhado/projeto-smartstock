const API = `http://${window.location.hostname}:8080/api`;
const $ = (id) => document.getElementById(id);

async function requisicao(caminho, opcoes = {}) {
    return fetch(`${API}${caminho}`, { credentials: "include", ...opcoes });
}

async function obterCsrf() {
    const resposta = await requisicao("/usuarios/csrf");
    if (!resposta.ok) throw new Error(`Erro ao obter CSRF: ${resposta.status}`);
    return resposta.json();
}

async function consultarUsuario() {
    const resposta = await requisicao("/usuarios/me");
    if (resposta.status === 401 || resposta.status === 403) return null;
    if (!resposta.ok) throw new Error(`Erro ao consultar usuário: ${resposta.status}`);
    return resposta.json();
}

function mensagemLogin(texto, sucesso = false) {
    const elemento = $("mensagem");
    elemento.textContent = texto;
    elemento.className = `feedback ${sucesso ? "ok" : "error"}`;
}

function iniciarLogin() {
    $("toggleSenha").addEventListener("click", () => {
        const senha = $("senha");
        senha.type = senha.type === "password" ? "text" : "password";
    });

    $("loginForm").addEventListener("submit", async (evento) => {
        evento.preventDefault();
        const botao = $("entrar");
        botao.disabled = true;
        mensagemLogin("Autenticando...", true);

        try {
            const csrf = await obterCsrf();
            const parametros = new URLSearchParams({
                email: $("email").value.trim(),
                password: $("senha").value
            });
            const resposta = await requisicao("/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded", [csrf.headerName]: csrf.token },
                body: parametros
            });

            if (resposta.status === 401) {
                mensagemLogin("E-mail ou senha inválidos.");
                return;
            }
            if (!resposta.ok) throw new Error(`Erro no login: ${resposta.status}`);

            const usuario = await consultarUsuario();
            if (!usuario) throw new Error("Login realizado, mas a sessão não foi reconhecida.");
            mensagemLogin(`Bem-vindo(a), ${usuario.nome}! Redirecionando...`, true);
            window.location.replace("dashboard.html");
        } catch (erro) {
            mensagemLogin(`Não foi possível concluir o login. ${erro.message}`);
        } finally {
            botao.disabled = false;
        }
    });
}

iniciarLogin();
