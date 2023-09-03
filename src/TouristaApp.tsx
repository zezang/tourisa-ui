import React from "react";

import styles from "./root.scss";

const TouristaApp: React.FunctionComponent = (): React.ReactElement => {
  return (
    <div className={styles.root}>
      <div>Welcome to Tourista</div>
    </div>
  );
};

export default TouristaApp;
