import { startRouter } from '../framework/index.js';
import { TodoApp } from './components/TodoApp.js';

const routes = {
    '/': () => TodoApp(() => true),
    '/active': () => TodoApp(todo => !todo.completed),
    '/completed': () => TodoApp(todo => todo.completed)
};

// Get the body element
const app = document.getElementsByTagName('html')[0];
if (!app) {
    console.error("Could not find body element to mount the app.");
} else {
    if (!window.location.hash) {
        window.location.hash = '/';
    }
    startRouter(routes, app);
}
