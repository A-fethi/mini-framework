import { Vnode } from "../../framework/index.js";
import { todoStore } from "../store.js";

export function TodoItem(todo) {
  const classes = [];
  if (todo.completed) classes.push('completed');
  if (todo.editing) classes.push('editing');
  return Vnode(
    "li",
    {
      "data-testid": 'todo-item',
      class: classes.join(' '),
    },
    [
      todo.editing
        ? Vnode("input", {
            class: "edit",
            value: todo.text,
            focus: true,
            onBlur: () => {
              if (!todo.updating) {
                todoStore.exitEditMode(todo.id);
              }
            },
            onKeydown: (e) => {
              if (e.key === "Enter") {
                const newText = e.target.value.trim();
                if (newText !== "" && newText.length >= 2) {
                  console.log("Updating todo:", todo.id, "with text:", newText);
                  todo.updating = true;
                  todoStore.updateTodo(todo.id, newText, false);
                  setTimeout(() => {
                    todo.updating = false;
                    if (todo.editing) {
                      todoStore.exitEditMode(todo.id);
                    }
                  }, 0);
                }
              } else {
                return;
              }
            },
          })
        : Vnode("div", { class: "view" }, [
            Vnode("input", {
              class: "toggle",
              type: "checkbox",
              "data-testid": "todo-item-toggle",
              checked: todo.completed,
              onChange: () => {
                todoStore.toggleTodo(todo.id);
              },
            }),
            Vnode(
              "label",
              {
                "data-testid": "todo-item-label",
                onDblclick: () => {
                  todoStore.updateTodo(todo.id, todo.text, true);
                },
              },
              todo.text
            ),
            Vnode(
              "button",
              {
                class: "destroy",
                "data-testid": "todo-item-button",
                onClick: () => todoStore.deleteTodo(todo.id),
              },
              ""
            ),
          ]),
    ]
  );
}
