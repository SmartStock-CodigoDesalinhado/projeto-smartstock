package br.com.smartstock.api.services;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import br.com.smartstock.api.entities.MovimentacaoEstoque;
import br.com.smartstock.api.entities.MovimentacaoEstoque.TipoMovimentacao;
import br.com.smartstock.api.entities.Produto;
import br.com.smartstock.api.repositories.MovimentacaoEstoqueRepository;
import br.com.smartstock.api.repositories.ProdutoRepository;

@Service
public class MovimentacaoEstoqueService {

    @Autowired
    private MovimentacaoEstoqueRepository repository;

    @Autowired
    private ProdutoRepository produtoRepository;

    public List<MovimentacaoEstoque> listarTodos() {
        return repository.findAll();
    }

    public MovimentacaoEstoque salvar(MovimentacaoEstoque movimentacao) {
        
        if (movimentacao.getProduto() == null || movimentacao.getProduto().getId() == null) {
            throw new RuntimeException("O Produto precisa ser informado.");
        }

        Produto produto = produtoRepository.findById(movimentacao.getProduto().getId())
                .orElseThrow(() -> new RuntimeException("Produto não encontrado."));


        if (movimentacao.getTipo() == TipoMovimentacao.ENTRADA) {
            produto.setUnidade(produto.getUnidade() + movimentacao.getQuantidadeEstoque());
            
        } else if (movimentacao.getTipo() == TipoMovimentacao.SAIDA) {
            if (produto.getUnidade() < movimentacao.getQuantidadeEstoque()) {
                throw new RuntimeException("Estoque insuficiente.");
            }
            produto.setUnidade(produto.getUnidade() - movimentacao.getQuantidadeEstoque());
        }

        produtoRepository.save(produto);

        return repository.save(movimentacao);
    }
}