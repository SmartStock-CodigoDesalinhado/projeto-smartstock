package br.com.smartstock.api.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.smartstock.api.entities.Cliente;

public interface ClienteRepository extends JpaRepository<Cliente, Long>{

}
