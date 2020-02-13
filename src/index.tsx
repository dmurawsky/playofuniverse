import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";

const HEIGHT = 400;
const WIDTH = 401;

ReactDOM.render(
  <App width={WIDTH} height={HEIGHT} />,
  document.getElementById("root")
);
