import React from "react";
import ReactDOM from "react-dom";
import CssBaseline from "@material-ui/core/CssBaseline";

import App from "./App";

ReactDOM.render(
  <CssBaseline>
    <App />
  </CssBaseline>,
  document.getElementById("root")
);

// Registrando o Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const swUrl = `${window.location.origin}/serviceWorker.js`; // Usando o origin para o caminho

    navigator.serviceWorker.register(swUrl)
      .then((registration) => {
        console.log('Service worker registrado com sucesso!', registration);
      })
      .catch((error) => {
        console.error('Erro durante o registro do service worker:', error);
      });
  });
}
