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
} from "@ionic/react";
//import ExploreContainer from '../components/ExploreContainer';
import "./Home.css";
import {
  getTasks,
  updateTask,
  addTask,
  deleteTask,
} from "../services/JsonServerService";
import { useEffect, useState } from "react";
import { bufferCount, fromEvent } from "rxjs";

const Home: React.FC = () => {
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [newTask, setNewTask] = useState<string>("");

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
    const addButton = document.querySelector(
      "ion-button"
    ) as HTMLIonButtonElement;
    const click$ = fromEvent(addButton, "click");
    const doubleClick$ = click$.pipe(bufferCount(2));

    const subscription = doubleClick$.subscribe(() => {
      handleAddTask();
    });

    return () => subscription.unsubscribe();
  }, [handleAddTask]);

  const toggleCompletion = (taskId: number) => {
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
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
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
   };

  function handleAddTask() {
    if(newTask !== '') {
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
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle className="text-center">Gestion des tâches</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Gestion des tâches</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonItem className="form-new-task">
          <IonLabel>Nouvelle tâche :</IonLabel>
          <IonInput
            value={newTask}
            onIonChange={(event) => setNewTask(event.detail.value!)}
          />
          <IonButton color="primary" onClick={handleAddTask}>
            Ajouter
          </IonButton>
        </IonItem>
        <div className="div-tasks">
          <IonGrid className="table-tasks">
            <IonRow className="rows-tasks">
              <IonCol size="2"><strong className="text-orange">Id</strong></IonCol>
              <IonCol size="5"><strong className="text-orange">Titre</strong></IonCol>
              <IonCol size="5"><strong className="text-orange">Actions</strong></IonCol>
            </IonRow>
            {tasks.map((task) => (
              <IonRow className="rows-tasks" key={task.id}>
                <IonCol size="2"><strong  className={task.completed ? "text-yellow" : "text-blue"}>{task.id}</strong></IonCol>
                <IonCol
                  size="5"
                  className={task.completed ? "checked" : ""}
                  onDoubleClick={() => toggleCompletion(task.id)}
                >
                  {task.title}
                </IonCol>
                <IonCol size="5">
                  <IonButton className="btn-action"
                    color={task.completed ? "warning" : "success"}
                    onClick={() => toggleCompletion(task.id)}
                  >
                    {task.completed ? "Invalider" : "Valider"}
                  </IonButton>
                  <IonButton className="btn-action"
                    color="danger"
                    onClick={() => deleteTaskById(task.id)}
                  >
                    Supprimer
                  </IonButton>
                </IonCol>
              </IonRow>
            ))}
          </IonGrid>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Home;
