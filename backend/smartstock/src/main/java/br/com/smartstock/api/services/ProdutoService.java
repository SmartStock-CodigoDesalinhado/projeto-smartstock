package br.com.smartstock.api.services;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import br.com.smartstock.api.entities.Produto;
import br.com.smartstock.api.repositories.ProdutoRepository;
import jakarta.transaction.Transactional;

@Service
public class ProdutoService {
	
	@Autowired
	private ProdutoRepository repository;
	
	

@Transactional
public Produto salvar(Produto produto) {

    if (produto.getEstoqueMinimo() == null) {
        produto.setEstoqueMinimo(0);
    }

    Optional<Produto> produtoExistente =
            repository.findByCodigoBarras(produto.getCodigoBarras());

    if (produtoExistente.isPresent()) {

        Produto existente = produtoExistente.get();

        if (Boolean.TRUE.equals(existente.getAtivo())) {
            throw new IllegalArgumentException(
                "Já existe um produto ativo com este código de barras."
            );
        }

        existente.setNome(produto.getNome());
        existente.setPrecoVenda(produto.getPrecoVenda());
        existente.setDataVencimento(produto.getDataVencimento());
        existente.setEstoqueMinimo(produto.getEstoqueMinimo());
        existente.setCategoria(produto.getCategoria());
        existente.setFornecedor(produto.getFornecedor());
        existente.setAtivo(true);

        return repository.save(existente);
    }

    return repository.save(produto);
}

	
	public List<Produto> listarTodos() {
		return repository.findByAtivoTrue();
	}
	
	public Optional<Produto> buscarPorId(Long id) {
	    return repository.findById(id)
	            .filter(produto -> Boolean.TRUE.equals(produto.getAtivo()));
	}
	
	


	@Transactional
	public Produto atualizar(Long id, Produto produtoAlterado) {
		Optional<Produto> produtoExistente = buscarPorId(id);

			if (produtoExistente.isPresent()) {

				Produto atualizado = produtoExistente.get();

				atualizado.setNome(produtoAlterado.getNome());
				atualizado.setCodigoBarras(produtoAlterado.getCodigoBarras());
				atualizado.setPrecoVenda(produtoAlterado.getPrecoVenda());
				atualizado.setDataVencimento(produtoAlterado.getDataVencimento());
				atualizado.setUnidade(produtoAlterado.getUnidade());
				atualizado.setEstoqueMinimo(produtoAlterado.getEstoqueMinimo());
				
				if(produtoAlterado.getCategoria() != null) {
					atualizado.setCategoria(produtoAlterado.getCategoria());
				}
				
				if(produtoAlterado.getFornecedor() != null) {
					atualizado.setFornecedor(produtoAlterado.getFornecedor());
				}

        return repository.save(atualizado);
    }

    return null;
}




	@Transactional
	public boolean deletar(Long id) {

		Optional<Produto> produto = repository.findById(id);

		if (produto.isEmpty()) {
        return false;
	}

		repository.delete(produto.get());
		repository.flush();

    return true;
}

	
}