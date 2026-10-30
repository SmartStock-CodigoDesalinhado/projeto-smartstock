
"use strict";

const API = `http://${window.location.hostname}:8080/api`;
const $ = (id) => document.getElementById(id);

const ROTAS = Object.freeze({
    produtos: "/produto",
    fornecedores: "/fornecedores",
    usuario: "/usuarios/me",
    csrf: "/usuarios/csrf",
    logout: "/auth/logout"
});

const ESTADO = {
    produtos: [],
    fornecedores: [],
    salvando: false
};

async function requisicao(caminho, opcoes = {}) {
    return fetch(`${API}${caminho}`, {
        ...opcoes,
        credentials: "include"
    });
}

async function obterCsrf() {
    const resposta = await requisicao(ROTAS.csrf);

    if (!resposta.ok) {
        throw new Error("Não foi possível validar sua sessão.");
    }

    const dados = await resposta.json();

    if (!dados.headerName || !dados.token) {
        throw new Error("Token de segurança inválido.");
    }

    return dados;
}

async function obterJson(caminho) {
    const resposta = await requisicao(caminho);

    if (resposta.status === 401) {
        window.location.replace("index.html");
        throw new Error("Sessão encerrada.");
    }

    if (resposta.status === 403) {
        throw new Error("Acesso negado pelo servidor.");
    }

    if (!resposta.ok) {
        throw new Error(
            `Não foi possível consultar os dados (${resposta.status}).`
        );
    }

    return resposta.json();
}

function obterLista(dados) {
    if (Array.isArray(dados)) {
        return dados;
    }

    if (Array.isArray(dados?.content)) {
        return dados.content;
    }

    throw new Error(
        "A resposta do servidor não contém uma lista válida."
    );
}

function exibirMensagem(id, mensagem) {
    $(id).textContent = mensagem;
}

function valorPrimeiro(objeto, chaves) {
    for (const chave of chaves) {
        if (
            objeto?.[chave] !== undefined &&
            objeto[chave] !== null
        ) {
            return objeto[chave];
        }
    }

    return null;
}

function codigoProduto(produto) {
    return valorPrimeiro(produto, [
        "codigoBarras",
        "codigoDeBarras",
        "codigo",
        "sku"
    ]) ?? produto.id ?? "—";
}

function quantidadeProduto(produto) {
    const valor = valorPrimeiro(produto, [
        "unidade",
        "quantidadeAtual",
        "quantidadeDisponivel",
        "quantidadeEstoque",
        "quantidade",
        "estoqueAtual",
        "estoque"
    ]);

    return valor === null ? null : Number(valor);
}

function minimoProduto(produto) {
    const valor = valorPrimeiro(produto, [
        "estoqueMinimo",
        "quantidadeMinima",
        "minimo"
    ]);

    return valor === null ? null : Number(valor);
}

function precoProduto(produto) {
    return valorPrimeiro(produto, [
        "precoVenda",
        "preco",
        "precoUnitario",
        "valor"
    ]);
}

function vencimentoProduto(produto) {
    return valorPrimeiro(produto, [
        "dataVencimento",
        "vencimento",
        "validade"
    ]);
}

function fornecedorDoProduto(produto) {
    if (
        produto?.fornecedor &&
        typeof produto.fornecedor === "object"
    ) {
        return produto.fornecedor;
    }

    const id =
        produto?.fornecedorId ??
        produto?.idFornecedor ??
        produto?.fornecedor;

    if (id == null) {
        return null;
    }

    return ESTADO.fornecedores.find(
        (item) => String(item.id) === String(id)
    ) ?? null;
}

function nomeFornecedor(produto) {
    const fornecedor = fornecedorDoProduto(produto);

    return (
        fornecedor?.nomeFornecedor ??
        fornecedor?.nome ??
        fornecedor?.razaoSocial ??
        produto.nomeFornecedor ??
        "—"
    );
}

function situacaoProduto(produto) {
    const quantidade = quantidadeProduto(produto);
    const minimo = minimoProduto(produto);

    if (
        !Number.isFinite(quantidade) ||
        !Number.isFinite(minimo)
    ) {
        return null;
    }

    if (quantidade <= 0) {
        return "Em falta";
    }

    if (quantidade <= minimo) {
        return "Estoque baixo";
    }

    return "Saudável";
}

