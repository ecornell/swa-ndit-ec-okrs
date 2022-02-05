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
    d3.csv("http://127.0.0.1:5500/src/data/OKRs-Sync.csv").then((okrs_all) => {
      App.okrs_all = okrs_all;

      let okrs = okrs_all.filter((okr) => okr["Period"] == "2022-Q1");
      App.okrs = okrs;

      d3.csv("http://127.0.0.1:5500/src//data/OKRs-teams.csv").then((teams) => {
        console.log(teams);

        App.teams = teams;

        App.chart = new OrgChart()
          .container(".chart-container")
          .data(teams)
          // .nodeHeight((d) => 200)
          .nodeHeight((d) => {
            var height = 36;
            var teamOkrs = okrs.filter(
              (okr) => okr["Team.lookupId"] == d.data.id
            );

            teamOkrs.sort((a, b) => {
              return a["#"] - b["#"];
            });

            d.data.numObjs = 0;
            d.data.numKRs = 0;

            var shown;
            teamOkrs.forEach((okr) => {
              shown = true;
              if (App.selectedOKR) {
                if (okr["ID"] == App.selectedOKR["ID"]) {
                  //
                } else if (
                  App.refOKRs &&
                  App.refOKRs.some((o) => o.ID == okr["ID"])
                ) {
                  //
                } else if (
                  App.supOKRs &&
                  App.supOKRs.some((o) => o.ID == okr["ID"])
                ) {
                  //
                } else if (okr.Category == "KR") {
                  shown = false;
                }
              }
              if (shown) {
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
              height = height + d.data.numKRs * 18;
            }

            return height;
          })
          .nodeWidth((d) => {
            //if (d.depth == 0) return 400;
            return 600;
          })
          .childrenMargin((d) => 90)
          .compactMarginBetween((d) => 65)
          .compactMarginPair((d) => 100)
          .neightbourMargin((a, b) => 50)
          .siblingsMargin((d) => 100)
          .buttonContent(({ node, state }) => {
            return `<div style="color:#333333;border-radius:5px;padding:4px 8px;font-size:10px;margin:auto auto;background-color:#fcfcfc;border: 1px solid #222222"> <span style="font-size:9px">${
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

            var teamOkrs = okrs.filter(
              (okr) => okr["Team.lookupId"] == d.data.id
            );

            teamOkrs.sort((a, b) => {
              return a["#"] - b["#"];
            });

            var teamOkrsText = [];

            var shown;
            teamOkrs.forEach((okr) => {
              //   console.log(okr);
              shown = true;

              let highlightClass = "";

              if (App.selectedOKR) {
                if (okr["ID"] == App.selectedOKR["ID"]) {
                  highlightClass = "okr-selected";
                } else if (
                  App.refOKRs &&
                  App.refOKRs.some((o) => o.ID == okr["ID"])
                ) {
                  highlightClass = "okr-referenced";
                } else if (
                  App.supOKRs &&
                  App.supOKRs.some((o) => o.ID == okr["ID"])
                ) {
                  highlightClass = "okr-supporting";
                } else {
                  if (okr.Category == "KR") {
                    highlightClass = "okr-hidden";
                    shown = false;
                  }
                }
              }

              if (shown) {
                if (okr.Category == "Obj") {
                  teamOkrsText.push(`
                  <div class="okr-obj ${highlightClass}" id="okr-${okr["ID"]}" onclick="App.setSelected(${okr["ID"]})" >
                  <span class="okr-obj-id">${okr["Category"]} ${okr["#"]} - </span>
                  <span class="okr-obj-title">${okr.Title}</span>
                  </div>
                `);
                } else {
                  teamOkrsText.push(`
                  <div class="okr-kr ${highlightClass}" id="okr-${okr["ID"]}" onclick="App.setSelected(${okr["ID"]})">
                    <span class="okr-kr-id">${okr["Category"]} ${okr["#"]}</span>
                    <span class="okr-kr-sep">-&nbsp;</span>
                    <span class="okr-kr-title">${okr.Title}</span>
                  </div>`);
                }
              }
            });

            // console.log(teamOkrsText.length);

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
</script>