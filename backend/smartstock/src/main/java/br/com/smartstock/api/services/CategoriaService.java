package br.com.smartstock.api.services;

import java.util.List;

import org.springframework.stereotype.Service;

import br.com.smartstock.api.entities.Categoria;
import br.com.smartstock.api.repositories.CategoriaRepository;

@Service
public class CategoriaService {

    private final CategoriaRepository repository;

    public CategoriaService(CategoriaRepository repository) {
        this.repository = repository;
    }

    public List<Categoria> listarTodas() {
        return repository.findAll();
    }

    public Categoria buscarPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categoria não encontrada."));
    }

    public Categoria salvar(Categoria categoria) {
        return repository.save(categoria);
    }

    public Categoria atualizar(Long id, Categoria categoriaNova) {

        Categoria categoriaAntiga = buscarPorId(id);

        if (categoriaNova.getNome() != null && !categoriaNova.getNome().isBlank()) {

            if (categoriaNova.getNome().length() < 3) {
                throw new RuntimeException("O nome da categoria deve possuir pelo menos 3 caracteres.");
            }

            categoriaAntiga.setNome(categoriaNova.getNome());
        }

        return repository.save(categoriaAntiga);
    }

    public void deletar(Long id) {

        Categoria categoria = buscarPorId(id);

        repository.delete(categoria);
    }
}