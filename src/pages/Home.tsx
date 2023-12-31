import {
  IonButton,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonPage,
  IonTitle,
  IonToolbar,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonText,
} from "@ionic/react";
import "./Home.css";
import {
  getTasks,
  updateTask,
  addTask,
  deleteTask,
  putTask,
} from "../services/JsonServerService";
import { useEffect, useRef, useState } from "react";
import { Dialog } from "@capacitor/dialog";
import { fromEvent } from "rxjs";

const Home: React.FC = () => {
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [newTask, setNewTask] = useState<string>("");
  const [newCompleted, setNewCompleted] = useState<boolean>(true);
  const [newId, setNewId] = useState<number>(0);

  const flagMode = useRef("add");

  useEffect(() => {
    const tasks$ = getTasks();
    const subscription = tasks$.subscribe((data) => {
      data.sort((a: ITask, b: ITask) => {
        if (a.completed === b.completed) {
          return a.id - b.id;
        }
        return Number(a.completed) - Number(b.completed);
      });
      setTasks(data);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    tasks.forEach((task) => {
      const titleElement = document.getElementById(`task-title-${task.id}`) as HTMLElement;
      const doubleClick$ = fromEvent(titleElement, 'dblclick');
      const subscription = doubleClick$.subscribe(() => {
        toggleCompletion(task.id);
      });
  
      return () => subscription.unsubscribe();
    });
  }, [tasks, toggleCompletion]);

  
  function toggleCompletion(taskId: number) {
    const task = tasks.find((task) => task.id === taskId);
    if (task) {
      const updatedTask = { ...task, completed: !task.completed };
      const update$ = updateTask(taskId, updatedTask.completed);
      update$.subscribe(() => {
        setTasks(
          tasks
            .map((task) => (task.id === taskId ? updatedTask : task))
            .sort((a: ITask, b: ITask) => {
              if (a.completed === b.completed) {
                return a.id - b.id;
              }
              return Number(a.completed) - Number(b.completed);
            })
        );
      });
    }
  };

  const deleteTaskById = (taskId: number) => {
    Dialog.confirm({
      title: "Confirmation",
      message: "Voulez-vous vraiment supprimer cette tâche ?",
    }).then((result) => {
      if (result.value) {
        const delete$ = deleteTask(taskId);
        delete$.subscribe(() => {
          setTasks(
            tasks
              .filter((task) => task.id !== taskId)
              .sort((a: ITask, b: ITask) => {
                if (a.completed === b.completed) {
                  return a.id - b.id;
                }
                return Number(a.completed) - Number(b.completed);
              })
          );
        });
      }
    });
  };

  const editTask = (taskId: number) => {
    const task = tasks.find((task) => task.id === taskId);
    if (!task) {
      return;
    }
    flagMode.current = "edit";
    setNewTask(task.title);
    setNewCompleted(task.completed);
    setNewId(task.id);
    const title = document.getElementById("form-title");
    if(title) title.innerText = "Modifier une tâche";
  };

  function handleClickFormTask() {
    if (newTask !== "") {
      if (flagMode.current === "add") {
        const task = { title: newTask, completed: false };
        const add$ = addTask(task);
        add$.subscribe((addedTask) => {
          const newTasks = [...tasks, addedTask];
          newTasks.sort((a: ITask, b: ITask) => {
            if (a.completed === b.completed) {
              return a.id - b.id;
            }
            return Number(a.completed) - Number(b.completed);
          });
          setTasks(newTasks);
          setNewTask("");
        });
      }

      if (flagMode.current === "edit") {
        const task = { id: newId, title: newTask, completed: newCompleted };
        const put$ = putTask(task);
        put$.subscribe((updatedTask) => {
          const newTasks = tasks.map((task) =>
            task.id === updatedTask.id ? updatedTask : task
          );
          newTasks.sort((a: ITask, b: ITask) => {
            if (a.completed === b.completed) {
              return a.id - b.id;
            }
            return Number(a.completed) - Number(b.completed);
          });
          setTasks(newTasks);
          resetForm();
        });
      }
    }
  }

  const resetForm = () => {
    setNewTask("");
    setNewCompleted(true);
    setNewId(0);
    const title = document.getElementById("form-title");
    if(title) title.innerText = "Ajouter une tâche";
    flagMode.current = "add";
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle size="large" className="text-center large-title">Gestion des tâches</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonTitle size="large" className="text-center title-margin" id="form-title">
          Ajouter une tâche
        </IonTitle>
        <IonItem className="form-new-task">
          <IonLabel>Titre de la tâche :</IonLabel>
          <IonInput
            value={newTask}
            onIonChange={(event) => setNewTask(event.detail.value!)}
          />
          <IonButton color="primary" onClick={handleClickFormTask}>
            {flagMode.current === "add" ? "Ajouter" : "Modifier"}
          </IonButton>
          <IonButton color="warning" onClick={resetForm}>Raz</IonButton>
        </IonItem>
        <IonTitle size="large" className="text-center title-margin">
          Liste des tâches
        </IonTitle>
        <IonCard className="card-tasks">
          <IonGrid className="table-tasks">
            <IonRow className="rows-tasks">
              <IonCol size="1">
                <IonText className="font-bold text-grey">Id</IonText>
              </IonCol>
              <IonCol size="4">
                <IonText className="font-bold text-grey">Titre</IonText>
              </IonCol>
              <IonCol className="actions-col-head">
                <IonText className="font-bold text-grey">Actions</IonText>
              </IonCol>
            </IonRow>
            {tasks.map((task) => (
              <IonRow className="rows-tasks" key={task.id}>
                <IonCol size="1">
                  <IonText
                    className={
                      task.completed
                        ? "font-bold text-blue"
                        : "font-bold text-orange"
                    }
                  >
                    {task.id}
                  </IonText>
                </IonCol>
                <IonCol
                  size="4"
                  className={
                    task.completed ? "checked text-blue" : "text-orange"
                  }
                  //onDoubleClick={() => toggleCompletion(task.id)}
                  id={`task-title-${task.id}`}
                >
                  {task.title}
                </IonCol>
                <IonCol className="actions-col">
                  <IonButton
                    className="btn-action"
                    color={task.completed ? "warning" : "success"}
                    onClick={() => toggleCompletion(task.id)}
                  >
                    {task.completed ? "Invalider" : "Valider"}
                  </IonButton>
                  <IonButton
                    className="btn-action"
                    color="primary"
                    onClick={() => editTask(task.id)}
                  >
                    Modifier
                  </IonButton>
                  <IonButton
                    className="btn-action"
                    color="danger"
                    onClick={() => deleteTaskById(task.id)}
                  >
                    Supprimer
                  </IonButton>
                </IonCol>
              </IonRow>
            ))}
          </IonGrid>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default Home;
