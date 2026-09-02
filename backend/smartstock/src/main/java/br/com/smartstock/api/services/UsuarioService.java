package br.com.smartstock.api.services;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import br.com.smartstock.api.entities.Usuario;
import br.com.smartstock.api.repositories.UsuarioRepository;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository repository;

    public List<Usuario> listarTodos() {
        return repository.findAll();
    }

    public Optional<Usuario> buscarPorId(Long id) {
        return repository.findById(id);
    }

    public Usuario salvar(Usuario usuario) {
        return repository.save(usuario);
    }

    public Usuario atualizar(Long id, Usuario usuarioAtualizado) {
        Optional<Usuario> usuarioExistente = buscarPorId(id);
        
        if(usuarioExistente.isPresent()) {
            Usuario atualizado = usuarioExistente.get();
            
            atualizado.setNome(usuarioAtualizado.getNome());
            atualizado.setLogin(usuarioAtualizado.getLogin());
            atualizado.setSenha(usuarioAtualizado.getSenha());
            atualizado.setTipoUsuario(usuarioAtualizado.getTipoUsuario());
            
            return repository.save(atualizado);
        }
        
        return null;
    }

    public void deletar(Long id) {
        repository.deleteById(id);
    }
}