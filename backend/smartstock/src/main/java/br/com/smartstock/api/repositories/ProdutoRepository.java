package br.com.smartstock.api.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.smartstock.api.entities.Produto;

public interface ProdutoRepository extends JpaRepository<Produto, Long>{

    List<Produto> findByAtivoTrue();

	
}
