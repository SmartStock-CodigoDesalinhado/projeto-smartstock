const API = `http://${window.location.hostname}:8080/api`;
const $ = id => document.getElementById(id);
let fornecedores = [];

// ==========================================
// ESTADO DOS MODAIS DE EXCLUSÃO
// ==========================================

let fornecedorPendenteExclusao = null;
let administradorPendenteExclusao = null;

let exclusaoFornecedorEmAndamento = false;
let exclusaoAdministradorEmAndamento = false;

async function requisicao(caminho, opcoes = {}) {
    return fetch(`${API}${caminho}`, { credentials: "include", ...opcoes });
}

async function obterCsrf() {
    const resposta = await requisicao("/usuarios/csrf");
    if (!resposta.ok) throw new Error(`Falha ao obter CSRF: ${resposta.status}`);
    return resposta.json();
}

async function consultarUsuario() {
    const resposta = await requisicao("/usuarios/me");
    if (resposta.status === 401 || resposta.status === 403) return null;
    if (!resposta.ok) throw new Error(`Falha ao consultar usuário: ${resposta.status}`);
    return resposta.json();
}

async function consultarLista(caminho) {
    const resposta = await requisicao(caminho);
    if (resposta.status === 401 || resposta.status === 403) {
        window.location.replace("index.html");
        throw new Error("Sessão encerrada.");
    }
    if (!resposta.ok) throw new Error(`Falha na consulta ${caminho}: ${resposta.status}`);
    const dados = await resposta.json();
    if (!Array.isArray(dados)) throw new Error("Formato inesperado da resposta.");
    return dados;
}

async function enviarDados(caminho, metodo, dados) {
    const csrf = await obterCsrf();
    const resposta = await requisicao(caminho, {
        method: metodo,
        headers: { "Content-Type": "application/json", [csrf.headerName]: csrf.token },
        body: JSON.stringify(dados)
    });
    if (resposta.status === 401 || resposta.status === 403) throw new Error("Sua sessão expirou ou você não possui permissão.");
    if (!resposta.ok) throw new Error(`Falha ao salvar: ${resposta.status}`);
    return resposta;
}

function texto(valor) {
    return String(valor ?? "—");
}

function adicionarCelula(linha, conteudo) {
    const celula = document.createElement("td");
    celula.textContent = texto(conteudo);
    linha.append(celula);
    return celula;
}

function formatarCnpj(valor) {
    const numeros = String(valor ?? "").replace(/\D/g, "");
    return numeros.length === 14 ? numeros.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5") : texto(valor);
}

function renderizarFornecedores() {
    const pesquisa = $("pesquisarFornecedor").value.trim().toLocaleLowerCase("pt-BR");
    const apenasNumeros = pesquisa.replace(/\D/g, "");
    const filtrados = fornecedores.filter(fornecedor => {
        const nome = String(fornecedor.nomeFornecedor ?? "").toLocaleLowerCase("pt-BR");
        const cnpj = String(fornecedor.cnpj ?? "");
        return nome.includes(pesquisa) || (apenasNumeros && cnpj.replace(/\D/g, "").includes(apenasNumeros));
    });
    const corpo = $("listaFornecedores");
    corpo.replaceChildren();
    if (!filtrados.length) {
        const linha = document.createElement("tr");
        const celula = adicionarCelula(linha, pesquisa ? "Nenhum fornecedor encontrado para esta pesquisa." : "Você ainda não possui fornecedores cadastrados.");
        celula.colSpan = 5;
        corpo.append(linha);
        return;
    }
    for (const fornecedor of filtrados) {
        const linha = document.createElement("tr");
        adicionarCelula(linha, fornecedor.nomeFornecedor);
        adicionarCelula(linha, formatarCnpj(fornecedor.cnpj));
        adicionarCelula(linha, fornecedor.telefoneComercial);
        adicionarCelula(linha, fornecedor.emailFornecedor || "—");
        const acoes = document.createElement("td");
        for (const [rotulo, acao] of [["Detalhes", "detalhes"], ["Editar", "editar"], ["Excluir", "excluir"]]) {
            const botao = document.createElement("button");
            botao.type = "button";
            botao.className = `forn-action${acao === "excluir" ? " delete" : ""}`;
            botao.textContent = rotulo;
            botao.dataset.acao = acao;
            botao.dataset.id = String(fornecedor.id);
            acoes.append(botao);
        }
        linha.append(acoes);
        corpo.append(linha);
    }
}