function formatarPreco(valor) {
    if (
        valor === null ||
        valor === undefined ||
        valor === ""
    ) {
        return "—";
    }

    const numero = Number(valor);

    return Number.isFinite(numero)
        ? numero.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })
        : "—";
}

function formatarData(valor) {
    if (!valor) {
        return "—";
    }

    const data = String(valor).slice(0, 10);

    if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) {
        return String(valor);
    }

    const [ano, mes, dia] = data.split("-");

    return `${dia}/${mes}/${ano}`;
}

function configurarUsuario(usuario) {
    const nome = String(
        usuario.nome ??
        usuario.email ??
        usuario.login ??
        "Usuário"
    ).trim();

    const partes = nome.split(/\s+/);

    $("nomeUsuario").textContent = nome;

    $("perfilUsuario").textContent =
        usuario.tipoUsuario === "CEO"
            ? "CEO"
            : usuario.tipoUsuario === "ADMIN"
                ? "Administrador"
                : "Usuário";

    $("iniciaisUsuario").textContent = partes
        .slice(0, 2)
        .map((parte) => parte[0])
        .join("")
        .toUpperCase();

    $("saudacaoUsuario").textContent =
        `Olá, ${partes[0]}!`;
}

async function carregarFornecedores() {
    const dados = await obterJson(ROTAS.fornecedores);

    ESTADO.fornecedores = obterLista(dados);

    const seletor = $("fornecedorProduto");
    const selecionado = seletor.value;

    seletor.replaceChildren(
        new Option("Selecione", "")
    );

    for (const fornecedor of ESTADO.fornecedores) {
        const nome =
            fornecedor.nomeFornecedor ??
            fornecedor.nome ??
            fornecedor.razaoSocial ??
            `Fornecedor ${fornecedor.id}`;

        seletor.add(
            new Option(nome, String(fornecedor.id))
        );
    }

    if (
        [...seletor.options].some(
            (opcao) => opcao.value === selecionado
        )
    ) {
        seletor.value = selecionado;
    }
}

function atualizarIndicadores() {
    $("totalProdutos").textContent =
        String(ESTADO.produtos.length);

    $("totalFalta").textContent = String(
        ESTADO.produtos.filter(
            (produto) =>
                situacaoProduto(produto) === "Em falta"
        ).length
    );

    $("totalBaixo").textContent = String(
        ESTADO.produtos.filter(
            (produto) =>
                situacaoProduto(produto) === "Estoque baixo"
        ).length
    );

    $("totalSaudavel").textContent = String(
        ESTADO.produtos.filter(
            (produto) =>
                situacaoProduto(produto) === "Saudável"
        ).length
    );
}

function produtosFiltrados() {
    const termo = $("pesquisaProduto")
        .value
        .trim()
        .toLocaleLowerCase("pt-BR");

    const situacao = $("filtroSituacao").value;

    return ESTADO.produtos.filter((produto) => {
        const campos = [
            produto.nome,
            codigoProduto(produto),
            nomeFornecedor(produto)
        ];

        const correspondePesquisa =
            !termo ||
            campos.some((campo) =>
                String(campo ?? "")
                    .toLocaleLowerCase("pt-BR")
                    .includes(termo)
            );

        const correspondeSituacao =
            !situacao ||
            situacaoProduto(produto) === situacao;

        return (
            correspondePesquisa &&
            correspondeSituacao
        );
    });
}

function criarCelula(linha, conteudo, classe = "") {
    const celula = document.createElement("td");

    celula.textContent =
        conteudo == null ? "—" : String(conteudo);

    if (classe) {
        celula.className = classe;
    }

    linha.append(celula);

    return celula;
}

