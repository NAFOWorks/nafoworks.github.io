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
        borderColor: '#f00',
        backgroundColor: 'rgba(255,0,0,0.1)',
        fill: true,
        radius: 2,
        borderWidth: 2
      }, {
        label: 'Locks',
        data: data.map(row => row.loc),
        borderColor: '#fc0',
        backgroundColor: 'rgba(255,230,0,0.1)',
        fill: true,
        radius: 2,
        borderWidth: 2
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
      item.t = 'danger'
      item.icon = 'emoji-dizzy'
      item.title = 'Suspension'
    } else if (item.t == 'loc') {
      item.t = 'warning'
      item.icon = 'lock-fill'
      item.title = 'Locked'
    }
    reports_feed.innerHTML += `
    <div id="report-${ index }" class="mt-3 card pb-1">
      <div class="card-body">
        <span class="small text-tertiary">${ new Date(item.d) }</span>
        <div class="card-title d-flex justify-content-between m-0">
          <p class="card-text">@${ item.h }</p>
          <span class="text-${ item.t }">${ item.title }&nbsp;<i class="bi bi-${item.icon }"></i></span>
        </div>
      </div>
      <div class="card-footer">
        <a target="_blank" class="btn btn-outline-primary" href="https://web.archive.org/web/*/https://twitter.com/${ item.h }*" role="button"><i class="bi bi-box-arrow-right"></i>&nbsp;archive.org</a>

      </div>
    </div>
    `
  })
  reports = data
}
fetch('/data/reports.json').then(response => response.json()).then(render_reports)
