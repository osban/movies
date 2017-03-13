import m from "mithril"
import s from "mithril/stream"
import Movie from "./model"

const MovieList = {
  mm2hm(minraw) {
    let min = Number(minraw)
    let time = ""
    if (min != 0) {
      let hh = Math.floor(min/60)
      let mm = min % 60
      mm < 10 ? mm = "0" + mm : null
      time = `${hh}:${mm}`
    } else {
      time = ""
    }
    return time
  },

  setsel(id) {
    // set the filter selections when navigating back from another page
    let x = document.getElementById(id)
    for (let i = 0; i < x.length; i++) {
      id == "time" ? x.options[i].text == Movie.filtertime ? x.options[i].selected = true : null : null
      id == "yeargt" ? x.options[i].text == Movie.filteryeargt ? x.options[i].selected = true : null : null
      id == "yearlt" ? x.options[i].text == Movie.filteryearlt ? x.options[i].selected = true : null : null
      id == "type" ? x.options[i].text == Movie.filtertype ? x.options[i].selected = true : null : null
      id == "genre" ? x.options[i].text == Movie.filtergenre ? x.options[i].selected = true : null : null
      id == "disk" ? x.options[i].text == Movie.filterdisk ? x.options[i].selected = true : null : null
      id == "seen" ? x.options[i].text == Movie.filterseen ? x.options[i].selected = true : null : null
    }
  },

  oninit(vnode) {
    Movie.loadlist()
    this.zoekterm = s("")
    this.yesno = false
    this.reset = false
  },

  onbeforeupdate(vnode) {
    Movie.filterlist = Movie.list

    if (this.reset) {
      Movie.filtertime = "< Time"
      Movie.filteryeargt = "> Year"
      Movie.filteryearlt = "< Year"
      Movie.filtertype = "Type"
      Movie.filtergenre = "Genre"
      Movie.filterdisk = "Disk"
      Movie.filterseen = "Seen"
      this.reset = false

      let options = document.querySelectorAll('.sel option')
      for (let i = 0; i < options.length; i++) {
        options[i].selected = options[i].defaultSelected
      }
    }

    if (Movie.filtertime != "< Time") {
      let res = Movie.filtertime.split(":")
      let min = Number(res[0]) * 60
      min += Number(res[1])
      Movie.filterlist = Movie.filterlist.filter(item => {
        return item.runtime < min})
    }

    if (Movie.filteryeargt != "> Year") {
      Movie.filterlist = Movie.filterlist.filter(item => {
        return item.year > Number(Movie.filteryeargt)})
    }

    if (Movie.filteryearlt != "< Year") {
      Movie.filterlist = Movie.filterlist.filter(item => {
        return item.year < Number(Movie.filteryearlt)})
    }

    if (Movie.filtertype != "Type") {
      Movie.filterlist = Movie.filterlist.filter(item => {
        return item.type === Movie.filtertype})
    }

    if (Movie.filtergenre != "Genre") {
      Movie.filterlist = Movie.filterlist.filter(item => {
        return item.genres.indexOf(Movie.filtergenre) > -1})
    }

    if (Movie.filterdisk != "Disk") {
      Movie.filterlist = Movie.filterlist.filter(item => {
        return item.disk == Movie.filterdisk})
    }

    if (Movie.filterseen != "Seen") {
      Movie.filterseen === "Yes" ? this.yesno = true : this.yesno = false
      Movie.filterlist = Movie.filterlist.filter(item => {
        return item.seen === this.yesno})
    }

    Movie.filterlist = Movie.filterlist.filter(item => {
      return item.title.toLowerCase().indexOf(vnode.state.zoekterm().toLowerCase()) > -1})
  },

  view(vnode) {
    return !Movie.filterlist ? m('h4', "Loading...") :
    m('div',
      m('input#listsearch[type=search][placeholder="Search title"]', {
        oninput: m.withAttr("value", this.zoekterm)}),
      m('br'),
      m('b.mlx', "filters: "),
      m('select.sel#time', {
        oncreate: () => MovieList.setsel("time"),
        onchange: function() {Movie.filtertime = this.value}},
        m('option[selected]', "< Time"),
        m('option', "1:30"),
        m('option', "1:45"),
        m('option', "2:00"),
        m('option', "2:15"),
        m('option', "2:30"),
        m('option', "3:00"),
        m('option', "5:00")
      ),
      m('select.sel#yeargt', {
        oncreate: () => MovieList.setsel("yeargt"),
        onchange: function() {Movie.filteryeargt = this.value}},
        m('option[selected]', "> Year"),
        m('option', "1920"),
        m('option', "1930"),
        m('option', "1940"),
        m('option', "1950"),
        m('option', "1960"),
        m('option', "1970"),
        m('option', "1980"),
        m('option', "1990"),
        m('option', "2000"),
        m('option', "2010"),
        m('option', "2015")
      ),
      m('select.sel#yearlt', {
        oncreate: () => MovieList.setsel("yearlt"),
        onchange: function() {Movie.filteryearlt = this.value}},
        m('option[selected]', "< Year"),
        m('option', "1920"),
        m('option', "1930"),
        m('option', "1940"),
        m('option', "1950"),
        m('option', "1960"),
        m('option', "1970"),
        m('option', "1980"),
        m('option', "1990"),
        m('option', "2000"),
        m('option', "2010"),
        m('option', "2015")
      ),
      m('select.sel#type', {
        oncreate: () => MovieList.setsel("type"),
        onchange: function() {Movie.filtertype = this.value}},
        m('option[selected]', "Type"),
        m('option', "movie"),
        m('option', "series")
      ),
      m('select.sel#genre', {
        oncreate: () => MovieList.setsel("genre"),
        onchange: function() {Movie.filtergenre = this.value}},
        m('option[selected]', "Genre"),
        Movie.genres.map(item => {
          return m('option', item)}),
      ),
      m('select.sel#disk', {
        oncreate: () => MovieList.setsel("disk"),
        onchange: function() {Movie.filterdisk = this.value}},
        m('option[selected]', "Disk"),
        Movie.disks.map(item => {
          return m('option', item)}),
      ),
      m('select.sel#seen', {
        oncreate: () => MovieList.setsel("seen"),
        onchange: function() {Movie.filterseen = this.value}},
        m('option[selected]', "Seen"),
        m('option', "Yes"),
        m('option', "No")
      ),
      m('button.mlxx', {onclick: () => this.reset = true}, "Reset"),
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
          Movie.filterlist.map((movie, i) => {
            return m('tr',
              m('td', i+1),
              m('td',
                m('a', {
                  href: "/view/" + movie._id,
                  oncreate: m.route.link},
                  movie.title
                )
              ),
              m('td.right', MovieList.mm2hm(movie.runtime)),
              m('td', movie.year),
              m('td', movie.type),
              m('td', movie.genres),
              m('td.right', movie.disk),
              m('td.center', movie.seen ? m('img[src=checkmark-16.png]') : m('img[src=xmark-16.png].xmark'))
            )
          })
        )
      )
    )
  }
}

module.exports = MovieList
