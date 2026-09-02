package br.com.smartstock.api.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import br.com.smartstock.api.entities.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
}