	package br.com.smartstock.api.services;
	
	import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import br.com.smartstock.api.entities.MovimentacaoEstoque;
import br.com.smartstock.api.entities.MovimentacaoEstoque.TipoMovimentacao;
import br.com.smartstock.api.entities.Produto;
import br.com.smartstock.api.entities.Usuario;
import br.com.smartstock.api.repositories.MovimentacaoEstoqueRepository;
import br.com.smartstock.api.repositories.ProdutoRepository;
import br.com.smartstock.api.repositories.UsuarioRepository;
import org.springframework.transaction.annotation.Transactional;	

	@Service
	public class MovimentacaoEstoqueService {
	
	    @Autowired
	    private MovimentacaoEstoqueRepository repository;
	
	    @Autowired
	    private ProdutoRepository produtoRepository;
	    
	    @Autowired
	    private UsuarioRepository usuarioRepository;
	    
	
	    public List<MovimentacaoEstoque> listarTodos() {
	        return repository.findAll();
	    }
	
	    
	    @Transactional
	    public MovimentacaoEstoque salvar(MovimentacaoEstoque movimentacao) {
	        
	        if (movimentacao.getProduto() == null || movimentacao.getProduto().getId() == null) {
	            throw new RuntimeException("O Produto precisa ser informado.");
	        }
	
	        Produto produto = produtoRepository.findById(movimentacao.getProduto().getId())
	                .orElseThrow(() -> new RuntimeException("Produto não encontrado."));
	        
	        Authentication autenticacao =
	                SecurityContextHolder.getContext().getAuthentication();

	        if (autenticacao == null || !autenticacao.isAuthenticated()) {
	            throw new IllegalStateException("Usuário não autenticado.");
	        }

	        Usuario responsavel = usuarioRepository
	                .findByLoginIgnoreCase(autenticacao.getName())
	                .orElseThrow(() ->
	                        new IllegalStateException("Responsável não encontrado.")
	                );

	        movimentacao.setResponsavel(responsavel);
	        movimentacao.setProduto(produto);
	        
	
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