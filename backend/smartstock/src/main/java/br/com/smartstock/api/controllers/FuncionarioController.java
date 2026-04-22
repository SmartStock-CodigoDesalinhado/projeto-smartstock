package br.com.smartstock.api.controllers;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.smartstock.api.entities.Funcionario;
import br.com.smartstock.api.services.FuncionarioService;
import jakarta.validation.Valid;

@RestController	
@RequestMapping("api/funcionario")
@CrossOrigin("*")
public class FuncionarioController {
	@Autowired
	private FuncionarioService service;
	
	@PostMapping
	public ResponseEntity<Funcionario> cadastrar(@RequestBody @Valid Funcionario funcionario) {
		Funcionario novoFuncionario = service.salvar(funcionario);
		
        return ResponseEntity.status(HttpStatus.CREATED).body(novoFuncionario);

	}
	
	@GetMapping
	public ResponseEntity <List<Funcionario>> listar() {
		return ResponseEntity.ok(service.listarTodos());
	}

	@GetMapping("/{id}")
	public ResponseEntity<Funcionario> buscar(@PathVariable Long id) {
		Optional<Funcionario> funcionario = service.buscarPorId(id);
    	
    	if(funcionario != null) {
    		return ResponseEntity.ok(funcionario.get());
    	}
    					
    	return ResponseEntity.notFound().build();
    }
	
}
