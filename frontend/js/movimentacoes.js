const API = `http://${window.location.hostname}:8080/api`;

const $ = (id) => document.getElementById(id);

let produtos = [];
let movimentacoes = [];




async function requisicao(caminho, opcoes = {}) {
    return fetch(`${API}${caminho}`, {
        credentials: "include",
        ...opcoes
    });
}

async function obterCsrf() {
    const resposta = await requisicao("/usuarios/csrf");

    if (!resposta.ok) {
        throw new Error(
            `Não foi possível validar a sessão (${resposta.status}).`
        );
    }

    return resposta.json();
}

async function consultarUsuario() {
    const resposta = await requisicao("/usuarios/me");

    if (resposta.status === 401 || resposta.status === 403) {
        window.location.replace("index.html");
        return null;
    }

    if (!resposta.ok) {
        throw new Error("Não foi possível carregar os dados do usuário.");
    }

    return resposta.json();
}

async function consultarLista(caminhos) {
    for (const caminho of caminhos) {
        const resposta = await requisicao(caminho);

        if (resposta.status === 404) {
            continue;
        }

        if (resposta.status === 401 || resposta.status === 403) {
            window.location.replace("index.html");

            throw new Error(
                "Sua sessão expirou. Entre novamente."
            );
        }

        if (!resposta.ok) {
            throw new Error(
                `Falha ao consultar ${caminho} (${resposta.status}).`
            );
        }

        const dados = await resposta.json();

        if (Array.isArray(dados)) {
            return dados;
        }

        if (Array.isArray(dados.content)) {
            return dados.content;
        }

        throw new Error(
            `Formato inesperado retornado por ${caminho}.`
        );
    }

    throw new Error(
        `Endpoint não encontrado: ${caminhos.join(" ou ")}.`
    );
}


// ======================================================
// 3. FUNÇÕES AUXILIARES
// ======================================================

function texto(valor) {
    return String(valor ?? "—");
}

function nomeProduto(produto) {
    return produto?.nome
        ?? produto?.nomeProduto
        ?? produto?.descricao
        ?? `Produto #${produto?.id ?? "?"}`;
}

function obterIdProduto(movimentacao) {
    return movimentacao?.produto?.id
        ?? movimentacao?.produtoId
        ?? movimentacao?.idProduto
        ?? null;
}

function encontrarProduto(id) {
    return produtos.find(
        (produto) => String(produto.id) === String(id)
    );
}

function nomeProdutoMovimentado(movimentacao) {
    const produtoId = obterIdProduto(movimentacao);
    const produto = encontrarProduto(produtoId);

    return movimentacao?.produto?.nome
        ?? movimentacao?.nomeProduto
        ?? (
            produto
                ? nomeProduto(produto)
                : `Produto #${produtoId ?? "?"}`
        );
}

function obterTipo(movimentacao) {
    const tipo = String(
        movimentacao?.tipo
        ?? movimentacao?.tipoMovimentacao
        ?? ""
    ).toUpperCase();

    if (tipo.includes("SAI")) return "SAIDA";
    if (tipo.includes("ENT")) return "ENTRADA";

    return tipo || "OUTRO";
}

function obterQuantidadeEstoque(produto) {
    const quantidade = produto?.quantidadeAtual
        ?? produto?.quantidadeEstoque
        ?? produto?.quantidade
        ?? produto?.estoqueAtual
        ?? produto?.estoque
        ?? produto?.unidade;

    return quantidade == null
        ? null
        : Number(quantidade);
}

function obterQuantidadeMovimentada(movimentacao) {
    return Number(
        movimentacao?.quantidadeEstoque
        ?? movimentacao?.quantidade
        ?? 0
    );
}

function formatarData(movimentacao) {
    const valor = movimentacao?.dataHora
        ?? movimentacao?.dataMovimentacao
        ?? movimentacao?.data
        ?? movimentacao?.createdAt;

    if (!valor) return "—";

    const data = new Date(valor);

    if (Number.isNaN(data.getTime())) {
        return texto(valor);
    }

    return data.toLocaleString("pt-BR", {
        dateStyle: "short",
        timeStyle: "short"
    });
}

