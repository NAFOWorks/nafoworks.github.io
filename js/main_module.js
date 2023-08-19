import * as bootstrap from 'bootstrap'

let filter_bar = document.getElementById('filter-bar')
window.addEventListener("scroll", (event) => {
  if (filter_bar.getBoundingClientRect().top == 0) {
    filter_bar.classList.add('shadow-sm')
  } else {
    filter_bar.classList.remove('shadow-sm')
  }
})

import 'https://cdn.jsdelivr.net/npm/chart.js@4.3.3/dist/chart.umd.min.js'

Chart.defaults.scales.linear.min = 0

let render_statistics = function (data) {
  console.log(data)
  let config = {
    type: 'line',
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: {
            usePointStyle: true
          }
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Date'
          }
        },
        y: {
          stacked: true,
          title: {
            display: true,
            text: 'Accounts'
          }
        }
      }
    },
    data: {
      labels: data.map(row => row.year),
      datasets: [{
        label: 'Suspensions',
        data: data.map(row => row.sus),
        borderColor: '#cec',
        backgroundColor: 'rgba(204,238,204,0.5)',
        fill: true,
        radius: 4,
        borderWidth: 4
      }, {
        label: 'Locks',
        data: data.map(row => row.loc),
        borderColor: '#fda',
        backgroundColor: 'rgba(255,221,170,0.2)',
        fill: true,
        radius: 4,
        borderWidth: 4
      }]
    }
  }
  new Chart(document.getElementById('statistics'), config)
}
fetch('/data/statistics.json').then(response => response.json()).then(render_statistics)

import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en'
TimeAgo.addDefaultLocale(en)
const timeAgo = new TimeAgo('en-US')

var reports

let filter = document.getElementById('filter')
let filter_changed = function (e) {
  console.log(e.target.value)
  let value = e.target.value
  reports.forEach((item, index) => {
    let element = document.getElementById(`report-${ index }`)
    if (item.h.toLowerCase().includes(value.toLowerCase())) {
      element.classList.remove('d-none')
    } else {
      element.classList.add('d-none')
    }
  })
}
filter.addEventListener('input', filter_changed)

let reports_feed = document.getElementById('reports-feed')
let render_reports = data => {
  data.forEach((item, index) => {
    if (item.t == 'sus') {
      item.icon = 'emoji-dizzy'
      item.title = 'Suspension'
    } else if (item.t == 'loc') {
      item.icon = 'lock-fill'
      item.title = 'Locked'
    }
    reports_feed.innerHTML += `
    <div id="report-${ index }" class="mt-3 card pt-2 pb-3">
      <div class="card-body">
        <div class="card-title btn rounded ${ item.t }">
          <i class="bi bi-${item.icon }"></i> ${ item.title }
        </div>
        <div class="small text-tertiary">
          ${ timeAgo.format(new Date(item.d)) }
        </div>
        <p class="card-text pt-3 pb-1">@${ item.h }</p>
      </div>
    </div>
    `
  })
  reports = data
}
fetch('/data/reports.json').then(response => response.json()).then(render_reports)