async function carregarFornecedores() {
    $("statusFornecedores").textContent = "Atualizando fornecedores...";
    try {
        fornecedores = await consultarLista("/fornecedores");
        fornecedores.sort((a, b) => String(a.nomeFornecedor ?? "").localeCompare(String(b.nomeFornecedor ?? ""), "pt-BR"));
        $("totalFornecedores").textContent = fornecedores.length.toLocaleString("pt-BR");
        $("statusFornecedores").textContent = "";
        renderizarFornecedores();
    } catch (erro) {
        console.error("Erro ao carregar fornecedores:", erro);
        $("statusFornecedores").textContent = "Não foi possível consultar os fornecedores. Tente novamente.";
        $("listaFornecedores").replaceChildren();
        const linha = document.createElement("tr");
        adicionarCelula(linha, "Informações indisponíveis.").colSpan = 5;
        $("listaFornecedores").append(linha);
        $("totalFornecedores").textContent = "—";
    }
}

function abrirFormulario(fornecedor = null) {
    $("formFornecedor").reset();
    $("resultadoFornecedor").textContent = "";
    $("idFornecedor").value = fornecedor?.id ?? "";
    $("nomeFornecedor").value = fornecedor?.nomeFornecedor ?? "";
    $("cnpjFornecedor").value = fornecedor?.cnpj ?? "";
    $("telefoneFornecedor").value = fornecedor?.telefoneComercial ?? "";
    $("emailFornecedor").value = fornecedor?.emailFornecedor ?? "";
    $("enderecoFornecedor").value = fornecedor?.logradouroComercio ?? "";
    $("tituloModalFornecedor").textContent = fornecedor ? "Editar fornecedor" : "Novo fornecedor";
    $("salvarFornecedor").textContent = fornecedor ? "Salvar alterações" : "Cadastrar fornecedor";
    $("modalFornecedor").showModal();
}

function abrirDetalhes(fornecedor) {
    const lista = $("detalhesFornecedor");
    lista.replaceChildren();
    const campos = [
        ["Fornecedor", fornecedor.nomeFornecedor],
        ["CNPJ", formatarCnpj(fornecedor.cnpj)],
        ["Telefone comercial", fornecedor.telefoneComercial],
        ["E-mail", fornecedor.emailFornecedor || "Não informado"],
        ["Endereço", fornecedor.logradouroComercio]
    ];
    for (const [titulo, valor] of campos) {
        const termo = document.createElement("dt");
        termo.textContent = titulo;
        const descricao = document.createElement("dd");
        descricao.textContent = texto(valor);
        lista.append(termo, descricao);
    }
    $("modalDetalhes").showModal();
}

