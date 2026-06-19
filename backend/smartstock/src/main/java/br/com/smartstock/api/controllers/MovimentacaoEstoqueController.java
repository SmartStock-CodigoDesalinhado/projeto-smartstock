package br.com.smartstock.api.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.smartstock.api.entities.MovimentacaoEstoque;
import br.com.smartstock.api.services.MovimentacaoEstoqueService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("api/movimentacoes")
@CrossOrigin("*")
public class MovimentacaoEstoqueController {

    @Autowired
    private MovimentacaoEstoqueService service;

    @GetMapping
    public ResponseEntity<List<MovimentacaoEstoque>> listar() {
        return ResponseEntity.ok(service.listarTodos());
    }

    @PostMapping
    public ResponseEntity<MovimentacaoEstoque> criar(@RequestBody @Valid MovimentacaoEstoque movimentacao) {
        try {
            MovimentacaoEstoque novaMovimentacao = service.salvar(movimentacao);
            return ResponseEntity.status(HttpStatus.CREATED).body(novaMovimentacao);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
}