function definirStatusApi(disponivel) {
    const elemento = $("statusApi");

    if (!elemento) return;

    elemento.classList.toggle("error", !disponivel);

    elemento.innerHTML = `
        <span></span>
        ${disponivel ? "Dados da API" : "API indisponível"}
    `;
}

function mostrarErroApi(erro) {
    console.error(erro);

    definirStatusApi(false);

    if ($("feedbackLista")) {
        $("feedbackLista").textContent =
            `${erro.message} Confira se o backend está em execução.`;
    }
}


// ======================================================
// 4. RESUMO DOS INDICADORES
// ======================================================

function renderizarResumo() {
    $("totalMovimentacoes").textContent =
        movimentacoes.length.toLocaleString("pt-BR");

    $("totalEntradas").textContent =
        movimentacoes
            .filter((item) => obterTipo(item) === "ENTRADA")
            .length
            .toLocaleString("pt-BR");

    $("totalSaidas").textContent =
        movimentacoes
            .filter((item) => obterTipo(item) === "SAIDA")
            .length
            .toLocaleString("pt-BR");

    // A entidade atual possui somente ENTRADA e SAIDA.
    if ($("totalAjustes")) {
        $("totalAjustes").textContent = "0";
    }
}


// ======================================================
// 5. TABELA DE MOVIMENTAÇÕES
// ======================================================

function criarCelula(linha, valor) {
    const celula = document.createElement("td");

    celula.textContent = texto(valor);

    linha.append(celula);

    return celula;
}

function obterResponsavel(movimentacao) {
    return movimentacao?.responsavel?.nome
        ?? movimentacao?.usuario?.nome
        ?? movimentacao?.nomeResponsavel
        ?? (
            typeof movimentacao?.responsavel === "string"
                ? movimentacao.responsavel
                : null
        )
        ?? "—";
}

function renderizarTabela() {
    const pesquisa = $("pesquisaMovimentacao")
        .value
        .trim()
        .toLocaleLowerCase("pt-BR");

    const filtro = $("filtroTipo").value;

    const filtradas = movimentacoes.filter((item) => {

        const termos = [
            nomeProdutoMovimentado(item),
            item?.produto?.codigoBarras,
            item?.codigoBarras,
            item?.produto?.codigo,
            obterResponsavel(item),
            item?.notaFiscal
        ]
            .map((valor) =>
                texto(valor).toLocaleLowerCase("pt-BR")
            )
            .join(" ");

        const correspondePesquisa =
            termos.includes(pesquisa);

        const correspondeTipo =
            !filtro || obterTipo(item) === filtro;

        return correspondePesquisa && correspondeTipo;
    });

    filtradas.sort((a, b) => {
        const dataA = new Date(
            a?.dataHora ?? a?.dataMovimentacao ?? 0
        );

        const dataB = new Date(
            b?.dataHora ?? b?.dataMovimentacao ?? 0
        );

        return dataB - dataA;
    });

    const corpo = $("listaMovimentacoes");

    corpo.replaceChildren();

    $("contagemLista").textContent =
        `Mostrando ${filtradas.length} de ${movimentacoes.length} movimentações`;

    if (filtradas.length === 0) {

        const linha = document.createElement("tr");

        const celula = criarCelula(
            linha,
            movimentacoes.length
                ? "Nenhuma movimentação corresponde aos filtros."
                : "Nenhuma movimentação cadastrada."
        );

        celula.colSpan = 7;

        corpo.append(linha);

        return;
    }

    filtradas.forEach((item) => {

        const linha = document.createElement("tr");

        const produtoId = obterIdProduto(item);
        const produto = encontrarProduto(produtoId);

        const tipo = obterTipo(item);

        const quantidade =
            obterQuantidadeMovimentada(item);

        // Produto
        criarCelula(
            linha,
            nomeProdutoMovimentado(item)
        );

        // Código
        criarCelula(
            linha,
            item?.produto?.codigoBarras
            ?? item?.codigoBarras
            ?? item?.produto?.codigo
            ?? produto?.codigoBarras
            ?? produto?.codigo
            ?? produtoId
        );

        // Tipo
        const celulaTipo = document.createElement("td");

        const etiqueta = document.createElement("span");

        etiqueta.className =
            `mov-badge ${tipo === "ENTRADA" ? "entrada" : "saida"}`;

        etiqueta.textContent =
            tipo === "ENTRADA"
                ? "↘ Entrada"
                : "↗ Saída";

        celulaTipo.append(etiqueta);

        linha.append(celulaTipo);

        // Quantidade
        const celulaQuantidade = criarCelula(
            linha,
            `${tipo === "SAIDA" ? "−" : "+"}${Math.abs(quantidade)}`
        );

        celulaQuantidade.className =
            `mov-quantity ${tipo === "SAIDA" ? "negative" : "positive"}`;

        // Responsável
        criarCelula(
            linha,
            obterResponsavel(item)
        );

        // Data
        criarCelula(
            linha,
            formatarData(item)
        );

        // Ações
        const celulaAcoes = document.createElement("td");

        const botaoDetalhes =
            document.createElement("button");

        botaoDetalhes.type = "button";
        botaoDetalhes.className = "mov-action";
        botaoDetalhes.textContent = "◎ Detalhes";

        botaoDetalhes.addEventListener("click", () => {
            abrirDetalhes(item);
        });

        celulaAcoes.append(botaoDetalhes);

        linha.append(celulaAcoes);

        corpo.append(linha);
    });
}


