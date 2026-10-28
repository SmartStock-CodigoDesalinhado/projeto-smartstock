package br.com.smartstock.api.services;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import br.com.smartstock.api.entities.Usuario;
import br.com.smartstock.api.enums.TipoUsuario;
import br.com.smartstock.api.repositories.UsuarioRepository;
import jakarta.transaction.Transactional;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository repository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    public List<Usuario> listarTodos() {
        return repository.findAll();
    }

    public Optional<Usuario> buscarPorId(Long id) {
        return repository.findById(id);
    }
    
    public Optional<Usuario> buscarPorEmail(String email) {
        return repository.findByLoginIgnoreCase(email);
    }

    public Usuario cadastrarCeo(Usuario usuario) {
        usuario.setId(null);
        usuario.setTipoUsuario(TipoUsuario.CEO);
        usuario.setSenha(passwordEncoder.encode(usuario.getSenha()));

        return repository.save(usuario);
    }
    
    public Usuario salvar(Usuario usuario) {
        if(usuario.getTipoUsuario() == TipoUsuario.CEO) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Não é permitido cadastrar outro CEO.");
        }

        usuario.setSenha(passwordEncoder.encode(usuario.getSenha()));
        return repository.save(usuario);
    }

    public Usuario atualizar(Long id, Usuario usuarioAtualizado) {
        Optional<Usuario> usuarioExistente = buscarPorId(id);
        
        if (usuarioExistente.isPresent()) {
            Usuario atualizado = usuarioExistente.get();
            
            atualizado.setNome(usuarioAtualizado.getNome());
            atualizado.setLogin(usuarioAtualizado.getLogin());
            if(atualizado.getTipoUsuario() == TipoUsuario.CEO) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "O CEO não pode ser alterado.");
            }

            if(usuarioAtualizado.getTipoUsuario() != TipoUsuario.ADMIN) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Não é permitido alterar um usuário para CEO.");
            }

            atualizado.setTipoUsuario(TipoUsuario.ADMIN);
            
            if (usuarioAtualizado.getSenha() != null && !usuarioAtualizado.getSenha().isBlank()) {
                atualizado.setSenha(passwordEncoder.encode(usuarioAtualizado.getSenha()));
            }
            
            return repository.save(atualizado);
        }
        
        return null;
    }

    public void deletar(Long id) {
        Usuario usuario = repository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado."));

        if(usuario.getTipoUsuario() == TipoUsuario.CEO) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "O CEO não pode ser excluído.");
        }

        repository.deleteById(id);
    }
    
    public boolean cadastroCeoDisponivel() {
        return repository.count() == 0;
    }

    @Transactional
    public synchronized Usuario cadastrarCeoInicial(Usuario usuario) {
        if (!cadastroCeoDisponivel()) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "O cadastro inicial do CEO não está disponível."
            );
        }

        return cadastrarCeo(usuario);
    }
}