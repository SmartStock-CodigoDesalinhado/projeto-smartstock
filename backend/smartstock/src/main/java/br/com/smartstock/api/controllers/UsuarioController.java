package br.com.smartstock.api.controllers;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.security.core.Authentication;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.smartstock.api.entities.Usuario;
import br.com.smartstock.api.services.UsuarioService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("api/usuarios")
public class UsuarioController {
    
    @Autowired
    private UsuarioService service;
    
    @GetMapping("/csrf")
    public Map<String, String> csrf(CsrfToken token) {
        return Map.of(
            "headerName", token.getHeaderName(),
            "token", token.getToken()
        );
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, String>> me(
        Authentication authentication
    ) {
        Usuario usuario = service
            .buscarPorEmail(authentication.getName())
            .orElseThrow(
                () -> new IllegalStateException(
                    "Usuario nao encontrado."
                )
            );

        return ResponseEntity.ok(
            Map.of(
                "nome", usuario.getNome(),
                "email", usuario.getLogin(),
                "tipoUsuario", usuario.getTipoUsuario().name()
            )
        );
    }
    
    @GetMapping
    public ResponseEntity<List<Usuario>> listar() {
        return ResponseEntity.ok(service.listarTodos());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Usuario> buscarPorId(@PathVariable Long id) {
        Optional<Usuario> usuario = service.buscarPorId(id);
        
        if(usuario.isPresent()) {
            return ResponseEntity.ok(usuario.get());
        }
        
        return ResponseEntity.notFound().build();
    }
    
    @PostMapping
    public ResponseEntity<Usuario> criar(@Valid @RequestBody Usuario usuario) {
        Usuario novoUsuario = service.salvar(usuario);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(novoUsuario);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Usuario> atualizar(@PathVariable Long id, @Valid @RequestBody Usuario usuario) {
        Usuario usuarioAtualizado = service.atualizar(id, usuario);
        
        if(usuarioAtualizado != null) {
            return ResponseEntity.ok(usuarioAtualizado);
        }
        
        return ResponseEntity.notFound().build();
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Object> deletar(@PathVariable Long id) {
        Optional<Usuario> usuario = service.buscarPorId(id);
        
        if(usuario.isPresent()) {
            service.deletar(id);
            return ResponseEntity.status(HttpStatus.OK).body("Sucesso: O usuário foi excluído permanentemente.");
        }
        
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Erro: Não foi possível deletar. O usuário com ID " + id + " não foi encontrado.");
    }
}