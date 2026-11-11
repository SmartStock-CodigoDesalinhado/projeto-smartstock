"use strict";

/* SmartStock — integração com a API existente do Spring Boot. */
const HOST_API = window.location.hostname || "localhost";
const API = `http://${HOST_API}:8080/api`;
const $ = (id) => document.getElementById(id);

const ENDPOINTS = Object.freeze({
  usuario: "/usuarios/me",
  csrf: "/usuarios/csrf",
  produtos: "/produto",
  produtoPorId: (id) => `/produto/${encodeURIComponent(id)}`,
  movimentacoes: "/movimentacoes",
  logout: "/auth/logout"
});

let produtos = [];
let produtoSelecionadoExclusao = null;
let exclusaoEmAndamento = false;
let ultimoFoco = null;
let carregamentoEmAndamento = false;

const escapeHTML = (valor) => String(valor ?? "—").replace(/[&<>"']/g, (caractere) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
})[caractere]);

function categoriaNome(categoria) {
  const nomes = {
    produtosLimpeza: "Produtos de limpeza",
    Comida: "Comida",
    Bebida: "Bebida",
    Higiene: "Higiene"
  };
  const valor = typeof categoria === "object" && categoria !== null
    ? (categoria.nome ?? categoria.descricao ?? "Sem categoria")
    : categoria;
  return nomes[valor] || String(valor ?? "Não informada");
}

function quantidadeProduto(produto) {
  const numero = Number(produto?.unidade ?? 0);
  return Number.isFinite(numero) ? numero : 0;
}

function minimoProduto(produto) {
  // Compatível com versões do backend sem a propriedade estoqueMinimo.
  const bruto = produto?.estoqueMinimo;
  const numero = bruto === null || bruto === undefined ? 5 : Number(bruto);
  return Number.isFinite(numero) && numero >= 0 ? numero : 5;
}

function statusProduto(produto) {
  const atual = quantidadeProduto(produto);
  if (atual <= 0) {
    return { chave: "zerado", nome: "Sem estoque", classe: "status-zero" };
  }
  if (atual <= minimoProduto(produto)) {
    return { chave: "baixo", nome: "Estoque baixo", classe: "status-low" };
  }
  return { chave: "normal", nome: "Normal", classe: "status-normal" };
}

function obterProdutoLocal(id) {
  return produtos.find((produto) => String(produto.id) === String(id));
}

function mostrarFeedback(mensagem, tipo = "info", destino = "feedback") {
  const elemento = $(destino);
  if (!elemento) return;
  elemento.textContent = mensagem || "";
  elemento.className = `stock-feedback${tipo ? ` is-${tipo}` : ""}${destino !== "feedback" ? " stock-modal-feedback" : ""}`;
  elemento.hidden = !mensagem;
}

function autenticarResposta(resposta) {
  if (resposta.status === 401) {
    window.location.replace("index.html");
    throw new Error("Sua sessão expirou. Faça login novamente.");
  }
  if (resposta.status === 403) {
    throw new Error("Seu usuário não tem permissão para esta operação.");
  }
}

async function requisicao(caminho, opcoes = {}) {
  try {
    return await fetch(`${API}${caminho}`, {
      ...opcoes,
      credentials: "include"
    });
  } catch (erro) {
    throw new Error(
      `Não foi possível conectar à API (${API}). Verifique o Spring Boot, ` +
      `a porta 8080 e o CORS. Detalhes: ${erro.message}`
    );
  }
}

async function interpretarErro(resposta) {
  const padrao = `A operação falhou (HTTP ${resposta.status}).`;
  const texto = await resposta.text();
  if (!texto) return padrao;
  try {
    const dados = JSON.parse(texto);
    if (typeof dados.message === "string") return dados.message;
    if (typeof dados.mensagem === "string") return dados.mensagem;
    if (typeof dados.detail === "string") return dados.detail;
    if (Array.isArray(dados.errors)) {
      return dados.errors.map((erro) => erro.defaultMessage || erro.message || String(erro)).join("; ");
    }
  } catch {
    if (resposta.headers.get("content-type")?.includes("text/plain")) {
      return texto;
    }
  }
  return padrao;
}