async function salvarFornecedor(evento) {
    evento.preventDefault();
    const nomeFornecedor = $("nomeFornecedor").value.trim();
    const cnpj = $("cnpjFornecedor").value.replace(/\D/g, "");
    const telefoneComercial = $("telefoneFornecedor").value.trim();
    const emailFornecedor = $("emailFornecedor").value.trim();
    const logradouroComercio = $("enderecoFornecedor").value.trim();
    if (!/^[\p{L} ]+$/u.test(nomeFornecedor)) {
        $("resultadoFornecedor").textContent = "O nome deve conter apenas letras e espaços, conforme as regras atuais de cadastro.";
        return;
    }
    if (cnpj.length !== 14) {
        $("resultadoFornecedor").textContent = "Informe um CNPJ com 14 dígitos.";
        return;
    }
    const id = $("idFornecedor").value;
    const botao = $("salvarFornecedor");
    botao.disabled = true;
    $("resultadoFornecedor").textContent = "Salvando fornecedor...";
    try {
        await enviarDados(id ? `/fornecedores/${id}` : "/fornecedores", id ? "PUT" : "POST", {
            nomeFornecedor, cnpj, telefoneComercial, emailFornecedor: emailFornecedor || null, logradouroComercio
        });
        $("modalFornecedor").close();
        await carregarFornecedores();
        if (!$("statusFornecedores").textContent) $("statusFornecedores").textContent = id ? "Fornecedor atualizado com sucesso." : "Fornecedor cadastrado com sucesso.";
    } catch (erro) {
        console.error("Erro ao salvar fornecedor:", erro);
        $("resultadoFornecedor").textContent = "Não foi possível salvar o fornecedor. Confira os dados e se CNPJ, e-mail ou telefone já estão cadastrados.";
    } finally {
        botao.disabled = false;
    }
}

   // ==========================================
// MODAL DE CONFIRMAÇÃO DE EXCLUSÃO DE FORNECEDOR
// ==========================================

function excluirFornecedor(fornecedor) {
    if (exclusaoFornecedorEmAndamento) return;

    if (
        !fornecedor ||
        !Number.isSafeInteger(Number(fornecedor.id)) ||
        Number(fornecedor.id) <= 0
    ) {
        $("statusFornecedores").textContent =
            "Fornecedor inválido. Atualize a lista.";
        return;
    }

    fornecedorPendenteExclusao = {
        id: fornecedor.id,
        nome: fornecedor.nomeFornecedor
    };

    $("mensagemExclusaoFornecedor").textContent =
        `Deseja excluir permanentemente o fornecedor "${fornecedor.nomeFornecedor}"?`;

    $("erroExclusaoFornecedor").textContent = "";
    $("erroExclusaoFornecedor").hidden = true;

    $("modalExclusaoFornecedor").showModal();
}


// ==========================================
// CONFIRMAÇÃO DA EXCLUSÃO DE FORNECEDOR
// ==========================================

async function confirmarExclusaoFornecedor() {
    if (
        exclusaoFornecedorEmAndamento ||
        !fornecedorPendenteExclusao
    ) {
        return;
    }

    const fornecedor = fornecedorPendenteExclusao;

    const confirmar = $("confirmarExclusaoFornecedor");
    const cancelar = $("cancelarExclusaoFornecedor");
    const erroModal = $("erroExclusaoFornecedor");

    exclusaoFornecedorEmAndamento = true;

    confirmar.disabled = true;
    cancelar.disabled = true;
    confirmar.textContent = "Excluindo...";

    erroModal.hidden = true;
    erroModal.textContent = "";

    try {
        const csrf = await obterCsrf();

        const resposta = await requisicao(
            `/fornecedores/${encodeURIComponent(fornecedor.id)}`,
            {
                method: "DELETE",
                headers: {
                    [csrf.headerName]: csrf.token
                }
            }
        );

        if (resposta.status === 401) {
            window.location.replace("index.html");
            return;
        }

        if (resposta.status === 403) {
            throw new Error(
                "Você não possui permissão para excluir fornecedores."
            );
        }

        if (resposta.status === 404) {
            throw new Error(
                "Fornecedor não encontrado."
            );
        }

        if (resposta.status === 409) {
            throw new Error(
                "Este fornecedor possui registros vinculados e não pode ser excluído."
            );
        }

        if (!resposta.ok) {
            throw new Error(
                `Falha ao excluir fornecedor: HTTP ${resposta.status}.`
            );
        }

        fornecedorPendenteExclusao = null;

        $("modalExclusaoFornecedor").close();

        await carregarFornecedores();

        $("statusFornecedores").textContent =
            `Fornecedor "${fornecedor.nome}" excluído com sucesso.`;

    } catch (erro) {
        console.error("Erro ao excluir fornecedor:", erro);

        if ($("modalExclusaoFornecedor").open) {
            erroModal.textContent = erro.message;
            erroModal.hidden = false;
        } else {
            $("statusFornecedores").textContent =
                `A exclusão foi enviada, mas houve um problema ao atualizar a lista: ${erro.message}`;
        }

    } finally {
        exclusaoFornecedorEmAndamento = false;

        confirmar.disabled = false;
        cancelar.disabled = false;
        confirmar.textContent = "Excluir permanentemente";
    }
}