function renderizarProdutos() {
    const lista = produtosFiltrados();
    const tabela = $("listaProdutos");

    tabela.replaceChildren();

    $("estadoVazio").hidden = lista.length > 0;

    for (const produto of lista) {
        const linha = document.createElement("tr");

        criarCelula(
            linha,
            produto.nome,
            "product-name"
        );

        criarCelula(
            linha,
            codigoProduto(produto)
        );

        criarCelula(
            linha,
            nomeFornecedor(produto)
        );

        criarCelula(
            linha,
            formatarPreco(precoProduto(produto))
        );

        criarCelula(
            linha,
            quantidadeProduto(produto)
        );

        criarCelula(
            linha,
            formatarData(vencimentoProduto(produto))
        );

        const celulaSituacao = criarCelula(linha, "");
        const situacao = situacaoProduto(produto);

        const etiqueta = document.createElement("span");

        etiqueta.className = `pill ${situacao === "Em falta"
            ? "red"
            : situacao === "Estoque baixo"
                ? "yellow"
                : situacao === "Saudável"
                    ? "green"
                    : "gray"
            }`;

        etiqueta.textContent =
            situacao ?? "Não informado";

        celulaSituacao.replaceChildren(etiqueta);

        const acoes = criarCelula(linha, "");

        const editar = document.createElement("button");

        editar.type = "button";
        editar.className = "edit-btn";
        editar.dataset.editar = String(produto.id);
        editar.textContent = "Editar";

        const excluir = document.createElement("button");

        excluir.type = "button";
        excluir.className = "delete-btn";
        excluir.dataset.excluir = String(produto.id);
        excluir.textContent = "Excluir";
        excluir.setAttribute(
            "aria-label",
            `Excluir produto ${produto.nome}`
        );

        acoes.replaceChildren(editar, excluir);

        tabela.append(linha);
    }
}

async function carregarProdutos() {
    exibirMensagem(
        "statusPagina",
        "Carregando produtos..."
    );

    try {
        ESTADO.produtos = obterLista(
            await obterJson(ROTAS.produtos)
        );

        atualizarIndicadores();
        renderizarProdutos();

        exibirMensagem(
            "statusPagina",
            "Produtos atualizados."
        );
    } catch (erro) {
        console.error(
            "Erro ao carregar produtos:",
            erro
        );

        exibirMensagem(
            "statusPagina",
            erro.message
        );
    }
}

function abrirCadastro() {
    $("formProduto").reset();

    $("produtoId").value = "";
    $("tituloModal").textContent = "Cadastrar produto";
    $("salvarProduto").textContent = "Cadastrar produto";

    exibirMensagem("resultadoProduto", "");

    $("modalProduto").showModal();
}

function abrirEdicao(id) {
    const produto = ESTADO.produtos.find(
        (item) => String(item.id) === String(id)
    );

    if (!produto) {
        exibirMensagem(
            "statusPagina",
            "Produto não encontrado. Atualize a lista."
        );

        return;
    }

    $("formProduto").reset();

    $("produtoId").value = String(produto.id);
    $("nomeProduto").value = produto.nome ?? "";

    $("codigoProduto").value =
        codigoProduto(produto) ?? "";

    $("precoProduto").value =
        precoProduto(produto) ?? "";

    $("quantidadeProduto").value =
        quantidadeProduto(produto) ?? "";

    $("estoqueMinimoProduto").value =
        minimoProduto(produto) ?? 0;

    $("vencimentoProduto").value =
        vencimentoProduto(produto)
            ? String(vencimentoProduto(produto)).slice(0, 10)
            : "";

    const fornecedor = fornecedorDoProduto(produto);

    $("fornecedorProduto").value = String(
        fornecedor?.id ??
        produto.fornecedorId ??
        produto.idFornecedor ??
        ""
    );

    $("tituloModal").textContent = "Editar produto";
    $("salvarProduto").textContent = "Salvar alterações";

    exibirMensagem("resultadoProduto", "");

    $("modalProduto").showModal();
}

