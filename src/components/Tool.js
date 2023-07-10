import React, { useEffect, useState } from "react";
import PublicGoogleSheetsParser from "public-google-sheets-parser";
import { utils, writeFileXLSX } from "xlsx";

import IconCharts from "@/components/IconCharts";
import PrivateSelect from "@/components/Select";
import Grid from "@/components/Grid";

const MEASUREMENTS = [
  "Raw numbers",
  "Rate per population",
  "Rate per prior event point",
  "Disparity gap per population",
  "Disparity gap per prior event point"
];

const RACES = {
  White: "White",
  Black: "Black",
  Hispanic: "Latino",
  AAPI: "Asian / Pacific Islander"
  // Native: "Native American",
  // Other: "Other"
};

const getURLQueryParameterByName = (name, url = window.location.href) => {
  const sanitizedName = name.replace(/[[]]/g, "\\$&");
  const regex = new RegExp(`[?&]${sanitizedName}(=([^&#]*)|&|#|$)`);
  const results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return "";
  return decodeURIComponent(results[2].replace(/\+/g, " "));
};

export default function App() {
  const [yearsAvailable, setYearsAvailable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [years, setYears] = useState([]);
  const [countiesAvailable, _] = useState([
    "Alameda",
    "Alpine",
    "Amador",
    "Butte",
    "Calaveras",
    "Colusa",
    "Contra Costa",
    "Del Norte",
    "El Dorado",
    "Fresno",
    "Glenn",
    "Humboldt",
    "Imperial",
    "Inyo",
    "Kern",
    "Kings",
    "Lake",
    "Lassen",
    "Los Angeles",
    "Madera",
    "Marin",
    "Mariposa",
    "Mendocino",
    "Merced",
    "Modoc",
    "Mono",
    "Monterey",
    "Napa",
    "Nevada",
    "Orange",
    "Placer",
    "Plumas",
    "Riverside",
    "Sacramento",
    "San Benito",
    "San Bernardino",
    "San Diego",
    "San Francisco",
    "San Joaquin",
    "San Luis Obispo",
    "San Mateo",
    "Santa Barbara",
    "Santa Clara",
    "Santa Cruz",
    "Shasta",
    "Sierra",
    "Siskiyou",
    "Solano",
    "Sonoma",
    "Stanislaus",
    "Sutter",
    "Tehama",
    "Trinity",
    "Tulare",
    "Tuolumne",
    "Ventura",
    "Yolo",
    "Yuba"
  ]);
  const [county, setCounty] = useState("Santa Clara");
  const [decisionPointsAvailable, setDecisionPointsAvailable] = useState([]);
  const [decisionPoints, setDecisionPoints] = useState([]);
  const [offensesAvailable, setOffensesAvailable] = useState([]);
  const [offenses, setOffenses] = useState([]);
  const [races, setRaces] = useState(Object.keys(RACES));
  const [measurement, setMeasurement] = useState("Raw numbers");
  const [chartConfig, setChartConfig] = useState({
    ratio: 1,
    base: null
  });
  const [fullRecords, setFullRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState({
    raw: [],
    chart: []
  });
  const [showTable, setShowTable] = useState(false);

  const onDataDownload = () => {
    const ws = utils.json_to_sheet(filteredRecords.raw);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Data");
    writeFileXLSX(wb, "PaperPrison - Data.xlsx");
  };
  const onDataTableDisplayToggled = () => setShowTable(!showTable);

  const filter = (
    { decisionPoints, races, offenses, years, measurement },
    records = fullRecords
  ) => {
    const raw = records.filter((r) => {
      if (races.length > 0 && !races.includes(r.Race)) {
        return false;
      }
      if (
        decisionPoints.length > 0 &&
        !decisionPoints.includes(r["Event Point"])
      ) {
        return false;
      }
      if (offenses.length > 0 && !offenses.includes(r.Offenses)) {
        return false;
      }
      if (!years.includes(r.Year)) {
        return false;
      }
      return true;
    });
    const filtered = raw.reduce((acc, item) => {
      if (!acc[item.Year]) {
        acc[item.Year] = {
          year: item.Year,
          data: {}
        };
      }
      if (!acc[item.Year].data[item["Event Point"]]) {
        acc[item.Year].data[item["Event Point"]] = {
          label: item["Event Point"],
          items: {},
          records: {}
        };
      }
      if (!acc[item.Year].data[item["Event Point"]].items[item["Offenses"]]) {
        acc[item.Year].data[item["Event Point"]].items[item["Offenses"]] = {
          label: item["Offenses"],
          items: {}
        };
      }
      acc[item.Year].data[item["Event Point"]].items[item["Offenses"]].items[
        item["Race"]
      ] = item[measurement] || 0;

      if (!acc[item.Year].data[item["Event Point"]].records[item["Race"]]) {
        acc[item.Year].data[item["Event Point"]].records[item["Race"]] = 1;
      } else {
        acc[item.Year].data[item["Event Point"]].records[item["Race"]]++;
      }
      return acc;
    }, {});
    setFilteredRecords({
      raw,
      chart: Object.values(filtered).map((item) => {
        item.data = Object.values(item.data).map((d) => {
          d.items = Object.values(d.items).reduce(
            (acc, dd) => {
              Object.keys(dd.items).forEach((k) => {
                let temp = acc[k] + (dd.items[k] || 0);
                if (measurement === "Raw numbers") {
                  temp = Math.ceil(temp);
                } else {
                  temp = Number(Number(temp).toFixed(2));
                }
                acc[k] = temp;
                return acc;
              });

              return acc;
            },
            { AAPI: 0, Black: 0, Hispanic: 0, White: 0 }
          );
          return d;
        });
        return item;
      })
    });
  };

  // https://docs.google.com/spreadsheets/d/1nJ3k0KXVrhXm8La-lOTpw8U7xL7Cc-GioANxxH5KsXE/edit#gid=0
  // Make sure share this link to the public, so anyone who has the link can open this spreedsheet
  const fetchData = async (sheet) => {
    setLoading(true)
    const parser = new PublicGoogleSheetsParser();
    parser
      .parse("1nJ3k0KXVrhXm8La-lOTpw8U7xL7Cc-GioANxxH5KsXE", sheet)
      .then((originItems) => {
        const _years = [];
        const _decisionPoints = [];
        const _offenses = [];
        const _races = [];
        const items = originItems.map((item) => {
          item.Offenses = item.PC_offense;
          item.Race = item.race;
          item.Year = item.year;
          item["Event Point"] = item.decision;
          item["Raw numbers"] = item.number;
          item["Rate per population"] = isNaN(item.rate_per_100_pop)
            ? 0
            : item.rate_per_100_pop;
          item["Rate per prior event point"] = isNaN(item.rate_cond_previous)
            ? 0
            : item.rate_cond_previous;

          item["Disparity gap per population"] = isNaN(item.disparity_gap_pop_w)
            ? 0
            : item.disparity_gap_pop_w;
          item["Disparity gap per prior event point"] = isNaN(
            item.disparity_gap_cond_w
          )
            ? 0
            : item.disparity_gap_cond_w;
          return item;
        });
        items.forEach((item) => {
          if (_years.indexOf(item["Year"]) === -1) {
            _years.push(item["Year"]);
          }
          if (_decisionPoints.indexOf(item["Event Point"]) === -1) {
            _decisionPoints.push(item["Event Point"]);
          }
          if (_offenses.indexOf(item["Offenses"]) === -1) {
            _offenses.push(item["Offenses"]);
          }
          if (_races.indexOf(item["Race"]) === -1) {
            _races.push(item["Race"]);
          }
        });
        const mostRecentYear = _years.sort()[_years.length - 1];
        setYears([mostRecentYear]);
        setYearsAvailable(_years);
        setDecisionPointsAvailable(_decisionPoints);
        setDecisionPoints(_decisionPoints);
        setOffenses(_offenses);
        setOffensesAvailable(_offenses);
        setFullRecords(items);
        setRaces(_races);
        setLoading(false)
        filter(
          {
            races: _races,
            decisionPoints: decisionPoints,
            offenses: _offenses,
            years: [mostRecentYear],
            measurement
          },
          items
        );
      });
  };

  useEffect(() => {
    const sheet = getURLQueryParameterByName("sheet") || "Santa Clara";
    fetchData(sheet).catch((e) => {});
  }, []);

  const onCountyChange = async (value) => {
    setCounty(value);
    await fetchData(value);
    filter({
      races,
      decisionPoints,
      years,
      offenses,
      measurement
    });
  };

  const onYearChange = (values) => {
    setYears(values);
    filter({
      races,
      decisionPoints,
      years: values,
      offenses,
      measurement
    });
  };

  const onDecisionPointChange = (values) => {
    setDecisionPoints(values);
    filter({
      races,
      decisionPoints: values,
      offenses,
      years,
      measurement
    });
  };

  const onRacesChange = (values) => {
    setRaces(values);
    filter({
      races: values,
      decisionPoints,
      offenses,
      years,
      measurement
    });
  };

  const onOffensesChange = (values) => {
    setOffenses(values);
    filter({
      races,
      decisionPoints,
      offenses: values,
      years,
      measurement
    });
  };

  const onMeasurementsChange = (value) => {
    setMeasurement(value);
    if (
      value === "Disparity gap per population" ||
      value === "Disparity gap per prior event point" ||
      value === "Rate per prior event point"
    ) {
      setChartConfig({
        base: "white",
        ratio: 0.01
      });
    } else if (value === "Raw numbers") {
      setChartConfig({
        base: null,
        ratio: 1
      });
    } else {
      setChartConfig({
        base: null,
        ratio: 0.1
      });
    }
    filter({
      races,
      decisionPoints,
      offenses,
      years,
      measurement: value
    });
  };

  return (
    <div className="tool" id="tool">
      <p className="generic-page">
        This tool visualizes the disparity in treatment of different racial
        groups within the criminal justice system across counties in California,
        providing evidence of racial inequality that supports the California
        Racial Justice Act.
      </p>
      <div className="filters">
        <div>Customize: </div>
        <div className="filter">
          <PrivateSelect
            label="Years"
            multiple={true}
            value={years}
            onChange={onYearChange}
            options={yearsAvailable.map((y) => ({
              text: y,
              value: y
            }))}
          />
        </div>
        <div className="filter">
          <PrivateSelect
            label="Counties"
            value={county}
            multiple={false}
            onChange={onCountyChange}
            options={countiesAvailable.map((county) => ({
              text: county,
              value: county
            }))}
          />
        </div>
        <div className="filter">
          <PrivateSelect
            label="Event Point"
            multiple={true}
            value={decisionPoints}
            onChange={onDecisionPointChange}
            options={decisionPointsAvailable.map((dp) => ({
              text: dp,
              value: dp
            }))}
          />
        </div>
        <div className="filter">
          <PrivateSelect
            label="Offenses"
            value={offenses}
            multiple={true}
            onChange={onOffensesChange}
            options={offensesAvailable.map((o) => ({
              text: o,
              value: o
            }))}
          />
        </div>
        <div className="filter">
          <PrivateSelect
            label="Measurement"
            value={measurement}
            onChange={onMeasurementsChange}
            options={MEASUREMENTS.map((m) => ({
              text: m,
              value: m
            }))}
          />
        </div>
      </div>
      <div className="chart-selected">
        <h2>{county}</h2>
        <p>
          <span>{measurement};</span>
          <span>
            {decisionPoints.length === decisionPointsAvailable.length
              ? "All Event Points"
              : offenses.join(", ")}
            ;
          </span>
          <span>
            {offenses.length === offensesAvailable.length
              ? "All Offenses"
              : offenses.join(", ")}
          </span>
        </p>
      </div>
      <div className="chart-containers">
        {
          loading ?
          <div className="loading-animation-centered">
            <Grid />
          </div>
          :
          <IconCharts
            data={filteredRecords.chart}
            races={RACES}
            base={chartConfig.base}
            measurement={measurement}
          />
        }
        
      </div>
      {/* <pre>{JSON.stringify(filteredRecords, null, 4)}</pre> */}
      <div className="buttons">
        <div className="button" onClick={() => window && window.print()}>
          Print
        </div>
        <div className="button" onClick={onDataTableDisplayToggled}>
          View Data
        </div>
        <div className="button" onClick={onDataDownload}>
          Download Data
        </div>
      </div>
      {showTable && filteredRecords.raw.length > 0 && (
        <table className="ui celled table">
          <thead>
            <tr>
              {Object.keys(filteredRecords.raw[0]).map((r) => (
                <th key={r}>{r}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredRecords.raw.map((row, rIndex) => {
              return (
                <tr key={rIndex}>
                  {Object.keys(filteredRecords.raw[0]).map((k) => (
                    <td key={k}>{row[k]}</td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
