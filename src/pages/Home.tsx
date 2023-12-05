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

  /*
  const toggleCompletion = (taskId: number) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? {...task, completed: !task.completed} : task
    ));
  };
*/

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
  };

  /*

const handleAddTask = () => {
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
};*/

  function handleAddTask() {
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
            <IonRow>
              <IonCol size="2"><strong className="text-warning">Id</strong></IonCol>
              <IonCol size="6"><strong className="text-warning">Titre</strong></IonCol>
              <IonCol size="4"><strong className="text-warning">Actions</strong></IonCol>
            </IonRow>
            {tasks.map((task) => (
              <IonRow key={task.id}>
                <IonCol size="2">{task.id}</IonCol>
                <IonCol
                  size="6"
                  className={task.completed ? "checked" : ""}
                  onDoubleClick={() => toggleCompletion(task.id)}
                >
                  {task.title}
                </IonCol>
                <IonCol size="4">
                  <IonButton
                    color={task.completed ? "warning" : "success"}
                    onClick={() => toggleCompletion(task.id)}
                  >
                    {task.completed ? "Invalider" : "Valider"}
                  </IonButton>
                  <IonButton
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
