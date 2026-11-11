const HOST_API = window.location.hostname || "localhost";
const API = `http://${HOST_API}:8080/api`;
const $ = (id) => document.getElementById(id);

let produtos = [];

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

  $("semEstoque").textContent = produtos.filter((produto) => {
    return Number(produto.unidade) <= 0;
  }).length;
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
    <button
        type="button"
        class="row-action"
        data-editar="${seguro(produto.id)}"
    >
        Editar
    </button>

  

    <button
        type="button"
        class="row-action row-action-delete"
        data-excluir="${seguro(produto.id)}">
        Excluir
    </button>
</div>
        </td>
      </tr>`;
  }).join("");
}





async function carregar() {
  feedback("Atualizando dados do estoque...");

  try {
    produtos = await listaAPI("/produto");

    renderResumo();
    renderProdutos();

    await carregarTotalMovimentacoes();

    feedback("Estoque atualizado com sucesso.", "success");

  } catch (erro) {
    feedback(
      erro.message || "Não foi possível carregar o estoque.",
      "error"
    );

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


let produtoSelecionadoExclusao = null;
let exclusaoEmAndamento = false;

function abrirModalExcluir(id) {
    const produto = produtoPorId(id);

    if (!produto || exclusaoEmAndamento) {
        return;
    }

    produtoSelecionadoExclusao = produto;

    $("nomeProdutoExcluir").textContent = produto.nome;

    $("feedbackExcluir").textContent = "";
    $("feedbackExcluir").className = "estoque-feedback";

    abrirModal("modalExcluirProduto");

    $("cancelarExclusao").focus();
}

function fecharModalExcluir() {
    if (exclusaoEmAndamento) {
        return;
    }

    produtoSelecionadoExclusao = null;

    fecharModal("modalExcluirProduto");
}

async function confirmarExclusaoProduto() {
    if (!produtoSelecionadoExclusao || exclusaoEmAndamento) {
        return;
    }

    const produto = produtoSelecionadoExclusao;
    const botaoConfirmar = $("confirmarExclusao");
    const botaoCancelar = $("cancelarExclusao");
    const feedbackExcluir = $("feedbackExcluir");

    exclusaoEmAndamento = true;

    botaoConfirmar.disabled = true;
    botaoCancelar.disabled = true;

    feedbackExcluir.textContent = "Excluindo produto...";
    feedbackExcluir.className = "estoque-feedback";

    try {
        const csrf = await obterCsrf();

        const resposta = await requisicao(
            `/produto/${encodeURIComponent(produto.id)}`,
            {
                method: "DELETE",
                headers: {
                    [csrf.headerName]: csrf.token
                }
            }
        );

        if (!resposta.ok) {
            let mensagem;

            switch (resposta.status) {
                case 401:
                    window.location.replace("index.html");
                    return;

                case 403:
                    mensagem = "Você não tem permissão para excluir este produto.";
                    break;

                case 404:
                    mensagem = "Produto não encontrado.";
                    break;

                case 409:
                    mensagem = "O produto possui registros vinculados e não pode ser excluído.";
                    break;

                default:
                    mensagem = `Erro ao excluir produto (HTTP ${resposta.status}).`;
            }

            throw new Error(mensagem);
        }

        produtoSelecionadoExclusao = null;

        fecharModal("modalExcluirProduto");

        await carregar();

        feedback(
            `Produto "${produto.nome}" excluído com sucesso.`,
            "success"
        );

    } catch (erro) {
        console.error("Erro ao excluir produto:", erro);

        feedbackExcluir.textContent =
            erro.message || "Não foi possível excluir o produto.";

        feedbackExcluir.className = "estoque-feedback error";

    } finally {
        exclusaoEmAndamento = false;

        botaoConfirmar.disabled = false;
        botaoCancelar.disabled = false;
    }
}

function configurarEventos() {
  $("pesquisa").addEventListener("input", renderProdutos);
  $("filtroStatus").addEventListener("change", renderProdutos);
  $("atualizar").addEventListener("click", carregar);
  
 $("listaProdutos").addEventListener("click", (evento) => {
    const botaoEditar = evento.target.closest("[data-editar]");
    const botaoExcluir = evento.target.closest("[data-excluir]");

    if (botaoEditar) {
        editarProduto(botaoEditar.dataset.editar);
        return;
    }

    if (botaoExcluir) {
        abrirModalExcluir(botaoExcluir.dataset.excluir);
    }

    $("confirmarExclusao").addEventListener(
    "click",
    confirmarExclusaoProduto
);


});

 document.querySelectorAll("[data-fechar]").forEach((botao) => {
    botao.addEventListener("click", () => {
        if (botao.dataset.fechar === "modalExcluirProduto") {
            fecharModalExcluir();
            return;
        }

        fecharModal(botao.dataset.fechar);
    });
});

  document.querySelectorAll(".modal-backdrop").forEach((modal) => {
    modal.addEventListener("click", (evento) => {
        if (evento.target !== modal) {
            return;
        }

        if (modal.id === "modalExcluirProduto") {
            fecharModalExcluir();
            return;
        }

        fecharModal(modal.id);
    });
});

  document.addEventListener("keydown", (evento) => {
    if (evento.key !== "Escape") {
        return;
    }

    document
        .querySelectorAll(".modal-backdrop:not([hidden])")
        .forEach((modal) => {
            if (modal.id === "modalExcluirProduto") {
                fecharModalExcluir();
                return;
            }

            fecharModal(modal.id);
        });
});

  $("formProduto").addEventListener("submit", salvarProduto);

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

      const resposta = await requisicao("/auth/logout", {
        method: "POST",
        headers: {
          [csrf.headerName]: csrf.token
        }
      });

      if (!resposta.ok) {
        throw new Error(`Falha no logout: HTTP ${resposta.status}`);
      }

      window.location.replace("index.html");

    } catch (erro) {
      console.error("Erro ao encerrar sessão:", erro);

      feedback(
        "Não foi possível encerrar a sessão. Tente novamente.",
        "error"
      );
    }
  });
}

async function carregarTotalMovimentacoes() {
    const elemento = $("totalMovimentacoes");

    if (!elemento) {
        return;
    }

    try {
        const movimentacoes = await listaAPI("/movimentacoes");

        elemento.textContent = movimentacoes.length;

    } catch (erro) {
        console.error(
            "Erro ao consultar movimentações:",
            erro
        );

        elemento.textContent = "—";
    }
}

configurarEventos();

(async function iniciarEstoque() {
  await inicializarPerfil();
  await carregar();
})();
