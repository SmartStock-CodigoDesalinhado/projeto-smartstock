package br.com.smartstock.api.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.smartstock.api.entities.Categoria;

public interface CategoriaRepository extends JpaRepository<Categoria, Long>{

}
