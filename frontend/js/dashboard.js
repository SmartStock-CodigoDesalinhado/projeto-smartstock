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

function ehCEO(usuario) {
    return usuario?.tipoUsuario === "CEO";
}

function podeCadastrarAdministrador(usuario) {
    return ["ADMIN", "CEO"].includes(usuario?.tipoUsuario);
}

function podeRemoverAdministrador(usuario) {
    return ehCEO(usuario);
}

function texto(valor) {
    return String(valor ?? "—");
}

function seguro(valor) {
    return texto(valor).replace(/[&<>"']/g, caractere => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[caractere]);
}

async function listaAPI(caminhos) {
    for (const caminho of caminhos) {
        const resposta = await requisicao(caminho);
        if (resposta.status === 404) continue;
        if (resposta.status === 401) {
            window.location.replace("index.html");
            throw new Error("Sessão encerrada.");
        }
        if (!resposta.ok) throw new Error(`Erro ${resposta.status} em ${caminho}`);
        const dados = await resposta.json();
        if (Array.isArray(dados)) return dados;
        if (Array.isArray(dados.content)) return dados.content;
        throw new Error(`Formato inesperado em ${caminho}`);
    }
    throw new Error(`Endpoint não encontrado: ${caminhos.join(" ou ")}`);
}

function quantidade(produto) {
    const valor = produto.unidade ?? produto.quantidadeAtual ?? produto.quantidadeEstoque ?? produto.quantidade ?? produto.estoqueAtual ?? produto.estoque; return valor == null ? null : Number(valor);
}

function minimo(produto) {
    const valor = produto.estoqueMinimo ?? produto.quantidadeMinima ?? produto.minimo;
    return valor == null ? null : Number(valor);
}

function situacao(produto) {
    const atual = quantidade(produto);
    const limite = minimo(produto);
    if (atual == null || limite == null || !Number.isFinite(atual) || !Number.isFinite(limite)) return null;
    if (atual <= 0) return "Em falta";
    if (atual <= limite) return "Estoque baixo";
    return "Saudável";
}

async function carregarProdutos() {
    const produtos = await listaAPI(["/produto"]);
    $("totalProdutos").textContent = produtos.length.toLocaleString("pt-BR");
    const completos = produtos.every(produto => situacao(produto) !== null);
    if (completos) {
        $("totalFalta").textContent = produtos.filter(p => situacao(p) === "Em falta").length;
        $("totalBaixo").textContent = produtos.filter(p => situacao(p) === "Estoque baixo").length;
        $("totalSaudavel").textContent = produtos.filter(p => situacao(p) === "Saudável").length;
    }
    $("listaProdutos").innerHTML = produtos.length ? produtos.map(produto => {
        const status = situacao(produto);
        const classe = status === "Em falta" ? "red" : status === "Estoque baixo" ? "yellow" : "green";
        return `<tr><td>${seguro(produto.nome)}</td><td>${seguro(produto.codigoBarras ?? produto.codigo ?? produto.sku ?? produto.id)}</td><td>${seguro(quantidade(produto))}</td><td>${seguro(minimo(produto))}</td><td>${status ? `<span class="pill ${classe}">${status}</span>` : "Não informado"}</td></tr>`;
    }).join("") : '<tr><td colspan="5">Nenhum produto cadastrado.</td></tr>';
    const alertas = produtos.filter(produto => ["Em falta", "Estoque baixo"].includes(situacao(produto)));
    $("listaAlertas").innerHTML = !completos
        ? "<p>Não foi possível verificar a situação de todos os produtos.</p>"
        : alertas.length
            ? alertas.map(produto => `
            <div class="item">
                <strong>${seguro(produto.nome)}</strong>
                <span>${seguro(situacao(produto))}</span>
            </div>
        `).join("")
            : "<p>Nenhum produto precisa de reposição no momento.</p>";
}

async function carregarFornecedores() {
    const fornecedores = await listaAPI(["/fornecedores"]);
    $("listaFornecedores").innerHTML = fornecedores.length ? fornecedores.slice(0, 8).map(fornecedor => `<div class="item"><strong>${seguro(fornecedor.nomeFornecedor ?? fornecedor.nome ?? fornecedor.razaoSocial)}</strong><small>${seguro(fornecedor.cnpj ?? fornecedor.email ?? "")}</small></div>`).join("") : "<p>Nenhum fornecedor cadastrado.</p>";
}

async function carregarMovimentacoes() {
    const movimentacoes = await listaAPI(["/movimentacoes", "/movimentacoes-estoque", "/movimentacoesEstoque"]);
    $("listaMovimentacoes").innerHTML = movimentacoes.length ? movimentacoes.slice(0, 10).map(mov => `<tr><td>${seguro(mov.dataHora ?? mov.dataMovimentacao ?? mov.data)}</td><td>${seguro(mov.produto?.nome ?? mov.nomeProduto ?? mov.produtoId)}</td><td>${seguro(mov.tipo ?? mov.tipoMovimentacao)}</td><td>${seguro(mov.quantidade)}</td></tr>`).join("") : '<tr><td colspan="4">Nenhuma movimentação cadastrada.</td></tr>';
}

async function atualizarPainel() {
    $("statusPainel").textContent = "Atualizando informações do estoque...";
    $("indicadorAtualizacao").textContent = "● Atualizando";

    const resultados = await Promise.allSettled([
        carregarProdutos(),
        carregarFornecedores(),
        carregarMovimentacoes()
    ]);

    const nomes = ["Produtos", "Fornecedores", "Movimentações"];

    const erros = resultados
        .map((resultado, indice) => {
            if (resultado.status === "rejected") {
                console.error(`Erro ao carregar ${nomes[indice]}:`, resultado.reason);
                return nomes[indice];
            }
            return null;
        })
        .filter(Boolean);

    if (resultados[0].status === "rejected") {
        $("listaProdutos").innerHTML =
            '<tr><td colspan="5">Não foi possível consultar os produtos.</td></tr>';

        $("listaAlertas").textContent =
            "Não foi possível consultar os alertas de estoque.";
    }

    if (resultados[1].status === "rejected") {
        $("listaFornecedores").textContent =
            "Não foi possível consultar os fornecedores.";
    }

    if (resultados[2].status === "rejected") {
        $("listaMovimentacoes").innerHTML =
            '<tr><td colspan="4">Não foi possível consultar as movimentações.</td></tr>';
    }

    if (erros.length === 0) {
        $("statusPainel").textContent = "";
        $("indicadorAtualizacao").textContent = "● Estoque atualizado";
    } else {
        $("statusPainel").textContent =
            "Algumas informações não puderam ser carregadas. Tente atualizar a página.";

        $("indicadorAtualizacao").textContent =
            "● Atualização incompleta";
    }
}



async function carregarAdministradores() {
    try {
        const resposta = await requisicao("/usuarios");
        if (!resposta.ok) throw new Error(`Erro ao consultar usuários: ${resposta.status}`);
        const usuarios = await resposta.json();
        if (!Array.isArray(usuarios)) throw new Error("A API não retornou uma lista de usuários.");
        const administradores = usuarios.filter(usuario => usuario.tipoUsuario === "ADMIN");
        const lista = $("listaAdministradores");
        lista.replaceChildren();

        if (administradores.length === 0) {
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

            const remover = document.createElement("button");
            remover.type = "button";
            remover.className = "danger-btn";
            remover.textContent = "Excluir";
            remover.dataset.id = String(usuario.id);
            remover.dataset.nome = texto(usuario.nome);
            linha.append(detalhes, remover);
            lista.append(linha);
        }
    } catch (erro) {
        console.error("Erro ao consultar administradores:", erro);
        $("listaAdministradores").textContent = "Não foi possível consultar os administradores. Tente novamente.";
    }
}

async function iniciarDashboard() {
    try {
        const usuario = await consultarUsuario();
        if (!usuario) {
            window.location.replace("index.html");
            return;
        }
        const nome = usuario.nome || usuario.email;
        atualizarSaudacao(nome);
        setInterval(() => atualizarSaudacao(nome), 60000);
        $("nomeUsuario").textContent = nome;
        $("perfilUsuario").textContent = ehCEO(usuario) ? "CEO" : usuario.tipoUsuario === "ADMIN" ? "Administrador" : "Usuário";
        $("iniciaisUsuario").textContent = nome.trim().split(/\s+/).slice(0, 2).map(parte => parte[0]).join("").toUpperCase();
        $("cadastrarAdministrador").hidden = !podeCadastrarAdministrador(usuario);
        $("removerAdministrador").hidden = !podeRemoverAdministrador(usuario);
        await atualizarPainel();
    } catch (erro) {
        console.error("Erro ao iniciar o Dashboard:", erro);
        $("statusPainel").textContent = "Não foi possível carregar o painel. Atualize a página.";
    }

    const botaoPerfil = $("botaoPerfil");
    const menuPerfil = $("menuPerfil");

    function fecharMenuPerfil() {
        menuPerfil.hidden = true;
        botaoPerfil.setAttribute("aria-expanded", "false");
    }

    botaoPerfil.addEventListener("click", () => {
        menuPerfil.hidden = !menuPerfil.hidden;
        botaoPerfil.setAttribute("aria-expanded", String(!menuPerfil.hidden));
    });

    document.addEventListener("click", (evento) => {
        if (!evento.target.closest(".profile-area")) fecharMenuPerfil();
    });

    document.addEventListener("keydown", (evento) => {
        if (evento.key === "Escape") fecharMenuPerfil();
    });

    $("recarregar").addEventListener("click", atualizarPainel);
    $("sair").addEventListener("click", async () => {
        fecharMenuPerfil();
        try {
            const csrf = await obterCsrf();
            const resposta = await requisicao("/auth/logout", { method: "POST", headers: { [csrf.headerName]: csrf.token } });
            if (!resposta.ok) throw new Error(`Erro ${resposta.status}`);
            window.location.replace("index.html");
        } catch (erro) {
            $("statusPainel").textContent = `Não foi possível encerrar a sessão: ${erro.message}`;
        }
    });

    $("cadastrarAdministrador").addEventListener("click", () => {
        fecharMenuPerfil();
        $("resultadoCadastro").textContent = "";
        $("modalUsuario").showModal();
    });
    $("fecharModal").addEventListener("click", () => $("modalUsuario").close());
    $("removerAdministrador").addEventListener("click", async () => {
        fecharMenuPerfil();
        $("resultadoRemocao").textContent = "";
        $("listaAdministradores").textContent = "Carregando administradores...";
        $("modalRemocao").showModal();
        await carregarAdministradores();
    });

    $("fecharRemocao").addEventListener("click", () => $("modalRemocao").close());

    $("listaAdministradores").addEventListener("click", async (evento) => {
        const botao = evento.target.closest("button[data-id]");
        if (!botao) return;
        const id = Number(botao.dataset.id);
        const nome = botao.dataset.nome;
        if (!Number.isSafeInteger(id) || id <= 0) return;
        if (!window.confirm(`Deseja excluir permanentemente o administrador ${nome}?`)) return;
        botao.disabled = true;
        $("resultadoRemocao").textContent = "Excluindo administrador...";
        try {
            const csrf = await obterCsrf();
            const resposta = await requisicao(`/usuarios/${id}`, {
                method: "DELETE",
                headers: { [csrf.headerName]: csrf.token }
            });
            if (!resposta.ok) {
                const detalhe = await resposta.text();
                throw new Error(`Erro ${resposta.status}: ${detalhe.slice(0, 160)}`);
            }
            $("resultadoRemocao").textContent = `O administrador ${nome} foi removido com sucesso.`; await carregarAdministradores();
        } catch (erro) {
            console.error("Erro ao excluir administrador:", erro);
            $("resultadoRemocao").textContent = "Não foi possível remover o administrador. Tente novamente.";
            botao.disabled = false;
        }
    });

    $("formUsuario").addEventListener("submit", async (evento) => {
        evento.preventDefault();
        $("resultadoCadastro").textContent = "Cadastrando...";
        try {
            const csrf = await obterCsrf();
            const usuario = { nome: $("novoNome").value.trim(), login: $("novoEmail").value.trim(), senha: $("novaSenha").value, tipoUsuario: "ADMIN" };
            const resposta = await requisicao("/usuarios", { method: "POST", headers: { "Content-Type": "application/json", [csrf.headerName]: csrf.token }, body: JSON.stringify(usuario) });
            if (!resposta.ok) {
                const detalhe = await resposta.text();
                throw new Error(`Erro ${resposta.status}: ${detalhe.slice(0, 200)}`);
            }
            $("resultadoCadastro").textContent = "Administrador cadastrado com sucesso!"; $("formUsuario").reset();
        } catch (erro) {
            console.error("Erro ao cadastrar administrador:", erro);
            $("resultadoCadastro").textContent = "Não foi possível cadastrar o administrador. Verifique os dados e tente novamente.";
        }
    });
}

function atualizarSaudacao(nome) {
    const hora = new Date().getHours();
    const primeiroNome = nome.trim().split(/\s+/)[0];

    let saudacao;

    if (hora >= 18 || hora < 5) {
        saudacao = "Boa noite";
    } else if (hora < 12) {
        saudacao = "Bom dia";
    } else {
        saudacao = "Boa tarde";
    }

    $("saudacaoUsuario").textContent = `${saudacao}, ${primeiroNome}!`;
}

iniciarDashboard();