function montarProduto() {
    const nome = $("nomeProduto").value.trim();
    const codigoBarras = $("codigoProduto").value.trim();

    const precoVenda =
        Number($("precoProduto").value);

    const unidade =
        Number($("quantidadeProduto").value);

    const estoqueMinimo =
        Number($("estoqueMinimoProduto").value);

    const dataVencimento =
        $("vencimentoProduto").value;

    const fornecedorId =
        Number($("fornecedorProduto").value);

    if (nome.length < 3 || nome.length > 100) {
        throw new Error(
            "O nome deve conter entre 3 e 100 caracteres."
        );
    }

    if (!codigoBarras) {
        throw new Error(
            "Informe o código de barras."
        );
    }

    if (
        $("precoProduto").value === "" ||
        !Number.isFinite(precoVenda) ||
        precoVenda < 0
    ) {
        throw new Error(
            "Informe um preço válido."
        );
    }

    if (
        $("quantidadeProduto").value === "" ||
        !Number.isSafeInteger(unidade) ||
        unidade < 0
    ) {
        throw new Error(
            "Informe uma quantidade válida."
        );
    }

    if (
        $("estoqueMinimoProduto").value === "" ||
        !Number.isSafeInteger(estoqueMinimo) ||
        estoqueMinimo < 0
    ) {
        throw new Error(
            "Informe um estoque mínimo válido."
        );
    }

    if (!dataVencimento) {
        throw new Error(
            "Informe a data de vencimento."
        );
    }

    if (
        !Number.isSafeInteger(fornecedorId) ||
        fornecedorId <= 0 ||
        !ESTADO.fornecedores.some(
            (item) => Number(item.id) === fornecedorId
        )
    ) {
        throw new Error(
            "Selecione um fornecedor válido."
        );
    }

    return {
        nome,
        codigoBarras,
        precoVenda,
        unidade,
        estoqueMinimo,
        dataVencimento,
        fornecedor: {
            id: fornecedorId
        }
    };
}

async function salvarProduto(evento) {
    evento.preventDefault();

    if (ESTADO.salvando) {
        return;
    }

    const id = $("produtoId").value;
    const editando = id !== "";
    const botao = $("salvarProduto");

    ESTADO.salvando = true;
    botao.disabled = true;

    exibirMensagem(
        "resultadoProduto",
        editando
            ? "Salvando alterações..."
            : "Cadastrando produto..."
    );

    try {
        const dados = montarProduto();
        const csrf = await obterCsrf();

        const caminho = editando
            ? `${ROTAS.produtos}/${encodeURIComponent(id)}`
            : ROTAS.produtos;

        const resposta = await requisicao(caminho, {
            method: editando ? "PUT" : "POST",
            headers: {
                "Content-Type": "application/json",
                [csrf.headerName]: csrf.token
            },
            body: JSON.stringify(dados)
        });

        if (resposta.status === 401) {
            window.location.replace("index.html");

            throw new Error(
                "Sua sessão expirou. Entre novamente."
            );
        }

        if (resposta.status === 403) {
            throw new Error(
                "Você não tem permissão para salvar este produto."
            );
        }

        if (!resposta.ok) {
            let detalhe = "";

            try {
                const corpo = await resposta.json();

                detalhe =
                    typeof corpo?.mensagem === "string"
                        ? corpo.mensagem
                        : typeof corpo?.message === "string"
                            ? corpo.message
                            : "";
            } catch {
                detalhe = "";
            }

            throw new Error(
                detalhe ||
                `O servidor recusou os dados (${resposta.status}).`
            );
        }

        $("modalProduto").close();

        await carregarProdutos();

        exibirMensagem(
            "statusPagina",
            editando
                ? "Produto atualizado com sucesso."
                : "Produto cadastrado com sucesso."
        );
    } catch (erro) {
        console.error(
            "Erro ao salvar produto:",
            erro
        );

        exibirMensagem(
            "resultadoProduto",
            erro.message
        );
    } finally {
        ESTADO.salvando = false;
        botao.disabled = false;
    }
}