async function obterCsrf() {
  const resposta = await requisicao(ENDPOINTS.csrf);
  autenticarResposta(resposta);
  if (!resposta.ok) throw new Error(await interpretarErro(resposta));
  const csrf = await resposta.json();
  if (typeof csrf.headerName !== "string" || !csrf.headerName ||
    typeof csrf.token !== "string" || !csrf.token) {
    throw new Error("A API não retornou um token CSRF válido.");
  }
  return csrf;
}

async function buscarLista(caminho) {
  const resposta = await requisicao(caminho);
  autenticarResposta(resposta);
  if (!resposta.ok) throw new Error(await interpretarErro(resposta));
  const dados = await resposta.json();
  if (!Array.isArray(dados)) {
    throw new Error(`Formato de resposta inválido em ${caminho}: esperada uma lista.`);
  }
  return dados;
}

async function buscarProdutoPorId(id) {
  const resposta = await requisicao(ENDPOINTS.produtoPorId(id));
  autenticarResposta(resposta);
  if (!resposta.ok) throw new Error(await interpretarErro(resposta));
  const produto = await resposta.json();
  if (!produto || typeof produto !== "object" || String(produto.id) !== String(id)) {
    throw new Error("A API retornou um produto inválido.");
  }
  return produto;
}

async function enviarJson(caminho, metodo, dados) {
  const csrf = await obterCsrf();
  const resposta = await requisicao(caminho, {
    method: metodo,
    headers: { "Content-Type": "application/json", [csrf.headerName]: csrf.token },
    body: JSON.stringify(dados)
  });
  autenticarResposta(resposta);
  if (!resposta.ok) throw new Error(await interpretarErro(resposta));
  return resposta;
}

/* Resumo e indicadores */
function atualizarIndicadores() {
  const total = produtos.length;
  const normais = produtos.filter((produto) => statusProduto(produto).chave === "normal").length;
  const baixos = produtos.filter((produto) => statusProduto(produto).chave === "baixo").length;
  const zerados = produtos.filter((produto) => statusProduto(produto).chave === "zerado").length;

  $("totalProdutos").textContent = total;
  $("estoqueBaixo").textContent = baixos;
  $("semEstoque").textContent = zerados;
  $("quantidadeNormais").textContent = normais;
  $("quantidadeBaixos").textContent = baixos;
  $("quantidadeZerados").textContent = zerados;

  $("barraNormal").style.width = `${total ? (normais / total) * 100 : 0}%`;
  $("barraBaixo").style.width = `${total ? (baixos / total) * 100 : 0}%`;
  $("barraZerado").style.width = `${total ? (zerados / total) * 100 : 0}%`;
  $("graficoSaude").setAttribute("aria-label",
    `Normal: ${normais}; estoque baixo: ${baixos}; sem estoque: ${zerados}.`);
}

function renderizarAlertas() {
  const alertas = produtos
    .filter((produto) => statusProduto(produto).chave !== "normal")
    .sort((a, b) => {
      const prioridade = (produto) => statusProduto(produto).chave === "zerado" ? 0 : 1;
      return prioridade(a) - prioridade(b) || String(a.nome ?? "").localeCompare(String(b.nome ?? ""), "pt-BR");
    })
    .slice(0, 4);

  if (alertas.length === 0) {
    $("listaAlertas").innerHTML = `
      <li class="stock-alert-ok">
        <span class="stock-alert-ok-icon" aria-hidden="true">✓</span>
        <div><strong>Tudo sob controle</strong><small>Nenhum produto precisa de reposição no momento.</small></div>
      </li>`;
    return;
  }

  $("listaAlertas").innerHTML = alertas.map((produto) => {
    const zerado = statusProduto(produto).chave === "zerado";
    return `
      <li class="stock-alert-item">
        <span class="stock-alert-item-dot ${zerado ? "alert-dot-zero" : "alert-dot-low"}"></span>
        <div class="stock-alert-item-details">
          <strong title="${escapeHTML(produto.nome)}">${escapeHTML(produto.nome)}</strong>
          <small>${zerado ? "Produto esgotado" : `Restam ${quantidadeProduto(produto)} un. · Mínimo ${minimoProduto(produto)}`}</small>
        </div>
      </li>`;
  }).join("");
}

