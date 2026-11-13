package br.com.smartstock.api.controllers;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.smartstock.api.entities.Fornecedor;
import br.com.smartstock.api.services.FornecedorService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("api/fornecedores")
public class FornecedorController {

	@Autowired
    private FornecedorService service;
	
	@GetMapping
	public ResponseEntity<List<Fornecedor>> listar() {
	    return ResponseEntity.ok(service.listarTodos());
	}
    
    @GetMapping("/{id}")
    public ResponseEntity<Fornecedor> buscar(@PathVariable Long id) {
        Optional<Fornecedor> forn = service.buscarPorId(id);
        
        if(forn.isPresent()) {
            return ResponseEntity.ok(forn.get());
        }
        
        return ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<Fornecedor> criar(@Valid @RequestBody Fornecedor fornecedor) {
        Fornecedor novoFornecedor = service.salvar(fornecedor);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(novoFornecedor);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Fornecedor> atualizar(@PathVariable Long id, @Valid @RequestBody Fornecedor fornecedor) {
        Fornecedor fornecedorAtualizado = service.atualizar(id, fornecedor);
        
        if(fornecedorAtualizado != null) {
            return ResponseEntity.ok(fornecedorAtualizado);
        }
        
        return ResponseEntity.notFound().build();
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {

    	boolean excluido = service.deletar(id);

    	if (!excluido) {
    		return ResponseEntity.notFound().build();
    	}

    	return ResponseEntity.noContent().build();
}
    

@ExceptionHandler(MethodArgumentNotValidException.class)
public ResponseEntity<String> tratarErrosValidacao(
        MethodArgumentNotValidException erro) {

    String mensagem = erro.getBindingResult()
            .getFieldErrors()
            .stream()
            .map(campo -> campo.getField() + ": " + campo.getDefaultMessage())
            .collect(Collectors.joining("; "));

    return ResponseEntity.badRequest().body(mensagem);
}


@ExceptionHandler(DataIntegrityViolationException.class)
public ResponseEntity<String> tratarExclusaoVinculada(
        DataIntegrityViolationException erro) {

    return ResponseEntity
            .status(HttpStatus.CONFLICT)
            .body("Não é possível excluir o fornecedor porque existem registros vinculados.");
}


    
}