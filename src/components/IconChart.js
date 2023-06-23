import React from "react";

const formatNumber = (number) => {
  if (number > 1000) {
    const formattedNumber = (number / 1000).toFixed(1);
    return formattedNumber + "k";
  } else {
    return number.toString();
  }
};

const PersonIcon = ({ value = 0, label = "", race }) => {
  const valueRoof = Math.ceil(value);
  const maskHeight = {
    height: `${valueRoof * 100 - value * 100}%`
  };
  return (
    <div className="icon-chart-data">
      {valueRoof > 0 ? (
        Array(valueRoof)
          .fill(0)
          .map((_, index) => {
            return (
              <div className="icon-chart-data-point" key={index}>
                <svg
                  aria-label="Person"
                  className={`icon-person re-${race}`}
                  title={valueRoof}
                >
                  <use href="/images/sprites.svg#person"></use>
                </svg>
                <span
                  className="icon-chart-data-point-mask"
                  style={valueRoof - 1 === index ? maskHeight : {}}
                >
                  {valueRoof - 1 === index && (
                    <div className="icon-chart-data-label">
                      {formatNumber(label)}
                    </div>
                  )}
                </span>
              </div>
            );
          })
      ) : (
        <div className="icon-chart-data-point">
          <div className="icon-person icon-person-placeholder" />
          <span className="icon-chart-data-point-mask">
            <div className="icon-chart-data-label">0.0</div>
          </span>
        </div>
      )}
    </div>
  );
};

const IconChart = ({ data, races, base, measurement }) => {
  let scale = 1;
  const isRawNumber = [
    "Raw numbers",
    "Rate per population",
    "Rate per prior decision point"
  ].includes(measurement);
  if (measurement === "Raw numbers") {
    scale = 10000;
  } else if (measurement === "Rate per prior decision point") {
    scale = 100;
  } else {
    scale = 1;
  }
  return (
    <div className="icon-charts">
      {data.map((yd) => {
        const yearData = JSON.parse(JSON.stringify(yd));
        const scaledYearData = yearData.data.map((yd) => {
          return {
            label: yd.label,
            items: Object.keys(yd.items).reduce((acc, k) => {
              acc[k] = {
                scaled: isRawNumber
                  ? (yd.items[k] / scale).toFixed(2)
                  : (yd.items[k] / yd.records[k] / scale).toFixed(2),
                origin: isRawNumber
                  ? yd.items[k]
                  : (yd.items[k] / yd.records[k]).toFixed(2),
                scale
              };
              return acc;
            }, {})
          };
        });
        return (
          <div className="icon-chart" key={yearData.year}>
            <h3>
              {yearData.year}
              <div className="chart-meta">
                <div className="chart-scale">
                  <PersonIcon value={1} race={base} /> {scale}{" "}
                  {!base ? (scale > 1 ? "Persons" : "Person ") : "White Person"}
                </div>
              </div>
            </h3>
            <div className="icon-chart-races-container">
              {Object.keys(races)
                .filter((raceItem) => raceItem.toLowerCase() !== base)
                .map((raceItem) => {
                  return (
                    <div className="icon-chart-race-container" key={raceItem}>
                      <h4>{races[raceItem]}</h4>
                      <div className="icon-chart-rows">
                        {base && (
                          <div className="icon-chart-row">
                            <PersonIcon value={1} race={base} />
                          </div>
                        )}
                        {scaledYearData.map((raceData, raceDataIndex) => {
                          return (
                            <div className="icon-chart-row" key={raceDataIndex}>
                              <div className="icon-chart-label">
                                {raceData.label}
                              </div>
                              <PersonIcon
                                value={raceData?.items[raceItem]?.scaled}
                                race={raceItem}
                                label={raceData?.items[raceItem]?.origin}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default IconChart;
