package br.com.smartstock.api.controllers;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.smartstock.api.entities.Cliente;
import br.com.smartstock.api.services.ClienteService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("api/cliente")
@CrossOrigin("*")
public class ClienteController {
	
	@Autowired
	private ClienteService service;
	
	@GetMapping
    public ResponseEntity<List<Cliente>> listar() {
        return ResponseEntity.ok(service.listarTodos());
    }
	
	@GetMapping("/{id}")
	public ResponseEntity<Cliente> buscarPorId(@PathVariable Long id) {
	    Optional<Cliente> cl = service.buscarPorId(id);
	    
	    if(cl.isPresent()) {
	        return ResponseEntity.ok(cl.get());
	    }
	    
	    return ResponseEntity.notFound().build();	
	}
	
	@PostMapping
		public ResponseEntity<Cliente> criar(@Valid @RequestBody Cliente cliente) {
			Cliente novoCliente = service.salvar(cliente);
			
			return ResponseEntity.status(HttpStatus.CREATED).body(novoCliente);
	}
	
	@PutMapping("/{id}")
		public ResponseEntity<Cliente> atualizar(@PathVariable Long id, @Valid @RequestBody Cliente cl) {
			Cliente clienteAtualizado = service.atualizar(id, cl);
			
			if(clienteAtualizado != null) {
				return ResponseEntity.ok(clienteAtualizado);
			}
			
			return ResponseEntity.notFound().build();
	}
	
	@DeleteMapping("/{id}")
		public ResponseEntity<Object> deletar(@PathVariable Long id) {
			Optional<Cliente> cl = service.buscarPorId(id);
			
			if(cl.isPresent()) {
				service.deletar(id);
				return ResponseEntity.status(HttpStatus.OK).body("Sucesso: O cliente foi deletado permanentemente");
			}
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Erro: Não foi possível deletar o cliente. Cliente com ID" + id + "não foi encontrado.");
	}

}