/* Tabela, busca e filtros */
function renderizarTabela() {
  const busca = $("pesquisa").value.trim().toLocaleLowerCase("pt-BR");
  const filtro = $("filtroStatus").value;
  const filtrados = produtos.filter((produto) => {
    const termos = [produto.nome, produto.codigoBarras, categoriaNome(produto.categoria)]
      .filter(Boolean).join(" ").toLocaleLowerCase("pt-BR");
    return termos.includes(busca) && (filtro === "todos" || statusProduto(produto).chave === filtro);
  });

  $("totalNaTabela").textContent = `${produtos.length} ${produtos.length === 1 ? "produto" : "produtos"}`;
  $("contagemTabela").textContent = `Exibindo ${filtrados.length} de ${produtos.length} produtos`;

  if (filtrados.length === 0) {
    $("listaProdutos").innerHTML = `
      <tr><td class="stock-empty-row" colspan="7">
        <div class="stock-no-results">
          <span class="stock-no-results-icon" aria-hidden="true">⌕</span>
          <strong>${produtos.length === 0 ? "Nenhum produto cadastrado" : "Nenhum resultado encontrado"}</strong>
          <span>${produtos.length === 0 ? "Cadastre seu primeiro produto na aba Produtos." : "Tente outros termos ou altere o filtro."}</span>
          ${produtos.length === 0 ? '<a href="produtos.html">Ir para Produtos</a>' : ""}
        </div>
      </td></tr>`;
    return;
  }

  $("listaProdutos").innerHTML = filtrados.map((produto) => {
    const status = statusProduto(produto);
    const id = escapeHTML(produto.id);
    return `
      <tr>
        <td>
          <div class="stock-product-cell">
            <span class="stock-product-avatar" aria-hidden="true">${escapeHTML(String(produto.nome || "P").trim().charAt(0).toUpperCase())}</span>
            <div><strong>${escapeHTML(produto.nome)}</strong><small>Produto #${id}</small></div>
          </div>
        </td>
        <td><span class="stock-code">${escapeHTML(produto.codigoBarras)}</span></td>
        <td>${escapeHTML(categoriaNome(produto.categoria))}</td>
        <td class="stock-number"><strong>${quantidadeProduto(produto)}</strong> <span>un.</span></td>
        <td class="stock-number">${minimoProduto(produto)} <span>un.</span></td>
        <td><span class="stock-status ${status.classe}"><span class="stock-status-dot"></span>${status.nome}</span></td>
        <td>
          <div class="stock-row-actions">
            <button class="stock-row-btn" type="button" data-editar="${id}" aria-label="Editar ${escapeHTML(produto.nome)}" title="Editar produto">
              <svg class="stock-icon" aria-hidden="true"><use href="#ico-edit"></use></svg>
            </button>
            <button class="stock-row-btn stock-row-delete" type="button" data-excluir="${id}" aria-label="Excluir ${escapeHTML(produto.nome)}" title="Excluir produto">
              <svg class="stock-icon" aria-hidden="true"><use href="#ico-trash"></use></svg>
            </button>
          </div>
        </td>
      </tr>`;
  }).join("");
}

function renderizarEstoque() {
  atualizarIndicadores();
  renderizarTabela();
  renderizarAlertas();
}