async function carregarAdministradores() {
    const lista = $("listaAdministradores");
    lista.textContent = "Carregando administradores...";
    try {
        const usuarios = await consultarLista("/usuarios");
        lista.replaceChildren();
        const administradores = usuarios.filter(usuario => usuario.tipoUsuario === "ADMIN");
        if (!administradores.length) {
            lista.textContent = "Nenhum administrador disponível para exclusão.";
            return;
        }
        for (const usuario of administradores) {
            const linha = document.createElement("div");
            linha.className = "admin-row";
            const detalhes = document.createElement("div");
            detalhes.className = "admin-details";
            const nome = document.createElement("strong");
            nome.textContent = texto(usuario.nome);
            const email = document.createElement("small");
            email.textContent = texto(usuario.login);
            detalhes.append(nome, email);
            const botao = document.createElement("button");
            botao.type = "button";
            botao.className = "danger-btn";
            botao.textContent = "Excluir";
            botao.dataset.id = String(usuario.id);
            botao.dataset.nome = texto(usuario.nome);
            linha.append(detalhes, botao);
            lista.append(linha);
        }
    } catch (erro) {
        console.error("Erro ao listar administradores:", erro);
        lista.textContent = "Não foi possível consultar os administradores. Tente novamente.";
    }
}

// ==========================================
// MODAL DE CONFIRMAÇÃO DE EXCLUSÃO DE ADMINISTRADOR
// ==========================================

function abrirConfirmacaoAdministrador(id, nome) {
    if (exclusaoAdministradorEmAndamento) return;

    if (!Number.isSafeInteger(id) || id <= 0) return;

    administradorPendenteExclusao = {
        id,
        nome
    };

    $("mensagemConfirmacaoExclusao").textContent =
        `Deseja excluir permanentemente o administrador "${nome}"?`;

    $("erroConfirmacaoExclusao").textContent = "";
    $("erroConfirmacaoExclusao").hidden = true;

    $("modalRemocao").close();
    $("modalConfirmacaoExclusao").showModal();
}


// ==========================================
// CONFIRMAÇÃO DA EXCLUSÃO DE ADMINISTRADOR
// ==========================================

async function confirmarExclusaoAdministrador() {
    if (
        exclusaoAdministradorEmAndamento ||
        !administradorPendenteExclusao
    ) {
        return;
    }

    const administrador = administradorPendenteExclusao;

    const confirmar = $("confirmarExclusao");
    const cancelar = $("cancelarExclusao");
    const erroModal = $("erroConfirmacaoExclusao");

    exclusaoAdministradorEmAndamento = true;

    confirmar.disabled = true;
    cancelar.disabled = true;
    confirmar.textContent = "Excluindo...";

    erroModal.hidden = true;
    erroModal.textContent = "";

    try {
        const csrf = await obterCsrf();

        const resposta = await requisicao(
            `/usuarios/${encodeURIComponent(administrador.id)}`,
            {
                method: "DELETE",
                headers: {
                    [csrf.headerName]: csrf.token
                }
            }
        );

        if (resposta.status === 401) {
            window.location.replace("index.html");
            return;
        }

        if (resposta.status === 403) {
            throw new Error(
                "Você não possui permissão para remover administradores."
            );
        }

        if (resposta.status === 404) {
            throw new Error(
                "Administrador não encontrado."
            );
        }

        if (!resposta.ok) {
            throw new Error(
                `Falha na exclusão: HTTP ${resposta.status}.`
            );
        }

        administradorPendenteExclusao = null;

        $("modalConfirmacaoExclusao").close();

        $("modalRemocao").showModal();

        await carregarAdministradores();

        $("resultadoRemocao").textContent =
            `O administrador ${administrador.nome} foi removido com sucesso.`;

    } catch (erro) {
        console.error("Erro ao remover administrador:", erro);

        if ($("modalConfirmacaoExclusao").open) {
            erroModal.textContent = erro.message;
            erroModal.hidden = false;
        } else {
            $("resultadoRemocao").textContent =
                `A exclusão foi enviada, mas houve um problema ao atualizar a lista: ${erro.message}`;
        }

    } finally {
        exclusaoAdministradorEmAndamento = false;

        confirmar.disabled = false;
        cancelar.disabled = false;
        confirmar.textContent = "Excluir permanentemente";
    }
}

