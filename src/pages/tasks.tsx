import { CONFIG } from 'src/config-global';

import { TasksView } from 'src/sections/tasks/view';

// ----------------------------------------------------------------------

export default function TasksPage() {
  return (
    <>
      <title>{`Gestión de Tareas - ${CONFIG.appName}`}</title>

      <TasksView />
    </>
  );
}