async function carregarMovimentacoes() {
  try {
    const movimentacoes = await buscarLista(ENDPOINTS.movimentacoes);
    $("totalMovimentacoes").textContent = movimentacoes.filter((item) => item.ativo !== false).length;
    return true;
  } catch (erro) {
    console.error("Erro ao carregar movimentações:", erro);
    $("totalMovimentacoes").textContent = "—";
    return false;
  }
}

async function carregar({ silencioso = false } = {}) {
  if (carregamentoEmAndamento) return false;
  carregamentoEmAndamento = true;
  $("atualizar").disabled = true;
  if (!silencioso) mostrarFeedback("Sincronizando dados com a API...", "info");

  try {
    const lista = await buscarLista(ENDPOINTS.produtos);
    produtos = lista;
    renderizarEstoque();
    const historicoOK = await carregarMovimentacoes();
    if (!silencioso) {
      mostrarFeedback(historicoOK
        ? "Estoque atualizado com sucesso."
        : "Produtos carregados, mas o histórico de movimentações está indisponível.",
        historicoOK ? "success" : "warning");
    }
    return true;
  } catch (erro) {
    console.error("Erro ao atualizar o estoque:", erro);
    mostrarFeedback(erro.message || "Não foi possível carregar o estoque.", "error");
    if (produtos.length === 0) {
      $("listaProdutos").innerHTML = '<tr><td colspan="7" class="stock-empty-row">Não foi possível consultar os produtos. Verifique a API e sua sessão.</td></tr>';
    }
    return false;
  } finally {
    carregamentoEmAndamento = false;
    $("atualizar").disabled = false;
  }
}

/* Modais */
function abrirModal(id) {
  const modal = $(id);
  if (!modal) throw new Error(`Modal não encontrado: ${id}`);
  ultimoFoco = document.activeElement;
  modal.hidden = false;
  document.body.classList.add("stock-modal-open");
  const foco = modal.querySelector("input:not(:disabled), button:not(:disabled)");
  foco?.focus();
}

function fecharModal(id) {
  const modal = $(id);
  if (!modal) return;
  modal.hidden = true;
  if (!document.querySelector(".stock-modal-backdrop:not([hidden])")) {
    document.body.classList.remove("stock-modal-open");
  }
  if (ultimoFoco && ultimoFoco.isConnected) ultimoFoco.focus();
}

function editarProduto(id) {
  const produto = obterProdutoLocal(id);
  if (!produto) {
    mostrarFeedback("Produto não encontrado. Atualize a página.", "error");
    return;
  }
  $("formProduto").reset();
  $("produtoId").value = String(produto.id);
  $("nomeProduto").value = produto.nome ?? "";
  $("codigoBarras").value = produto.codigoBarras ?? "";
  $("categoria").value = categoriaNome(produto.categoria);
  $("precoVenda").value = produto.precoVenda ?? 0;
  $("unidade").value = quantidadeProduto(produto);
  $("dataVencimento").value = produto.dataVencimento ? String(produto.dataVencimento).slice(0, 10) : "";
  mostrarFeedback("", "info", "feedbackProduto");
  abrirModal("modalProduto");
}