// ======================================================
// 6. PRODUTOS E ESTOQUE NO FORMULÁRIO
// ======================================================

function popularProdutos() {
    const select = $("produtoMovimentacao");

    const valorAtual = select.value;

    select.replaceChildren();

    const opcaoInicial =
        document.createElement("option");

    opcaoInicial.value = "";
    opcaoInicial.textContent = "Selecione um produto";

    select.append(opcaoInicial);

    produtos
        .slice()
        .sort((a, b) =>
            nomeProduto(a).localeCompare(b.nome ?? b.nomeProduto ?? "", "pt-BR")
        )
        .forEach((produto) => {

            const opcao =
                document.createElement("option");

            const estoque =
                obterQuantidadeEstoque(produto);

            opcao.value = produto.id;

            opcao.textContent =
                `${nomeProduto(produto)}${estoque == null ? "" : ` — estoque: ${estoque}`}`;

            select.append(opcao);
        });

    if (valorAtual) {
        select.value = valorAtual;
    }

    atualizarEstoqueAtual();
}

function atualizarEstoqueAtual() {
    const produto = encontrarProduto(
        $("produtoMovimentacao").value
    );

    $("estoqueAtual").value = produto
        ? (
            obterQuantidadeEstoque(produto)
            ?? "Não informado pela API"
        )
        : "";
}

function abrirNovaMovimentacao() {
    $("formMovimentacao").reset();

    $("feedbackFormulario").textContent = "";

    popularProdutos();

    $("modalMovimentacao").showModal();
}


// ======================================================
// 7. DETALHES DA MOVIMENTAÇÃO
// ======================================================

function abrirDetalhes(movimentacao) {
    const lista = $("detalhesMovimentacao");

    lista.replaceChildren();

    const campos = [
        ["Produto", nomeProdutoMovimentado(movimentacao)],
        ["Tipo", obterTipo(movimentacao)],
        ["Quantidade", obterQuantidadeMovimentada(movimentacao)],
        ["Nota fiscal", movimentacao?.notaFiscal],
        ["Responsável", obterResponsavel(movimentacao)],
        ["Data", formatarData(movimentacao)],
        ["ID", movimentacao?.id]
    ];

    campos.forEach(([nome, valor]) => {

        if (valor == null) return;

        const titulo = document.createElement("dt");

        titulo.textContent = nome;

        const descricao = document.createElement("dd");

        descricao.textContent = texto(valor);

        lista.append(titulo, descricao);
    });

    $("modalDetalhesMov").showModal();
}


