<template>
  <div class="chart-container" style="height: 100%"></div>
</template>
 
 <script>
/* eslint-disable no-unused-vars, no-undef */

import { OrgChart } from "../services/org-chart.js";

export default {
  name: "Chart",

  props: ["okrs", "teams", "settings", "dataloaded"],

  data: () => ({}),

  methods: {
    //
    initChart() {
      App.chart = new OrgChart()
        .container(".chart-container")
        .data(this.teams)
        .nodeHeight((d) => {
          var height = 38;
          var teamOkrs = getTeamOkrs(this.okrs, d);

          d.data.numObjs = 0;
          d.data.numKRs = 0;

          updateOkrVisability(teamOkrs);

          teamOkrs.forEach((okr) => {
            if (okr.shown) {
              if (okr.Title.toString().length > 100) {
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
          var teamOkrs = getTeamOkrs(this.okrs, d);
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
          var teamOkrs = getTeamOkrs(global.App.okrs, d);

          updateOkrVisability(teamOkrs);

          var teamOkrsText = [];
          teamOkrs.forEach((okr) => {
            if (okr.shown) {
              if (okr.Category == "Obj") {
                teamOkrsText.push(`
                  <div class="okr-obj ${okr.classOkrRow}" id="okr-${okr["id"]}" onclick="App.setSelected(${okr["id"]})" >
                  <span class="okr-obj-id">${okr["Category"]} ${okr["_x0023_"]} - </span>
                  <span class="okr-obj-title">${okr.Title}</span>
                  </div>
                `);
              } else {
                teamOkrsText.push(`
                  <div class="okr-kr ${okr.classOkrRow}" id="okr-${okr["id"]}" onclick="App.setSelected(${okr["id"]})">
                    <span class="okr-kr-id">${okr["Category"]} ${okr["_x0023_"]}</span>
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
                        <div class="okr-team">${d.data.Title}</div>
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
    },
  },

  mounted() {
    console.log("Chart mounted");
    this.initChart();
  },

  watch: {
    dataloaded(val) {
      console.log("dataloaded", val);
      if (this.dataloaded) {
        App.chart.render();
      }
    },
  },
};

function getTeamOkrs(okrs, d) {
  // console.log("getTeamOkrs", okrs, d);
  var teamOkrs = okrs.filter((okr) => okr["TeamLookupId"] == d.data.id);
  teamOkrs.sort((a, b) => {
    return a["_x0023_"] - b["_x0023_"];
  });
  return teamOkrs;
}

function updateOkrVisability(teamOkrs) {
  teamOkrs.forEach((okr) => {
    okr.classOkrRow = "";
    okr.shown = true;
  });

  if (App.selectedOKR) {
    teamOkrs.forEach((okr) => {
      if (okr["id"] == App.selectedOKR["id"]) {
        okr.classOkrRow = "okr-selected";
      } else if (
        App.refOKRsX &&
        App.refOKRsX.some((o) => o.okr.id == okr["id"])
      ) {
        okr.classOkrRow = "okr-referenced";
      } else if (
        App.supOKRsX &&
        App.supOKRsX.some((o) => o.okr.id == okr["id"])
      ) {
        okr.classOkrRow = "okr-supporting";
      } else {
        if (App.settings.includes("filter-related")) {
          okr.classOkrRow = "okr-hidden";
          okr.shown = false;
        }
      }

      // show parent Obj if KR is shown
      if (
        okr.shown &&
        okr.Category == "KR" &&
        App.settings.includes("filter-related")
      ) {
        var parentObj = teamOkrs.find(
          (o) => o["_x0023_"] == okr["_x0023_"].toString().split(".")[0]
        );
        if (parentObj) {
          parentObj.shown = true;
          if (parentObj.classOkrRow == "okr-hidden") {
            parentObj.classOkrRow = "";
          }
        }
      }
    });
  }
}
</script>