function configurarMenuPerfil() {
    const botao = $("botaoPerfil");
    const menu = $("menuPerfil");

    const fechar = () => {
        menu.hidden = true;

        botao.setAttribute(
            "aria-expanded",
            "false"
        );
    };

    botao.addEventListener("click", () => {
        menu.hidden = !menu.hidden;

        botao.setAttribute(
            "aria-expanded",
            String(!menu.hidden)
        );
    });

    document.addEventListener("click", (evento) => {
        if (!evento.target.closest(".profile-area")) {
            fechar();
        }
    });

    document.addEventListener("keydown", (evento) => {
        if (evento.key === "Escape") {
            fechar();
        }
    });

    $("sair").addEventListener("click", async () => {
        fechar();

        try {
            const csrf = await obterCsrf();

            const resposta = await requisicao(
                ROTAS.logout,
                {
                    method: "POST",
                    headers: {
                        [csrf.headerName]: csrf.token
                    }
                }
            );

            if (!resposta.ok) {
                throw new Error(
                    "Não foi possível encerrar a sessão."
                );
            }

            window.location.replace("index.html");
        } catch (erro) {
            exibirMensagem(
                "statusPagina",
                erro.message
            );
        }
    });
}

async function excluirProduto(id) {
    const produto = ESTADO.produtos.find(
        (item) => String(item.id) === String(id)
    );

    if (!produto) {
        exibirMensagem(
            "statusPagina",
            "Produto não encontrado. Atualize a lista."
        );
        return;
    }

    const confirmado = window.confirm(
        `Deseja realmente excluir o produto "${produto.nome}"?\n\n` +
        "Esta operação não poderá ser desfeita."
    );

    if (!confirmado) {
        return;
    }

    try {
        exibirMensagem(
            "statusPagina",
            "Excluindo produto..."
        );

        const csrf = await obterCsrf();

        const resposta = await requisicao(
            `${ROTAS.produtos}/${encodeURIComponent(id)}`,
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
                "Você não possui permissão para excluir produtos."
            );
        }

        if (resposta.status === 404) {
            throw new Error(
                "Produto não encontrado ou rota de exclusão inexistente."
            );
        }

        if (resposta.status === 409) {
            throw new Error(
                "Este produto possui registros vinculados e não pode ser excluído."
            );
        }

        if (!resposta.ok) {
            throw new Error(
                `Não foi possível excluir o produto. Erro HTTP ${resposta.status}.`
            );
        }

        await carregarProdutos();

        exibirMensagem(
            "statusPagina",
            `Produto "${produto.nome}" excluído com sucesso.`
        );

    } catch (erro) {
        console.error("Erro ao excluir produto:", erro);

        exibirMensagem(
            "statusPagina",
            erro.message
        );
    }
}


function configurarEventos() {
    $("novoProduto").addEventListener(
        "click",
        abrirCadastro
    );

    $("atualizarProdutos").addEventListener(
        "click",
        carregarProdutos
    );

    $("pesquisaProduto").addEventListener(
        "input",
        renderizarProdutos
    );

    $("filtroSituacao").addEventListener(
        "change",
        renderizarProdutos
    );

    $("listaProdutos").addEventListener(
        "click",
        async (evento) => {
            const botaoEditar = evento.target.closest(
                "button[data-editar]"
            );

            if (botaoEditar) {
                abrirEdicao(botaoEditar.dataset.editar);
                return;
            }

            const botaoExcluir = evento.target.closest(
                "button[data-excluir]"
            );

            if (botaoExcluir) {
                botaoExcluir.disabled = true;

                try {
                    await excluirProduto(
                        botaoExcluir.dataset.excluir
                    );
                } finally {
                    botaoExcluir.disabled = false;
                }
            }
        }
    );

    $("fecharModal").addEventListener(
        "click",
        () => $("modalProduto").close()
    );

    $("cancelarProduto").addEventListener(
        "click",
        () => $("modalProduto").close()
    );

    $("formProduto").addEventListener(
        "submit",
        salvarProduto
    );

    configurarMenuPerfil();
}

async function iniciarPagina() {
    configurarEventos();

    try {
        const usuario = await obterJson(ROTAS.usuario);

        configurarUsuario(usuario);
    } catch (erro) {
        console.error(
            "Falha ao autenticar usuário:",
            erro
        );

        exibirMensagem(
            "statusPagina",
            erro.message
        );

        return;
    }

    try {
        await carregarFornecedores();
    } catch (erro) {
        console.error(
            "Falha ao carregar fornecedores:",
            erro
        );

        exibirMensagem(
            "statusPagina",
            `Aviso: não foi possível carregar fornecedores: ${erro.message}`
        );
    }

    await carregarProdutos();
}


void iniciarPagina();
