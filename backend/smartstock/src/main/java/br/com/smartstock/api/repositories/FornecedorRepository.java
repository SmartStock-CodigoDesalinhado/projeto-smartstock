package br.com.smartstock.api.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.smartstock.api.entities.Fornecedor;

public interface FornecedorRepository extends JpaRepository <Fornecedor, Long>{
	
	List<Fornecedor> findByAtivoTrue();

	
}