function configurarEventos() {
    const menu = $("menuPerfil");
    const gatilho = $("botaoPerfil");
    function fecharMenu() {
        menu.hidden = true;
        gatilho.setAttribute("aria-expanded", "false");
    }
    gatilho.addEventListener("click", () => {
        menu.hidden = !menu.hidden;
        gatilho.setAttribute("aria-expanded", String(!menu.hidden));
    });
    document.addEventListener("click", evento => {
        if (!evento.target.closest(".profile-area")) fecharMenu();
    });
    document.addEventListener("keydown", evento => {
        if (evento.key === "Escape") fecharMenu();
    });
    $("sair").addEventListener("click", async () => {
        fecharMenu();
        try {
            const csrf = await obterCsrf();
            const resposta = await requisicao("/auth/logout", { method: "POST", headers: { [csrf.headerName]: csrf.token } });
            if (!resposta.ok) throw new Error(`Falha no logout: ${resposta.status}`);
            window.location.replace("index.html");
        } catch (erro) {
            console.error("Erro ao encerrar sessão:", erro);
            $("statusFornecedores").textContent = "Não foi possível encerrar a sessão. Tente novamente.";
        }
    });
    $("novoFornecedor").addEventListener("click", () => abrirFormulario());
    $("recarregarFornecedores").addEventListener("click", carregarFornecedores);
    $("pesquisarFornecedor").addEventListener("input", renderizarFornecedores);
    $("fecharFornecedor").addEventListener("click", () => $("modalFornecedor").close());
    $("cancelarFornecedor").addEventListener("click", () => $("modalFornecedor").close());
    $("formFornecedor").addEventListener("submit", salvarFornecedor);
    $("fecharDetalhes").addEventListener("click", () => $("modalDetalhes").close());
    $("voltarDetalhes").addEventListener("click", () => $("modalDetalhes").close());
    $("listaFornecedores").addEventListener("click", evento => {
        const botao = evento.target.closest("button[data-acao]");
        if (!botao) return;
        const fornecedor = fornecedores.find(item => String(item.id) === botao.dataset.id);
        if (!fornecedor) return;
        if (botao.dataset.acao === "detalhes") abrirDetalhes(fornecedor);
        if (botao.dataset.acao === "editar") abrirFormulario(fornecedor);
        if (botao.dataset.acao === "excluir") excluirFornecedor(fornecedor);
    });
    $("cadastrarAdministrador").addEventListener("click", () => {
        fecharMenu();
        $("resultadoCadastro").textContent = "";
        $("modalUsuario").showModal();
    });
    $("fecharModal").addEventListener("click", () => $("modalUsuario").close());
    $("removerAdministrador").addEventListener("click", async () => {
        fecharMenu();
        $("resultadoRemocao").textContent = "";
        $("modalRemocao").showModal();
        await carregarAdministradores();
    });
    $("fecharRemocao").addEventListener("click", () => $("modalRemocao").close());
   // ==========================================
// EVENTO DE ABERTURA DO MODAL DE ADMINISTRADOR
// ==========================================

$("listaAdministradores").addEventListener("click", evento => {
    const botao = evento.target.closest("button[data-id]");

    if (!botao || !/^\d+$/.test(botao.dataset.id)) {
        return;
    }

    const id = Number(botao.dataset.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
        return;
    }

    abrirConfirmacaoAdministrador(
        id,
        botao.dataset.nome
    );
});

// ==========================================
// EVENTOS DO MODAL DE EXCLUSÃO DE FORNECEDOR
// ==========================================

$("cancelarExclusaoFornecedor").addEventListener(
    "click",
    () => {
        if (!exclusaoFornecedorEmAndamento) {
            $("modalExclusaoFornecedor").close();
        }
    }
);

$("confirmarExclusaoFornecedor").addEventListener(
    "click",
    confirmarExclusaoFornecedor
);

$("modalExclusaoFornecedor").addEventListener(
    "cancel",
    evento => {
        if (exclusaoFornecedorEmAndamento) {
            evento.preventDefault();
        }
    }
);

$("modalExclusaoFornecedor").addEventListener(
    "close",
    () => {
        if (!exclusaoFornecedorEmAndamento) {
            fornecedorPendenteExclusao = null;
        }
    }
);


// ==========================================
// EVENTOS DO MODAL DE EXCLUSÃO DE ADMINISTRADOR
// ==========================================

$("cancelarExclusao").addEventListener(
    "click",
    () => {
        if (!exclusaoAdministradorEmAndamento) {
            $("modalConfirmacaoExclusao").close();
        }
    }
);

$("confirmarExclusao").addEventListener(
    "click",
    confirmarExclusaoAdministrador
);

$("modalConfirmacaoExclusao").addEventListener(
    "cancel",
    evento => {
        if (exclusaoAdministradorEmAndamento) {
            evento.preventDefault();
        }
    }
);

$("modalConfirmacaoExclusao").addEventListener(
    "close",
    () => {
        if (exclusaoAdministradorEmAndamento) {
            return;
        }

        administradorPendenteExclusao = null;

        if (!$("modalRemocao").open) {
            $("modalRemocao").showModal();
        }
    }
);

    $("formUsuario").addEventListener("submit", async evento => {
        evento.preventDefault();
        $("resultadoCadastro").textContent = "Cadastrando...";
        try {
            const csrf = await obterCsrf();
            const usuario = {
                nome: $("novoNome").value.trim(),
                login: $("novoEmail").value.trim(),
                senha: $("novaSenha").value,
                tipoUsuario: "ADMIN"
            };
            const resposta = await requisicao("/usuarios", {
                method: "POST",
                headers: { "Content-Type": "application/json", [csrf.headerName]: csrf.token },
                body: JSON.stringify(usuario)
            });
            if (!resposta.ok) throw new Error(`Falha no cadastro: ${resposta.status}`);
            $("resultadoCadastro").textContent = "Administrador cadastrado com sucesso!";
            $("formUsuario").reset();
        } catch (erro) {
            console.error("Erro ao cadastrar administrador:", erro);
            $("resultadoCadastro").textContent = "Não foi possível cadastrar o administrador. Verifique os dados e tente novamente.";
        }
    });
}

async function iniciarFornecedores() {
    configurarEventos();
    try {
        const usuario = await consultarUsuario();
        if (!usuario) {
            window.location.replace("index.html");
            return;
        }
        const nome = usuario.nome || usuario.login || "Usuário";
        $("nomeUsuario").textContent = nome;
        $("perfilUsuario").textContent = usuario.tipoUsuario === "CEO" ? "CEO" : usuario.tipoUsuario === "ADMIN" ? "Administrador" : "Usuário";
        $("iniciaisUsuario").textContent = nome.trim().split(/\s+/).slice(0, 2).map(parte => parte[0]).join("").toUpperCase();
        $("cadastrarAdministrador").hidden = !["ADMIN", "CEO"].includes(usuario.tipoUsuario);
        $("removerAdministrador").hidden = usuario.tipoUsuario !== "CEO";
        await carregarFornecedores();
    } catch (erro) {
        console.error("Erro ao iniciar página de fornecedores:", erro);
        $("statusFornecedores").textContent = "Não foi possível carregar a página. Tente novamente.";
    }
}

iniciarFornecedores();