// ======================================================
// 8. CARREGAMENTO DOS DADOS
// ======================================================

async function carregarDados() {
    $("feedbackLista").textContent =
        "Carregando movimentações...";

    try {

        const [
            listaProdutos,
            listaMovimentacoes
        ] = await Promise.all([

            consultarLista(["/produto"]),

            consultarLista(["/movimentacoes"])

        ]);

        produtos = listaProdutos;

        movimentacoes = listaMovimentacoes;

        popularProdutos();

        renderizarResumo();

        renderizarTabela();

        definirStatusApi(true);

        $("feedbackLista").textContent = "";

    } catch (erro) {

        mostrarErroApi(erro);

    }
}


// ======================================================
// 9. REGISTRO DE ENTRADA E SAÍDA
// ======================================================

async function registrarMovimentacao(evento) {

    evento.preventDefault();

    // Capturar os dados do formulário
    const produtoId =
        $("produtoMovimentacao").value;

    const tipo =
        $("tipoMovimentacao").value;

    const quantidade =
        Number($("quantidadeMovimentacao").value);

    const notaFiscal =
        $("notaFiscalMovimentacao").value.trim();


    // Validar produto
    if (!produtoId) {

        $("feedbackFormulario").textContent =
            "Preencha a nota fiscal ou identificação da movimentação.";

        return;
    }


    // Validar tipo
    if (!["ENTRADA", "SAIDA"].includes(tipo)) {

        $("feedbackFormulario").textContent =
            "Selecione Entrada ou Saída.";

        return;
    }


    // Validar quantidade
    if (!Number.isInteger(quantidade) || quantidade <= 0) {

        $("feedbackFormulario").textContent =
            "Informe uma quantidade inteira maior que zero.";

        return;
    }


    // Validar nota fiscal
    if (!notaFiscal) {

        $("feedbackFormulario").textContent =
            "Preencha a nota fiscal ou identificação da movimentação.";

        return;
    }


    // Localizar produto
    const produto = encontrarProduto(produtoId);

    if (!produto) {

        $("feedbackFormulario").textContent =
            "Produto não encontrado.";

        return;
    }


    // Verificar estoque disponível
    const estoqueAtual =
        obterQuantidadeEstoque(produto);

    if (
        tipo === "SAIDA"
        && estoqueAtual !== null
        && quantidade > estoqueAtual
    ) {

        $("feedbackFormulario").textContent =
            `Estoque insuficiente. Disponível: ${estoqueAtual}.`;

        return;
    }


    // Preparar botão
    const botaoSalvar = $("salvarMovimentacao");

    botaoSalvar.disabled = true;

    $("feedbackFormulario").textContent =
        "Registrando movimentação...";


    try {

        // Obter token CSRF
        const csrf = await obterCsrf();


        // Montar objeto conforme a entidade Java
        const dadosMovimentacao = {

            tipo: tipo,

            notaFiscal: notaFiscal,

            quantidadeEstoque: quantidade,

            produto: {
                id: Number(produtoId)
            }

        };


        // Enviar movimentação para a API
        const resposta = await requisicao(
            "/movimentacoes",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    [csrf.headerName]: csrf.token
                },

                body: JSON.stringify(dadosMovimentacao)
            }
        );


        // Verificar autenticação
        if (
            resposta.status === 401
            || resposta.status === 403
        ) {

            throw new Error(
                "Sua sessão expirou ou você não tem permissão para registrar movimentações."
            );
        }


        // Verificar resposta da API
        if (!resposta.ok) {

            let mensagem = "";

            try {

                const erroApi = await resposta.json();

                mensagem =
                    erroApi.message
                    ?? erroApi.mensagem
                    ?? erroApi.detail
                    ?? "";

                if (
                    !mensagem
                    && Array.isArray(erroApi.errors)
                ) {

                    mensagem = erroApi.errors
                        .map((erro) =>
                            erro.defaultMessage ?? erro.message
                        )
                        .filter(Boolean)
                        .join(" ");

                }

            } catch {
                // A API pode retornar resposta sem JSON.
            }

            throw new Error(
                mensagem
                || `O backend recusou a movimentação (${resposta.status}).`
            );
        }


        // Finalizar registro
        $("modalMovimentacao").close();

        $("formMovimentacao").reset();

        await carregarDados();

        $("feedbackLista").textContent =
            "Movimentação registrada com sucesso!";


    } catch (erro) {

        console.error(
            "Erro ao registrar movimentação:",
            erro
        );

        $("feedbackFormulario").textContent =
            erro.message
            || "Não foi possível registrar a movimentação.";

    } finally {

        botaoSalvar.disabled = false;

    }
}


