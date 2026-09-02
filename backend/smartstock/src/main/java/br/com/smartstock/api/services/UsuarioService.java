package br.com.smartstock.api.services;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import br.com.smartstock.api.entities.Usuario;
import br.com.smartstock.api.repositories.UsuarioRepository;

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

    public Usuario salvar(Usuario usuario) {
        usuario.setSenha(passwordEncoder.encode(usuario.getSenha()));
        return repository.save(usuario);
    }

    public Usuario atualizar(Long id, Usuario usuarioAtualizado) {
        Optional<Usuario> usuarioExistente = buscarPorId(id);
        
        if (usuarioExistente.isPresent()) {
            Usuario atualizado = usuarioExistente.get();
            
            atualizado.setNome(usuarioAtualizado.getNome());
            atualizado.setLogin(usuarioAtualizado.getLogin());
            atualizado.setTipoUsuario(usuarioAtualizado.getTipoUsuario());
            
            if (usuarioAtualizado.getSenha() != null && !usuarioAtualizado.getSenha().isBlank()) {
                atualizado.setSenha(passwordEncoder.encode(usuarioAtualizado.getSenha()));
            }
            
            return repository.save(atualizado);
        }
        
        return null;
    }

    public void deletar(Long id) {
        repository.deleteById(id);
    }
}