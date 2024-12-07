"use client";
import type { NextPage } from "next";
import Head from "next/head";
import TodoList from "@/components/ToDoList";

const Home: NextPage = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>Todo App</title>
        <meta name="description" content="Full-stack Todo Application" />
      </Head>

      <main className="container mx-auto">
        <h1 className="text-center text-3xl font-bold mt-10 mb-6">
          My Todo List
        </h1>
        <TodoList />
      </main>
    </div>
  );
};

export default Home;
