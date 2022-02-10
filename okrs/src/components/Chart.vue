<template>
  <div class="chart-container" style="width: 100%; height: 100%"></div>  
</template>
 
 <script>
/* eslint-disable no-unused-vars, no-undef */

import { OrgChart } from "../org-chart.js";

export default {
  name: "Chart",

  data: () => ({}),

  methods: {
    test: function () {
      console.log("TEST");
      console.log(App);
    },
  },

  mounted() {
    d3.csv("https://saitdecornellokrs.blob.core.windows.net/files-public/OKRs-Sync.csv").then((okrs_all) => {
      App.okrs_all = okrs_all;

      let okrs = okrs_all.filter((okr) => okr["Period"] == "2022-Q1");
      App.okrs = okrs;

      d3.csv("https://saitdecornellokrs.blob.core.windows.net/files-public/OKRs-Teams.csv").then((teams) => {
        console.log(teams);

        App.teams = teams;

        App.chart = new OrgChart()
          .container(".chart-container")
          .data(teams)
          .nodeHeight((d) => {
            var height = 38;
            var teamOkrs = getTeamOKrs(okrs, d);

            d.data.numObjs = 0;
            d.data.numKRs = 0;

            updateOkrVisability(teamOkrs);

            teamOkrs.forEach((okr) => {
              if (okr.shown) {
                if (okr.Title.toString().length > 110) {
                  height = height + 14;
                }
                if (okr.Category == "Obj") {
                  d.data.numObjs++;
                } else {
                  d.data.numKRs++;
                }
              }
            });

            if (d.data && d.data.numObjs) {
              height = height + d.data.numObjs * 24;
            }
            if (d.data && d.data.numKRs) {
              height = height + d.data.numKRs * 16;
            }
            return height;
          })
          .nodeWidth((d) => {
            var teamOkrs = getTeamOKrs(okrs, d);
            updateOkrVisability(teamOkrs);
            var hasVisibleOKRs = teamOkrs.some((okr) => okr.shown);
            return hasVisibleOKRs ? 600 : 200;
          })
          .childrenMargin((d) => 90)
          .compactMarginBetween((d) => 65)
          .compactMarginPair((d) => 100)
          .neightbourMargin((a, b) => 50)
          .siblingsMargin((d) => 100)
          .buttonContent(({ node, state }) => {
            return `<div style="color:#333333;border-radius:5px;padding:3px 10px;font-size:10px;margin:auto auto;background-color:#fcfcfc;border: 1px solid #222222"> <span style="font-size:9px">${
              node.children
                ? `<i class="fas fa-angle-up"></i>`
                : `<i class="fas fa-angle-down"></i> ${node.data._directSubordinates}`
            }</span></div>`;
          })
          .linkUpdate(function (d, i, arr) {
            d3.select(this)
              .attr("stroke", (d) =>
                d.data._upToTheRootHighlighted ? "#14760D" : "#666666"
              )
              .attr("stroke-width", (d) =>
                d.data._upToTheRootHighlighted ? 15 : 1
              );

            if (d.data._upToTheRootHighlighted) {
              d3.select(this).raise();
            }
          })
          .nodeContent(function (d, i, arr, state) {
            var teamOkrs = getTeamOKrs(okrs, d);

            updateOkrVisability(teamOkrs);

            var teamOkrsText = [];
            teamOkrs.forEach((okr) => {
              if (okr.shown) {
                if (okr.Category == "Obj") {
                  teamOkrsText.push(`
                  <div class="okr-obj ${okr.highlightClass}" id="okr-${okr["ID"]}" onclick="App.setSelected(${okr["ID"]})" >
                  <span class="okr-obj-id">${okr["Category"]} ${okr["#"]} - </span>
                  <span class="okr-obj-title">${okr.Title}</span>
                  </div>
                `);
                } else {
                  teamOkrsText.push(`
                  <div class="okr-kr ${okr.highlightClass}" id="okr-${okr["ID"]}" onclick="App.setSelected(${okr["ID"]})">
                    <span class="okr-kr-id">${okr["Category"]} ${okr["#"]}</span>
                    <span class="okr-kr-sep">-&nbsp;</span>
                    <span class="okr-kr-title">${okr.Title}</span>
                  </div>`);
                }
              }
            });

            return `                  
                    <div class="okr" style="width:${
                      d.width
                    }px;height:${d.height}px">                    
                      <div class="okr-content">
                        <div class="okr-team">${d.data.Name}</div>
                        ${teamOkrsText.join("")}
                      </div>   
                    </div>
                    `;
          })
          .nodeUpdate(function (d, i, arr) {
            d3.select(this)
              .select(".node-rect")
              .attr("stroke", (d) =>
                d.data._highlighted || d.data._upToTheRootHighlighted
                  ? "#14760D"
                  : "none"
              )
              .attr(
                "stroke-width",
                d.data._highlighted || d.data._upToTheRootHighlighted ? 40 : 1
              );
          })
          .render();
      });
    });
  },
};

function getTeamOKrs(okrs, d) {
  var teamOkrs = okrs.filter((okr) => okr["Team.lookupId"] == d.data.id);
  teamOkrs.sort((a, b) => {
    return a["#"] - b["#"];
  });
  return teamOkrs;
}

function updateOkrVisability(teamOkrs) {
  teamOkrs.forEach((okr) => {
    okr.highlightClass = "";
    okr.shown = true;
  });

  if (App.selectedOKR) {
    teamOkrs.forEach((okr) => {
      if (okr["ID"] == App.selectedOKR["ID"]) {
        okr.highlightClass = "okr-selected";
      } else if (App.refOKRs && App.refOKRs.some((o) => o.ID == okr["ID"])) {
        okr.highlightClass = "okr-referenced";
      } else if (App.supOKRs && App.supOKRs.some((o) => o.ID == okr["ID"])) {
        okr.highlightClass = "okr-supporting";
      } else {
        if (App.cbRelated) {
          okr.highlightClass = "okr-hidden";
          okr.shown = false;
        }
      }

      // show parent Obj if KR is shown
      if (okr.shown && okr.Category == "KR" && App.cbRelated) {
        var parentObj = teamOkrs.find((o) => o["#"] == okr["#"].split(".")[0]);
        console.log(parentObj);
        if (parentObj) {
          parentObj.shown = true;
          if (parentObj.highlightClass == "okr-hidden") {
            parentObj.highlightClass = "";
          }
        }
      }
    });
  }
}
</script>