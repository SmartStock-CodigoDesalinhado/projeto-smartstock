package br.com.smartstock.api.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.smartstock.api.entities.Funcionario;

public interface FuncionarioRepository extends JpaRepository<Funcionario, Long>{

}
