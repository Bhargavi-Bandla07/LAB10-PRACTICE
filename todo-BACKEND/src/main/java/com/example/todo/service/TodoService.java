package com.example.todo.service;

import com.example.todo.Entity.Todo;
import com.example.todo.repository.TodoRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TodoService {

    private final TodoRepository repo;

    public TodoService(TodoRepository repo) {
        this.repo = repo;
    }

    public List<Todo> findAll() {
        return repo.findAll();
    }

    public Optional<Todo> findById(Long id) {
        return repo.findById(id);
    }

    public Todo save(Todo todo) {
        // if createdAt is null, set it
        if (todo.getCreatedAt() == null) {
            todo.setCreatedAt(java.time.LocalDateTime.now());
        }
        return repo.save(todo);
    }

    public void deleteById(Long id) {
        repo.deleteById(id);
    }

    public boolean existsById(Long id) {
        return repo.existsById(id);
    }
}
