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

	    public Optional<Funcionario> buscarPorId(Long id) {
	        return repository.findById(id);
	    }

    public Funcionario salvar(Funcionario func) {
        return repository.save(func);
    }
    
    public Funcionario atualizar(Long id, Funcionario funcAtualizado) {
    	Optional <Funcionario> funcExistente = buscarPorId(id);
    	
    	if(funcExistente.isPresent()) {
    		Funcionario atualizado = funcExistente.get();
    		
    		atualizado.setCargo(funcAtualizado.getCargo());
    		atualizado.setEmailFuncionario(funcAtualizado.getEmailFuncionario());
    		atualizado.setNomeFuncionario(funcAtualizado.getNomeFuncionario());
    		atualizado.setCpfFuncionario(funcAtualizado.getCpfFuncionario());
    		atualizado.setRgFuncionario(funcAtualizado.getRgFuncionario());
    		
    		return repository.save(atualizado);
    	}
    	
    	return null;
    }
    
    public void deletar(Long id) {
    	repository.deleteById(id);
    }
	
}