// ======================================================
// 10. ENCERRAMENTO DA SESSÃO
// ======================================================

async function sair() {

    try {

        const csrf = await obterCsrf();

        await requisicao(
            "/auth/logout",
            {
                method: "POST",

                headers: {
                    [csrf.headerName]: csrf.token
                }
            }
        );

    } catch (erro) {

        console.warn(
            "Falha ao encerrar sessão:",
            erro
        );

    }

    window.location.replace("index.html");
}


// ======================================================
// 11. EVENTOS DA INTERFACE
// ======================================================

function configurarEventos() {

    $("botaoPerfil").addEventListener("click", () => {

        const menu = $("menuPerfil");

        menu.hidden = !menu.hidden;

        $("botaoPerfil").setAttribute(
            "aria-expanded",
            String(!menu.hidden)
        );

    });


    $("sair").addEventListener("click", sair);


    $("abrirNova").addEventListener(
        "click",
        abrirNovaMovimentacao
    );


    $("fecharModal").addEventListener("click", () => {
        $("modalMovimentacao").close();
    });


    $("cancelarModal").addEventListener("click", () => {
        $("modalMovimentacao").close();
    });


    $("fecharDetalhes").addEventListener("click", () => {
        $("modalDetalhesMov").close();
    });


    $("fecharDetalhesBotao").addEventListener("click", () => {
        $("modalDetalhesMov").close();
    });


    $("atualizarMovimentacoes").addEventListener(
        "click",
        carregarDados
    );


    $("pesquisaMovimentacao").addEventListener(
        "input",
        renderizarTabela
    );


    $("filtroTipo").addEventListener(
        "change",
        renderizarTabela
    );


    $("produtoMovimentacao").addEventListener(
        "change",
        atualizarEstoqueAtual
    );


    $("formMovimentacao").addEventListener(
        "submit",
        registrarMovimentacao
    );

}


// ======================================================
// 12. INICIALIZAÇÃO DA PÁGINA
// ======================================================

async function iniciar() {

    configurarEventos();

    try {

        const usuario = await consultarUsuario();

        if (usuario) {

            const nome =
                usuario.nome
                ?? usuario.nomeUsuario
                ?? usuario.login
                ?? "Usuário";

            $("nomeUsuario").textContent = nome;

            $("saudacaoUsuario").textContent =
                `Olá, ${nome.trim().split(/\s+/)[0]}!`;

            $("perfilUsuario").textContent =
                usuario.tipoUsuario
                ?? usuario.perfil
                ?? "Usuário";

            $("iniciaisUsuario").textContent = nome
                .split(/\s+/)
                .slice(0, 2)
                .map((parte) => parte[0])
                .join("")
                .toUpperCase();

        }

    } catch (erro) {

        console.warn(
            "Não foi possível carregar o perfil:",
            erro
        );

    }

    await carregarDados();

}


// ======================================================
// 13. EXECUTAR QUANDO A PÁGINA CARREGAR
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    iniciar
);