async function salvarProduto(evento) {
  evento.preventDefault();
  const id = $("produtoId").value;
  if (!id) {
    mostrarFeedback("Produto não selecionado.", "error", "feedbackProduto");
    return;
  }
  const nome = $("nomeProduto").value.trim();
  const precoVenda = Number($("precoVenda").value);
  const dataVencimento = $("dataVencimento").value;
  if (nome.length < 3 || !Number.isFinite(precoVenda) || precoVenda < 0 ||
    !/^\d{4}-\d{2}-\d{2}$/.test(dataVencimento) || !$("formProduto").checkValidity()) {
    mostrarFeedback("Preencha nome, preço e vencimento corretamente.", "error", "feedbackProduto");
    return;
  }

  const botao = $("salvarProduto");
  botao.disabled = true;
  mostrarFeedback("Salvando alterações...", "info", "feedbackProduto");
  try {
    // GET imediatamente antes do PUT para não reutilizar o estoque carregado ao abrir o modal.
    // A proteção completa contra alterações concorrentes requer DTO/versão no backend.
    const atual = await buscarProdutoPorId(id);
    const dados = {
      nome,
      codigoBarras: atual.codigoBarras,
      categoria: atual.categoria,
      precoVenda,
      dataVencimento,
      unidade: atual.unidade,
      fornecedor: atual.fornecedor ?? null
    };
    if (Object.hasOwn(atual, "estoqueMinimo")) {
      dados.estoqueMinimo = atual.estoqueMinimo;
    }
    await enviarJson(ENDPOINTS.produtoPorId(id), "PUT", dados);
    fecharModal("modalProduto");
    const atualizado = await carregar({ silencioso: true });
    mostrarFeedback(atualizado
      ? "Produto atualizado com sucesso."
      : "Alteração salva, mas não foi possível atualizar a lista. Clique em Atualizar.",
      atualizado ? "success" : "warning");
  } catch (erro) {
    console.error("Falha ao editar produto:", erro);
    mostrarFeedback(erro.message || "Erro ao salvar produto.", "error", "feedbackProduto");
  } finally {
    botao.disabled = false;
  }
}

function abrirModalExcluir(id) {
  if (exclusaoEmAndamento) return;
  const produto = obterProdutoLocal(id);
  if (!produto) {
    mostrarFeedback("Produto não encontrado. Atualize a página.", "error");
    return;
  }
  produtoSelecionadoExclusao = produto;
  $("nomeProdutoExcluir").textContent = produto.nome ?? "Produto sem nome";
  mostrarFeedback("", "info", "feedbackExcluir");
  abrirModal("modalExcluirProduto");
  $("cancelarExclusao").focus();
}

function fecharModalExcluir() {
  if (exclusaoEmAndamento) return;
  produtoSelecionadoExclusao = null;
  fecharModal("modalExcluirProduto");
}

async function confirmarExclusaoProduto() {
  if (!produtoSelecionadoExclusao || exclusaoEmAndamento) return;
  const produto = produtoSelecionadoExclusao;
  exclusaoEmAndamento = true;
  $("confirmarExclusao").disabled = true;
  $("cancelarExclusao").disabled = true;
  mostrarFeedback("Excluindo produto...", "info", "feedbackExcluir");

  try {
    const csrf = await obterCsrf();
    const resposta = await requisicao(ENDPOINTS.produtoPorId(produto.id), {
      method: "DELETE",
      headers: { [csrf.headerName]: csrf.token }
    });
    autenticarResposta(resposta);
    if (resposta.status === 404) throw new Error("Produto não encontrado no banco de dados.");
    if (resposta.status === 409) {
      throw new Error("Este produto possui registros vinculados e não pode ser excluído.");
    }
    if (!resposta.ok) throw new Error(await interpretarErro(resposta));

    // A exclusão já foi confirmada pelo backend; a atualização visual não depende de novo GET.
    produtos = produtos.filter((item) => String(item.id) !== String(produto.id));
    renderizarEstoque();
    produtoSelecionadoExclusao = null;
    fecharModal("modalExcluirProduto");
    mostrarFeedback(`Produto “${produto.nome}” excluído com sucesso.`, "success");
    await carregar({ silencioso: true });
  } catch (erro) {
    console.error("Falha ao excluir produto:", erro);
    mostrarFeedback(erro.message || "Não foi possível excluir o produto.", "error", "feedbackExcluir");
  } finally {
    exclusaoEmAndamento = false;
    $("confirmarExclusao").disabled = false;
    $("cancelarExclusao").disabled = false;
  }
}

