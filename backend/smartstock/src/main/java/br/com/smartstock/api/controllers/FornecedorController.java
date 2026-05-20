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

import br.com.smartstock.api.entities.Fornecedor;
import br.com.smartstock.api.services.FornecedorService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("api/fornecedores")
@CrossOrigin("*")
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
    public ResponseEntity<Object> deletar(@PathVariable Long id) {
        Optional<Fornecedor> fornecedor = service.buscarPorId(id);
        
        if(fornecedor.isPresent()) {    
            service.deletar(id);
            return ResponseEntity.status(HttpStatus.OK).body("Sucesso: O fornecedor foi excluído permanentemente");

        }
        
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Erro: Não foi possível deletar. o fornecedor com ID" + id + "não foi encontrado");

    }
    
}