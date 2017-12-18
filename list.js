import m from "mithril"
import s from "mithril/stream"
import Model from "./model"

const List = {
  mm2hm: minraw => {
    const min = Number(minraw)
    let time = ""
    if (min !== 0) {
      const hh = min / 60 | 0
      let mm = min % 60
      if (mm < 10) mm = "0" + mm
      time = `${hh}:${mm}`
    }
    else time = ""

    return time
  },

  oninit: ({state}) => {
    Model.loadlist()
    state.zoekterm = s("")
    state.yesno = false
    state.reset = false
    state.sort = "alphabetic"
  },

  onbeforeupdate: ({state}) => {
    Model.filterlist = Model.list
    
    if (state.sort !== Model.sort) {
      const sorts = {
        'alphabetic': () => {Model.filterlist = Model.list.sort((a,b) =>
          a.title.toLowerCase() > b.title.toLowerCase() ? 1 : a.title.toLowerCase() < b.title.toLowerCase() ? -1 : 0)
        },
        'id ascending': () => {
          Model.filterlist = Model.list.sort((a,b) => a._id > b._id ? 1 : a._id < b._id ? -1 : 0)
        },
        'id descending': () => {
          Model.filterlist = Model.list.sort((a,b) => a._id < b._id ? 1 : a._id > b._id ? -1 : 0)
        }
      }[state.sort]()
      Model.sort = state.sort
    }

    if (state.reset) {
      Model.filtertime = "< Time"
      Model.filteryeargt = "> Year"
      Model.filteryearlt = "< Year"
      Model.filtertype = "Type"
      Model.filtergenre = "Genre"
      Model.filterdisk = "Disk"
      Model.filterseen = "Seen"
      state.reset = false
    }

    if (Model.filtertime !== "< Time") {
      const res = Model.filtertime.split(":")
      let min = Number(res[0]) * 60
      min += Number(res[1])
      Model.filterlist = Model.filterlist.filter(item => item.runtime < min)
    }

    if (Model.filteryeargt !== "> Year") {
      Model.filterlist = Model.filterlist.filter(item => item.year > Number(Model.filteryeargt))
    }

    if (Model.filteryearlt !== "< Year") {
      Model.filterlist = Model.filterlist.filter(item => item.year < Number(Model.filteryearlt))
    }

    if (Model.filtertype !== "Type") {
      Model.filterlist = Model.filterlist.filter(item => item.type === Model.filtertype)
    }

    if (Model.filtergenre !== "Genre") {
      Model.filterlist = Model.filterlist.filter(item => item.genres.indexOf(Model.filtergenre) > -1)
    }

    if (Model.filterdisk !== "Disk") {
      Model.filterlist = Model.filterlist.filter(item => item.disk == Model.filterdisk)
    }

    if (Model.filterseen !== "Seen") {
      Model.filterseen === "Yes" ? state.yesno = true : state.yesno = false
      Model.filterlist = Model.filterlist.filter(item => item.seen === state.yesno)
    }

    Model.filterlist = Model.filterlist.filter(item => item.title.toLowerCase().indexOf(state.zoekterm().toLowerCase()) > -1)
  },

  view: ({state}) => [
    !Model.filterlist ? m('h4', "Loading...") :
    m('div',
      m('input#listsearch', {
        type: 'search',
        placeholder: "Search title",
        oninput: m.withAttr("value", state.zoekterm)
      }),
      m('b', "Sort: "),
      m('select', {onchange: e => state.sort = e.target.value, value: state.sort},
        Model.sorts.map(sort => m('option', sort))
      ),
      m('br'),
      m('b.mlx', "filters: "),
      m('select.sel#time', {
        onchange: e => Model.filtertime = e.target.value, value: Model.filtertime},
        Model.times.map(time => m('option', time))
      ),
      m('select.sel#yeargt', {
        onchange: e => Model.filteryeargt = e.target.value, value: Model.filteryeargt},
        Model.yearsgt.map(year => m('option', year))
      ),
      m('select.sel#yearlt', {
        onchange: e => Model.filteryearlt = e.target.value, value: Model.filteryearlt},
        Model.yearslt.map(year => m('option', year))
      ),
      m('select.sel#type', {
        onchange: e => Model.filtertype = e.target.value, value: Model.filtertype},
        Model.types.map(type => m('option', type))
      ),
      m('select.sel#genre', {
        onchange: e => Model.filtergenre = e.target.value, value: Model.filtergenre},
        Model.genres.map(genre => m('option', genre)),
      ),
      m('select.sel#disk', {
        onchange: e => Model.filterdisk = e.target.value, value: Model.filterdisk},
        Model.disks.map(disk => m('option', disk)),
      ),
      m('select.sel#seen', {
        onchange: e => Model.filterseen = e.target.value, value: Model.filterseen},
        Model.seens.map(seen => m('option', seen)),
      ),
      m('button.mlxx', {onclick: () => state.reset = true}, "Reset"),
      m('table.u-full-width',
        m('thead',
          m('tr',
            m('th', "#"),
            m('th', "Title"),
            m('th.right', "Time"),
            m('th', "Year"),
            m('th', "Type"),
            m('th', "Genre"),
            m('th.right', "Disk"),
            m('th.center', "Seen")
          )
        ),
        m('tbody',
          Model.filterlist.map((Model, i) => [
            m('tr',
              m('td', i+1),
              m('td',
                m('a', {
                  href: "/view/" + Model._id,
                  oncreate: m.route.link},
                  Model.title
                )
              ),
              m('td.right', List.mm2hm(Model.runtime)),
              m('td', Model.year),
              m('td', Model.type),
              m('td', Model.genres),
              m('td.right', Model.disk),
              m('td.center', Model.seen ? m('img', {src: 'images/checkmark-16.png'}) : m('img.xmark', {src: 'images/xmark-16.png'}))
            )
          ])
        )
      )
    )
  ]
}
export default List
