import m from "mithril"
import s from "mithril/stream"
import Movie from "./model"
import addinfo from "./addinfo"
import addlist from "./addlist"

module.exports = {
  oninit() {
    this.zoekterm = s("")
    this.zoektermi = s("")

    // If reload, go to list page
    !Movie.list[0] ? m.route.set("/") : null
  },

  view() {
    return m('div',
      m('div.row',
        m('div.twelve columns',
          m('input.zoek[type=text][placeholder="find"]', {
            onfocus: function() {this.select(); Movie.added = false},
            oninput: m.withAttr('value', this.zoekterm),
            onchange: () => {this.zoekterm() != "" ? Movie.getquery(this.zoekterm()) : null}
          }),
          m('input.zoeki[type=text][placeholder="find by id"]', {
            onfocus: function() {this.select(); Movie.added = false},
            oninput: m.withAttr('value', this.zoektermi),
            onchange: () => {this.zoektermi() != "" ? Movie.getqueryid(this.zoektermi()) : null}
          }),
          Movie.added ? m('b.red', "Movie added!") : m('b.green', Movie.searching)
        )
      ),
      Movie.state === "error" ? (m('div.row.mtxx', m('h2', Movie.error))) : Movie.state === "found" ? m(addinfo) :
      Movie.state === "list" ? m(addlist) : null
    )
  }
}
