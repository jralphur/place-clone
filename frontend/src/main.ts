import { createApp } from "vue";
import App from "./App.vue";
import "./index.css";
import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faCompress, faSquare } from "@fortawesome/free-solid-svg-icons";
library.add(faCompress, faSquare);

const app = createApp(App).component("font-awesome-icon", FontAwesomeIcon);

app.mount("#app");
