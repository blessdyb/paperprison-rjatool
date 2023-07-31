import React from "react";

const DATA_DATA_COLUMNS = [
  "county",
  "PC_code",
  "PC_offense",
  // "race",
  // "decision",
//   "number",
//   "rate_per_100_pop",
//   "disparity_gap_pop_w",
  // "Offenses",
  "Race",
  "Year",
  "Event Point",
  "Raw numbers",
  "Rate per population",
  "Rate per prior event point",
  "Disparity gap per population",
  "Disparity gap per prior event point",
];

const DataTable = ({data}) => {
  return (
    <table className="ui celled table">
      <thead>
        <tr>
          {DATA_DATA_COLUMNS.map((r) => (
            <th key={r}>{r}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, rIndex) => {
          return (
            <tr key={rIndex}>
              {DATA_DATA_COLUMNS.map((k) => {
                if (k == "county") {
                    console.log(row[k])
                }
                let value = row[k];
                if (k === "Raw numbers" && value < 10) {
                  value = "N/A";
                } else if (
                  [
                    "Rate per population",
                    "Rate per prior event point",
                    "Disparity gap per population",
                    "Disparity gap per prior event point",
                  ].indexOf(k) > -1
                ) {
                  value = parseFloat(value).toFixed(2);
                }
                return <td key={k}>{value}</td>;
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default DataTable;
