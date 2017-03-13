import m from "mithril"
import s from "mithril/stream"
import Movie from "./model"
import editinfo from "./editinfo"

const MovieEdit = {
  findmovie(zoek) {
    Movie.current = Movie.list.find((item, i) => {
      item.title.toLowerCase().indexOf(zoek.toLowerCase()) > -1 ? Movie.pointer = i : null
        return item.title.toLowerCase().indexOf(zoek.toLowerCase()) > -1
    })
  },

  oninit(vnode) {
    this.zoekterm = s("")
    // If reload, go to list page
    !Movie.list[0] ? m.route.set("/") : null

    // find specific movie or load first one
    if (vnode.attrs.id === "0") {
      Movie.current = Movie.list[0]
    } else {
      Movie.current = Movie.list.find((item, i) => {
          item._id == vnode.attrs.id ? Movie.pointer = i : null
          return item._id == vnode.attrs.id
      })
    }
    Movie.list[0] && Movie.current.year ? Movie.year = "(" + Movie.current.year + ")" : Movie.year = ""
  },

  onbeforeupdate() {
    Movie.current.year ? Movie.year = "(" + Movie.current.year + ")" : Movie.year = ""
  },

  view(vnode) {
    return m('div',
      m('div.row',
        m('div.twelve columns',
          m('input.zoek[type=text][placeholder="find by name"]', {
            onfocus: function() {this.select(); Movie.updated = false; Movie.deleted = false},
            oninput: m.withAttr('value', this.zoekterm),
            onchange: () => {this.zoekterm() != "" ? MovieEdit.findmovie(this.zoekterm()) : null}
          }),
          Movie.pointer > 0 ? m('button.btnprev', {
            onclick: () => {Movie.current = Movie.list[Movie.pointer - 1]; Movie.pointer--}}, "PREV") :
            m('button.btninvisp[disabled]', "PREV"),
          Movie.pointer < Movie.list.length - 1 ? m('button.mrxx', {
            onclick: () => {Movie.current = Movie.list[Movie.pointer + 1]; Movie.pointer++}}, "NEXT") :
            m('button.btninvisn[disabled]', "NEXT"),
          Movie.updated ? m('b.red', "Movie updated!") : null,
          Movie.deleted ? m('b.red', "Movie deleted!") : null
        )
      ),
      !Movie.current ? (m('div.row.mtxx', m('h2', "Nothing found"))) : m(editinfo)
    )
  }
}

module.exports = MovieEdit
