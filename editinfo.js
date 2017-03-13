import m from "mithril"
import Movie from "./model"
import editseries from "./editseries"

const editinfo = {
  binds(data) {
    return {onchange: e => {
      e.target.name == "seen" ? Movie.current.seen = !Movie.current.seen : data[e.target.name] = e.target.value}}
  },

  delok() {
    document.getElementById('delok').style.display="block"
    document.getElementById('delokok').onclick = () => {
      Movie.delmovie(Movie.current._id)
      document.getElementById('delok').style.display="none"
    }

    document.getElementById('delokno').onclick = () => {
      document.getElementById('delok').style.display="none"
    }
  },

  view() {
    Movie.deleted = false
    Movie.updated = false
    return m('div', editinfo.binds(Movie.current),
      m('div.row.mtxx',
        m('div.seven columns',
          m('h3', `${Movie.current.title} ${Movie.year}`),
          m('p',
            m('label.editlabel', "edit title: "),
            m('input.edittitle[type=text][name=title]', {
              value: Movie.current.title,
              onfocus: function() {this.select()}
            }),
            m('br'),
            m('label.editlabel', "original title: "),
            m('input.edittitle[type=text][name=originaltitle]', {
              value: Movie.current.originaltitle,
              onfocus: function() {this.select()}
            }),
            m('br'),
            m('label.editlabel', "type: "),
            m('input.edittype[type=text][name=type]', {value: Movie.current.type}),
            m('br'),
            m('label.editlabel', "rating: "),
            m('input.editratmet[type=text][name=rating]', {value: Movie.current.rating}),
            m('br'),
            m('label.editlabel', "metascore: "),
            m('input.editratmet[type=text][name=metascore]', {value: Movie.current.metascore}),
            m('br'),
            m('label.editlabel', "imdb: "),
            m('a', {href: Movie.current.imdburl, target: "_blank"}, Movie.current.imdburl),
            m('br'),
            m('label.editlabel', "disk: "),
            m('input.editdisk[type=text][name=disk]', {
              value: Movie.current.disk,
              onfocus: function() {this.select()}
            }),
            m('br'),
            m('label.editlabel.labeltop', "seen: "),
            m('input[type=checkbox][name=seen]', {
              value: Movie.current.seen,
              checked: Movie.current.seen
            }),
            m('br'),
            m('label.editlabel', "notes: ",
              m('textarea.widthccc[name=notes]', {
                value: Movie.current.notes,
                onfocus: function() {this.select()}
              })
            )
          )
        ),
        m('div.five columns.widthccc',
          m('img', {src: Movie.current.poster})
        )
      ),
      m('div.row',
        m('label.editlabel', "img url: "),
        m('input.editimgurl[type=text][name=poster]', {
          value: Movie.current.poster,
          onfocus: function() {this.select()}
        })
      ),
      m('div.row',
        Movie.current.type === "series" ? m(editseries) : null,
        m('div',
          m('button.button-primary.mrxx', {onclick: () => {Movie.putmovie(Movie.current._id)}}, "Update"),
          m('button.button-primary#btndel', {onclick: () => {editinfo.delok()}}, "Delete")
        )
      ),
      m('div#delok',
        m('span#delok0', `Delete confirmation`),
        m('span#delok1', `Are you sure you want to delete`),
        m('br'),
        m('span', ">> "),
        m('span#delok2', Movie.current.title),
        m('span', " << ?"),
        m('br'),
        m('button#delokok.mrx', "YES"),
        m('button#delokno.mlx', "NO")
      )
    )
  }
}

module.exports = editinfo
