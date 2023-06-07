import React from "react";

const GenericPage = ({ children, id }) => {
  return (
    <div id={id} className="generic-page">
      {children}
    </div>
  );
};
export default GenericPage;
