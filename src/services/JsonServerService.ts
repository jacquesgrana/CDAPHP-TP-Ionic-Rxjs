import { from } from "rxjs";

const serverUrl = 'http://localhost:5050/tasks';
export function getTasks () {
    return from(
      fetch(`${serverUrl}`).then((response) => response.json())
    );
  };

  export function updateTask(id: number, completed: boolean) {
    return from(
      fetch(`${serverUrl}/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed }),
      }).then((response) => response.json())
    );
  }

  export function addTask(task: Partial<ITask>) {
    return from(
      fetch(`${serverUrl}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(task),
      }).then((response) => response.json())
    );
  }

  export function deleteTask(id: number) {
    return from(
      fetch(`${serverUrl}/${id}`, {
        method: 'DELETE',
      }).then((response) => response.json())
    );
  }
  