const HOST_API = window.location.hostname || "localhost";
const API = `http://${HOST_API}:8080/api`;
const $ = (id) => document.getElementById(id);

let produtos = [];
let movimentacoes = [];

const texto = (valor) => String(valor ?? "—");

function seguro(valor) {
  return texto(valor).replace(/[&<>"']/g, (caractere) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[caractere]);
}

function formatarData(valor) {
  if (!valor) return "—";

  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return texto(valor);

  return data.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function categoriaNome(categoria) {
  const categorias = {
    produtosLimpeza: "Produtos de limpeza",
    Comida: "Comida",
    Bebida: "Bebida",
    Higiene: "Higiene",
  };

  return categorias[categoria] || texto(categoria);
}

function statusProduto(produto) {
  const quantidade = Number(produto.unidade || 0);

  if (quantidade <= 0) {
    return { key: "zerado", label: "Sem estoque", cls: "status-empty" };
  }

  if (quantidade <= 5) {
    return { key: "baixo", label: "Estoque baixo", cls: "status-low" };
  }

  return { key: "normal", label: "Normal", cls: "status-normal" };
}

function produtoPorId(id) {
  return produtos.find((produto) => String(produto.id) === String(id));
}

function feedback(mensagem, tipo = "") {
  const elemento = $("feedback");

  if (elemento) {
    elemento.textContent = mensagem;
    elemento.className = `estoque-feedback ${tipo}`.trim();
  }

  const mensagemModal = $("feedbackProduto");
  const modalProduto = $("modalProduto");

  if (mensagemModal && modalProduto && !modalProduto.hidden) {
    mensagemModal.textContent = mensagem;
    mensagemModal.className = `estoque-feedback ${tipo}`.trim();
  }
}

async function requisicao(caminho, opcoes = {}) {
  try {
    return await fetch(`${API}${caminho}`, {
      credentials: "include",
      ...opcoes,
    });
  } catch (erro) {
    throw new Error(
      `Não foi possível conectar ao backend em ${API}. ` +
        "Confirme se o Spring Boot está em execução e se a porta 8080 está correta. " +
        `Detalhe: ${erro.message || "falha de rede/CORS"}`,
    );
  }
}

async function obterCsrf() {
  const resposta = await requisicao("/usuarios/csrf");

  if (!resposta.ok) {
    throw new Error(
      `O backend respondeu ${resposta.status} ao solicitar o token CSRF.`,
    );
  }

  const csrf = await resposta.json();
  if (!csrf.headerName || !csrf.token) {
    throw new Error(
      "O backend não retornou headerName/token CSRF no formato esperado.",
    );
  }

  return csrf;
}

async function consultarUsuario() {
  const resposta = await requisicao("/usuarios/me");

  if (resposta.status === 401 || resposta.status === 403) return null;
  if (!resposta.ok) {
    throw new Error("Não foi possível consultar o usuário.");
  }

  return resposta.json();
}

async function listaAPI(caminho) {
  const resposta = await requisicao(caminho);

  if (resposta.status === 401 || resposta.status === 403) {
    window.location.replace("index.html");
    throw new Error("Sua sessão expirou. Entre novamente.");
  }

  if (!resposta.ok) {
    throw new Error(`Falha ao consultar ${caminho} (${resposta.status}).`);
  }

  const dados = await resposta.json();
  if (!Array.isArray(dados)) {
    throw new Error("A API retornou um formato inesperado.");
  }

  return dados;
}

async function enviar(caminho, metodo, dados) {
  const csrf = await obterCsrf();
  const resposta = await requisicao(caminho, {
    method: metodo,
    headers: {
      "Content-Type": "application/json",
      [csrf.headerName]: csrf.token,
    },
    body: JSON.stringify(dados),
  });

  if (resposta.status === 401 || resposta.status === 403) {
    throw new Error(
      "Sua sessão expirou ou você não tem permissão para realizar esta operação. Entre novamente.",
    );
  }

  if (!resposta.ok) {
    let mensagem = `Não foi possível salvar os dados (HTTP ${resposta.status}).`;

    try {
      const erro = await resposta.json();

      if (erro.message || erro.mensagem) {
        mensagem = erro.message || erro.mensagem;
      } else if (Array.isArray(erro.errors) && erro.errors.length) {
        mensagem = erro.errors
          .map((item) => item.defaultMessage || item.message || item)
          .join("; ");
      } else if (erro.detail) {
        mensagem = erro.detail;
      } else if (erro.title) {
        mensagem = erro.title;
      }
    } catch {
    }

    if (resposta.status === 400) {
      mensagem +=
        " Confira nome, código de barras, categoria, preço, quantidade e vencimento.";
    }
    if (resposta.status === 409) {
      mensagem += " O código de barras pode já estar cadastrado.";
    }

    throw new Error(mensagem);
  }

  if (resposta.status === 204) return null;
  return resposta.json().catch(() => null);
}

function renderResumo() {
  $("totalProdutos").textContent = produtos.length;
  $("estoqueBaixo").textContent = produtos.filter((produto) => {
    const quantidade = Number(produto.unidade);
    return quantidade > 0 && quantidade <= 5;
  }).length;
  $("semEstoque").textContent = produtos.filter(
    (produto) => Number(produto.unidade) <= 0,
  ).length;
  $("totalMovimentacoes").textContent = movimentacoes.length;
}

function renderProdutos() {
  const busca = $("pesquisa").value.trim().toLocaleLowerCase("pt-BR");
  const filtro = $("filtroStatus").value;
  const lista = produtos.filter((produto) => {
    const termos = `${produto.nome || ""} ${produto.codigoBarras || ""} ${produto.categoria || ""}`
      .toLocaleLowerCase("pt-BR");
    const correspondeBusca = termos.includes(busca);
    const correspondeStatus =
      filtro === "todos" || statusProduto(produto).key === filtro;

    return correspondeBusca && correspondeStatus;
  });

  $("contagemTabela").textContent =
    `Exibindo ${lista.length} de ${produtos.length} produtos`;

  if (!lista.length) {
    $("listaProdutos").innerHTML =
      '<tr><td colspan="6" class="empty-state">Nenhum produto encontrado com esses filtros.</td></tr>';
    return;
  }

  $("listaProdutos").innerHTML = lista.map((produto) => {
    const status = statusProduto(produto);

    return `
      <tr>
        <td>
          ${seguro(produto.nome)}
          <span class="product-sub">ID #${seguro(produto.id)}</span>
        </td>
        <td>${seguro(produto.codigoBarras)}</td>
        <td>${seguro(categoriaNome(produto.categoria))}</td>
        <td><strong>${Number(produto.unidade || 0)}</strong> un.</td>
        <td><span class="stock-badge ${status.cls}">${status.label}</span></td>
        <td>
          <div class="row-actions">
            <button class="row-action" data-editar="${seguro(produto.id)}">Editar</button>
            <button class="row-action" data-mov="${seguro(produto.id)}">Movimentar</button>
          </div>
        </td>
      </tr>`;
  }).join("");
}

function renderMovimentacoes() {
  const recentes = [...movimentacoes]
    .sort((a, b) => new Date(b.dataHora || 0) - new Date(a.dataHora || 0))
    .slice(0, 10);

  if (!recentes.length) {
    $("listaMovimentacoes").innerHTML =
      '<tr><td colspan="5" class="empty-state">Nenhuma movimentação registrada ainda.</td></tr>';
    return;
  }

  $("listaMovimentacoes").innerHTML = recentes.map((movimentacao) => {
    const entrada = movimentacao.tipo === "ENTRADA";
    const nomeProduto =
      movimentacao.produto?.nome ||
      produtoPorId(movimentacao.produto?.id)?.nome ||
      `Produto #${movimentacao.produto?.id ?? "—"}`;
    const data = movimentacao.dataHora
      ? new Date(movimentacao.dataHora).toLocaleString("pt-BR")
      : "—";
    const sinal = entrada ? "+" : "−";
    const classe = entrada ? "movement-entry" : "movement-exit";
    const rotulo = entrada ? "↙ Entrada" : "↗ Saída";

    return `
      <tr>
        <td>${seguro(data)}</td>
        <td>${seguro(nomeProduto)}</td>
        <td><span class="movement-badge ${classe}">${rotulo}</span></td>
        <td><strong>${sinal}${Number(movimentacao.quantidadeEstoque || 0)}</strong> un.</td>
        <td>${seguro(movimentacao.notaFiscal)}</td>
      </tr>`;
  }).join("");
}

function atualizarSelectProdutos(selecionado = "") {
  const select = $("produtoMov");
  select.innerHTML = '<option value="">Selecione um produto</option>' +
    produtos.map((produto) => `
      <option value="${seguro(produto.id)}">
        ${seguro(produto.nome)} — ${Number(produto.unidade || 0)} un.
      </option>`).join("");

  if (selecionado) select.value = String(selecionado);
}

async function carregar() {
  feedback("Atualizando dados do estoque...");

  try {
    const resultados = await Promise.allSettled([
      listaAPI("/produto"),
      listaAPI("/movimentacoes"),
    ]);

    if (resultados[0].status !== "fulfilled") {
      throw resultados[0].reason;
    }

    produtos = resultados[0].value;
    movimentacoes = resultados[1].status === "fulfilled"
      ? resultados[1].value
      : [];

    renderResumo();
    renderProdutos();
    renderMovimentacoes();
    atualizarSelectProdutos();

    const historicoCarregado = resultados[1].status === "fulfilled";
    feedback(
      historicoCarregado
        ? "Estoque atualizado com sucesso."
        : "Produtos carregados. Não foi possível carregar o histórico de movimentações.",
      historicoCarregado ? "success" : "error",
    );
  } catch (erro) {
    feedback(erro.message || "Não foi possível carregar o estoque.", "error");
    $("listaProdutos").innerHTML =
      '<tr><td colspan="6" class="empty-state">Não foi possível carregar os produtos. Verifique a API e sua sessão.</td></tr>';
  }
}


function abrirModal(id) {
  $(id).hidden = false;
  document.body.style.overflow = "hidden";
}

function fecharModal(id) {
  $(id).hidden = true;
  document.body.style.overflow = "";
}

function abrirNovoProduto() {
  $("formProduto").reset();
  $("feedbackProduto").textContent = "";
  $("feedbackProduto").className = "estoque-feedback";
  $("produtoId").value = "";
  $("tituloModalProduto").textContent = "Adicionar produto";
  $("salvarProduto").textContent = "Salvar produto";
  $("codigoBarras").disabled = false;
  $("categoria").disabled = false;
  $("unidade").disabled = false;
  $("notaEdicao").hidden = true;
  abrirModal("modalProduto");
  $("nomeProduto").focus();
}

function editarProduto(id) {
  const produto = produtoPorId(id);
  if (!produto) return;

  $("formProduto").reset();
  $("produtoId").value = produto.id;
  $("nomeProduto").value = produto.nome || "";
  $("codigoBarras").value = produto.codigoBarras || "";
  $("categoria").value = produto.categoria || "Comida";
  $("precoVenda").value = produto.precoVenda ?? 0;
  $("unidade").value = produto.unidade ?? 0;
  $("dataVencimento").value = produto.dataVencimento
    ? String(produto.dataVencimento).slice(0, 10)
    : "";
  $("tituloModalProduto").textContent = "Editar produto";
  $("salvarProduto").textContent = "Salvar alterações";
  $("codigoBarras").disabled = true;
  $("categoria").disabled = true;
  $("unidade").disabled = true;
  $("notaEdicao").hidden = false;
  abrirModal("modalProduto");
}

function abrirMovimentacao(id = "") {
  atualizarSelectProdutos(id);
  $("formMovimentacao").reset();
  if (id) $("produtoMov").value = String(id);
  abrirModal("modalMovimentacao");
}

async function salvarProduto(evento) {
  evento.preventDefault();

  const id = $("produtoId").value;
  const dados = {
    nome: $("nomeProduto").value.trim(),
    codigoBarras: $("codigoBarras").value.trim(),
    categoria: $("categoria").value,
    precoVenda: Number($("precoVenda").value),
    unidade: Number($("unidade").value),
    dataVencimento: $("dataVencimento").value,
  };

  const dadosInvalidos =
    !dados.nome ||
    dados.nome.length < 3 ||
    !dados.codigoBarras ||
    !dados.dataVencimento ||
    !Number.isFinite(dados.precoVenda) ||
    dados.precoVenda < 0 ||
    !Number.isInteger(dados.unidade) ||
    dados.unidade < 0;

  if (dadosInvalidos) {
    feedback(
      "Confira os campos obrigatórios: nome (mínimo 3 caracteres), código de barras, preço, quantidade inteira não negativa e data de vencimento.",
      "error",
    );
    return;
  }

  const botao = $("salvarProduto");
  botao.disabled = true;

  try {
    await enviar(id ? `/produto/${id}` : "/produto", id ? "PUT" : "POST", dados);
    fecharModal("modalProduto");
    feedback(
      id ? "Produto atualizado com sucesso." : "Produto cadastrado com sucesso.",
      "success",
    );
    await carregar();
  } catch (erro) {
    feedback(erro.message || "Erro ao salvar o produto.", "error");
  } finally {
    botao.disabled = false;
  }
}

async function salvarMovimentacao(evento) {
  evento.preventDefault();

  const idProduto = $("produtoMov").value;
  const quantidade = Number($("quantidadeMov").value);
  const tipo = $("tipoMov").value;
  const notaFiscal = $("notaFiscal").value.trim();
  const produto = produtoPorId(idProduto);

  if (
    !idProduto ||
    !produto ||
    !Number.isInteger(quantidade) ||
    quantidade <= 0 ||
    !notaFiscal
  ) {
    feedback(
      "Informe produto, quantidade inteira positiva e nota fiscal/referência.",
      "error",
    );
    return;
  }

  if (tipo === "SAIDA" && quantidade > Number(produto.unidade || 0)) {
    feedback(
      `Estoque insuficiente. Disponível: ${produto.unidade} unidade(s).`,
      "error",
    );
    return;
  }

  const botao = $("salvarMovimentacao");
  botao.disabled = true;

  try {
    await enviar("/movimentacoes", "POST", {
      tipo,
      notaFiscal,
      quantidadeEstoque: quantidade,
      produto: { id: Number(idProduto) },
    });

    fecharModal("modalMovimentacao");
    feedback("Movimentação registrada com sucesso.", "success");
    await carregar();
  } catch (erro) {
    feedback(erro.message || "Não foi possível registrar a movimentação.", "error");
  } finally {
    botao.disabled = false;
  }
}

async function inicializarPerfil() {
  try {
    const usuario = await consultarUsuario();
    if (!usuario) {
      window.location.replace("index.html");
      return;
    }

    const nome = usuario.nome || usuario.login || "Usuário";
    $("nomeUsuario").textContent = nome;
    $("iniciaisUsuario").textContent = nome
      .split(/\s+/)
      .slice(0, 2)
      .map((parte) => parte[0])
      .join("")
      .toUpperCase();
    $("perfilUsuario").textContent =
      usuario.tipoUsuario === "CEO"
        ? "CEO"
        : usuario.tipoUsuario === "ADMIN"
          ? "Administrador"
          : "Usuário";
  } catch (erro) {
    console.warn("Não foi possível carregar o perfil do usuário:", erro);
  }
}

function configurarEventos() {
  $("pesquisa").addEventListener("input", renderProdutos);
  $("filtroStatus").addEventListener("change", renderProdutos);
  $("atualizar").addEventListener("click", carregar);
  $("novoProduto").addEventListener("click", abrirNovoProduto);
  $("novaMovimentacao").addEventListener("click", () => abrirMovimentacao());

  $("listaProdutos").addEventListener("click", (evento) => {
    const botaoEditar = evento.target.closest("[data-editar]");
    const botaoMovimentar = evento.target.closest("[data-mov]");

    if (botaoEditar) editarProduto(botaoEditar.dataset.editar);
    if (botaoMovimentar) abrirMovimentacao(botaoMovimentar.dataset.mov);
  });

  document.querySelectorAll("[data-fechar]").forEach((botao) => {
    botao.addEventListener("click", () => fecharModal(botao.dataset.fechar));
  });

  document.querySelectorAll(".modal-backdrop").forEach((modal) => {
    modal.addEventListener("click", (evento) => {
      if (evento.target === modal) fecharModal(modal.id);
    });
  });

  document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape") {
      document.querySelectorAll(".modal-backdrop:not([hidden])").forEach((modal) => {
        fecharModal(modal.id);
      });
    }
  });

  $("formProduto").addEventListener("submit", salvarProduto);
  $("formMovimentacao").addEventListener("submit", salvarMovimentacao);

  const botaoPerfil = $("botaoPerfil");
  const menuPerfil = $("menuPerfil");

  botaoPerfil.addEventListener("click", () => {
    menuPerfil.hidden = !menuPerfil.hidden;
    botaoPerfil.setAttribute("aria-expanded", String(!menuPerfil.hidden));
  });

  document.addEventListener("click", (evento) => {
    if (!evento.target.closest(".profile-area")) {
      menuPerfil.hidden = true;
      botaoPerfil.setAttribute("aria-expanded", "false");
    }
  });

  $("sair").addEventListener("click", async () => {
    try {
      const csrf = await obterCsrf();
      await requisicao("/auth/logout", {
        method: "POST",
        headers: { [csrf.headerName]: csrf.token },
      });
    } catch (erro) {
      console.warn("Não foi possível encerrar a sessão pela API:", erro);
    }

    window.location.replace("index.html");
  });
}

configurarEventos();

(async function iniciarEstoque() {
  await inicializarPerfil();
  await carregar();
})();
