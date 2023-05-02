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
} from "firebase/firestore";

const todoCollection = collection(db, "todos");

const TodoList = () => {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");

  const getTodos = async () => {
    const q = query(todoCollection);
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
    });

    setTodos([...todos, { id: docRef.id, text: input, completed: false }]);
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

    setTodos(
      todos.filter((todo) => {
        return todo.id !== id;
      })
    );
  };

  return (
    <div className={styles.container}>
      <h1 className="text-xl mb-4 font-bold underline underline-offset-4 decoration-wavy">
        Todo List
      </h1>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Add a new todo..."
        className="border border-gray-400 py-2 px-4 rounded-lg shadow-sm mb-4 w-full"
      />
      <button
        className="bg-blue-500 text-white py-2 px-4 rounded-lg shadow-sm hover:bg-blue-600 mb-4"
        onClick={addTodo}
      >
        Add Todo
      </button>
      <ul className="space-y-2">
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
