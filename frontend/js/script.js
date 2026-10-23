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

function abrirModal(id) {
    const modal = $(id);

    modal.hidden = false;
    document.body.classList.add("modal-aberto");

    const primeiroCampo = modal.querySelector("input, button");
    primeiroCampo?.focus();
}

function fecharModal(modal) {
    modal.hidden = true;
    document.body.classList.remove("modal-aberto");
}

function iniciarModais() {
    $("abrirContato").addEventListener("click", () => {
        abrirModal("modalContato");
    });

    $("abrirCadastroCeo").addEventListener("click", () => {
        abrirModal("modalCadastroCeo");
    });

    document.querySelectorAll("[data-fechar-modal]").forEach((botao) => {
        botao.addEventListener("click", () => {
            fecharModal(botao.closest(".modal-overlay"));
        });
    });

    document.querySelectorAll(".modal-overlay").forEach((modal) => {
        modal.addEventListener("click", (evento) => {
            if (evento.target === modal) {
                fecharModal(modal);
            }
        });
    });

    document.addEventListener("keydown", (evento) => {
        if (evento.key === "Escape") {
            document.querySelectorAll(".modal-overlay:not([hidden])").forEach(fecharModal);
        }
    });
}

iniciarModais();


function mensagemCadastroCeo(texto, sucesso = false) {
    const elemento = $("mensagemCeo");

    elemento.textContent = texto;
    elemento.className = `feedback ${sucesso ? "ok" : "error"}`;
}

function iniciarCadastroCeo() {
    $("cadastroCeoForm").addEventListener("submit", async (evento) => {
        evento.preventDefault();

        const nome = $("nomeCeo").value.trim();
        const login = $("emailCeo").value.trim();
        const senha = $("senhaCeo").value;
        const confirmarSenha = $("confirmarSenhaCeo").value;

        if (senha !== confirmarSenha) {
            mensagemCadastroCeo("As senhas não coincidem.");
            return;
        }

        const botao = $("salvarCeo");
        botao.disabled = true;

        mensagemCadastroCeo("Verificando cadastro...", true);

        try {
            const csrf = await obterCsrf();

            const resposta = await requisicao("/usuarios/ceo-inicial", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    [csrf.headerName]: csrf.token
                },
                body: JSON.stringify({
                    nome,
                    login,
                    senha,
                    tipoUsuario: "CEO"
                })
            });

            if (resposta.status === 404) {
                mensagemCadastroCeo("O cadastro inicial do CEO ainda não está disponível no servidor.");
                return;
            }

            if (resposta.status === 403 || resposta.status === 409) {
                mensagemCadastroCeo("O cadastro inicial não está permitido. O sistema pode já possuir um CEO.");
                return;
            }

            if (!resposta.ok) {
                mensagemCadastroCeo("Não foi possível realizar o cadastro. Verifique os dados informados.");
                return;
            }

            mensagemCadastroCeo("CEO cadastrado com sucesso! Você já pode entrar no SmartStock.", true);
            $("cadastroCeoForm").reset();
            $("areaCadastroCeo").hidden = true;
        } catch (erro) {
            mensagemCadastroCeo("Não foi possível conectar ao servidor.");
        } finally {
            botao.disabled = false;
        }
    });
}

iniciarCadastroCeo();

async function verificarCadastroCeo() {
    const areaCadastro = $("areaCadastroCeo");

    areaCadastro.hidden = true;

    try {
        const resposta = await requisicao("/usuarios/ceo-inicial/disponibilidade");

        if (!resposta.ok) return;

        const dados = await resposta.json();

        areaCadastro.hidden = dados.disponivel !== true;
    } catch (erro) {
        areaCadastro.hidden = true;
    }
}

verificarCadastroCeo();