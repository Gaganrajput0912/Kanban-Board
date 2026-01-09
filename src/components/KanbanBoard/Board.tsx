import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
  useSensor,
  useSensors,
  PointerSensor,
  closestCorners,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
import { v4 as uuidv4 } from "uuid";
import type { Column as ColumnType, Task, Id } from "./types";
import Column from "./Column";
import Card from "./Card";
import "./Board.css";

const defaultColumns: ColumnType[] = [
  {
    id: "todo",
    title: "Todo",
  },
  {
    id: "doing",
    title: "In Progress",
  },
  {
    id: "done",
    title: "Done",
  },
];

const defaultTasks: Task[] = [
  {
    id: "1",
    columnId: "todo",
    content: "Create initial project plan",
  },
  {
    id: "2",
    columnId: "todo",
    content: "Design landing page",
  },
  {
    id: "3",
    columnId: "doing",
    content: "Implement authentication",
  },
  {
    id: "4",
    columnId: "done",
    content: "Setup CI/CD pipeline",
  },
];

function Board() {
  const [columns] = useState<ColumnType[]>(defaultColumns);
  const [tasks, setTasks] = useState<Task[]>(defaultTasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    })
  );

  function createTask(columnId: Id) {
    const newTask: Task = {
      id: uuidv4(),
      columnId,
      content: `New Task ${tasks.length + 1}`,
    };
    setTasks([...tasks, newTask]);
  }

  function deleteTask(id: Id) {
    const newTasks = tasks.filter((task) => task.id !== id);
    setTasks(newTasks);
  }

  function updateTask(id: Id, content: string) {
    const newTasks = tasks.map((task) => {
      if (task.id !== id) return task;
      return { ...task, content };
    });
    setTasks(newTasks);
  }

  function onDragStart(event: DragStartEvent) {
    if (event.active.data.current?.type === "Task") {
      setActiveTask(event.active.data.current.task);
      return;
    }
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveTask(null);
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    setTasks((tasks) => {
      const activeIndex = tasks.findIndex((t) => t.id === activeId);
      const overIndex = tasks.findIndex((t) => t.id === overId);

      if (tasks[activeIndex].columnId !== tasks[overIndex]?.columnId) {
        return arrayMove(tasks, activeIndex, overIndex);
      }
      return arrayMove(tasks, activeIndex, overIndex);
    });
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === "Task";
    const isOverTask = over.data.current?.type === "Task";

    if (!isActiveTask) return;

    if (isActiveTask && isOverTask) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const overIndex = tasks.findIndex((t) => t.id === overId);

        if (tasks[activeIndex].columnId !== tasks[overIndex].columnId) {
          tasks[activeIndex].columnId = tasks[overIndex].columnId;
          return arrayMove(tasks, activeIndex, overIndex - 1);
        }

        return tasks;
      });
    }

    const isOverColumn = over.data.current?.type === "Column";

    if (isActiveTask && isOverColumn) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);

        tasks[activeIndex].columnId = overId;

        return arrayMove(tasks, activeIndex, activeIndex);
      });
    }
  }

  return (
    <div className="board-container">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragOver={onDragOver}
      >
        <div className="board-columns">
          {columns.map((col) => (
            <Column
              key={col.id}
              column={col}
              tasks={tasks.filter((task) => task.columnId === col.id)}
              createTask={createTask}
              deleteTask={deleteTask}
              updateTask={updateTask}
            />
          ))}
        </div>

        {createPortal(
          <DragOverlay>
            {activeTask && (
              <Card
                task={activeTask}
                deleteTask={deleteTask}
                updateTask={updateTask}
              />
            )}
          </DragOverlay>,
          document.body
        )}
      </DndContext>
    </div>
  );
}

export default Board;
