import React from "react";

import styles from "./styles.scss";

const App: React.FunctionComponent = (): React.ReactElement => {
  return (
    <div className={styles.root}>
      <div>Welcome to Tourista</div>
      <div>Testing to see if content shows</div>
      <div>Hello world!</div>
    </div>
  );
};

export default App;
