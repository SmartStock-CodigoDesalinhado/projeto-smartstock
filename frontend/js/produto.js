const API = `http://${window.location.hostname}:8080/api`;

const $ = (id) => document.getElementById(id);

let produtos = [];
let fornecedores = [];

/* =========================
   API
========================= */

async function requisicao(caminho, opcoes = {}) {

    return fetch(`${API}${caminho}`, {
        credentials: "include",
        ...opcoes
    });

}

async function obterCsrf() {

    const resposta = await requisicao("/usuarios/csrf");

    if (!resposta.ok) {
        throw new Error(`Erro ao obter CSRF: ${resposta.status}`);
    }

    return resposta.json();

}

async function consultarUsuario() {

    const resposta = await requisicao("/usuarios/me");

    if (
        resposta.status === 401 ||
        resposta.status === 403
    ) {
        return null;
    }

    if (!resposta.ok) {
        throw new Error(
            `Erro ao consultar usuário: ${resposta.status}`
        );
    }

    return resposta.json();

}

async function listaAPI(caminho) {

    const resposta = await requisicao(caminho);

    if (
        resposta.status === 401 ||
        resposta.status === 403
    ) {

        window.location.replace("index.html");

        throw new Error("Sessão encerrada.");

    }

    if (!resposta.ok) {

        throw new Error(
            `Erro ${resposta.status} em ${caminho}`
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
        `Formato inesperado em ${caminho}`
    );

}

/* =========================
   UTILITÁRIOS
========================= */

function texto(valor) {

    return String(valor ?? "—");

}

function seguro(valor) {

    return texto(valor).replace(
        /[&<>"']/g,
        caractere => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[caractere]
    );

}

function primeiroValor(objeto, campos) {

    for (const campo of campos) {

        if (
            objeto?.[campo] !== undefined &&
            objeto?.[campo] !== null
        ) {
            return objeto[campo];
        }

    }

    return null;

}

/* =========================
   PRODUTO
========================= */

function quantidade(produto) {

    const valor = primeiroValor(produto, [
        "quantidadeAtual",
        "quantidadeDisponivel",
        "quantidadeEstoque",
        "quantidade",
        "estoqueAtual",
        "estoque"
    ]);

    return valor == null
        ? null
        : Number(valor);

}

function estoqueMinimo(produto) {

    const valor = primeiroValor(produto, [
        "estoqueMinimo",
        "quantidadeMinima",
        "minimo"
    ]);

    return valor == null
        ? null
        : Number(valor);

}

function codigo(produto) {

    return primeiroValor(produto, [
        "codigoBarras",
        "codigoDeBarras",
        "codigo",
        "sku"
    ]) ?? produto.id;

}

function preco(produto) {

    return primeiroValor(produto, [
        "preco",
        "valor",
        "precoUnitario"
    ]);

}

function vencimento(produto) {

    return primeiroValor(produto, [
        "dataVencimento",
        "vencimento",
        "validade"
    ]);

}

/* =========================
   FORNECEDOR
========================= */

function fornecedorDoProduto(produto) {

    if (
        produto?.fornecedor &&
        typeof produto.fornecedor === "object"
    ) {
        return produto.fornecedor;
    }
const API = `http://${window.location.hostname}:8080/api`;

const $ = (id) => document.getElementById(id);


let produtos = [];

let fornecedores = [];


/* ========================================
   REQUISIÇÕES
======================================== */

async function requisicao(caminho, opcoes = {}) {

    return fetch(`${API}${caminho}`, {

        credentials: "include",

        ...opcoes

    });

}


async function obterCsrf() {

    const resposta =
        await requisicao("/usuarios/csrf");


    if (!resposta.ok) {

        throw new Error(
            `Erro ao obter CSRF: ${resposta.status}`
        );

    }


    return resposta.json();

}


async function consultarUsuario() {

    const resposta =
        await requisicao("/usuarios/me");


    if (
        resposta.status === 401 ||
        resposta.status === 403
    ) {

        return null;

    }


    if (!resposta.ok) {

        throw new Error(
            `Erro ao consultar usuário: ${resposta.status}`
        );

    }


    return resposta.json();

}


async function carregarLista(caminho) {

    const resposta =
        await requisicao(caminho);


    if (
        resposta.status === 401 ||
        resposta.status === 403
    ) {

        window.location.replace("../index.html");

        throw new Error(
            "Sessão encerrada."
        );

    }


    if (!resposta.ok) {

        throw new Error(
            `Erro ${resposta.status} em ${caminho}`
        );

    }


    const dados =
        await resposta.json();


    if (Array.isArray(dados)) {

        return dados;

    }


    if (Array.isArray(dados.content)) {

        return dados.content;

    }


    throw new Error(
        "A API retornou um formato inesperado."
    );

}


/* ========================================
   SEGURANÇA / TEXTO
======================================== */

function texto(valor) {

    return String(
        valor ?? "—"
    );

}


function seguro(valor) {

    return texto(valor).replace(

        /[&<>"']/g,

        caractere => ({

            "&": "&amp;",

            "<": "&lt;",

            ">": "&gt;",

            '"': "&quot;",

            "'": "&#39;"

        })[caractere]

    );

}


/* ========================================
   CAMPOS DO PRODUTO
======================================== */

function quantidade(produto) {

    const valor =

        produto.quantidadeAtual ??

        produto.quantidadeDisponivel ??

        produto.quantidadeEstoque ??

        produto.quantidade ??

        produto.estoqueAtual ??

        produto.estoque;


    if (valor == null) {

        return null;

    }


    return Number(valor);

}


function minimo(produto) {

    const valor =

        produto.estoqueMinimo ??

        produto.quantidadeMinima ??

        produto.minimo;


    if (valor == null) {

        return null;

    }


    return Number(valor);

}


function codigo(produto) {

    return (

        produto.codigoBarras ??

        produto.codigo ??

        produto.sku ??

        produto.id ??

        "—"

    );

}


function preco(produto) {

    return (

        produto.preco ??

        produto.precoUnitario ??

        produto.valor ??

        null

    );

}


function vencimento(produto) {

    return (

        produto.dataVencimento ??

        produto.vencimento ??

        produto.validade ??

        null

    );

}


/* ========================================
   FORNECEDOR DO PRODUTO
======================================== */

function obterFornecedor(produto) {

    if (
        produto.fornecedor &&
        typeof produto.fornecedor === "object"
    ) {

        return produto.fornecedor;

    }


    const fornecedorId =

        produto.fornecedorId ??

        produto.idFornecedor;


    if (fornecedorId == null) {

        return null;

    }


    return fornecedores.find(

        fornecedor =>

            String(fornecedor.id) ===
            String(fornecedorId)

    ) ?? null;

}


function nomeFornecedor(produto) {

    const fornecedor =
        obterFornecedor(produto);


    return (

        fornecedor?.nome ??

        fornecedor?.razaoSocial ??

        produto.nomeFornecedor ??

        "—"

    );

}


/* ========================================
   SITUAÇÃO DO ESTOQUE
======================================== */

function situacao(produto) {

    const atual =
        quantidade(produto);


    const estoqueMinimo =
        minimo(produto);


    if (
        !Number.isFinite(atual) ||
        !Number.isFinite(estoqueMinimo)
    ) {

        return null;

    }


    if (atual <= 0) {

        return "Em falta";

    }


    if (atual <= estoqueMinimo) {

        return "Estoque baixo";

    }


    return "Saudável";

}


/* ========================================
   FORMATAÇÃO
======================================== */

function formatarPreco(valor) {

    const numero =
        Number(valor);


    if (!Number.isFinite(numero)) {

        return "—";

    }


    return numero.toLocaleString(

        "pt-BR",

        {

            style: "currency",

            currency: "BRL"

        }

    );

}


function formatarData(valor) {

    if (!valor) {

        return "—";

    }


    const data =
        String(valor).slice(0, 10);


    const partes =
        data.split("-");


    if (partes.length !== 3) {

        return texto(valor);

    }


    return `${partes[2]}/${partes[1]}/${partes[0]}`;

}


/* ========================================
   FORNECEDORES
======================================== */

async function carregarFornecedores() {

    try {

        fornecedores =
            await carregarLista(
                "/fornecedores"
            );


        const select =
            $("fornecedorProduto");


        select.innerHTML = `

            <option value="">
                Selecione
            </option>

        `;


        fornecedores.forEach(
            fornecedor => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    fornecedor.id;


                option.textContent =

                    fornecedor.nome ??

                    fornecedor.razaoSocial ??

                    `Fornecedor ${fornecedor.id}`;


                select.append(option);

            }
        );

    } catch (erro) {

        fornecedores = [];


        console.error(
            "Erro ao carregar fornecedores:",
            erro
        );

    }

}


/* ========================================
   INDICADORES
======================================== */

function atualizarIndicadores() {

    $("totalProdutos").textContent =
        produtos.length;


    $("totalFalta").textContent =

        produtos.filter(

            produto =>
                situacao(produto) ===
                "Em falta"

        ).length;


    $("totalBaixo").textContent =

        produtos.filter(

            produto =>
                situacao(produto) ===
                "Estoque baixo"

        ).length;


    $("totalSaudavel").textContent =

        produtos.filter(

            produto =>
                situacao(produto) ===
                "Saudável"

        ).length;

}


/* ========================================
   FILTRO
======================================== */

function filtrarProdutos() {

    const pesquisa =

        $("pesquisaProduto")
            .value
            .trim()
            .toLowerCase();


    const filtro =

        $("filtroSituacao")
            .value;


    return produtos.filter(
        produto => {

            const nome =

                String(
                    produto.nome ?? ""
                ).toLowerCase();


            const codigoProduto =

                String(
                    codigo(produto)
                ).toLowerCase();


            const fornecedor =

                String(
                    nomeFornecedor(produto)
                ).toLowerCase();


            const encontrou =

                !pesquisa ||

                nome.includes(pesquisa) ||

                codigoProduto.includes(pesquisa) ||

                fornecedor.includes(pesquisa);


            const encontrouSituacao =

                !filtro ||

                situacao(produto) ===
                filtro;


            return (
                encontrou &&
                encontrouSituacao
            );

        }
    );

}


/* ========================================
   TABELA
======================================== */

function renderizarProdutos() {

    const lista =
        filtrarProdutos();


    const tbody =
        $("listaProdutos");


    const estadoVazio =
        $("estadoVazio");


    if (lista.length === 0) {

        tbody.innerHTML = "";

        estadoVazio.hidden = false;

        return;

    }


    estadoVazio.hidden = true;


    tbody.innerHTML = lista
        .map(
            produto => {

                const status =
                    situacao(produto);


                let classe =
                    "gray";


                if (status === "Em falta") {

                    classe = "red";

                }


                if (status === "Estoque baixo") {

                    classe = "yellow";

                }


                if (status === "Saudável") {

                    classe = "green";

                }


                return `

                    <tr>

                        <td class="product-name">

                            ${seguro(
                                produto.nome
                            )}

                        </td>


                        <td>

                            ${seguro(
                                codigo(produto)
                            )}

                        </td>


                        <td>

                            ${seguro(
                                nomeFornecedor(produto)
                            )}

                        </td>


                        <td>

                            ${seguro(
                                formatarPreco(
                                    preco(produto)
                                )
                            )}

                        </td>


                        <td>

                            ${seguro(
                                quantidade(produto)
                            )}

                        </td>


                        <td>

                            ${seguro(
                                formatarData(
                                    vencimento(produto)
                                )
                            )}

                        </td>


                        <td>

                            <span
                                class="pill ${classe}"
                            >

                                ${seguro(
                                    status ??
                                    "Não informado"
                                )}

                            </span>

                        </td>


                        <td>

                            <button
                                type="button"
                                class="edit-btn"
                                data-editar="${seguro(
                                    produto.id
                                )}"
                            >

                                Editar

                            </button>

                        </td>

                    </tr>

                `;

            }
        )
        .join("");

}


/* ========================================
   CARREGAR PRODUTOS
======================================== */

async function carregarProdutos() {

    $("statusPagina").textContent =
        "Carregando produtos...";


    try {

        produtos =
            await carregarLista(
                "/produtos"
            );


        atualizarIndicadores();


        renderizarProdutos();


        $("statusPagina").textContent =
            "Produtos atualizados a partir do backend.";

    } catch (erro) {

        produtos = [];


        atualizarIndicadores();


        $("listaProdutos").innerHTML = `

            <tr>

                <td colspan="8">

                    Não foi possível carregar
                    os produtos.

                </td>

            </tr>

        `;


        $("estadoVazio").hidden =
            true;


        $("statusPagina").textContent =
            erro.message;

    }

}


/* ========================================
   MODAL CADASTRO
======================================== */

function abrirCadastro() {

    $("formProduto").reset();


    $("produtoId").value =
        "";


    $("tituloModal").textContent =
        "Cadastrar produto";


    $("salvarProduto").textContent =
        "Cadastrar produto";


    $("resultadoProduto").textContent =
        "";


    $("modalProduto").showModal();

}


/* ========================================
   MODAL EDIÇÃO
======================================== */

function abrirEdicao(id) {

    const produto =
        produtos.find(

            item =>
                String(item.id) ===
                String(id)

        );


    if (!produto) {

        return;

    }


    $("produtoId").value =
        produto.id;


    $("nomeProduto").value =
        produto.nome ?? "";


    $("codigoProduto").value =
        codigo(produto) ?? "";


    $("precoProduto").value =
        preco(produto) ?? "";


    $("quantidadeProduto").value =
        quantidade(produto) ?? "";


    $("estoqueMinimoProduto").value =
        minimo(produto) ?? "";


    $("vencimentoProduto").value =
        vencimento(produto)
            ? String(
                vencimento(produto)
            ).slice(0, 10)
            : "";


    const fornecedor =
        obterFornecedor(produto);


    $("fornecedorProduto").value =

        fornecedor?.id ??

        produto.fornecedorId ??

        produto.idFornecedor ??

        "";


    $("tituloModal").textContent =
        "Editar produto";


    $("salvarProduto").textContent =
        "Salvar alterações";


    $("resultadoProduto").textContent =
        "";


    $("modalProduto").showModal();

}


/* ========================================
   OBJETO PARA API
======================================== */

function montarProduto() {

    return {

        nome:
            $("nomeProduto")
                .value
                .trim(),


        codigoBarras:
            $("codigoProduto")
                .value
                .trim(),


        preco:
            Number(
                $("precoProduto")
                    .value
            ),


        quantidadeAtual:
            Number(
                $("quantidadeProduto")
                    .value
            ),


        estoqueMinimo:
            Number(
                $("estoqueMinimoProduto")
                    .value
            ),


        dataVencimento:

            $("vencimentoProduto")
                .value ||

            null,


        fornecedorId:

            Number(
                $("fornecedorProduto")
                    .value
            )

    };

}


/* ========================================
   SALVAR PRODUTO
======================================== */

async function salvarProduto(evento) {

    evento.preventDefault();


    const id =
        $("produtoId").value;


    const editando =
        Boolean(id);


    const botao =
        $("salvarProduto");


    botao.disabled =
        true;


    $("resultadoProduto").textContent =

        editando

            ? "Salvando alterações..."

            : "Cadastrando produto...";


    try {

        const csrf =
            await obterCsrf();


        const dados =
            montarProduto();


        const resposta =
            await requisicao(

                editando

                    ? `/produtos/${id}`

                    : "/produtos",

                {

                    method:

                        editando

                            ? "PUT"

                            : "POST",


                    headers: {

                        "Content-Type":
                            "application/json",

                        [csrf.headerName]:
                            csrf.token

                    },


                    body:
                        JSON.stringify(
                            dados
                        )

                }

            );


        if (!resposta.ok) {

            const mensagem =
                await resposta.text();


            throw new Error(

                `Erro ${resposta.status}: ${mensagem.slice(
                    0,
                    200
                )}`

            );

        }


        $("resultadoProduto").textContent =

            editando

                ? "Produto atualizado com sucesso."

                : "Produto cadastrado com sucesso.";


        await carregarProdutos();


        setTimeout(
            () => {

                if (
                    $("modalProduto").open
                ) {

                    $("modalProduto").close();

                }

            },

            500
        );

    } catch (erro) {

        $("resultadoProduto").textContent =

            `Não foi possível salvar: ${erro.message}`;

    } finally {

        botao.disabled =
            false;

    }

}


/* ========================================
   USUÁRIO
======================================== */

function configurarUsuario(usuario) {

    const nome =

        usuario.nome ??

        usuario.login ??

        "Usuário";


    $("nomeUsuario").textContent =
        nome;


    $("perfilUsuario").textContent =

        usuario.tipoUsuario === "CEO"

            ? "CEO"

            : usuario.tipoUsuario === "ADMIN"

                ? "Administrador"

                : "Usuário";


    $("iniciaisUsuario").textContent =

        nome
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map(
                parte =>
                    parte.charAt(0)
            )
            .join("")
            .toUpperCase();


    const primeiroNome =

        nome
            .trim()
            .split(/\s+/)[0];


    $("saudacaoUsuario").textContent =

        `Olá, ${primeiroNome}!`;

}


/* ========================================
   INICIAR PÁGINA
======================================== */

async function iniciarPagina() {

    try {

        const usuario =
            await consultarUsuario();


        if (!usuario) {

            window.location.replace(
                "../index.html"
            );

            return;

        }


        configurarUsuario(
            usuario
        );


        await carregarFornecedores();


        await carregarProdutos();

    } catch (erro) {

        $("statusPagina").textContent =
            erro.message;

    }


    /* PERFIL */

    const botaoPerfil =
        $("botaoPerfil");


    const menuPerfil =
        $("menuPerfil");


    function fecharPerfil() {

        menuPerfil.hidden =
            true;


        botaoPerfil.setAttribute(
            "aria-expanded",
            "false"
        );

    }


    botaoPerfil.addEventListener(
        "click",
        () => {

            menuPerfil.hidden =
                !menuPerfil.hidden;


            botaoPerfil.setAttribute(

                "aria-expanded",

                String(
                    !menuPerfil.hidden
                )

            );

        }
    );


    document.addEventListener(
        "click",
        evento => {

            if (
                !evento.target.closest(
                    ".profile-area"
                )
            ) {

                fecharPerfil();

            }

        }
    );


    /* LOGOUT */

    $("sair").addEventListener(
        "click",
        async () => {

            try {

                const csrf =
                    await obterCsrf();


                const resposta =
                    await requisicao(

                        "/auth/logout",

                        {

                            method:
                                "POST",


                            headers: {

                                [csrf.headerName]:
                                    csrf.token

                            }

                        }

                    );


                if (!resposta.ok) {

                    throw new Error(
                        `Erro ${resposta.status}`
                    );

                }


                window.location.replace(
                    "../index.html"
                );

            } catch (erro) {

                $("statusPagina").textContent =

                    `Não foi possível sair: ${erro.message}`;

            }

        }
    );


    /* PRODUTOS */

    $("novoProduto")
        .addEventListener(
            "click",
            abrirCadastro
        );


    $("atualizarProdutos")
        .addEventListener(
            "click",
            carregarProdutos
        );


    $("pesquisaProduto")
        .addEventListener(
            "input",
            renderizarProdutos
        );


    $("filtroSituacao")
        .addEventListener(
            "change",
            renderizarProdutos
        );


    $("listaProdutos")
        .addEventListener(
            "click",
            evento => {

                const botao =
                    evento.target.closest(
                        "[data-editar]"
                    );


                if (botao) {

                    abrirEdicao(
                        botao.dataset.editar
                    );

                }

            }
        );


    /* MODAL */

    $("fecharModal")
        .addEventListener(
            "click",
            () =>
                $("modalProduto").close()
        );


    $("cancelarProduto")
        .addEventListener(
            "click",
            () =>
                $("modalProduto").close()
        );


    $("formProduto")
        .addEventListener(
            "submit",
            salvarProduto
        );


    document.addEventListener(
        "keydown",
        evento => {

            if (
                evento.key === "Escape"
            ) {

                fecharPerfil();

            }

        }
    );

}


}

iniciarPagina();