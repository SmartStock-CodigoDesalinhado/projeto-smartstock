package br.com.smartstock.api.services;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import br.com.smartstock.api.entities.Funcionario;
import br.com.smartstock.api.repositories.FuncionarioRepository;

@Service
public class FuncionarioService {
	@Autowired
	private FuncionarioRepository repository;
	
	public List<Funcionario> listarTodos() {
		return repository.findAll();
	}
	
	public Funcionario salvar(Funcionario cadastrarFuncionario) {
		return repository.save(cadastrarFuncionario);
	}

	public Optional<Funcionario> buscarPorId(Long id) {
        return repository.findById(id);
    }


	
}
