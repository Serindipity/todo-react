import React, { useState, useEffect } from "react";
import TodoItem from "@/components/TodoItem";
import styles from "@/styles/TodoList.module.css";
import { db } from "@/firebase";
import {
  collection,
  query,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  orderBy,
  serverTimestamp, // Timestamp 생성
} from "firebase/firestore";

const todoCollection = collection(db, "todos");

const TodoList = () => {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");

  const getTodos = async () => {
    const q = query(todoCollection, orderBy("createdAt", "asc")); // 생성된 시간을 기준으로 오름차순 정렬
    const results = await getDocs(q);
    const newTodos = [];
    results.docs.forEach((doc) => {
      newTodos.push({ id: doc.id, ...doc.data() });
    });
    setTodos(newTodos);
  };

  useEffect(() => {
    getTodos();
  }, []);

  const addTodo = async () => {
    if (input.trim() === "") return;
    const docRef = await addDoc(todoCollection, {
      text: input,
      completed: false,
      createdAt: serverTimestamp(), // 생성 시각 추가
    });
    setTodos([...todos, { id: docRef.id, text: input, completed: false, createdAt: new Date() }]); // 로컬에서는 자바스크립트의 new Date()로 생성시각 저장
    setInput("");
  };

  const toggleTodo = (id) => {
    const newTodos = todos.map((todo) => {
      if (todo.id === id) {
        const todoDoc = doc(todoCollection, id);
        updateDoc(todoDoc, { completed: !todo.completed });
        return { ...todo, completed: !todo.completed };
      } else {
        return todo;
      }
    });
    setTodos(newTodos);
  };

  const deleteTodo = (id) => {
    const todoDoc = doc(todoCollection, id);
    deleteDoc(todoDoc);
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  return (
    <div className={styles.todoList}>
      <h1>Todo List</h1>
      <div className={styles.inputContainer}>
        <input
          type="text"
          placeholder="Add a Todo"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button onClick={addTodo}>Add</button>
      </div>
      <ul>
        {todos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            toggleTodo={toggleTodo}
            deleteTodo={deleteTodo}
          />
        ))}
      </ul>
    </div>
  );
};

export default TodoList;
