import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMemo } from "react";
import { Plus } from "lucide-react";
import type { Column as ColumnType, Id, Task } from "./types";
import Card from "./Card";
import "./Column.css";

interface Props {
  column: ColumnType;
  tasks: Task[];
  createTask: (columnId: Id) => void;
  deleteTask: (id: Id) => void;
  updateTask: (id: Id, content: string) => void;
  deleteColumn?: (id: Id) => void; // Optional if we want to delete columns later
}

function Column({ column, tasks, createTask, deleteTask, updateTask }: Props) {
  const tasksIds = useMemo(() => {
    return tasks.map((task) => task.id);
  }, [tasks]);

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: "Column",
      column,
    },
    disabled: true,
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="column column-dragging"
      ></div>
    );
  }

  const headerColorClass = useMemo(() => {
    if (column.id === "todo") return "column-header-todo";
    if (column.id === "doing") return "column-header-doing";
    if (column.id === "done") return "column-header-done";
    return "";
  }, [column.id]);

  return (
    <div ref={setNodeRef} style={style} className="column">
      <div
        {...attributes}
        {...listeners}
        className={`column-header ${headerColorClass}`}
      >
        <div className="column-title">
          {column.title}
          <span className="task-count">{tasks.length}</span>
        </div>
        <button
          className="header-add-btn"
          onClick={() => createTask(column.id)}
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="column-content">
        <button
          className="add-task-btn"
          onClick={() => {
            createTask(column.id);
          }}
        >
          <Plus size={18} />
          <span>Add Card</span>
        </button>

        <SortableContext items={tasksIds}>
          {tasks.map((task) => (
            <Card
              key={task.id}
              task={task}
              deleteTask={deleteTask}
              updateTask={updateTask}
              columnId={column.id}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

export default Column;