/* Perfil e autenticação */
async function inicializarPerfil() {
  try {
    const resposta = await requisicao(ENDPOINTS.usuario);
    autenticarResposta(resposta);
    if (!resposta.ok) throw new Error(await interpretarErro(resposta));
    const usuario = await resposta.json();
    const nome = String(usuario.nome || usuario.login || "Usuário").trim();
    $("nomeUsuario").textContent = nome;
    $("iniciaisUsuario").textContent = nome.split(/\s+/).slice(0, 2)
      .map((parte) => parte.charAt(0)).join("").toLocaleUpperCase("pt-BR");
    $("perfilUsuario").textContent =
      usuario.tipoUsuario === "CEO" ? "CEO" :
        usuario.tipoUsuario === "ADMIN" ? "Administrador" : "Usuário";
    return true;
  } catch (erro) {
    console.error("Falha ao consultar usuário:", erro);
    mostrarFeedback(erro.message || "Falha ao consultar o perfil.", "error");
    return false;
  }
}

async function sair() {
  try {
    const csrf = await obterCsrf();
    const resposta = await requisicao(ENDPOINTS.logout, {
      method: "POST",
      headers: { [csrf.headerName]: csrf.token }
    });
    if (!resposta.ok) throw new Error(await interpretarErro(resposta));
    window.location.replace("index.html");
  } catch (erro) {
    console.error("Falha ao encerrar sessão:", erro);
    mostrarFeedback(erro.message || "Não foi possível encerrar a sessão.", "error");
  }
}

function configurarEventos() {
  $("pesquisa").addEventListener("input", renderizarTabela);
  $("filtroStatus").addEventListener("change", renderizarTabela);
  $("atualizar").addEventListener("click", () => carregar());

  $("listaProdutos").addEventListener("click", (evento) => {
    if (!(evento.target instanceof Element)) return;
    const editar = evento.target.closest("[data-editar]");
    const excluir = evento.target.closest("[data-excluir]");
    if (editar) editarProduto(editar.dataset.editar);
    else if (excluir) abrirModalExcluir(excluir.dataset.excluir);
  });

  $("formProduto").addEventListener("submit", salvarProduto);
  $("confirmarExclusao").addEventListener("click", confirmarExclusaoProduto);
  $("cancelarExclusao").addEventListener("click", fecharModalExcluir);

  document.querySelectorAll("[data-fechar]").forEach((botao) => {
    botao.addEventListener("click", () => {
      const id = botao.dataset.fechar;
      if (id === "modalExcluirProduto") fecharModalExcluir();
      else fecharModal(id);
    });
  });

  document.querySelectorAll(".stock-modal-backdrop").forEach((modal) => {
    modal.addEventListener("click", (evento) => {
      if (evento.target !== modal) return;
      if (modal.id === "modalExcluirProduto") fecharModalExcluir();
      else fecharModal(modal.id);
    });
  });

  document.addEventListener("keydown", (evento) => {
    if (evento.key !== "Escape") return;
    const aberto = document.querySelector(".stock-modal-backdrop:not([hidden])");
    if (!aberto) return;
    if (aberto.id === "modalExcluirProduto") fecharModalExcluir();
    else fecharModal(aberto.id);
  });

  const botaoPerfil = $("botaoPerfil");
  const menuPerfil = $("menuPerfil");
  botaoPerfil.addEventListener("click", (evento) => {
    evento.stopPropagation();
    menuPerfil.hidden = !menuPerfil.hidden;
    botaoPerfil.setAttribute("aria-expanded", String(!menuPerfil.hidden));
  });
  document.addEventListener("click", (evento) => {
    if (!(evento.target instanceof Element) || evento.target.closest(".profile-area")) return;
    menuPerfil.hidden = true;
    botaoPerfil.setAttribute("aria-expanded", "false");
  });
  $("sair").addEventListener("click", sair);
}

async function iniciarEstoque() {
  configurarEventos();
  const autorizado = await inicializarPerfil();
  if (autorizado) await carregar();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", iniciarEstoque, { once: true });
} else {
  iniciarEstoque();
}
