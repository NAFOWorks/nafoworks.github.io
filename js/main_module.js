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
      labels: data.map(row => row.date.toDateString()),
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

//import TimeAgo from 'javascript-time-ago'
//import en from 'javascript-time-ago/locale/en'
//TimeAgo.addDefaultLocale(en)
//const timeAgo = new TimeAgo('en-US')

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
let render_card = data => {
  return `
  <div id="report-${ data.index }" class="mt-3 card pb-1">
    <div class="card-body">
      <span class="small text-tertiary">${ new Date(data.d) }</span>
      <div class="card-title d-flex justify-content-between m-0">
        <p class="card-text">@${ data.h }</p>
        <span class="text-${ data.t }">${ data.title }&nbsp;<i class="bi bi-${data.icon }"></i></span>
      </div>
    </div>
    <div class="card-footer">
      <a target="_blank" class="btn btn-outline-primary" href="https://twitter.com/${ data.h }" role="button"><i class="bi bi-box-arrow-right"></i>&nbsp;twitter</a>
      <a target="_blank" class="btn btn-outline-primary" href="https://web.archive.org/web/*/https://twitter.com/${ data.h }*" role="button"><i class="bi bi-box-arrow-right"></i>&nbsp;archive.org</a>
    </div>
  </div>
  `
}
let render_reports = data => {
  let new_reports = []
  let statistics = []
  let card_index = 0
  data.forEach((item, index) => {
    item.date = new Date(item.date)
  })
  data.sort(function(a,b){
    return b.date - a.date
  })
  data.forEach((item, index) => {
    let item_data = {}
    item_data.d = item.date
    item.suspensions.forEach((suspension) => {
      item_data.index = card_index++
      item_data.h = suspension
      item_data.t = 'danger'
      item_data.icon = 'emoji-dizzy'
      item_data.title = 'Suspension'
      reports_feed.innerHTML += render_card(item_data)
      new_reports.push({ ...item_data})
    })
    item.locks.forEach((lock) => {
      item_data.index = card_index++
      item_data.h = lock
      item_data.t = 'warning'
      item_data.icon = 'lock-fill'
      item_data.title = 'Locked'
      reports_feed.innerHTML += render_card(item_data)
      new_reports.push({...item_data})
    })
    statistics.push({
      date: item.date,
      sus: item.suspensions.length,
      loc: item.locks.length
    })
  })
  reports = new_reports
  statistics.sort(function(a,b){
    return a.date - b.date
  })
  render_statistics(statistics)
}
fetch('/data/reports.json').then(response => response.json()).then(render_reports)
